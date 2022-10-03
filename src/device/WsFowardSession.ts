import { DeviceService } from './device.service';
import * as WebSocket from 'ws';
import { logAction } from '../common/Logger';
import { WsHandlerCommon } from './WsHandlerCommon';
import { DbService } from '../db/db.service';

export class WsFowardSession extends WsHandlerCommon {
  androidws: WebSocket.WebSocket;
  closed = false;

  log(msg: string) {
    logAction(this.serial, msg);
  }

  constructor(dbService: DbService, private phoneService: DeviceService, wsc: WebSocket, private serial: string) {
    super(dbService, wsc);
  }
  async start(remote: string, uri: string) {
    if (this.user && !this.user.allowDevice(this.serial)) {
      this.wsc.close(1014, 'Unauthorized');
      return this;
    }

    /**
     * get Message.
     */
    this.wsc.onmessage = this.processMessage;
    this.wsc.onclose = (event: WebSocket.CloseEvent) => {
      // eslint-disable-next-line prefer-const
      let { code, reason } = event;
      // ws not happy with close code 1005, replace 1005 by 1000;
      if (!code || code === 1005) code = 1000;
      if (!(Number(code) > 0)) {
        this.log(`GET invalid websocker ErrorCode: "${code}"`);
        code = 1000;
      }
      this.closed = true;
      if (this.androidws) {
        const NumCode = Number(code) || 1000;
        try {
          this.androidws.close(NumCode, reason);
        } catch (e) {
          console.error(`UNEXPECTED ERROR: androidws.close(${NumCode}, ${reason}); failed with`, e);
        }
      }
      this.emit('disconnected');
    };
    // this.wsc.on('close', (code: number, reason: Buffer) => {});

    const phone = await this.phoneService.getPhoneGui(this.serial);

    let dstPort = Number(remote);
    if (!(dstPort > 0)) {
      // TCP:PORT
      // UDP:PORT
      // localabstract:
      dstPort = await phone.client.tryForwardTCP(remote);
    }
    const endpoint = `ws://127.0.0.1:${dstPort}${uri}`;
    const androidws = new WebSocket.WebSocket(endpoint);

    androidws.onmessage = (event: WebSocket.MessageEvent) => {
      this.wsc.send(event.data);
    };

    /**closed from the android device */
    androidws.onclose = () => {
      this.close('android device cut connection');
      // this.wsc.close(1000, "android device cut connection");
    };
    androidws.onopen = () => {
      if (this.closed) {
        androidws.close(1000, 'connetion abort');
        return;
      }

      this.androidws = androidws;
      this.flushQueue(this.processMessage);
    };
    this.log(`Starting session on ${endpoint}`);
  }

  processMessage = (event: WebSocket.MessageEvent): void => {
    if (!this.androidws) {
      this.queue(event);
      return;
    }
    this.androidws.send(event.data);
  };
}
