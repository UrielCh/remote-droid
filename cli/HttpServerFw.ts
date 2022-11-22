import http from 'http';
import { RemoteDroidApi } from './RemoteDroidApi';
import { WebSocket, WebSocketServer } from 'ws';
import { WsServerFw } from './WsServerFw';
import pc from 'picocolors';

export class HttpServerFw {
  private server?: http.Server;
  constructor(private srcPort: number, private rd: RemoteDroidApi) {}

  public async start(): Promise<void> {
    // create http servce + ws server
    if (this.server) throw Error('already running');
    const wss = new WebSocketServer({ noServer: true });
    const server = http.createServer((req, res) => this.requestListener(req, res));
    this.server = server;

    wss.on('connection', (ws: WebSocket, request: http.IncomingMessage) => {
      // const wsfw =
      new WsServerFw(ws, request, this.rd);
      // this.sessions.push(new ProtoRevertLink(ws, request, this.options.dstPort, { ignoreEvent: this.ignoreEvent, maxParamLen: this.maxParamLen }));
    });

    server.on('upgrade', function upgrade(request, socket, head) {
      // const { pathname } = parse(request.url);
      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
      });
    });
    await new Promise<void>((resolve) => server.listen(this.srcPort, resolve));
  }

  private requestListener(req: http.IncomingMessage, res: http.ServerResponse) {
    const { headers } = req;
    const path = req.url;
    console.log(`RCV: ${pc.magenta(path)}`);

    const url = this.rd.getFwUrl('chrome_devtools_remote', path);
    // TODO add token
    http.get(url, { headers }, (chromeResp) => {
      const clen = chromeResp.headers['Content-Length'] || chromeResp.headers['content-length'];
      console.log(`FW GET ${pc.magenta(path)} ${pc.green(chromeResp.statusCode)} Content-Length:${pc.yellow(clen?.toString())}`);

      //res.writeHead(chromeResp.statusCode || 500, chromeResp.statusMessage, chromeResp.headers);
      let body = Buffer.alloc(0);
      chromeResp.on('data', (data) => {
        body = Buffer.concat([body, data]);
        //res.write(data);
      });
      chromeResp.on('end', () => {
        const txt0 = body.toString(); // JSON.parse();
        // this.logs.push({ requestUrl: path || '', response: txt });
        delete chromeResp.headers['Content-Length'];
        delete chromeResp.headers['content-length'];
        // const prefix = this.rd.getFwUrlPrefix().replace(/^http/, 'ws');
        const prefix = `ws://127.0.0.1:${this.srcPort}`; // this.rd.getFwUrlPrefix().replace(/^http/, 'ws');
        let txt = txt0.replaceAll(/"webSocketDebuggerUrl":\s?"ws:\/\/127.0.0.1:\d+([^"]+)"/g, `"webSocketDebuggerUrl": "${prefix}$1"`);
        if (txt0.length != txt.length) {
          // ws=127.0.0.1:65301/devtools/page/1",
          const prefix2 = prefix.replace('ws://', 'ws=');
          txt = txt.replaceAll(/ws=127.0.0.1:\d+([^"]+)"/g, `${prefix2}$1"`);
        }
        txt = txt.replace('Redmi Note 9 Pro', 'Redmi Note 13 Pro');
        console.log(`${txt}\n`);
        res.writeHead(chromeResp.statusCode || 500, chromeResp.statusMessage, chromeResp.headers);
        res.end(body);
      });
      chromeResp.on('close', () => {
        res.destroy();
      });
    });
  }
}
