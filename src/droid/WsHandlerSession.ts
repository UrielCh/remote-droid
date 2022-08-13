import { PhoneService } from "src/droid/phone.service";
import PhoneGUI from "src/droid/PhoneGUI";
import * as WebSocket from "ws";
import { throttle } from "throttle-debounce";
import { H264Configuration, VideoStreamFramePacket } from "@u4/adbkit";
import { logAction } from "src/common/Logger";
import { KeyEvent } from "@u4/adbkit/dist/adb/thirdparty/STFService/STFServiceModel";
import { EventEmitter } from "stream";

const pKeyframe = new Uint8Array([153]); // k
const pupdateframe = new Uint8Array([165]); // u
const pconfframe = new Uint8Array([143]); // c

export class WsHandlerSession extends EventEmitter {
  queueMsg: null | string[] = [];
  device: PhoneGUI;
  /** is screen jpeg is being stream */
  screening = false;

  /** is screen video is being stream */
  streaming = false;
  nbFrame = 0;

  prevX = 0;
  prevY = 0;

  sendImg: throttle<(data: Buffer) => void>;
  sendImgHook = (data: Buffer) => this.sendImg(data);

  log(msg: string) {
    logAction(this.serial, msg);
  }

  sendConfigHook = (data: H264Configuration) => {
    this.log(`SND: ${JSON.stringify(data)}`);
    const msg = Buffer.from(JSON.stringify(data));
    const buf = new Uint8Array(msg.length + 1);
    buf.set(pconfframe);
    buf.set(msg, 1);
    return new Promise((resolv) => this.wsc.send(buf, resolv));
  };

  constructor(private phoneService: PhoneService, private wsc: WebSocket, private serial: string) {
    super();
    /**
     * get Message.
     */
    this.wsc.on("message", async (data: WebSocket.RawData, isBinary: boolean) => {
      if (!isBinary) {
        this.processMessage(data.toString());
      } else {
        this.log("RCV binary content");
      }
    });
  }

  async start(): Promise<this> {
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
    for (const msg of this.queueMsg) {
      this.processMessage(msg);
    }
    this.queueMsg = null;
    this.wsc.on("close", () => {
      this.stopScreen();
    });
  }

  private sendError(error: string) {
    this.wsc.send(JSON.stringify({ error }));
  }

  /**
   * queue message is not ready of process incomming message
   * @param msg Websocket message
   */
  async processMessage(msg: string): Promise<void> {
    if (!this.device) {
      if (this.queueMsg) this.queueMsg.push(msg);
      return;
    }
    // console.log(pc.white('RCV:') + pc.yellow(raw));
    try {
      const p = msg.indexOf(" ");
      if (p === -1) {
        this.invalidInput(msg);
        return;
      }
      const cmd = msg.substring(0, p);
      const param = msg.substring(p + 1);

      switch (cmd) {
        case "MJPEG":
          if (param === "1" || param === "on") this.startScreen();
          else if (param === "0" || param === "off") this.stopScreen();
          else if (param === "once") this.onceScreen();
          else this.sendError("invalid param expect screen on/off");
          break;
        case "video":
          if (param === "1" || param === "on") this.startVideo();
          else if (param === "0" || param === "off") this.stopVideo();
          else this.sendError("invalid param expect screen on/off");
          break;
        case "throttle":
          if (param.match(/^[0-9]+$/)) this.setThrottle(param);
          else this.sendError("invalid param expect throttle number");
          break;
        case "m": {
          // touch move
          const [p1, p2] = param.split(" ");
          this.prevX = Number(p1);
          this.prevY = Number(p2);
          this.device.touchMove(this.prevX, this.prevY, true);
          break;
        }
        case "d": {
          // touch down
          const [p1, p2] = param.split(" ");
          this.prevX = Number(p1);
          this.prevY = Number(p2);
          this.device.touchDown(this.prevX, this.prevY, true);
          break;
        }
        case "u": // up
          this.device.touchUp(this.prevX, this.prevY, true);
          break;
        case "text":
        case "t": {
          // text
          await this.device.doText(param);
          break;
        }
        case "key":
        case "k": {
          // keypress
          const [type, key] = param.split(" ");
          let event: KeyEvent;
          switch (type) {
            case "UP":
            case "U":
              event = KeyEvent.UP;
              break;
            case "DOWN":
            case "D":
              event = KeyEvent.DOWN;
              break;
            case "PRESS":
            case "P":
              event = KeyEvent.PRESS;
              break;
            default:
              this.sendError("invalid param for key UP/DOWN/PRESS keyCode");
          }
          const keyCode = Number(key);
          await this.device.doKeyEvent({ event, keyCode });
          break;
        }
        // event: KeyEvent; // keyCode: number; // shiftKey?: boolean; // ctrlKey?: boolean; // altKey?: boolean; // metaKey?: boolean; // symKey?: boolean;
        // functionKey?: boolean; // capsLockKey?: boolean;  // scrollLockKey?: boolean; // numLockKey?: boolean;
        default:
          this.invalidInput(msg);
      }
    } catch (e) {
      this.log(`unknown message: "${msg}" ${e}`);
    }
  }

