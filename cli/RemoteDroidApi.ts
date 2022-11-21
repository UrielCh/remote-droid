import LRU from 'lru-cache';

export type ImgTypes = 'jpeg' | 'png' | 'webp' | 'gif';
export type DeviceType = 'emulator' | 'device' | 'offline' | 'unauthorized';

export type ServiceNode = {
  /**
   * node name
   */
  name: string;
  /**
   * url ending with / like http://dom.com/remote/local/
   */
  remoteDroid: string;
  /**
   * url ending with / like http://dom.com/pilot/local/
   */
  // pilotDroid: string;
  /**
   * Auth token
   */
  token: string;
};

export type ServiceNodeSerial = ServiceNode & { serial: string };

export interface PhoneRef0 {
  id: string;
  type: DeviceType;
  thumbnails?: string;
  props?: Record<string, string>;
  h: number;
  w: number;
}
export interface PhoneRef extends PhoneRef0 {
  srv: string;
}
export interface FetchError {
  srv: string;
  error: string;
  url: string;
}
export interface SlowerSrv {
  time: number;
  name: string;
  timeout: number;
}

export interface ListDevicesRet {
  devices: PhoneRef[];
  errors: FetchError[];
  slower: SlowerSrv;
  faster: SlowerSrv;
}

export class RemoteDroidApi {
  private headers: { Authorization?: string };
  private headersPOST: { Authorization?: string; 'Content-Type': 'application/json' };
  private url: string;

  static async rebootService(srv: ServiceNode) {
    const url = `${srv.remoteDroid}ping/apoptose`;

    const headers = {} as { Authorization?: string };
    if (srv.token) {
      const Authorization = `Bearer ${srv.token}`;
      headers.Authorization = Authorization;
    }
    const req = await fetch(url, { method: 'GET', headers });
    return req.text();
  }

  static async listDevices(
    srv: ServiceNode,
    options: { thumbnails?: ImgTypes; width?: number; propsPrefixs?: string; signal?: AbortSignal } = {},
  ): Promise<PhoneRef0[]> {
    const url = new URL('device', srv.remoteDroid);
    if (options.thumbnails) url.searchParams.append('thumbnails', options.thumbnails);
    if (options.width) url.searchParams.append('width', options.width.toString());
    if (options.propsPrefixs) url.searchParams.append('prefix', options.propsPrefixs);

    const headers = {} as { Authorization?: string };
    if (srv.token) {
      const Authorization = `Bearer ${srv.token}`;
      headers.Authorization = Authorization;
    }
    const req = await fetch(url, {
      headers,
      signal: options.signal,
    });
    const tels = (await req.json()) as Array<PhoneRef0>;
    return tels;
  }

  constructor(private srv: ServiceNodeSerial) {
    this.headers = {};
    this.headersPOST = {
      'Content-Type': 'application/json',
    };
    if (srv.token) {
      const Authorization = `Bearer ${srv.token}`;
      this.headers.Authorization = Authorization;
      this.headersPOST.Authorization = Authorization;
    }
    this.url = `${this.srv.remoteDroid}device/${this.srv.serial}/`;
    // console.log("USING URL:", this.url);
  }

  async listSMS() {
    console.log(`%c Listring des SMS de ${this.srv.serial}`, 'color: red');
    const smses = await this.sms('1664');
    for (const sms of smses) {
      // deno-lint-ignore no-explicit-any
      const { _id, date, body } = sms as any;
      console.log(`📩 ${_id} du ${new Date(date)}: ${body}`);
    }
    console.log(`%c TOTAL: ${smses.length} SMS`, 'color: green');
  }

  /**
   * delete SMS from free
   */
  async deleteSMS() {
    // deno-lint-ignore no-explicit-any
    const smses = (await this.sms('1664')) as any[];
    for (const sms of smses) {
      const smses2 = console.log(sms.body);
      await this.smsDelete(sms._id);
      console.log(smses2);
    }
  }

  async reboot(): Promise<string> {
    const req = await fetch(`${this.url}reboot`, { method: 'POST', headers: this.headers });
    return req.json();
  }

  rebootShell(): Promise<string> {
    return this.execOut('reboot');
  }

  shell(command: string): Promise<string> {
    return this.execOut(command);
  }

  async text(text: string, delay = 0): Promise<string> {
    const req = await fetch(`${this.url}text`, { method: 'POST', headers: this.headers, body: JSON.stringify({ text, delay }) });
    return req.json();
  }

  async screenSize(): Promise<{ width: number; height: number }> {
    const req = await fetch(`${this.url}screen-size`, { method: 'GET', headers: this.headers });
    return req.json();
  }

  async pressKey(key: number): Promise<string> {
    const req = await fetch(`${this.url}press/${key}`, { method: 'POST', headers: this.headers });
    return req.json();
  }

  // async tap(key: number): Promise<string> {
  //     const req = await fetch(`${this.url}tap`, { method: 'POST', headers: this.headers, body: JSON.stringify({ text, delay }) })
  //     return req.json();
  // }

  // async swipe(key: number): Promise<string> {
  //     const req = await fetch(`${this.url}swipe`, { method: 'POST', headers: this.headers, body: JSON.stringify({ text, delay }) })
  //     return req.json();
  // }

