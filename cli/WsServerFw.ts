import { WebSocket, RawData } from 'ws';
import http from 'http';
import { RemoteDroidApi } from 'RemoteDroidApi';
import pc from 'picocolors';

const LOG_ALL = false;

export class WsServerFw {
  constructor(wsClient: WebSocket, request: http.IncomingMessage, rd: RemoteDroidApi) {
    const path = request.url;
    console.log(`RCV WS: ${pc.magenta(path)}`);
    const endpoint = rd.getFwUrl('chrome_devtools_remote', path).replace(/^http/, 'ws');
    const queue: Array<RawData | string> = [];
    const wsChrome = new WebSocket(endpoint);
    console.log(`Starting session on ${pc.green(endpoint)}`);
    /**
     * foward or queue messages
     */
    wsClient.on('message', (msg, binary) => {
      // process message
      if (binary) {
        // console.log('in :', msg.toString('hex'));
      } else if (LOG_ALL) {
        const text = msg.toString();
        const message = JSON.parse(text);
        console.log(pc.green('in :'));
        console.log(message);
      }
      // foward or queue
      if (wsChrome.readyState === 1) {
        wsChrome.send(msg, { binary });
      } else {
        if (!binary) queue.push(msg.toString());
        else queue.push(msg);
      }
    });
    wsChrome.once('open', () => {
      for (const msg of queue) {
        wsChrome.send(msg);
      }
      wsChrome.on('message', (msg, binary) => {
        if (binary) {
          // console.log('out:', msg.toString('hex'));
        } else if (LOG_ALL) {
          const text = msg.toString();
          const message = JSON.parse(text);
          console.log(pc.red('out :'));
          console.log(message);
        }
        wsClient.send(msg, { binary });
      });
      wsClient.on('close', (code: number, reason: Buffer) => {
        // ws not happy with close code 1005, replace 1005 by 1000;
        if (!code || code === 1005) code = 1000;
        wsChrome.close(code || 1000, reason);
      });
    });
  }
}
