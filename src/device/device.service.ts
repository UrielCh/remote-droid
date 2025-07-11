import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common';
import { Device, KeyCodes, KeyCodesMap, PsEntry, RebootType, StartServiceOptions, Sync, Utils } from '@u4/adbkit';
import sharp from 'sharp';
import * as fs from 'fs';
import { TabCoordDto } from './dto/TapCoord.dto.js';
import { SwipeCoordDto } from './dto/SwipeCoord.dto.js';
import { getLogFile, logAction } from '../common/Logger.js';
import DeviceDto from './dto/Device.dto.js';
import { isPromiseResolved } from 'promise-status-async';
import PhoneGUI from './PhoneGUI.js';
import { SMSDto } from './dto/sms.dto.js';
import { Readable } from 'stream';
import CsvReader from 'csv-reader';
import { QSSmsOptionDto } from './dto/QSSmsOption.dto.js';
import { QSImgQueryPngDto } from './dto/QSImgQueryPng.dto.js';
import { STFServiceModel } from '@u4/adbkit';
import { ConfigService } from '@nestjs/config';
import { AdbClientService } from './adbClient.service.js';
import { ImageType } from './dto/QSDeviceList.js';
import { OnOffType } from './dto/onOff.dto.js';
import { request } from 'undici';
import { PngScreenShot } from './pngScreenShot.js';


interface InstallApkProgress {
  link: string;
  downloaded: number;
  size: number;
  status: 'connecting' | 'downloading' | 'transfering' | 'installing' | 'done';
}

@Injectable()
export class DeviceService implements OnModuleDestroy {
  phoneConnectTimeout: number;
  /**
   * cache per device
   */

  // deviceCache = new Map<string, Device>();
  /**
   * gui per devices
   */
  phonesCache = new Map<string, Promise<PhoneGUI | null>>();

  constructor(private config: ConfigService, private client: AdbClientService) {
    this.phoneConnectTimeout = Number(this.config.get('PHONE_CONNECT_TIMEOUT') || '2000');

    void this.trackDevices();
    // setInterval(() => this.autoStart(), 20000);
  }

  onModuleDestroy(): Promise<void> {
    return this.shutdown();
  }

  public async shutdown() {
    const devices = await this.getDevices();
    for (const device of devices) {
      await this.goOffline(device.id);
    }
  }

  /**
   * called every 10 sec to restart failed devices
   */
  // private async autoStart(): Promise<void> {
  //   // get missing devices
  //   const devices = (await this.client.listDevices()).filter((device) => !this.phonesCache.has(device.id));
  //   for (const device of devices) {
  //     // si toujour visible reinject it in 30 sec
  //     if (device && device.type === 'device') {
  //       logAction(device.id, 'AutoStart detect the device.');
  //       this.goOnline(device);
  //     }
  //   }
  // }

  private goOnline(device: Device) {
    // double check
    if (this.phonesCache.has(device.id)) {
      logAction(device.id, 'get online but is allready present.');
      return;
    }
    logAction(device.id, 'goOnline will be add to phonesCache');
    // lock serial
    // this.deviceCache.set(device.id, device);
    const phoneGui = new PhoneGUI(device);
    phoneGui.on('disconnect', async (cause: string) => {
      logAction(device.id, `phone Gui emit disconnect cause: ${cause}`);
      await this.goOffline(device.id);
    });

    const promise: Promise<PhoneGUI | null> = phoneGui.initPhoneGUI(this.phoneConnectTimeout).catch((e) => {
      logAction(device.id, `phoneGui ${device.id} crash Go offline: ${e.message}`);
      console.error(`phoneGui ${device.id} crash Go offline`, e);
      void this.goOffline(device.id);
      return null;
    });
    void promise.then((gui) => {
      if (gui) logAction(device.id, 'Is online.');
    });
    this.phonesCache.set(device.id, promise);
  }