  async execOut(command: string, sudo = false): Promise<string> {
    const req = await fetch(`${this.url}exec-out`, { method: 'POST', headers: this.headersPOST, body: JSON.stringify({ command, sudo }) });
    return req.text();
  }

  async getProps(prefixs?: string): Promise<Record<string, string>> {
    const url = new URL('./props', this.url);
    if (prefixs) url.searchParams.append('prefix', prefixs);
    const req = await fetch(url, { method: 'GET', headers: this.headers });
    return req.json();
  }

  async phonesubinfo(id: number): Promise<string> {
    const req = await fetch(`${this.url}phonesubinfo/${id}`, { method: 'GET', headers: this.headers });
    return req.json();
  }

  async clear(pkage: string): Promise<string> {
    const req = await fetch(`${this.url}clear/${pkage}`, { method: 'POST', headers: this.headers });
    return req.json();
  }

  async past(text: string): Promise<string> {
    const req = await fetch(`${this.url}past`, { method: 'POST', headers: this.headers, body: JSON.stringify({ text }) });
    return req.json();
  }

  async getChromeVersion(): Promise<string> {
    const url = new URL('dumpsys/package/com.android.chrome?', this.url);
    url.searchParams.append('grep', 'versionName');
    const req = await fetch(url, { method: 'GET', headers: this.headers });
    let text = await req.text();
    text = text.replaceAll(/versionName=/g, '');
    const versions = text
      .split(/[\r\n]/g)
      .map((a) => a.trim())
      .filter((a) => a);
    versions.sort((a, b) => Number(b.split('.')[0]) - Number(a.split('.')[0]));
    return versions[0];
  }

  async installApk(link: string): Promise<string> {
    const url = new URL('install', this.url);
    const req = await fetch(url, { method: 'POST', headers: this.headersPOST, body: JSON.stringify({ link }) });
    const text = await req.text();
    return text;
  }

  async png(options: { scall?: number; width?: number }): Promise<Blob> {
    const url = new URL('png', this.url);
    if (options.scall) url.searchParams.append('scall', options.scall.toString());
    if (options.width) url.searchParams.append('width', options.width.toString());
    const req = await fetch(url, { method: 'GET', headers: this.headers });
    return req.blob();
  }

  async jpeg(options: { scall?: number; quality?: number; width?: number }): Promise<Blob> {
    const url = new URL('jpeg', this.url);
    if (options.scall) url.searchParams.append('scall', options.scall.toString());
    if (options.quality) url.searchParams.append('quality', options.quality.toString());
    if (options.width) url.searchParams.append('width', options.width.toString());
    const req = await fetch(url, { method: 'GET', headers: this.headers });
    return req.blob();
  }

  async webp(options: { scall?: number; quality?: number; width?: number }): Promise<Blob> {
    const url = new URL('webp', this.url);
    if (options.scall) url.searchParams.append('scall', options.scall.toString());
    if (options.quality) url.searchParams.append('quality', options.quality.toString());
    if (options.width) url.searchParams.append('width', options.width.toString());
    const req = await fetch(url, { method: 'GET', headers: this.headers });
    return req.blob();
  }

  async wifi(mode: 'on' | 'off'): Promise<Blob> {
    const req = await fetch(`${this.url}wifi`, { method: 'POST', headers: this.headers, body: JSON.stringify({ mode }) });
    return req.blob();
  }

  async data(mode: 'on' | 'off'): Promise<Blob> {
    const req = await fetch(`${this.url}data`, { method: 'POST', headers: this.headers, body: JSON.stringify({ mode }) });
    return req.blob();
  }

  async airplane(mode: 'on' | 'off'): Promise<Blob> {
    const req = await fetch(`${this.url}airplane`, { method: 'POST', headers: this.headers, body: JSON.stringify({ mode }) });
    return req.blob();
  }

  async packages(): Promise<string[]> {
    const req = await fetch(`${this.url}packages`, { method: 'GET', headers: this.headers });
    return req.json();
  }

  async ps(): Promise<unknown[]> {
    const req = await fetch(`${this.url}ps`, { method: 'GET', headers: this.headers });
    return req.json();
  }

  async sms(from?: string): Promise<unknown[]> {
    const req = await fetch(`${this.url}sms?from=${from}`, { method: 'GET', headers: this.headers });
    return req.json();
  }

  async smsDelete(id: number): Promise<unknown> {
    const req = await fetch(`${this.url}sms/${id}`, { method: 'DELETE', headers: this.headers });
    return req.json();
  }

  async startActivity(activity: { user: number; action: string; data: string; mimeType: string; category: unknown; component: string }): Promise<unknown> {
    const req = await fetch(`${this.url}start-activity`, { method: 'POST', headers: this.headers, body: JSON.stringify(activity) });
    return req.json();
  }

  /**
   * get log
   */
  async log(): Promise<string> {
    const req = await fetch(`${this.url}log`, { method: 'GET', headers: this.headers });
    return req.text();
  }

  async fw(localabstract: string, path = '/'): Promise<string> {
    const req = await fetch(`${this.url}fw/localabstract:${localabstract}${path}`, { method: 'GET', headers: this.headers });
    return req.text();
  }

  // /remote/acer/device/{serial}/fw/{remote}/{path}
  // Forward http request.
}
