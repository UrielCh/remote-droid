import { CoreV1Api, V1Pod, V1Service, HttpError } from "@kubernetes/client-node";
import { IngressConfig } from "./IngressConfig";

interface PodData {
  //  podName: string;
  nodeName: string;
  // podIP: string;
}

function isPodValid(pod: V1Pod): boolean {
  if (pod.status && pod.status.conditions) {
    let conditions = pod.status.conditions;
    conditions = conditions.filter((cond) => cond.type === "Ready");
    if (conditions.length) {
      if (conditions[0].status === "False") return false;
      else return true;
    }
  }
  return false;
}

type Podname = string;

export class IngressRouteSetConf {
  public name = "";
  public selectorKey = "";
  public selectorValue = "";
  public prefix = "/NODENAME";
  public prefixBase = "/";
  public port = 0;
  public targetPort = 0;
  public generateName = "-";

  constructor(private parent: IngressConfig) {}

  get namepace(): string {
    return this.parent.namespace;
  }

  // live list
  nodeList = new Map<Podname, PodData>();

  public getNodeNames(): string[] {
    return [...this.nodeList.values()].map((e) => e.nodeName);
  }

  public set(key: string, value = "") {
    switch (key) {
      case "name":
        this.name = value;
        this.generateName = value + "-";
        break;
      case "selector":
        {
          const p = value.indexOf("=");
          if (p === -1) throw Error(`invalid selector value "${value}", selector must contains an =`);
          this.selectorKey = value.substring(0, p);
          this.selectorValue = value.substring(p + 1);
        }
        break;
      case "prefix":
        this.prefix = value;
        this.prefixBase = this.prefix.replace("NODENAME", "");
        break;
      case "port":
        this.port = Number(value);
        break;
      case "targetPort":
        this.targetPort = Number(value);
        break;
    }
  }

  private get namespace(): string {
    return this.parent.namespace;
  }

  private get coreV1Api(): CoreV1Api {
    return this.parent.parent.coreV1Api;
  }

  public visitPod(pod: V1Pod, removed?: boolean): IngressRouteSetConf | null {
    const { metadata, spec } = pod;
    if (!metadata || !spec) return null;
    if (!metadata.name) return null;
    if (metadata.generateName !== this.generateName) return null;
    if (removed) {
      this.nodeList.delete(metadata.name);
      this.delPodService(pod);
      //
    } else {
      if (isPodValid(pod)) {
        this.nodeList.set(metadata.name, { nodeName: spec.nodeName || "---" });
      } else {
        // pod not ready yet
        this.nodeList.delete(metadata.name);
      }
    }
    this.parent.change();
    // TODO add code
    return this;
  }

  private async delPodService(pod: V1Pod) {
    const nodeName = pod.spec?.nodeName || "";
    const name = `${this.generateName}service-${nodeName}`;
    this.coreV1Api.deleteNamespacedService(name, this.namespace);
  }

  async addPodService(pod: V1Pod) {
    const nodeName = pod.spec?.nodeName || "";
    const serviceName = `${this.generateName}service-${nodeName}`;
    const body: V1Service = {
      apiVersion: "v1",
      kind: "Service",
      metadata: { name: serviceName },
      spec: {
        selector: {
          [this.selectorKey]: this.selectorValue,
          [this.parent.parent.LABEL_NODE_NAME]: nodeName,
        },
        ports: [{ protocol: "TCP", port: this.port, targetPort: this.port }],
      },
    };
    try {
      await this.coreV1Api.createNamespacedService(this.namepace, body, undefined, undefined, undefined, undefined);
    } catch (e) {
      if (e instanceof HttpError) {
        const { statusCode } = e;
        if (statusCode === 409) {
          return;
        }
        console.log(`Create Namespaced Service ${this.namepace}:${serviceName} failed with ErrorCode:${statusCode} `);
        console.log(`Body:`, e.body);
      }
    }
  }

  public validate(parent: string): void {
    if (!this.name) {
      throw Error(`missing env key: ${parent}.name`);
    }
    if (!this.selectorKey) {
      throw Error(`missing env key: ${parent}.selector`);
    }
    if (!this.selectorValue) {
      throw Error(`missing env key: ${parent}.selector`);
    }
    if (!this.prefix.startsWith("/")) {
      throw Error(`invalid env value for ${parent}.prefix, sould start by a /`);
    }
    if (!(this.port > 1) || this.port > 65535) {
      throw Error(`Invalid env ${parent}.port must be a valid port [1-65535]`);
    }
    if (this.targetPort) {
      if (!(this.port > 1) || this.port > 65535) {
        throw Error(`Invalid env ${parent}.targetPort must be a valid port [1-65535]`);
      }
    } else {
      this.targetPort = this.port;
    }
  }
}