  /**
   * stop a device
   * @param deviceId serialnumber
   */
  private async goOffline(deviceId: string) {
    //this.deviceCache.delete(device.id);
    const promise = this.phonesCache.get(deviceId);
    this.phonesCache.delete(deviceId);
    if (!promise) return;
    logAction(deviceId, 'Is now offline and removed from deviceCache');
    const gui = await promise;
    if (!gui) return;
    gui.close('Adb report device as offline').catch(() => {
      // ignore error
    });
  }

  private async trackDevices(): Promise<void> {
    const tracker = await this.client.tracker;
    tracker.on('online', (device) => {
      this.goOnline(device);
    });
    tracker.on('offline', (device) => {
      void this.goOffline(device.id);
    });
    tracker.on('end', async () => {
      // const devices = (await this.client.listDevices()).filter((device) => !this.phonesCache.has(device.id));
      // const devices = await this.getDevices();
      // for (const device of devices) {
      //   await this.goOffline(device.id);
      // }
    });
  }

  async reboot(serial: string, rebootType: RebootType | 'system'): Promise<void> {
    const device = await this.getPhoneGui(serial);
    if (rebootType === 'system') await device.reboot();
    else await device.reboot(rebootType);
  }

  async write(serial: string, text: string, delay: number): Promise<void> {
    const device = await this.getPhoneGui(serial);
    await device.write(text, delay);
  }

  async getSize(serial: string): Promise<{ width: number; height: number }> {
    const device = await this.getPhoneGui(serial);
    return device.getSize();
  }

  async press(serial: string, key: KeyCodes): Promise<void> {
    const device = await this.getPhoneGui(serial);
    await device.keyCode(key);
  }

  async tap(serial: string, coord: TabCoordDto): Promise<void> {
    const device = await this.getPhoneGui(serial);
    const { width, height } = await device.getSize();
    const { px, py } = coord;
    let { x, y } = coord;
    if (px != null && py != null) {
      x = px * width;
      y = py * height;
    }
    if (typeof x !== 'number' || typeof y !== 'number') {
      throw new BadRequestException();
    }
    if (x === width) x = width - 1;
    if (y === height) y = height - 1;
    if (x > height || y > height) throw new BadRequestException();
    if (coord.x === undefined) throw new BadRequestException();
    if (coord.y === undefined) throw new BadRequestException();
    if (coord.durartion) await device.swipe(coord.x, coord.y, coord.x, coord.y, coord.durartion);
    else await device.tap(coord.x, coord.y);
  }

  async swipe(serial: string, coord: SwipeCoordDto): Promise<void> {
    const device = await this.getPhoneGui(serial);
    const { width, height } = await device.getSize();
    const { px1, py1, px2, py2 } = coord;
    let { x1, y1, x2, y2 } = coord;
    if (px1 != null && px2 != null && py1 != null && py2 != null) {
      x1 = px1 * width;
      x2 = px2 * width;
      y1 = py1 * height;
      y2 = py2 * height;
    }
    if (x1 === undefined || x2 === undefined) throw Error('Missing coord X');
    if (y1 === undefined || y2 === undefined) throw Error('Missing coord Y');

    if (x1 === width) x1 = width - 1;
    if (y1 === height) y1 = height - 1;
    if (x2 === width) x2 = width - 1;
    if (y2 === height) y2 = height - 1;
    if (x1 > height) throw new BadRequestException(`x1 > ${width}`);
    if (y1 > height) throw new BadRequestException(`y1 > ${height}`);
    if (y2 > height) throw new BadRequestException(`x2 > ${height}`);
    if (x2 > height) throw new BadRequestException(`x2 > ${width}`);
    if (typeof x1 !== 'number' || typeof x2 !== 'number' || typeof y1 !== 'number' || typeof y2 !== 'number') {
      throw new BadRequestException('x1,x2,y1,y2 must be defined');
    }
    await device.swipe(x1, y1, x2, y2, coord.durartion || 500);
  }

