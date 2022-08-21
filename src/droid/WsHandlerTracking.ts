import * as WebSocket from "ws";
import { Device, Tracker } from "@u4/adbkit";
import { logAction } from "../common/Logger";
import { EventEmitter } from "stream";
import { AdbClientService } from "./adbClient.service";

export class WsHandlerTracking extends EventEmitter {
  queueMsg: null | string[] = [];
  tracker: Tracker | undefined;
  log(msg: string) {
    logAction("general", msg);
  }

  constructor(private adbClient: AdbClientService, private wsc: WebSocket) {
    super();
  }

  async start(): Promise<this> {
    this.tracker = await this.adbClient.tracker;
    this.tracker.on("online", this.online);
    this.tracker.on("offline", this.offline);
    this.wsc.onclose = () => {
      this.tracker.off("online", this.online);
      this.tracker.off("offline", this.offline);
      // may close tracker if no more listener.
    };
    return this;
  }
  online = (device: Device) => this.wsc.send(`online ${device.id} ${device.type}`);
  offline = (device: Device) => this.wsc.send(`offline ${device.id} ${device.type}`);
}
