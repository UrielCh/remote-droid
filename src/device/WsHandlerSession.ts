import { WebSocket } from 'ws';
import { throttle } from 'throttle-debounce';
import { H264Configuration, KeyCodes, VideoStreamFramePacket } from '@u4/adbkit';

import { DeviceService } from './device.service.js';
import PhoneGUI from './PhoneGUI.js';
import { logAction } from '../common/Logger.js';
import { STFServiceModel } from '@u4/adbkit';
import { DbService } from '../db/db.service.js';
import { WsHandlerCommon } from './WsHandlerCommon.js';
// import picocolors from 'picocolors';
const { KeyEventMap } = STFServiceModel;
type KeyEvent = STFServiceModel.KeyEvent;

// const pKeyframe = new Uint8Array([153]); // k
// const pupdateframe = new Uint8Array([165]); // u
const pconfframe = new Uint8Array([143]); // c
const zero = BigInt(0);

export class WsHandlerSession extends WsHandlerCommon {
  device?: PhoneGUI;
  /** is screen jpeg is being stream */
  screening = false;

  /** is screen video is being stream */
  streaming = false;
  nbFrame = 0;

  prevX = 0;
  prevY = 0;

  sendImg?: throttle<(data: Buffer) => void>;
  sendImgHook = (data: Buffer) => {
    if (!this.sendImg)
      throw new Error('sendImg is not initialized, WsHandlerSession is not started');
    this.sendImg(data)
  };

  log(msg: string) {
    logAction(this.serial, msg);
  }

  sendConfigHook = (data: H264Configuration) => {
    this.log(`SND: ${JSON.stringify(data)}`);
    const msg = Buffer.from(JSON.stringify(data));
    const buf = new Uint8Array(msg.length + 1);
    buf.set(pconfframe);
    buf.set(msg, 1);

    return new Promise<void>((resolv, reject) => {
      this.wsc.send(buf, (error) => {
        if (error) {
          reject(error);
        } else {
          resolv();
        }
      });
    });
  };

  constructor(dbService: DbService, private phoneService: DeviceService, wsc: WebSocket, private serial: string) {
    super(dbService, wsc);
  }

  async start(): Promise<this> {
    if (this.user && !this.user.allowDevice(this.serial)) {
      this.wsc.close(1014, 'Unauthorized');
      return this;
    }
    /**
     * get Message.
     */
    this.wsc.onmessage = this.processMessage;
    try {
      this.device = await this.phoneService.getPhoneGui(this.serial);
    } catch (e) {
      // console.log('ws:', (e as Error).message);
      this.wsc.close(1014, (e as Error).message); // 	Server acting as gateway received an invalid response
      return this;
    }
    /**
     * Screen section
     */
    // if change img rate update sendImg
    this.setThrottle(500);
    // process quered message;
    this.flushQueue(this.processMessage);
    this.wsc.onclose = () => {
      if (this.device) this.stopScreen(this.device);
      this.notifyDisconect();
    };
    return this;
  }

  private sendError(error: string) {
    this.wsc.send(JSON.stringify({ error }));
  }

  /**
   * queue message is not ready of process incomming message
   * @param msg Websocket message
   */
  processMessage = async (event: WebSocket.MessageEvent): Promise<void> => {
    if (!this.device) {
      this.queue(event);
      return;
    }
    const msg = event.data.toString();
    // console.log(picocolors.white('WS RCV:') + picocolors.yellow(msg));
    try {
      const p = msg.indexOf(' ');
      let cmd = '';
      let param = '';

      if (p === -1) {
        cmd = msg;
      } else {
        cmd = msg.substring(0, p);
        param = msg.substring(p + 1);
      }

      switch (cmd) {
        case 'exit':
          //this.sendError("bye");
          this.close('bye');
          break;
        case 'auth':
          this.sendError('already authenticated or no auth needed');
          break;
        case 'mjpeg':
        case 'MJPEG':
          if (param === '1' || param === 'on') await this.startScreen(this.device);
          else if (param === '0' || param === 'off') this.stopScreen(this.device);
          else if (param === 'once') await this.onceScreen(this.device);
          else this.sendError('invalid param expect screen on/off');
          break;
        case 'video':
        case 'VIDEO':
          if (param === '1' || param === 'on') await this.startVideo(this.device);
          else if (param === '0' || param === 'off') await this.stopVideo(this.device);
          else this.sendError('invalid param expect screen on/off');
          break;
        case 'throttle':
        case 'THROTTLE':
          if (param.match(/^[0-9]+$/)) this.setThrottle(param);
          else this.sendError('invalid param expect throttle number');
          break;
        case 'm':
        case 'M': {
          // touch move
          const [p1, p2] = param.split(' ');
          this.prevX = Number(p1);
          this.prevY = Number(p2);
          await this.device.touchMove(this.prevX, this.prevY, true);
          break;
        }
        case 'd':
        case 'D': {
          // touch down
          const [p1, p2] = param.split(' ');
          this.prevX = Number(p1);
          this.prevY = Number(p2);
          await this.device.touchDown(this.prevX, this.prevY, true);
          break;
        }
        case 'u': // up
        case 'U':
          await this.device.touchUp(this.prevX, this.prevY, true);
          break;
        case 'text':
        case 'TEXT':
        case 't': {
          // text
          await this.device.doText(param);
          break;
        }
        case 'key':
        case 'KEY':
        case 'k': {
          // keypress
          const [type, key] = param.split(' ');
          let event: KeyEvent;
          switch (type) {
            case 'UP':
            case 'up':
            case 'U':
            case 'u':
              event = KeyEventMap.UP;
              break;
            case 'DOWN':
            case 'down':
            case 'D':
            case 'd':
              event = KeyEventMap.DOWN;
              break;
            case 'PRESS':
            case 'press':
            case 'P':
            case 'p':
              event = KeyEventMap.PRESS;
              break;
            default:
              const msg = `Invalid sub-key type: ${type} valide types: UP/DOWN/PRESS`;
              this.sendError(msg);
              this.log(`default RCV "${msg}" bad type: ${type}`);
              return;
          }
          const keyCode = Number(key) as KeyCodes;
          await this.device.doKeyEvent({ event, keyCode });
          break;
        }
        // event: KeyEvent; // keyCode: number; // shiftKey?: boolean; // ctrlKey?: boolean; // altKey?: boolean; // metaKey?: boolean; // symKey?: boolean;
        // functionKey?: boolean; // capsLockKey?: boolean;  // scrollLockKey?: boolean; // numLockKey?: boolean;
        default:
          this.invalidInput(msg);
      }
    } catch (e) {
      this.log(`Error handling message: "${msg}": ${e}`);
    }
  };

