import { KubeConfig, NetworkingV1Api, CoreV1Api, Watch, V1Pod, V1Ingress, PatchUtils, V1Service, HttpError } from "@kubernetes/client-node";
import { homedir } from "os";
import { join } from "path";
import { existsSync } from "fs";
import * as utils from "./utils";
import * as config from "./config";
import { debounce } from "throttle-debounce";
import http from "http";

///////
// dummy vartiable for K8S API
const pretty: string | undefined = undefined;
const dryRun: string | undefined = undefined;
const fieldManager: string | undefined = undefined;
const fieldValidation: string | undefined = undefined;
const force: boolean | undefined = undefined;

async function logWatchError(url: string, e: unknown, errorCnt: number) {
  const pause = Math.min(errorCnt * 6, 60);
  if (pause < 60 || errorCnt % 5 === 0) {
    if (e instanceof HttpError) {
      console.log(`Watch ${url} failed and return: ${e.statusCode}: ${e.message}" retrys in ${pause} sec`);
      console.log(`Body:`, e.body);
    } else if (e instanceof Error) {
      console.log(`Watch ${url} failed and return: ${e.message}" retrys in ${pause} sec`);
    } else {
      console.log(`Watch ${url} failed retrys in ${pause} sec`, e);
    }
  }
  await utils.delay(pause * 1000);
}

class IngressUpdater {
  kubeconfig: KubeConfig;
  nodeList = new Map<string, { podName: string; nodeName: string; podIP: string }>();
  networkingV1Api: NetworkingV1Api;
  coreV1Api: CoreV1Api;
  ingress: V1Ingress | null = null;

  constructor() {
    this.kubeconfig = new KubeConfig();
    const kubeconf = join(homedir(), ".kube", "config");
    if (existsSync(kubeconf)) this.kubeconfig.loadFromFile(kubeconf);
    else this.kubeconfig.loadFromCluster();
    this.networkingV1Api = this.kubeconfig.makeApiClient(NetworkingV1Api);
    this.coreV1Api = this.kubeconfig.makeApiClient(CoreV1Api);
  }

  /**
   * Tag pod with extra labels
   * @param pod the pod
   */
  async ensurePodLabel(pod: V1Pod) {
    if (!pod.metadata) pod.metadata = {};
    const metadata = pod.metadata;
    if (!metadata.labels) metadata.labels = {};
    const labels = metadata.labels;

    if (!labels[config.LABEL_NODE_NAME]) {
      const podName = utils.getPodName(pod);
      const nodeName = utils.getPodNodeName(pod);
      if (podName && nodeName) {
        console.log(`adding ${nodeName} to ${podName}`);
        const body = [];
        body.push({ op: "add", path: `/metadata/labels/${config.LABEL_NODE_NAME}`, value: nodeName });
        if (config.LABEL_NAMESPACE && pod.metadata.namespace) {
          body.push({ op: "add", path: `/metadata/labels/${config.LABEL_NAMESPACE}`, value: pod.metadata.namespace });
        }
        if (config.LABEL_POD_NAME && pod.metadata.name) {
          body.push({ op: "add", path: `/metadata/labels/${config.LABEL_POD_NAME}`, value: pod.metadata.name });
        }
        const options = { headers: { "Content-type": PatchUtils.PATCH_FORMAT_JSON_PATCH } };
        await this.coreV1Api.patchNamespacedPod(podName, config.NAMESPACE, body, pretty, dryRun, fieldManager, fieldValidation, force, options);
      }
    }
  }

  async addPodService(pod: V1Pod) {
    if (config.NO_INGRESS) {
      // service feature disabled
      return;
    }

    const pretty: string | undefined = undefined;
    const dryRun: string | undefined = undefined;
    const fieldManager: string | undefined = undefined;
    const fieldValidation: string | undefined = undefined;
    //const  options
    const nodeName = utils.getPodNodeName(pod);
    const serviceName = `${config.GENERATE_NAME}service-${nodeName}`;
    const body: V1Service = {
      apiVersion: "v1",
      kind: "Service",
      metadata: { name: serviceName },
      spec: {
        selector: {
          [config.APP_TAG_NAME]: config.APP_TAG_VALUE,
          [config.LABEL_NODE_NAME]: nodeName,
        },
        ports: [{ protocol: "TCP", port: config.POD_PORT, targetPort: config.POD_PORT }],
      },
    };
    try {
      await this.coreV1Api.createNamespacedService(config.NAMESPACE, body, pretty, dryRun, fieldManager, fieldValidation);
    } catch (e) {
      if (e instanceof HttpError) {
        const { statusCode } = e;
        if (statusCode === 409) {
          return;
        }
        console.log(`Create Namespaced Service ${config.NAMESPACE}:${serviceName} failed with ErrorCode:${statusCode} `);
        console.log(`Body:`, e.body);
      }
    }
  }

