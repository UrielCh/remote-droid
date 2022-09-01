import { KubeConfig } from "@kubernetes/client-node";
import { homedir } from "os";
import { join } from "path";
import { existsSync } from "fs";
import http from "http";
import { Config } from "./config";

class IngressUpdater {
  kubeconfig: KubeConfig;
  config: Config;

  constructor() {
    const kubeconf = join(homedir(), ".kube", "config");

    this.kubeconfig = new KubeConfig();
    if (existsSync(kubeconf)) this.kubeconfig.loadFromFile(kubeconf);
    else this.kubeconfig.loadFromCluster();
    this.config = new Config(this.kubeconfig);
  }

  public start() {
    this.config.watchIngresses();
    http
      .createServer((request, response) => {
        const headers = { "Content-Type": "application/json" };
        if (request.method != "GET") {
          response.writeHead(404, headers);
          response.end("404 only support GET", "utf-8");
        } else {
          if (request.url === "/") {
            response.writeHead(200, headers);
            response.end(this.config.getSummery(), "utf-8");
          }
        }
      })
      .listen(this.config.HTTP_PORT);
    this.config.watchPods();
  }
}

const updater = new IngressUpdater();
updater.start();