  invalidInput(text: string) {
    this.sendError("Invalid param expect screen / info  / throttle");
    this.log(`default RCV "${text}"`);
  }

  ////////////////
  // jpeg part

  /**
   *
   * @param ms change Throttle speed
   */
  setThrottle(ms: number | string): void {
    this.sendImg = throttle(Number(ms), (data) => {
      this.wsc.send(data);
    });
  }

  async onceScreen() {
    try {
      if (this.device._lastCapture) {
        this.wsc.send(this.device._lastCapture);
      } else {
        const cap = await this.device.getMinicap();
        cap.once("data", (data) => {
          // console.log(`sent a ${data.length} buf`);
          this.sendImg(data);
        });
      }
    } catch (error) {
      this.close(error);
    }
  }

  async startScreen() {
    if (this.screening) return;
    try {
      await this.device.ensureCapture();
      if (this.device._lastCapture) {
        // this.log("Send First Screen")
        this.wsc.send(this.device._lastCapture);
      }
      this.device.on("jpeg", this.sendImgHook);
      this.screening = true;
      this.device.on("disconnect", () => {
        this.stopScreen();
        this.wsc.close(1012); // /service is restarting
      });
    } catch (error) {
      this.close(error);
    }
  }

  async stopScreen() {
    if (this.screening) {
      try {
        this.device.off("jpeg", this.sendImgHook);
        this.screening = false;
      } catch (error) {
        this.close(error);
      }
    }
  }

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
    buf.write(data.keyframe ? "k" : "u");
    buf.writeBigInt64BE(data.pts, 1);
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
  async startVideo() {
    if (!this.streaming) {
      try {
        // if (device.ctrl.getCaputeMode() !== 'scrcpy')
        //     return;
        const scrcpy = await this.device.getScrcpy({ encoderName: "OMX.qcom.video.encoder.avc", maxSize: 640 });
        scrcpy.on("config", this.sendConfigHook);
        scrcpy.on("frame", this.sendVideoHook);
        this.log("StartVideo ready");
        this.screening = true;
      } catch (error) {
        this.close(error);
      }
    }
  }
  async stopVideo() {
    if (this.screening) {
      try {
        const scrcpy = await this.device.getScrcpy();
        scrcpy.off("config", this.sendConfigHook);
        scrcpy.off("frame", this.sendVideoHook);
        this.screening = false;
      } catch (error) {
        this.close(error);
      }
    }
  }

  //////////
  // general

  async close(error: unknown) {
    this.log("clossing WS ERROR:" + error);
    if (error instanceof Error) this.wsc.close(1011, error.message); // 	Internal server error while operating
    else this.wsc.close(1011, `${error}`); // 	Internal server error while operating
    this.emit("disconnected");
  }
}