  /**
   * list les devices active en configure
   * @returns
   */
  async getDevices(): Promise<DeviceDto[]> {
    const out: DeviceDto[] = [];
    const allSerial = [...this.phonesCache.keys()];
    const allPromises = allSerial.map((sn) => this.phonesCache.get(sn));
    const resolved = await Promise.all(allPromises.map(isPromiseResolved));
    for (let i = 0; i < resolved.length; i++) {
      if (resolved[i]) {
        const phone = await allPromises[i];
        if (phone) {
          out.push({ id: phone.serial, type: phone.device.type });
        }
      } else {
        out.push({ id: allSerial[i], type: 'offline' });
      }
    }
    return out;
  }

  /**
   * gen addThumbnails in parallel
   */
  addThumbnails(devices: DeviceDto[], imgType: ImageType, newWidth: number): Promise<DeviceDto[]> {
    return Promise.all(
      devices.map(async (device: DeviceDto) => {
        const dev = await this.getPhoneGui(device.id);
        if (dev._lastCaptureJpg || dev._lastCapturePng) {
          let img: sharp.Sharp = sharp(dev._lastCaptureJpg || (dev._lastCapturePng as PngScreenShot).png);
          const metadata = await img.metadata();
          let { width, height } = metadata;
          if (width && height) {
            if (width < height) {
              const scall = newWidth / width;
              width = newWidth;
              height = Math.round(height * scall);
            } else {
              const scall = newWidth / height;
              height = newWidth;
              width = Math.round(width * scall);
            }
            img = img.resize(width, height);
            let out: Buffer | null = null;
            let type = '';
            switch (imgType) {
              case 'jpg':
                out = await img.jpeg().toBuffer();
                type = 'image/jpeg';
                break;
              case 'png':
                out = await img.png().toBuffer();
                type = 'image/png';
                break;
              // case 'jp2':
              //   out = await img.jp2().toBuffer();
              //   type = 'image/jp2';
              //   break;
              case 'webp':
                out = await img.webp().toBuffer();
                type = 'image/webp';
                break;
              case 'gif':
                out = await img.gif().toBuffer();
                type = 'image/gif';
                break;
              default:
            }
            if (out) {
              device.thumbnails = `data:${type};base64,${out.toString('base64')}`;
              device.w = width;
              device.h = height;
            }
          }
        }
        return device;
      }),
    );
  }

  /**
   * create and cache PhoneGUI
   * @param serial
   * @returns
   */
  async getPhoneGui(serial: string): Promise<PhoneGUI> {
    const phoneGui = await this.phonesCache.get(serial);
    if (!phoneGui) {
      throw new NotFoundException(serial, 'Requested device is missing.');
    }
    return phoneGui;
  }

  async getDeviceScreenPng(serial: string, options: QSImgQueryPngDto): Promise<Buffer> {
    try {
      const phone = await this.getPhoneGui(serial);
      const { png } = await phone.capturePng(options.maxAge);

      let scall = options.scall;

      if ((!scall || scall === 1 || scall > 1) && !options.width) return png;

      const img: sharp.Sharp = sharp(png);

      const meta = await img.metadata();
      if (!meta.width || !meta.height) throw Error('Image corrupted');

      let resized: sharp.Sharp;

      if (!options.width) {
        if (scall <= 0.01) scall = 0.01;
        const width = Math.round(meta.width * scall);
        const height = Math.round(meta.height * scall);
        resized = img.resize(width, height);
      } else {
        const width = Math.round(options.width);
        const height = Math.round((meta.height / meta.width) * width);
        resized = img.resize(width, height);
      }

      return resized.png().toBuffer();
    } catch (e) {
      throw new NotFoundException((e as Error).message);
    }
  }

