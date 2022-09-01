import { KubeConfig, NetworkingV1Api, CoreV1Api, Watch, V1Pod, V1Ingress, PatchUtils, V1Service, HttpError } from "@kubernetes/client-node";
import { IngressRouteSetConf } from "./IngressRouteSetConf";
import { IngressConfig } from "./IngressConfig";
import { logWatchError } from "./utils";

export class Config {
  public readonly LABEL_NODE_NAME: string;
  public readonly SELF_SELECTOR: string;
  public readonly networkingV1Api: NetworkingV1Api;
  #selfServiceName = "";
  /**
   * if set will add label on all pods in the selected namespace
   */
  LABEL_ALL: boolean;
  HTTP_PORT: number;
  ingresses: Map<string, IngressConfig> = new Map();
  /**
   * stored set of actif namespaces
   */
  #namespaces = new Set<string>();
  coreV1Api: CoreV1Api;

  constructor(private kubeConfig: KubeConfig) {
    this.LABEL_NODE_NAME = process.env["LABEL.nodename"] || "nodename";
    this.LABEL_ALL = !!process.env["LABEL.all"];
    this.SELF_SELECTOR = process.env["SELF_SELECTOR"] || "";

    // add extra namespace
    if (process.env.NAMESPACE) {
      this.addNamespaces(process.env.NAMESPACE, 'discover key "NAMESPACE"');
    }
    this.HTTP_PORT = Number(process.env["HTTP_PORT"]) || 8080;

    // INGRESS.namespace.IngeresName.1.name
    const regexp = /INGRESS\.([^.]+)\.([^.]+)\.(\d+)\.([^.]+)/;
    for (const key of Object.keys(process.env)) {
      const m = key.match(regexp);
      if (!m) continue;
      const [, namespace, ingressName, idStr, k] = m;
      const ingressKey = `${namespace}.${ingressName}`;
      this.addNamespaces(namespace, `discover key: "${key}"`);
      let slot = this.ingresses.get(ingressKey);
      if (!slot) {
        slot = new IngressConfig(this, namespace, ingressName);
        this.ingresses.set(ingressKey, slot);
      }
      const id = Number(idStr);
      slot.create(id).set(k, process.env[key]);
    }
    this.validate();
    this.coreV1Api = this.kubeConfig.makeApiClient(CoreV1Api);
    this.networkingV1Api = this.kubeConfig.makeApiClient(NetworkingV1Api);
  }

  public get selfServiceName(): string {
    return this.#selfServiceName;
  }

