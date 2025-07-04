import fs from 'node:fs';
import { EventEmitter } from 'node:events';

import { isPromiseResolved } from 'promise-status-async';
import { NotFoundException } from '@nestjs/common';
import pc from 'picocolors';
import { fromEventPattern } from 'rxjs';
import {
  type Device,
  DeviceClient,
  type KeyCodes,
  KeyCodesMap,
  Minicap,
  type MinicapOptions,
  type MotionEvent,
  MotionEventMap,
  type RebootType,
  Scrcpy,
  ScrcpyOptions,
  STFService,
  type STFServiceOptions,
  Utils,
} from '@u4/adbkit';
import { STFServiceModel } from '@u4/adbkit';
import { logAction } from '../common/Logger.js';
// import resources from "../data/Resources";
import { Namespace, SettingsGlobalKey, SettingsKey, SettingsSecureKey, SettingsSystemKey } from '../schemas/vars.js';
import { PngScreenShot } from './pngScreenShot.js';
import pto from '../common/pto.js';

const { ClipboardTypeMap, KeyEventMap } = STFServiceModel;
type KeyEventRequest = STFServiceModel.KeyEventRequest;

export type PhoneState = {
  lastEv: string;
  nbHit: number;
  nbFail: number;
  pass: number;
};

const pointerId = BigInt('0xFFFFFFFFFFFFFFFF');
const PRELOAD_SERVICES = false;
/**
 * enforce EventEmitter typing
 */
interface IEmissions {
  // a new jpeg get captured
  jpeg: (data: Buffer) => void;
  // a capture process get disonectedl
  disconnect: (cause: string) => void;
  tap: (data: { x: number; y: number; durration: number }) => void;
  swipe: (data: { x1: number; y1: number; x2: number; y2: number; durration: number }) => void;
}

export default class PhoneGUI extends EventEmitter {
  propsTime = 0;
  props?: Promise<Record<string, string>>; // Record<string, string>;

  closed = false;
  #serial: string;
  offline = 0;
  hostname = '';
  public readonly client: DeviceClient;
  private size?: { width: number; height: number };

  private _scrcpy?: Promise<Scrcpy>;
  private _minicap?: Promise<Minicap>;
  private _STFService?: Promise<STFService>;

  private mode: {
    USE_scrcpy?: Partial<ScrcpyOptions>;
    USE_minicap?: Partial<MinicapOptions>;
    USE_STFService?: Partial<STFServiceOptions>;
  };

  public get serial(): string {
    return this.#serial;
  }

  constructor(
    public readonly device: Device, // DeviceClient,
  ) {
    super();
    this.client = device.getClient();
    // enable STFService
    this.mode = {
      USE_scrcpy: undefined,
      USE_minicap: {},
      USE_STFService: {},
    };
    this.#serial = device.id;
    // this.on("swipe", (ev) => this.emit("input", { type: "swipe", ...ev }));
    // this.on("tap", (ev) => this.emit("input", { type: "tap", ...ev }));
    //this.on("disconnect", () => this.emit("disconnect"));
  }

  public on = <K extends keyof IEmissions>(event: K, listener: IEmissions[K]): this => super.on(event, listener);
  public off = <K extends keyof IEmissions>(event: K, listener: IEmissions[K]): this => super.off(event, listener);
  public once = <K extends keyof IEmissions>(event: K, listener: IEmissions[K]): this => super.once(event, listener);
  public emit = <K extends keyof IEmissions>(event: K, ...args: Parameters<IEmissions[K]>): boolean => super.emit(event, ...args);

  public async initPhoneGUI(maxTime?: number): Promise<this> {
    await this.initPhoneCtrl(maxTime);
    return this;
  }

  public startCount = 0;
  public startId = 0;
  public running = false;

  public reboot(type?: RebootType): Promise<boolean> {
    return this.client.reboot(type);
  }

  nextEvent: Promise<any> = Promise.resolve('');

