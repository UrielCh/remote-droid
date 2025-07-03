import { RemoteDeviceWs } from './RemoteDeviceWs.js';

export interface CDPListItem {
    description: string,
    // debug URL usable within a chrome browser
    devtoolsFrontendUrl: `https://chrome-devtools-frontend.appspot.com/serve_internal_file/@${string}/inspector.html?ws=${string}:${number}/devtools/page/${number}`;
    // tab id ou UUID
    id: `${number}` | string;
    // page title
    title: string;
    type: "page" | "background_page" | "worker" | "iframe" | string;
    // page URL
    url: string;
    // the WebSocket URL to connect to the CDP
    webSocketDebuggerUrl: `ws://${string}:${number}/devtools/page/${number}`;
}

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

  /**
   * @see https://chromedevtools.github.io/devtools-protocol/
   * GET /json or /json/list
   * @returns 
   */
  async getCdpJson(): Promise<CDPListItem[]> {
    // http://127.0.0.1:3009/remote/local/device/7f63325e/fw/localabstract:chrome_devtools_remote/json/list
    const url = new URL(`fw/localabstract:chrome_devtools_remote/json/list`, this.baseUrl);
    const req = await fetch(url, { method: 'GET', headers: this.headers });
    const list: CDPListItem[] = await req.json();
    return list;
  }

  // /**
  //  * @see https://chromedevtools.github.io/devtools-protocol/
  //  * GET /json or /json/list
  //  * @returns 
  //  */
  // async getCdpProtocol(): Promise<string> {
  //   // http://127.0.0.1:3009/remote/local/device/7f63325e/fw/localabstract:chrome_devtools_remote/json/protocol/
  //   const url = new URL(`fw/localabstract:chrome_devtools_remote/json/protocol/`, this.baseUrl);
  //   const req = await fetch(url, { method: 'GET', headers: this.headers });
  //   const list: string = await req.text();
  //   return list;
  // }

  /**
   * @param wsUrl ws://127.0.0.1:59638/devtools/page/75
   * @returns 
   */
  async getCdpTest(wsUrl: string): Promise<string> {
    const wsUrlObj = new URL(wsUrl);
    const pathname = wsUrlObj.pathname; // pathname starts with / like in /devtools/page/75
    // http://127.0.0.1:3009/remote/local/device/7f63325e/fw/localabstract:chrome_devtools_remote/devtools/page/75
    const url = new URL(`fw/localabstract:chrome_devtools_remote${pathname}`, this.baseUrl);
    if (url.protocol === "http:") {
      url.protocol = 'ws:';
    } else {
      url.protocol = 'wss:';
    }

    console.log(url);

    const ws = new WebSocket(url.toString());
    
    return new Promise<string>((resolve, reject) => {
      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'DOM.getDocument' }));
        // ws.send(JSON.stringify({ id: 1, method: 'Page.getResourceTree' }));
        // ws.send(JSON.stringify({ "id": 2, "method": "DOM.getOuterHTML", "params": { "nodeId": 1 } }));
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.id === 1) {
          const nodeId = message.result.root.nodeId;
          ws.send(JSON.stringify({ id: 2, method: 'DOM.getOuterHTML', params: { nodeId } }));
        }
        if (message.id === 2) {
          ws.close();
          resolve(message.result.outerHTML);
        }
      };

      ws.onerror = (err) => {
        ws.close();
        reject(err);
      };
    });
  }
}
