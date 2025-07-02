import { WebSocket } from 'ws';
import { DeviceService } from './device.service.js';
import { logAction } from '../common/Logger.js';
import { WsHandlerCommon } from './WsHandlerCommon.js';
import { DbService } from '../db/db.service.js';

export class WsFowardSession extends WsHandlerCommon {
  androidws?: WebSocket;

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
      let { code } = event;
      const { reason } = event;
      if (!code) code = 1000;
      // else if (code === 1005 || code === 1006) code = 1000;

      if (!this.isValidStatusCode(code)) {
        // console.log(`GET non suported websocket ErrorCode: "${code}" using 1000 intead`);
        code = 1000;
      }
      if (!(Number(code) > 0)) {
        this.log(`GET invalid websocket ErrorCode: "${code}"`);
        code = 1000;
      }
      if (this.androidws) {
        const codeNum = Number(code) || 1000;
        try {
          // console.info(`start closing WS with(${codeNum}, ${reason})`);
          this.androidws.close(codeNum, reason);
          this.androidws = undefined;
        } catch (e) {
          console.error(`UNEXPECTED ERROR: androidws.close(${codeNum}, ${reason}); failed with`, e);
        }
      }
      this.notifyDisconect();
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
    const androidws = new WebSocket(endpoint);

    androidws.onmessage = (event: WebSocket.MessageEvent) => {
      this.wsc.send(event.data);
    };

    /**closed from the android device */
    androidws.onerror = () => {
      this.close('android device connection failed');
      // android side close triger client websocket close
      this.wsc.close(1000, 'android device connection failed');
    };

    /**closed from the android device */
    androidws.onclose = () => {
      this.close('android device cut connection');
      // android side close triger client websocket close
      this.wsc.close(1000, 'android device cut connection');
    };
    androidws.onopen = () => {
      if (this.closed) {
        if (androidws) {
          androidws.close(1000, 'connetion abort');
          this.androidws = undefined;
        }
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
    } else {
      this.androidws.send(event.data);
    }
  };
}
