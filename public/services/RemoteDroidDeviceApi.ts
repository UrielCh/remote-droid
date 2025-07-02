import { RemoteDeviceWs } from './RemoteDeviceWs.js';

export class RemoteDroidDeviceApi {
  private headers: { Authorization?: string };
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string, prefix: string, token?: string) {
    this.baseUrl = `${baseUrl}/device/${prefix}/`;
    const headers = {} as { Authorization?: string };
    if (token) {
      const Authorization = `Bearer ${token}`;
      headers.Authorization = Authorization;
    }
    this.headers = headers;
    // let prefix = srv.prefix;
    // if (!prefix.endsWith('/')) {
    //   prefix = prefix += '/';
    // }
    // this.prefix = `${prefix}device/${srv.id}`;
  }

  async getProps(prefixs?: string): Promise<Record<string, string>> {
    const url = new URL(`./props`, this.baseUrl);
    if (prefixs) url.searchParams.append('prefix', prefixs);
    const req = await fetch(url, { method: 'GET', headers: this.headers });
    return req.json();
  }

  get remoteDeviceWs(): RemoteDeviceWs {
    return new RemoteDeviceWs(this.baseUrl, this.token);
  }

  async getChromeVersion(): Promise<string> {
    const url = new URL('dumpsys/package/com.android.chrome?', this.baseUrl);
    url.searchParams.append('grep', 'versionName');
    const req = await fetch(url, { method: 'GET', headers: this.headers });
    let text = await req.text();
    text = text.replace(/versionName=/g, '');
    const versions = text
      .split(/[\r\n]/g)
      .map((a) => a.trim())
      .filter((a) => a);
    versions.sort((a, b) => Number(b.split('.')[0]) - Number(a.split('.')[0]));
    return versions[0];
  }
}
