import { DeviceService } from './device.service';
import * as WebSocket from 'ws';
import { logAction } from '../common/Logger';
import { WsHandlerCommon } from './WsHandlerCommon';
import { DbService } from '../db/db.service';

/**
 * copy from ws lin
 * Checks if a status code is allowed in a close frame.
 *
 * @param {Number} code The status code
 * @return {Boolean} `true` if the status code is valid, else `false`
 * @public
 */
function isValidStatusCode(code: number) {
  return (code >= 1000 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006) || (code >= 3000 && code <= 4999);
}

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
      let { code } = event;
      const { reason } = event;

      if (!code) code = 1000;

      if (!isValidStatusCode(code)) {
        console.log(`GET non suported websocket ErrorCode: "${code}" using 1000 intead`);
        code = 1000;
      }
      // ws not happy with close code 1005, replace 1005 by 1000;
      // if (!code || code === 1005) code = 1000;
      if (!(Number(code) > 0)) {
        this.log(`GET invalid websocket ErrorCode: "${code}"`);
        code = 1000;
      }
      this.closed = true;
      if (this.androidws) {
        const codeNum = Number(code) || 1000;
        try {
          console.info(`start closing WS with(${codeNum}, ${reason})`);
          this.androidws.close(codeNum, reason);
        } catch (e) {
          console.error(`UNEXPECTED ERROR: androidws.close(${codeNum}, ${reason}); failed with`, e);
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