  invalidInput(msg: string) {
    this.sendError(`Invalid function "${msg}" expect: exit / MJPEG / video / screen / throttle / M / D / U`);
    this.log(`default RCV "${msg}"`);
  }

  ////////////////
  // jpeg part

  /**
   *
   * @param ms change Throttle speed
   */
  setThrottle(ms: number | string): void {
    this.sendImg = throttle(Number(ms), (data: Buffer) => {
      this.wsc.send(data);
    });
  }

  async onceScreen(device: PhoneGUI) {
    try {
      if (device._lastCaptureJpg) {
        this.wsc.send(device._lastCaptureJpg);
      } else {
        const cap = await device.getMinicap();
        cap.once('data', (data) => {
          // console.log(`sent a ${data.length} buf`);
          if (!this.sendImg)
            throw new Error('sendImg is not initialized, WsHandlerSession is not started');
          this.sendImg(data);
        });
      }
    } catch (error) {
      console.error('CloseErrro:', error);
      this.close(error as Error);
    }
  }

  async startScreen(device: PhoneGUI) {
    if (this.screening) return;
    try {
      await device.ensureCapture();
      if (device._lastCaptureJpg) {
        // this.log("Send First Screen")
        this.wsc.send(device._lastCaptureJpg);
      }
      device.on('jpeg', this.sendImgHook);
      this.screening = true;
      device.once('disconnect', () => {
        this.stopScreen(device);
        this.wsc.close(1012); // /service is restarting
      });
    } catch (error) {
      this.close(error as Error);
    }
  }

  stopScreen = (device: PhoneGUI) => {
    if (this.screening) {
      try {
        device.off('jpeg', this.sendImgHook);
        this.screening = false;
      } catch (error) {
        this.close(error as Error);
      }
    }
  };

  ////////////////
  // video part
  async sendVideoHook(data: VideoStreamFramePacket) {
    if (this.nbFrame == 0) {
      if (data.config) {
        await this.sendConfigHook(data.config);
        this.nbFrame++;
      }
    } else {
      this.nbFrame++;
    }
    const buf = Buffer.allocUnsafe(data.data.length + 1 + 8);
    buf.write(data.keyframe ? 'k' : 'u');
    buf.writeBigInt64BE(data.pts || zero, 1);
    buf.copy(data.data, 9);
    // const buf = new Uint8Array(data.data.length + 1)
    // buf.set(data.keyframe ? pKeyframe : pupdateframe);
    // buf.set(data.data, 1);
    // Number(data.pts)
    // keyframe?: boolean | undefined;
    // pts?: bigint | undefined;
    // data: Uint8Array;
    this.wsc.send(buf);
  }

  // const config: H264Configuration | null = null;
  async startVideo(device: PhoneGUI) {
    if (!this.streaming) {
      try {
        // if (device.ctrl.getCaputeMode() !== 'scrcpy')
        //     return;
        const scrcpy = await device.getScrcpy({ encoderName: 'OMX.qcom.video.encoder.avc', maxSize: 640 });
        scrcpy.on('config', this.sendConfigHook);
        scrcpy.on('frame', this.sendVideoHook);
        this.log('StartVideo ready');
        this.screening = true;
      } catch (error) {
        this.close(error as Error);
      }
    }
  }
  async stopVideo(device: PhoneGUI) {
    if (this.screening) {
      try {
        const scrcpy = await device.getScrcpy();
        scrcpy.off('config', this.sendConfigHook);
        scrcpy.off('frame', this.sendVideoHook);
        this.screening = false;
      } catch (error) {
        this.close(error as Error);
      }
    }
  }
}