  async delPodService(pod: V1Pod) {
    const nodeName = utils.getPodNodeName(pod);
    const name = `${config.GENERATE_NAME}service-${nodeName}`;
    this.coreV1Api.deleteNamespacedService(name, config.NAMESPACE);
  }

  updateIngress = debounce(500, () => {
    if (config.NO_INGRESS) return;
    const newList = [...this.nodeList.values()].map((e) => e.nodeName);
    const newListTxt = JSON.stringify(newList);
    if (newListTxt !== config.prevNode.txt) {
      config.prevNode.txt = newListTxt;
      console.log(
        "Live pods:",
        [...this.nodeList.values()].map((n) => `${n.podName} on Node ${n.nodeName}`),
      );

      const ingress = this.ingress;
      if (!ingress) return;
      if (!ingress.spec) ingress.spec = {};
      const spec = ingress.spec;
      if (!spec.rules) spec.rules = [];
      const rules = spec.rules;
      if (!rules.length) rules.push({ host: config.INGRESS_HOST });
      const rule = rules.find((r) => r.host == config.INGRESS_HOST) || rules[0];
      if (!rule.http) rule.http = { paths: [] };
      const http = rule.http;
      // drop old rules
      const servicePrefix = `${config.GENERATE_NAME}service-`;
      http.paths = http.paths.filter((elm) => !elm.backend.service || !elm.backend.service.name.startsWith(servicePrefix));
      for (const node of this.nodeList.values()) {
        const nodeName = node.nodeName;
        http.paths.push({
          path: `/${nodeName}`,
          pathType: "Prefix",
          backend: {
            service: {
              name: `${config.GENERATE_NAME}service-${nodeName}`, // node.podName, // node.podIP | node.podName
              port: {
                number: Number(config.POD_PORT),
              },
            },
          },
        });
      }
      delete ingress.status;
      if (ingress.metadata) {
        delete ingress.metadata.creationTimestamp;
        delete ingress.metadata.generation;
        delete ingress.metadata.managedFields;
        delete ingress.metadata.resourceVersion;
        delete ingress.metadata.uid;
      }
      this.networkingV1Api.replaceNamespacedIngress(config.INGRESS_NAME, config.NAMESPACE, ingress);
    }
  });

  public async watchIngress(): Promise<never> {
    const watch = new Watch(this.kubeconfig);
    const url = `/apis/networking.k8s.io/v1/namespaces/${config.NAMESPACE}/ingresses`;
    let errorCnt = 0;
    for (;;) {
      try {
        // console.log("Watching", url);
        const watching = new Promise<void>((resolve, reject) => {
          void watch.watch(
            url,
            {},
            (phase: string | "ADDED" | "MODIFIED" | "DELETED", ingress: V1Ingress) => {
              if (ingress.metadata && ingress.metadata.name === config.INGRESS_NAME) {
                this.ingress = ingress;
              }
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

  public async watchPod(): Promise<void> {
    const watch = new Watch(this.kubeconfig);
    const url = `/api/v1/namespaces/${config.NAMESPACE}/pods`;
    let errorCnt = 0;
    for (;;) {
      try {
        const watching = new Promise<void>((resolve, reject) => {
          void watch.watch(
            url,
            {},
            async (phase: string | "ADDED" | "MODIFIED" | "DELETED", pod: V1Pod) => {
              const podName = utils.getPodName(pod);
              if (!podName) return;
              if (phase === "DELETED") {
                this.nodeList.delete(podName);
                await this.delPodService(pod);
              } else if (utils.isPodValid(pod)) {
                await this.ensurePodLabel(pod);
                // (phase === "ADDED" || phase === "MODIFIED")
                const nodeName = utils.getPodNodeName(pod);
                const podIP = pod.status?.podIP || "";
                this.nodeList.set(podName, { podName, nodeName, podIP });
                await this.addPodService(pod);
              } else {
                this.nodeList.delete(podName);
              }
              this.updateIngress();
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
}

const updater = new IngressUpdater();
if (config.NO_INGRESS) {
  console.log("INGRESS GENERATION is not Enabled");
} else {
  console.log("Start watching Ingresses");
  updater.watchIngress();
  http
    .createServer((request, response) => {
      const headers = { "Content-Type": "application/json" };
      if (request.method != "GET") {
        response.writeHead(404, headers);
        response.end("404", "utf-8");
      } else {
        response.writeHead(200, headers);
        response.end(config.prevNode.txt, "utf-8");
      }
    })
    .listen(config.HTTP_PORT);
}
updater.watchPod();
