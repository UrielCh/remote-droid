import * as WebSocket from "ws";
import { Device, Tracker } from "@u4/adbkit";
import { logAction } from "../common/Logger";
import { AdbClientService } from "./adbClient.service";
import { WsHandlerCommon } from "./WsHandlerCommon";
import { DbService } from "../db/db.service";

export class WsHandlerTracking extends WsHandlerCommon {
  queueMsg: null | string[] = [];
  tracker: Tracker | undefined;
  log(msg: string) {
    logAction("general", msg);
  }

  constructor(dbService: DbService, private adbClient: AdbClientService, wsc: WebSocket) {
    super(dbService, wsc);
  }

  async start(): Promise<this> {
    const tracker = (this.tracker = await this.adbClient.tracker);
    tracker.on("online", this.online);
    tracker.on("offline", this.offline);
    this.wsc.onclose = () => {
      tracker.off("online", this.online);
      tracker.off("offline", this.offline);
      // may close tracker if no more listener.
    };
    return this;
  }
  online = (device: Device) => {
    if (this.user && !this.user.allowDevice(device.id)) {
      return;
    }
    this.wsc.send(`online ${device.id} ${device.type}`);
  };
  offline = (device: Device) => {
    if (this.user && !this.user.allowDevice(device.id)) {
      return;
    }
    this.wsc.send(`offline ${device.id} ${device.type}`);
  };
}