  async init() {
    if (!this.SELF_SELECTOR) return;
    const p = this.SELF_SELECTOR.indexOf("=");
    if (p === -1) throw Error("invalid configuration SELF_SELECTOR must looks like app=dyn-ingress");
    const key = this.SELF_SELECTOR.substring(0, p);
    const value = this.SELF_SELECTOR.substring(p + 1);
    this.#selfServiceName = `dyn-ingress-${value}-service`;
    const body: V1Service = {
      apiVersion: "v1",
      kind: "Service",
      metadata: { name: this.#selfServiceName },
      spec: {
        selector: {
          [key]: value,
        },
        ports: [{ protocol: "TCP", port: this.HTTP_PORT, targetPort: this.HTTP_PORT }],
      },
    };
    for (const namespace of this.#namespaces) {
      try {
        await this.coreV1Api.createNamespacedService(namespace, body);
      } catch (e) {
        if (e instanceof HttpError && e.statusCode === 409) {
          try {
            await this.coreV1Api.replaceNamespacedService(this.#selfServiceName, namespace, body);
          } catch (e2) {
            await logWatchError(`POST /api/v1/namespaces/${namespace}/services`, e2, 0);
          }
        } else {
          await logWatchError(`PUT /api/v1/namespaces/${namespace}/services`, e, 0);
        }
        // console.error(`failed to create Namespaced Service ${namespace}.${this.#selfServiceName} errorCode:${e.}`);
      }
    }
  }

  private addNamespaces(namespace: string, reason: string) {
    if (!this.#namespaces.has(namespace)) {
      console.log(`Watching namespace "${namespace}" cause by ${reason}`);
      this.#namespaces.add(namespace);
    }
  }

  /**
   * validate all configuration and fail in conf is inconsistant
   */
  public validate(): void {
    for (const [id, ing] of this.ingresses.entries()) {
      ing.validate(`INGRESS.${id}`);
      console.log(`"INGRESS.${id}" ingress config is valid`);
    }
  }

  //////////////
  // Ingress section

  public watchIngresses(): void {
    if (!this.ingresses.size) {
      console.log("ingresses feature not configured");
      return;
    }
    console.log(`Start watching ingress in ${JSON.stringify([...this.#namespaces])}`);
    for (const namespace of this.#namespaces) void this.watchIngress(namespace);
  }

  private async watchIngress(namespace: string): Promise<never> {
    const watch = new Watch(this.kubeConfig);
    const url = `/apis/networking.k8s.io/v1/namespaces/${namespace}/ingresses`;
    let errorCnt = 0;
    for (;;) {
      try {
        // console.log("Watching", url);
        const watching = new Promise<void>((resolve, reject) => {
          void watch.watch(
            url,
            {},
            (phase: string | "ADDED" | "MODIFIED" | "DELETED", ingress: V1Ingress) => {
              const ingressName = ingress.metadata?.name;
              const ingressKey = `${namespace}.${ingressName}`;
              const ingressData = this.ingresses.get(ingressKey);
              if (!ingressData) return;
              if (!ingressData.ingress) console.log(`Attach to ingress "${ingressKey}"`);
              ingressData.ingress = ingress;
            },
            (err) => {
              if (err) {
                reject(err);
              } else resolve();
            },
          );
        });
        await watching;
        errorCnt = 0;
      } catch (e) {
        await logWatchError(url, e, ++errorCnt);
      }
    }
  }

  /////////////
  // Pod section
  public visitPod(pod: V1Pod, removed?: boolean): IngressRouteSetConf | null {
    for (const child of this.ingresses.values()) {
      const m = child.visitPod(pod, removed);
      if (m) return m;
    }
    return null;
  }

  public watchPods(): void {
    console.log(`Start watching pods in ${JSON.stringify([...this.#namespaces])}`);
    for (const namespace of this.#namespaces) void this.watchPod(namespace);
  }

  /**
   * Tag pod with extra labels
   * @param pod the pod
   */
  async ensurePodLabel(pod: V1Pod): Promise<IngressRouteSetConf | null> {
    const { metadata, spec } = pod;
    if (!spec || !metadata) return null;

    if (!metadata.labels) metadata.labels = {};
    const conf = this.visitPod(pod);
    if (!conf || !this.LABEL_ALL) return null;
    if (!metadata || !metadata.name || !metadata.namespace) return null;
    if (metadata.labels[this.LABEL_NODE_NAME] === spec.nodeName) return conf;
    const body = [];
    body.push({ op: "add", path: `/metadata/labels/${this.LABEL_NODE_NAME}`, value: spec.nodeName });
    //if (config.LABEL_NAMESPACE && pod.metadata.namespace)
    //  body.push({ op: "add", path: `/metadata/labels/${config.LABEL_NAMESPACE}`, value: pod.metadata.namespace });
    //if (config.LABEL_POD_NAME && pod.metadata.name)
    //  body.push({ op: "add", path: `/metadata/labels/${config.LABEL_POD_NAME}`, value: pod.metadata.name });
    const options = { headers: { "Content-type": PatchUtils.PATCH_FORMAT_JSON_PATCH } };
    console.log(`Patching pod ${metadata.namespace}.${metadata.name} with label:${this.LABEL_NODE_NAME}=${spec.nodeName}`);
    await this.coreV1Api.patchNamespacedPod(metadata.name, metadata.namespace, body, undefined, undefined, undefined, undefined, undefined, options);
    return conf;
  }

  private async watchPod(namespace: string): Promise<never> {
    const watch = new Watch(this.kubeConfig);
    const url = `/api/v1/namespaces/${namespace}/pods`;
    let errorCnt = 0;
    for (;;) {
      try {
        const watching = new Promise<void>((resolve, reject) => {
          void watch.watch(
            url,
            {},
            async (phase: string | "ADDED" | "MODIFIED" | "DELETED", pod: V1Pod) => {
              if (phase === "DELETED") {
                this.visitPod(pod, true);
              } else {
                this.ensurePodLabel(pod);
              }
            },
            (err: any) => {
              if (err) {
                reject(err);
              } else resolve();
            },
          );
        });
        await watching;
        errorCnt = 0;
      } catch (e) {
        await logWatchError(url, e, ++errorCnt);
      }
    }
  }

  getSummery(): { [key: string]: string[] } {
    const result: { [key: string]: string[] } = {};
    for (const ent of this.ingresses.values()) {
      for (const [id, conf] of ent.configs.entries()) {
        result[`${ent.namespace}.${ent.ingressName}.${id}`] = conf.getNodeNames();
      }
    }
    return result;
  }

  #prefixIndex?: Map<string, IngressRouteSetConf>;

  get prefixIndex(): Map<string, IngressRouteSetConf> {
    if (!this.#prefixIndex) {
      const map = new Map<string, IngressRouteSetConf>();
      for (const conf of this.ingresses.values()) {
        for (const sub of conf.configs.values()) {
          map.set(sub.prefixBase, sub);
        }
      }
      this.#prefixIndex = map;
    }
    return this.#prefixIndex;
  }

  getIngressConfigByPrefixBase(path: string): IngressRouteSetConf | undefined {
    return this.prefixIndex.get(path);
  }
}