  // '.png' |
  async getDeviceScreen(serial: string, options?: { scall?: number; width?: number; fileExt?: '.jpeg' | '.webp'; quality?: number }): Promise<Buffer> {
    options = options || {};
    try {
      const phone = await this.getPhoneGui(serial);
      const { png } = await phone.captureJpeg();
      const quality = options.quality || 80;

      // if (options.fileExt === '.png' && options.scall === 1 && !options.width) {
      //   return png;
      // }

      const img: sharp.Sharp = sharp(png);
      const meta = await img.metadata();
      if (!meta.width || !meta.height) throw Error('Image corrupted');

      let resized: sharp.Sharp;
      if (!options.width) {
        let scall = options.scall || 1;
        if (scall > 1) scall = 1;
        if (scall <= 0.01) scall = 0.01;
        const width = Math.round(meta.width * scall);
        const height = Math.round(meta.height * scall);
        resized = img.resize(width, height);
      } else {
        const width = Math.round(options.width);
        const height = Math.round((meta.height / meta.width) * width);
        resized = img.resize(width, height);
      }

      let compressed: sharp.Sharp;
      if (options.fileExt === '.webp') compressed = resized.webp({ quality });
      else compressed = resized.jpeg({ quality });

      return compressed.toBuffer();
    } catch (e) {
      throw new NotFoundException((e as Error).message);
    }
  }

  /**
   * @param serial device serial number
   * @param maxAge max data ager in millisec
   * @returns all props
   */
  async getProps(serial: string, maxAge: number, prefix?: string[]): Promise<Record<string, string>> {
    const phone = await this.getPhoneGui(serial);
    let props = await phone.getProps(maxAge);
    if (prefix && prefix.length) {
      const props2 = {} as Record<string, string>; // new Map<string, string>;
      for (const [k, v] of Object.entries(props)) {
        for (const p of prefix) {
          if (k.startsWith(p)) {
            props2[k] = v;
            break;
          }
        }
      }
      props = props2;
    }
    return props;
  }

  async getIphonesubinfo(serial: string, id: number): Promise<string> {
    const phone = await this.getPhoneGui(serial);
    return phone.getIphonesubinfo(id);
  }

  async execOut(serial: string, cmd: string, sudo?: boolean): Promise<string> {
    const phone = await this.getPhoneGui(serial);
    let client = phone.client;
    if (sudo) client = client.sudo();
    return client.execOut(cmd, 'utf-8');
  }

  async shell(serial: string, cmd: string, sudo?: boolean): Promise<string> {
    const phone = await this.getPhoneGui(serial);
    let client = phone.client;
    if (sudo) client = client.sudo();
    const duplex = await client.shell(cmd);
    const buffer = await Utils.readAll(duplex);
    return buffer.toString('utf-8');
  }

  async clear(serial: string, pkg: string): Promise<boolean> {
    const phone = await this.getPhoneGui(serial);
    return phone.client.clear(pkg);
  }

  async setSvc(serial: string, type: 'wifi' | 'data', mode: OnOffType): Promise<void> {
    const phone = await this.getPhoneGui(serial);
    if (mode === 'toggleOff') {
      await phone.client.execOut(`svc ${type} enable`, 'utf-8');
      mode = 'off';
    } else if (mode === 'toggleOn') {
      await phone.client.execOut(`svc ${type} disable`, 'utf-8');
      mode = 'on';
    }
    if (mode === 'on') {
      await phone.client.execOut(`svc ${type} enable`, 'utf-8');
    } else if (mode === 'off') {
      await phone.client.execOut(`svc ${type} disable`, 'utf-8');
    }
  }

