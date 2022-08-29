import { PhoneService } from "../droid/phone.service";
import WebSocket from "ws";
import { logAction } from "../common/Logger";
import { EventEmitter } from "stream";

export class WsFowardSession extends EventEmitter {
  queueMsg: Array<[WebSocket.RawData, boolean]> | null = [];
  androidws: WebSocket;
  closed = false;

  log(msg: string) {
    logAction(this.serial, msg);
  }

  constructor(private phoneService: PhoneService, private wsc: WebSocket, private serial: string) {
    super();
    /**
     * get Message.
     */
    this.wsc.on("message", this.processMessage);
    this.wsc.on("close", (code: number, reason: Buffer) => {
      // ws not happy with close code 1005, replace 1005 by 1000;
      if (!code || code === 1005) code = 1000;
      if (!(Number(code) > 0)) {
        this.log(`GET invalid websocker ErrorCode: "${code}"`);
        code = 1000;
      }
      this.closed = true;
      if (this.androidws) this.androidws.close(code || 1000, reason);
      this.emit("disconnected");
    });
  }
  async start(remote: string, uri: string) {
    const phone = await this.phoneService.getPhoneGui(this.serial);

    let dstPort = Number(remote);
    if (!(dstPort > 0)) {
      // TCP:PORT
      // UDP:PORT
      // localabstract:
      dstPort = await phone.client.tryForwardTCP(remote);
    }
    const endpoint = `ws://127.0.0.1:${dstPort}${uri}`;
    const androidws = new WebSocket(endpoint);

    androidws.on("message", (data: WebSocket.RawData, binary: boolean) => {
      this.wsc.send(data, { binary });
    });

    /**closed from the android device */
    androidws.once("close", () => {
      this.wsc.close(1000, "android device cut connection");
    });

    androidws.once("open", () => {
      if (this.closed) {
        androidws.close(1000, "connetion abort");
        return;
      }

      this.androidws = androidws;
      if (this.queueMsg)
        for (const [data, binary] of this.queueMsg) {
          this.processMessage(data, binary);
        }
      this.queueMsg = null;
    });
    this.log(`Starting session on ${endpoint}`);
  }

  processMessage = async (data: WebSocket.RawData, binary: boolean): Promise<void> => {
    if (!this.androidws) {
      if (this.queueMsg) this.queueMsg.push([data, binary]);
      return;
    }
    this.androidws.send(data, { binary });
  };
}