  queueEvent(next: () => Promise<any>, name: string): Promise<any> {
    const timeout = 35;
    const up = this.nextEvent.then(async () => {
      try {
        const p = pto(next(), timeout);
        await p;
        // p.clear();
        return p;
        // await pTimeout(next(), 500, Error(`Timeout executing ${name}`));
      } catch (e) {
        const msg = `queueEvent ${this.#serial} Timeout(${timeout}ms) on ${name}`;
        logAction(this.#serial, msg);
        console.log(msg);
      }
    });
    //const up = this.nextEvent.then(next);
    this.nextEvent = up;
    return up;
  }

  /**
   * boost transition
   */
  async boostTransition(): Promise<number> {
    let changes = 0;
    const settings = await this.getSettings('global');
    if (settings.animator_duration_scale != '0.05') {
      await this.setSetting('global', 'animator_duration_scale', '0.05');
      changes++;
    }
    if (settings.transition_animation_scale != '0.05') {
      await this.setSetting('global', 'transition_animation_scale', '0.05');
      changes++;
    }
    if (settings.window_animation_scale != '0.05') {
      await this.setSetting('global', 'window_animation_scale', '0.05');
      changes++;
    }
    return changes;
  }
  /**
   *  change brightness
   * @param value 0-255
   */
  brightness(value: number): Promise<string> {
    return this.shell(`su -c "echo ${value} > /sys/devices/platform/soc/ae00000.qcom,mdss_mdp/backlight/panel0-backlight/brightness"`);
  }

  /**
   * enable / disable wifi
   */
  setWifi(enable: boolean): Promise<string> {
    const action = enable ? 'enable' : 'disable';
    this.log(`Set wifi ${action}`);
    return this.shell(`svc wifi ${action}`);
  }

  setData(enable: boolean): Promise<string> {
    const action = enable ? 'enable' : 'disable';
    this.log(`Set mobile data ${action}`);
    return this.shell(`svc data ${action}`);
  }

  clipboardEnabled = false;
  /**
   * install Adb Clipboard_v2.0
   */
  // async enableClipboard(): Promise<void> {
  //   if (this.clipboardEnabled) return;
  //   const pkgs = new Set(await this.client.getPackages());
  //   this.log("EnableClipboard");
  //   if (!pkgs.has("ch.pete.adbclipboard")) {
  //     await this.client.install(resources.apk("Adb Clipboard_v2.0_apkpure.com.apk"));
  //   }
  //   this.clipboardEnabled = true;
  // }

  log(action: string): void {
    if (action.length > 200) action = action.substring(0, 200);
    const text = action;
    logAction(this.#serial, text);
  }

  log2(msg: string): void {
    logAction(this.#serial, msg);
  }

  async killProcess(pkg: string): Promise<boolean> {
    let processes = await this.client.getPs('-A');
    processes = processes.filter((p) => p.NAME === pkg);
    if (processes.length) {
      this.log(`Killing ${pkg} PID: ${processes[0].PID}`);
      const resp = await this.client.shell(`su -c 'kill ${processes[0].PID}'`);
      const txt = (await Utils.readAll(resp)).toString('utf-8');
      this.log(`su -c kill ${processes[0].PID} ret: ${txt}`);
      return true;
    }
    return false;
  }

  async avion(): Promise<void> {
    this.log('mode avion');
    await this.client.extra.airPlainMode(false, 200);
    await this.back();
  }

  public async touchDown(x: number, y: number, percent = false): Promise<void> {
    if (this.mode.USE_scrcpy) {
      await this.queueEvent(async () => {
        const scrcpy = await this.getScrcpy();
        await scrcpy.width;
        const { width, height } = await this.getSize();
        const screenSize = { x: width, y: height };
        if (percent) {
          x = (x * width) | 0;
          y = (y * height) | 0;
        }
        return scrcpy.injectTouchEvent(MotionEventMap.ACTION_DOWN, pointerId, { x, y }, screenSize, 0xffff);
      }, 'scrcpy touchDown');
      return;
    }
    if (this.mode.USE_STFService) {
      await this.queueEvent(async () => {
        const service = await this.getSTFService();
        if (percent) {
          const { width, height } = await this.getSize();
          x = (x * width) | 0;
          y = (y * height) | 0;
        }
        return service.downCommit(x, y);
      }, 'STFService touchDown');
      return;
    }
    throw Error('touchDown can only work with USE_scrcpy or USE_STFService');
  }

  public async touchMove(x: number, y: number, percent = false): Promise<void> {
    if (this.mode.USE_scrcpy) {
      await this.queueEvent(async () => {
        const scrcpy = await this.getScrcpy();
        await scrcpy.width;
        const { width, height } = await this.getSize();
        const screenSize = { x: width, y: height };
        if (percent) {
          x = (x * width) | 0;
          y = (y * height) | 0;
        }
        return scrcpy.injectTouchEvent(MotionEventMap.ACTION_MOVE, pointerId, { x, y }, screenSize, 0xffff);
      }, 'scrcpy touchMove');
      return;
    }
    if (this.mode.USE_STFService) {
      await this.queueEvent(async () => {
        const STFService = await this.getSTFService();
        if (percent) {
          const { width, height } = await this.getSize();
          x = (x * width) | 0;
          y = (y * height) | 0;
        }
        return STFService.moveCommit(x, y);
      }, 'STFService touchMove');
      return;
    }
    throw Error('touchMove can only work with USE_scrcpy or USE_STFService');
  }

  public async touchUp(x: number, y: number, percent = false): Promise<void> {
    if (this.mode.USE_scrcpy) {
      await this.queueEvent(async () => {
        const scrcpy = await this.getScrcpy();
        await scrcpy.width;
        const { width, height } = await this.getSize();
        const screenSize = { x: width, y: height };
        if (percent) {
          x = (x * width) | 0;
          y = (y * height) | 0;
        }
        return scrcpy.injectTouchEvent(MotionEventMap.ACTION_UP, pointerId, { x, y }, screenSize, 0xffff);
      }, 'scrcpy touchUp');
      return;
    }
    if (this.mode.USE_STFService) {
      await this.queueEvent(async () => {
        const service = await this.getSTFService();
        return service.upCommit();
      }, 'STFService touchUp');
      return;
    }
    throw Error('touchUp can only work with USE_scrcpy or USE_STFService');
  }

  tap(x: number, y: number): Promise<void> {
    return this.swipe(x, y, x, y, 10);
    // this.assertOnline();
    // this.emit('input', { type: 'tap', x, y });
    // const resp = await this.client.shell(`input tap ${x} ${y}`);
    // await streamToString(resp);
  }

  tapPercent(x: number, y: number): Promise<void> {
    return this.swipePercent(x, y, x, y, 10);
  }

  async swipePercent(px1: number, py1: number, px2: number, py2: number, durration: number): Promise<void> {
    await this.assertOnline();
    const { width, height } = await this.getSize();
    let x1 = px1 * width;
    let y1 = py1 * height;
    let x2 = px2 * width;
    let y2 = py2 * height;

    const dx = x2 - x1;
    const dy = y2 - y1;

    y1 = Math.floor(y1);
    y2 = Math.floor(y2);

    x1 = Math.floor(x1);
    x2 = Math.floor(x2);
    durration = Math.round(durration);
    if (x1 == x2 && y1 == y2) {
      this.emit('tap', { x: x1, y: y1, durration }); // add print ?
    } else {
      this.emit('swipe', { x1, y1, x2, y2, durration });
    }

    if (this.mode.USE_scrcpy || this.mode.USE_STFService) {
      const start = Date.now();
      let now = start;
      const end = start + durration;
      const position = { x: x1, y: y1 };
      await this.touchDown(position.x, position.y);
      if (dx == 0 && dy == 0) {
        await Utils.delay(durration);
      } else {
        while (now < end) {
          await Utils.delay(8);
          now = Date.now();
          let timeRatio = (now - start) / durration;
          if (timeRatio > 1) timeRatio = 1;
          const nextX = (x1 + dx * timeRatio) | 0;
          const nextY = (y1 + dy * timeRatio) | 0;
          if (position.x != nextX || position.y != nextY) {
            position.x = nextX;
            position.y = nextY;
            await this.touchMove(position.x, position.y);
          }
        }
      }
      await this.touchUp(position.x, position.y);
    } else {
      const cmd = `input swipe ${x1} ${y1} ${x2} ${y2} ${durration}`;
      await this.queueEvent(async () => {
        await this.client.execOut(cmd);
      }, 'cmd');
    }
  }

  // # Swipe X1 Y1 X2 Y2 [duration(ms)]:
  async swipe_menu_on(): Promise<void> {
    await this.swipePercent(0.3, 0.01, 0.3, 0.6, 200);
    // await this.shell('input swipe 300 20 300 1450 200');
  }
  // # Swipe X1 Y1 X2 Y2 [duration(ms)]:
  async swipe_menu_off(): Promise<void> {
    await this.swipePercent(0.3, 0.1, 0.3, 0, 200);
    // await this.shell('input swipe 300 1450 300 300 20');
  }

  private async scollDown(cnt: number, sleep = 1.5): Promise<void> {
    logAction(this.serial, 'scollDown');
    await this.swipePercent(0.5, 0.66, 0.5, 0.59 - 0.12 * cnt, 80);
    await Utils.delay(sleep * 1000); /* was 1 sec */
  }

  /**
   *
   * @param entryPoint
   * am start -W -n com.linuxjet.apps.ChromeUA/.MainActivity
   * am start -W -n com.rosteam.gpsemulator/.MainActivity
   * am start -W -n com.google.android.apps.messaging/.ui.ConversationListActivity
   * am start -W -n com.playgendary.tom/com.lllibset.LLActivity.LLActivity
   */
  async startApplication(entryPoint: string) {
    await this.shell(`am start -W -n ${entryPoint}`);
    // dumpsys activity broadcasts |grep -iE ".+\.[0-9A-Z_\-]+:$" |sort
    // pm list packages
    // pm list packages -3
    // dumpsys package | grep -Eo "^[[:space:]]+[0-9a-f]+[[:space:]]+com.google.android.apps.messaging/[^[:space:]]+" | grep -oE "[^[:space:]]+$" | sort -u
    // dumpsys package | grep -Eo "^[[:space:]]+[0-9a-f]+[[:space:]]+com.playgendary.tom/[^[:space:]]+" | grep -oE "[^[:space:]]+$" | sort -u
    // dumpsys package | grep -Eo "^[[:space:]]+[0-9a-f]+[[:space:]]+com.android.chrome/[^[:space:]]+" | grep -oE "[^[:space:]]+$" | sort -u
    // adb shell dumpsys package com.android.chrome | grep versionName
  }

  async shell(command: string): Promise<string> {
    await this.assertOnline();
    try {
      const resp = await this.client.execOut(command, 'utf8');
      return resp;
    } catch (e) {
      await this.assertOnline(e as Error);
      throw e;
    }
  }
  assertOnline(e?: Error): void {
    if (e) {
      const message: string = e.message;
      if (message && message.endsWith("not found'")) {
        this.offline = Date.now() + 30_000;
      } else if (message && message.includes("device offline'")) {
        this.offline = Date.now() + 30_000;
      }
    }
    if (this.isOffline()) {
      // TODO ENABLE next line AFTER commit
      // await this.close()
      throw new NotFoundException(`Device '${this.client.serial}' is offline now.`);
    }
  }

  public async doText(text: string) {
    if (this.mode.USE_STFService) {
      await this.queueEvent(async () => {
        const service = await this.getSTFService();
        return service.doType({ text });
      }, 'STFService doText');
    } else if (this.mode.USE_scrcpy) {
      await this.queueEvent(async () => {
        const scrcpy = await this.getScrcpy();
        return scrcpy.injectText(text);
      }, 'scrcpy doText');
    } else {
      const escape = text.replace("'", "\\'");
      await this.queueEvent(() => {
        return this.shell(`input keyboard text '${escape}'`);
      }, 'shell doText');
    }
  }

  async pastText(text: string): Promise<void> {
    // if (USE_minicap) {
    //     this.STFService.doKeyEvent()
    // }
    if (this.mode.USE_scrcpy) {
      try {
        await this.queueEvent(async () => {
          const scrcpy = await this.getScrcpy();
          return scrcpy.setClipboard(text);
        }, 'scrcpy pastText');
      } catch (e) {
        if (e instanceof Error) {
          if (e.message === 'write after end') {
            await this.stopScrcpy();
          }
        }
        throw e;
      }
    } else {
      // STF version
      await this.queueEvent(async () => {
        const service = await this.getSTFService();
        return service.setClipboard({ type: ClipboardTypeMap.TEXT, text });
      }, 'setClipboard');
      await this.queueEvent(() => {
        return this.keyCode(KeyCodesMap.KEYCODE_PASTE);
      }, 'KEYCODE_PASTE');
    }
  }

  // async adbclipboardPast(text: string): Promise<void> {
  // await this.enableClipboard();
  // const escape = encodeURIComponent(text.replace(/'/g, "'"));
  // await this.shell(`am broadcast -n ch.pete.adbclipboard/.WriteReceiver -e text '${escape}'`);
  // await this.keyCode(KeyCodes.KEYCODE_PASTE);
  //}

  async write(text: string, delay?: number): Promise<void> {
    try {
      delay = delay ?? 0.001;
      if (delay < 0) {
        await this.doText(text);
        return;
      }
      for (const key of text) {
        await this.doText(key);
        if (delay) await Utils.delay(1000 * delay);
      }
    } catch (e) {
      if (e instanceof Error) {
        if (e.message === 'write after end') {
          await this.stopScrcpy();
        }
      }
      throw e;
    }
  }
  public async ensureCapture(): Promise<Minicap | Scrcpy | undefined> {
    if (this.mode.USE_minicap) {
      return await this.getMinicap();
    }
    if (this.mode.USE_scrcpy) {
      return await this.getScrcpy();
    }
  }

  async getIphonesubinfo(id: number): Promise<string> {
    await this.assertOnline();
    const buf = await this.client.callServiceRaw('iphonesubinfo', id);
    return buf.readString();
  }

  async swipe(x1: number, y1: number, x2: number, y2: number, durration: number): Promise<void> {
    const { width, height } = await this.getSize();
    return this.swipePercent(x1 / width, y1 / height, x2 / width, y2 / height, durration);
  }

  async getProps(maxAge = 1000): Promise<Record<string, string>> {
    const now = Date.now();
    const age = now - this.propsTime;
    if (this.props && age < maxAge) return this.props;
    await this.assertOnline();
    this.propsTime = now;
    this.props = this.client
      .getProperties()
      .then((props) => {
        this.hostname = props['net.hostname'];
        if (!this.hostname) this.hostname = props['ro.boot.hwname'];
        return props;
      })
      .catch((e) => {
        this.assertOnline(e);
        return e;
      });
    return this.props;
  }

  _lastCaptureJpg?: Buffer;
  _lastCapturePng?: PngScreenShot;
  lastCaptureDate = 0; // 01/01/1970
  /**
   * return a PNG
   */
  async captureJpeg(): Promise<{ png: Buffer }> {
    if (this.mode.USE_scrcpy) {
      await this.getScrcpy();
      if (!this._lastCaptureJpg) {
        await new Promise((resolve) => {
          this.once('jpeg', resolve);
        });
      }
      // this._lastCVMat = await cv.imdecodeAsync(this._lastCapture, config.IMREAD);
      return { png: this._lastCaptureJpg as Buffer };
    } else if (this.mode.USE_minicap) {
      await this.getMinicap();
      let pass = 0;
      while (!this._lastCaptureJpg) {
        if (pass++ > 5) throw new Error('miniCap is not ready');
        console.error(`MiniCap not ready on ${this.serial}`);
        await Utils.delay(1000);
      }
      // this._lastCVMat = await cv.imdecodeAsync(this._lastCapture, config.IMREAD);
      return { png: this._lastCaptureJpg };
    }
    throw Error('scrcpy of minicap must be anabled');
  }

  private newCapturePng(): Promise<PngScreenShot> {
    this.pastPng = new PngScreenShot(this.client).capture();
    this.pastPng.then(
      (cap) => (this._lastCapturePng = cap),
      (e) => {
        console.error(`CapturePng capture failed once on ${this.#serial}, ${e}`);
      },
    );
    return this.pastPng;
  }

  pastPng: Promise<PngScreenShot> | null = null;
  public async capturePng(maxAge = 0): Promise<PngScreenShot> {
    // first call
    if (!this.pastPng) {
      return this.newCapturePng();
    }
    // resolving previous call
    if (!(await isPromiseResolved(this.pastPng))) return this.pastPng;
    // do not accepts previous value
    if (maxAge === 0) {
      return this.newCapturePng();
    }
    // check date for expiration
    const current = await this.pastPng;
    if (current.age > maxAge) {
      return this.newCapturePng();
    }
    return this.pastPng;
  }

  async savePng(file: string, data?: Buffer): Promise<void> {
    //let T1 = Date.now();
    if (!data) {
      const tmp = await this.captureJpeg(); // : Promise<{png: Buffer, mat: Mat}> {
      data = tmp.png;
    }
    //T1 = Date.now() - T1
    //console.log(`capture done in ${(T1 / 1000).toFixed(1)} Sec`)
    await fs.promises.writeFile(file, data, { encoding: 'binary' });
    //return T1;
  }
  async doKeyEvent(req: KeyEventRequest): Promise<any> {
    if (this.mode.USE_scrcpy) {
      await this.queueEvent(async () => {
        const scrcpy = await this.getScrcpy();
        let action: MotionEvent | null = null;
        const keyCode: KeyCodes = req.keyCode as KeyCodes;
        const repeatCount = 0;
        const metaState = 0;
        switch (req.event) {
          case KeyEventMap.DOWN:
            action = MotionEventMap.ACTION_DOWN;
            break;
          case KeyEventMap.UP:
            action = MotionEventMap.ACTION_UP;
            break;
          case KeyEventMap.PRESS:
            req.event = KeyEventMap.DOWN;
            await this.doKeyEvent(req);
            await Utils.delay(30);
            req.event = KeyEventMap.UP;
            return this.doKeyEvent(req);
          default:
            return;
        }
        // TODO: add Meta
        await scrcpy.injectKeycodeEvent(action, keyCode, repeatCount, metaState);
        return;
      }, `scrcpy doKeyEvent ${req.event}`);
    }
    if (this.mode.USE_STFService) {
      await this.queueEvent(async () => {
        const service = await this.getSTFService();
        return service.doKeyEvent(req);
      }, `STFService doKeyEvent ${req.event}`);
    }
  }

  async keyCode(key: KeyCodes, delay = 10): Promise<string> {
    if (this.mode.USE_scrcpy) {
      await this.queueEvent(async () => {
        try {
          const scrcpy = await this.getScrcpy();
          await scrcpy.injectKeycodeEvent(MotionEventMap.ACTION_DOWN, key, 0, 0);
          await Utils.delay(delay);
          await scrcpy.injectKeycodeEvent(MotionEventMap.ACTION_UP, key, 0, 0);
        } catch (e) {
          if (e instanceof Error) {
            if (e.message === 'write after end') {
              await this.stopScrcpy();
            }
          }
          await this.assertOnline(e as Error);
          throw e;
        }
      }, `scrcpy keyCode ${key}`);
    } else if (this.mode.USE_STFService) {
      await this.queueEvent(async () => {
        const service = await this.getSTFService();
        await service.doKeyEvent({ event: KeyEventMap.DOWN, keyCode: key });
        await Utils.delay(delay);
        await service.doKeyEvent({ event: KeyEventMap.UP, keyCode: key });
      }, `STFService keyCode ${key}`);
    } else {
      await this.queueEvent(() => {
        return this.shell(`input keyevent ${key}`);
      }, `shell keyCode ${key}`);
    }
    return '';
  }

  async getSettings(namespace: 'system'): Promise<{ [key in SettingsSystemKey]: string }>;
  async getSettings(namespace: 'secure'): Promise<{ [key in SettingsSecureKey]: string }>;
  async getSettings(namespace: 'global'): Promise<{ [key in SettingsGlobalKey]: string }>;
  async getSettings(namespace: Namespace): Promise<{ [key in SettingsKey]: string }> {
    const resp = await this.shell(`settings list ${namespace}`);
    const settings = {} as { [key in SettingsKey]: string };
    resp.split(/[\r\n]+/).forEach((line) => {
      const m = line.match(/([^=]+)=(.*)/);
      if (m) {
        settings[m[1] as SettingsKey] = m[2];
      }
    });
    return settings;
  }

  getSetting(namespace: 'system', key: SettingsSystemKey): Promise<string>;
  getSetting(namespace: 'secure', key: SettingsSecureKey): Promise<string>;
  getSetting(namespace: 'global', key: SettingsGlobalKey): Promise<string>;
  getSetting(namespace: Namespace, key: SettingsKey): Promise<string> {
    return this.shell(`settings get ${namespace} ${key}`);
  }

  setSetting(namespace: 'system', key: SettingsSystemKey, value: string): Promise<string>;
  setSetting(namespace: 'secure', key: SettingsSecureKey, value: string): Promise<string>;
  setSetting(namespace: 'global', key: SettingsGlobalKey, value: string): Promise<string>;
  setSetting(namespace: Namespace, key: SettingsKey, value: string): Promise<string> {
    return this.shell(`settings put ${namespace} ${key} "${value.replace(/"/g, '\\"')}"`);
  }

  home(): Promise<string> {
    return this.keyCode(KeyCodesMap.KEYCODE_HOME);
    //this.client.transport(this.serial)
    //.then((transport) => new ShellCommand(transport).execute(command))
    //.nodeify(callback);
    // const resp = await this.client.shell(this.serial, 'input keyevent KEYCODE_HOME');
    // await streamToString(resp);
  }

  back(): Promise<string> {
    return this.keyCode(KeyCodesMap.KEYCODE_BACK);
    // const resp = await this.client.shell(this.serial, 'input keyevent KEYCODE_BACK');
    // await streamToString(resp);
  }

  //
  clear(pkag: string): Promise<boolean> {
    return this.client.clear(pkag);
  }

  async getSize(): Promise<{ width: number; height: number }> {
    if (!this.size) {
      await this.assertOnline();
      if (this.mode.USE_scrcpy) {
        const scrcpy = await this.getScrcpy();
        const width = await scrcpy.width;
        const height = await scrcpy.height;
        this.size = { width, height };
      } else {
        const resp = await this.client.shell('wm size');
        const str = (await Utils.readAll(resp)).toString('utf-8');
        // 'Physical size: 1080x2400'.match(/(\d+)x(\d+)/)
        const m = str.match(/(\d+)x(\d+)/);
        if (!m) throw Error('can not gewt device size info');
        const width = Number(m[1]);
        const height = Number(m[2]);
        this.size = { width, height };
      }
    }
    return this.size;
  }

  isOffline(): boolean {
    if (!this.offline) {
      return false;
    }
    if (this.offline < Date.now()) {
      this.offline = 0;
      return false;
    }
    return true;
  }
  public async close(cause: string) {
    if (!this.closed) {
      this.log(`closing phone caused by: ${cause}`);
      this.closed = true;
    }
    if (this._scrcpy) {
      this.log('Closing scrcpy services');
      try {
        const scpy = await this._scrcpy;
        scpy.stop();
      } catch (e) {
        // ignore
      }
      this._scrcpy = undefined;
    }
    if (this._minicap) {
      this.log('Closing minicap services');
      try {
        const minicap = await this._minicap;
        minicap.stop();
      } catch (e) {
        // ignore
      }
      this._minicap = undefined;
    }
    if (this._STFService) {
      try {
        this.log('Closing STFService services');
        const service = await this._STFService;
        service.stop();
      } catch (e) {
        // ignore
      }
      this._STFService = undefined;
    }
    this.emit('disconnect', cause);
  }

  async initPhoneCtrl(maxTime = 2000): Promise<this> {
    fromEventPattern;
    await pto(this.getProps(), maxTime, `Phone is crashed, can not get props in ${maxTime}ms`);
    if (PRELOAD_SERVICES) {
      let action = 'init Phone Ctrl:';
      if (this.mode.USE_minicap) action += ' minicap';
      if (this.mode.USE_STFService) action += ' STFService';
      if (this.mode.USE_scrcpy) action += ' scrcpy';
      this.log(action);
      if (this.mode.USE_minicap) {
        // this.log("first getMinicap");
        await this.getMinicap();
      } //  else this.log("Minicap not enabled");
      if (this.mode.USE_STFService) {
        // this.log("first getSTFService");
        await this.getSTFService();
      } // else this.log("STFService not enabled");
      if (this.mode.USE_scrcpy) {
        // this.log("first getScrcpy");
        await this.getScrcpy();
      } //  else this.log("scrcpy not enabled");
      this.log('All Services initialized');
    }
    return this;
  }

  public async stopScrcpy(): Promise<void> {
    if (this._scrcpy) {
      const scrcpy = await this._scrcpy;
      scrcpy.stop();
      this._scrcpy = undefined;
    }
  }

  public getCaputeMode(): 'minicap' | 'scrcpy' | 'screencap' {
    if (this.mode.USE_scrcpy) {
      return 'scrcpy';
    }
    if (this.mode.USE_minicap) {
      return 'minicap';
    }
    return 'screencap';
  }

  public async getScrcpy(option?: Partial<ScrcpyOptions>): Promise<Scrcpy> {
    await this.assertOnline();
    if (this.closed) throw Error('getScrcpy: Phone is closed');
    if (!this._scrcpy) {
      this._scrcpy = this.getNewScrcpy(option).catch(() => {
        this._scrcpy = undefined;
        throw Error('getScrcpy failed on ' + this.serial);
      });
    }
    return this._scrcpy;
  }

  private async getNewScrcpy(option?: Partial<ScrcpyOptions>): Promise<Scrcpy> {
    this.log('Loading scrcpy ' + JSON.stringify(option));
    this.log(`${pc.green('init')} scrcpy for ${this.client.serial}`);
    const scrcpy = this.client.scrcpy(this.mode.USE_scrcpy || option);
    //const stream = new DemuxerStream({ highwaterMark: 3600 });
    //const demuxPromise = stream.demuxer({})
    // demuxPromise.then(async (demuxer: Demuxer) => {
    //     let dec = beamcoder.decoder({ demuxer, stream_index: 0 }); // Create a decoder
    //     while (true) {
    //         const packet = await demuxer.read();
    //         let decResult = await dec.decode(packet); // Decode the frame
    //         if (decResult.frames.length === 0) // Frame may be buffered, so flush it out
    //             decResult = await dec.flush();
    //         // Filtering could be used to transform the picture here, e.g. scaling
    //         let enc = beamcoder.encoder({ // Create an encoder for JPEG data
    //             name: 'mjpeg', // FFmpeg does not have an encoder called 'jpeg'
    //             width: dec.width,
    //             height: dec.height,
    //             pix_fmt: dec.pix_fmt.indexOf('422') >= 0 ? 'yuvj422p' : 'yuvj420p',
    //             time_base: [1, 1]
    //         });
    //         let jpegResult = await enc.encode(decResult.frames[0]); // Encode the frame
    //         await enc.flush(); // Tidy the encoder
    //         this._lastCapture = jpegResult.packets[0].data;
    //         this.emit('jpeg', jpegResult.packets[0].data);
    //     }
    //     // demuxer.forceClose();
    // });
    //let cnt = 0;
    //scrcpy.on('frame', (data) => {
    //    // cnt++;
    //    // if (cnt < 200) {
    //    //     const debugDest = `qcom-${cnt.toFixed(0).padStart(3, '0')}.avc`;
    //    //     fs.writeFileSync(debugDest, data);
    //    //     console.log(debugDest);
    //    // }
    //    stream.write(data.data);
    //});
    await scrcpy.start();
    await scrcpy.firstFrame;
    scrcpy.on('disconnect', () => {
      this._scrcpy = undefined;
      this.emit('disconnect', 'scrcpy get disconnected');
    });
    return scrcpy;
  }

  /**
   * get a minicap Promise that resolved after first screen shoot
   * the promise is reset on error.
   * @returns
   */
  public async getMinicap(): Promise<Minicap> {
    await this.assertOnline();
    if (this.closed) throw Error('getMinicap Phone is closed');
    if (!this._minicap) {
      this._minicap = this.getNewMinicap().catch((e) => {
        this._minicap = undefined;
        throw Error(`failed to start Minicap on ${this.serial} Err:${e}`);
      });
    }
    return this._minicap;
  }

  /**
   * @returns return a Minicap promise that get resolve after first screenshoot
   */
  private async getNewMinicap(): Promise<Minicap> {
    const options = this.mode.USE_minicap;
    const t0 = Date.now();
    const minicap = this.client.minicap(options);
    minicap.on('data', (data: Buffer) => {
      this._lastCaptureJpg = data;
      this.emit('jpeg', data);
    });
    minicap.once('disconnect', (cause: string) => {
      //if (res) {
      //    const msg = 'disconnect before first screen shoot';
      this.log(`minicap disconnected: ${cause}`);
      //    reject(Error(msg));
      //}
      this._minicap = undefined;
      void this.close('minicap get disconnected');
    });
    await pto(minicap.start(), 10000, `minicap.start on ${this.serial} take more that 10 sec`);
    this.log('minicap startd Ok need a screenshot');
    await pto(minicap.firstFrame, 10000, `minicap.firstFrame on ${this.serial} take more that 10 sec`);
    this.log(`first screen capture after ${Date.now() - t0}ms`);
    this.log(`INIT Minicap for ${this.client.serial} done in ${Date.now() - t0}ms`);
    return minicap;
  }

  public async getSTFService(): Promise<STFService> {
    await this.assertOnline();
    if (this.closed) throw Error('getSTFService: Phone is closed on ' + this.serial);
    if (!this._STFService) {
      this._STFService = this.getNewSTFService();
    }
    return this._STFService;
  }

  private async getNewSTFService(): Promise<STFService> {
    const t0 = Date.now();
    for (let pass = 0; pass < 3; pass++) {
      const service = this.client.STFService(this.mode.USE_STFService);
      try {
        service.on('disconnect', () => {
          this._STFService = undefined;
          void this.close('STFService get disconnected');
        });
        await pto(service.start(), 10 * 1000, `STFService.start() timeout after 10 second Pass ${pass}`);
        this.log(`INIT STFService for ${this.client.serial} in ${Date.now() - t0} ms`);
        return service;
      } catch (e) {
        service.stop();
        await this.assertOnline(e as Error);
        console.error('STFService', e);
        this.log(`INIT STFService for ${this.client.serial} FAILED in ${Date.now() - t0} ms`);
        this.log(`${e}: ${(e as Error).message}`);
        await Utils.delay(2000);
      }
    }
    this._STFService = undefined;
    await this.close('STFService get disconnected mutiple times');
    throw Error('failed to INIT STFService on ' + this.serial);
  }
}