  async setAirplane(serial: string, mode: OnOffType): Promise<boolean> {
    const phone = await this.getPhoneGui(serial);
    try {
      if (mode === 'toggleOff') {
        return await phone.client.extra.airPlainMode(false, 200);
      }
      if (mode === 'toggleOn') {
        return await phone.client.extra.airPlainMode(true, 200);
      }
      if (mode === 'on') {
        return await phone.client.extra.airPlainMode(true);
      }
      if (mode === 'off') {
        return await phone.client.extra.airPlainMode(false);
      }
    } catch (e) {
      logAction(serial, `setAirplane "${mode}" failed: ${(e as Error).message}`);
      throw new InternalServerErrorException((e as Error).message);
    }
    return false;
  }

  async pastText(serial: string, text: string): Promise<void> {
    //if (this.mode.USE_scrcpy) {
    //  try {
    //    const scrcpy = await this.getScrcpy();
    //    await scrcpy.setClipboard(text);
    //  } catch (e) {
    //    if (e instanceof Error) {
    //      if (e.message === "write after end") {
    //        await this.stopScrcpy();
    //      }
    //    }
    //    throw e;
    //  }
    //} else {
    const phone = await this.getPhoneGui(serial);
    const service = await phone.getSTFService();
    await service.setClipboard({ type: STFServiceModel.ClipboardTypeMap.TEXT, text });
    // const escape = encodeURIComponent(text.replace(/'/g, "'"));
    // await this.execOut(serial, `am broadcast -n ch.pete.adbclipboard/.WriteReceiver -e text '${escape}'`);
    await this.press(serial, KeyCodesMap.KEYCODE_PASTE);
  }

  async getLog(serial: string, limit = 512000): Promise<string> {
    const logFile = getLogFile(serial);
    let stats: fs.Stats;
    try {
      stats = await fs.promises.stat(logFile);
    } catch (e) {
      throw new NotFoundException('no such log');
    }
    const size = stats.size;
    let start = 0;
    // add one char to avoid droping the first line on a perfect align
    if (size > limit + 1) {
      start = 1 + size - limit;
    }
    const stream = fs.createReadStream(logFile, { start, end: size, encoding: 'utf-8' });
    let data = '';
    stream.on('data', (chunk) => (data += chunk));
    return new Promise<string>((resolve) => {
      stream.once('end', () => {
        // discar the first parcial line
        if (start) {
          const p = data.indexOf('\n');
          if (p > 0) data = data.substring(p + 1);
        }
        resolve(data);
      });
    });
  }

  async getPackages(serial: string): Promise<string[]> {
    const phone = await this.getPhoneGui(serial);
    return phone.client.getPackages();
  }

  async getPs(serial: string): Promise<Array<Partial<PsEntry>>> {
    const phone = await this.getPhoneGui(serial);
    return phone.client.getPs('-A');
  }

  async deleteSMS(serial: string, id: number): Promise<boolean> {
    const phone = await this.getPhoneGui(serial);
    const query = `DELETE FROM sms WHERE _id=${id}`;
    const code = `echo ${query.replace(/"/g, '\\"')} | sqlite3 /data/data/com.android.providers.telephony/databases/mmssms.db`;
    const sudo = phone.client.sudo();
    await sudo.execOut(code, 'utf8');
    return true;
  }

  async getSMS(serial: string, option: QSSmsOptionDto): Promise<SMSDto[]> {
    const phone = await this.getPhoneGui(serial);
    let query = 'SELECT \\* FROM sms';
    // if (option.from) {
    //   query += `WHERE address=${option.from}`;
    // }
    query += '\\;';
    const code = `echo -e .mode csv\\\\n.headers on\\\\n${query.replace(/"/g, '\\"')} | sqlite3 /data/data/com.android.providers.telephony/databases/mmssms.db`;
    const sudo = phone.client.sudo();
    const sms = await sudo.execOut(code, 'utf8');
    const stream = Readable.from([sms.replace(/\r\n/g, '\n')]);
    let messages = await new Promise<SMSDto[]>((resolve, reject) => {
      const messages: SMSDto[] = [];
      stream
        .pipe(new CsvReader.default({ multiline: true, asObject: true, skipHeader: true, trim: true, parseBooleans: true, parseNumbers: true }))
        .on('data', function (row: any) {
          messages.push(row as SMSDto);
        })
        .on('error', function (e) {
          reject(e);
        })
        .on('end', function () {
          resolve(messages);
        });
    });
    if (option.from) {
      const address = Number(option.from);
      messages = messages.filter((sms) => sms.address === address);
    }
    return messages;
  }

