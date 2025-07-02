import * as http from 'node:http';
import { WebSocketServer, WebSocket, Server} from 'ws';
import { WebSocketAdapter } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { NestExpressApplication } from '@nestjs/platform-express';

export class WsAdapterCatchAll implements WebSocketAdapter<WebSocketServer, WebSocket, void> {
  constructor(private readonly app: NestExpressApplication) {
    // empty
  }
  webSocket?: Server;

  create(): Server {
    const server = this.app.getHttpServer();
    const webSocket = new WebSocketServer({ server });
    this.webSocket = webSocket;
    return webSocket;
  }

  bindClientConnect(server: Server, callback: (this: Server, socket: WebSocket, request: http.IncomingMessage) => void) {
    server.on('connection', (socket: WebSocket, request: http.IncomingMessage) => {
      callback.call(server, socket, request);
    });
  }

  bindMessageHandlers() {
    // ignore
  }

  bindMessageHandler(buffer: any, handlers: MessageMappingProperties[], process: (data: any) => Observable<any>): Observable<any> {
    const message = buffer.data;
    return process(message);
  }

  close(server: WebSocketServer) {
    server.close();
  }

  dispose(): void {
    if (this.webSocket) this.webSocket.close();
  }
}
