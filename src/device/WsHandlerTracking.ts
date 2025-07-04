import { WebSocket } from 'ws';
import { Device, Tracker } from '@u4/adbkit';
import { logAction } from '../common/Logger.js';
import { AdbClientService } from './adbClient.service.js';
import { WsHandlerCommon } from './WsHandlerCommon.js';
import { DbService } from '../db/db.service.js';

export class WsHandlerTracking extends WsHandlerCommon {
  tracker: Tracker | undefined;
  log(msg: string) {
    logAction('general', msg);
  }

  constructor(dbService: DbService, private adbClient: AdbClientService, wsc: WebSocket) {
    super(dbService, wsc);
  }

  async start(): Promise<this> {
    this.flushQueue();
    const tracker = (this.tracker = await this.adbClient.tracker);
    tracker.on('online', this.online);
    tracker.on('offline', this.offline);
    this.wsc.onclose = () => {
      tracker.off('online', this.online);
      tracker.off('offline', this.offline);
      this.notifyDisconect();
      // may close tracker if no more listener.
    };
    this.wsc.onmessage = this.processMessage;
    const devices: Device[] = await this.adbClient.listDevices();
    for (const device of devices) {
      this.online(device);
    }
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
  processMessage = (event: WebSocket.MessageEvent): void => {
    const msg = event.data.toString();
    if (msg === 'exit') {
      this.close('bye');
    }
  };
}