  async startActivity(serial: string, options: StartServiceOptions): Promise<boolean> {
    const phone = await this.getPhoneGui(serial);
    return phone.client.startActivity(options);
  }

  async forward(serial: string, remote: string): Promise<number> {
    const phone = await this.getPhoneGui(serial);
    const port = await phone.client.tryForwardTCP(remote);
    return port;
  }

  prevInstall = new Map<string, InstallApkProgress>();
  installApkCache = new Map<string, InstallApkProgress>();
  /**
   * https://downloadr2.apkmirror.com/wp-content/uploads/2022/11/88/63644bc264abe/com.handcent.app.nextsms_10.0.6-41000600_minAPI19(arm64-v8a,armeabi)(nodpi)_apkmirror.com.apk?verify=1667540898-kF-ic2OKhmhdqE4UIyHXGki1yyQh7oCjBPkUr755AXw
   * Dirty implementation should be rewrite
   * @param serial
   * @param link
   * @returns
   */
  async installApk(serial: string, link: string): Promise<boolean> {
    const phone = await this.getPhoneGui(serial);
    const tmpFile = `${serial}-${Date.now()}.apk`;

    const prev = this.prevInstall.get(serial);
    if (prev && prev.link === link) {
      throw new ServiceUnavailableException(`${link} Already installed`);
    }

    let progress: InstallApkProgress | undefined = this.installApkCache.get(serial);
    if (progress) {
      if (progress.status === 'connecting') {
        throw new ServiceUnavailableException(`A previoud instalation of ${progress.link} is Starting.`);
      }
      if (progress.status === 'downloading')
        throw new ServiceUnavailableException(`The downloading of ${progress.link} ${((progress.downloaded / progress.size) * 100).toFixed(1)}%`);
      if (progress.status === 'transfering') throw new ServiceUnavailableException(`Transfering file ${progress.link} to the device.`);

      throw new ServiceUnavailableException(`The installation of ${progress.link} in progress in device`);
    }
    progress = {
      link,
      downloaded: 0,
      size: 0,
      status: 'connecting',
    };
    this.installApkCache.set(serial, progress);
    try {
      const ws = fs.createWriteStream(tmpFile, { encoding: 'binary' });
      const { statusCode, headers, body } = await request(link);
      if (statusCode < 200 || statusCode >= 300) {
        throw new BadRequestException(`Bad external server response code: ${statusCode}`);
      }
      progress.size = Number(headers['content-length']);
      progress.status = 'downloading';
      // "content-type": "application/vnd.android.package-archive",
      const write = (data: any) =>
        new Promise<void>((resolve, reject) => {
          ws.write(data, (error) => {
            if (error) reject(error);
            resolve();
          });
        });
      for await (const data of body) {
        await write(data);
        progress.downloaded += data.length;
        if (progress.downloaded == progress.size) {
          console.log('Transfert FIni');
        }
      }
      await new Promise((resolve, reject) => {
        ws.close(resolve);
      });
      progress.status = 'transfering';
      //await phone.client.install(tmpFile);

      const temp = Sync.temp(tmpFile);
      const transfer = await phone.client.push(tmpFile, temp);
      await transfer.waitForEnd();
      progress.status = 'installing';
      await phone.client.installRemote(temp);
      progress.status = 'done';
      this.prevInstall.set(serial, progress);
    } catch (e) {
      console.log(e);
      return false;
    } finally {
      this.installApkCache.delete(serial);
      await fs.promises.unlink(tmpFile);
    }
    return true;
  }
}
