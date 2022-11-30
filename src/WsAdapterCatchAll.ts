import * as WebSocket from 'ws';
import { WebSocketAdapter } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import * as http from 'http';
import { NestExpressApplication } from '@nestjs/platform-express';

export class WsAdapterCatchAll implements WebSocketAdapter<WebSocket.WebSocketServer, WebSocket.WebSocket, void> {
  constructor(private readonly app: NestExpressApplication) {
    // empty
  }
  webSocket?: WebSocket.Server;

  create(): WebSocket.Server {
    const server = this.app.getHttpServer();
    const webSocket = new WebSocket.Server({ server });
    this.webSocket = webSocket;
    return webSocket;
  }

  bindClientConnect(server: WebSocket.Server, callback: (this: WebSocket.Server, socket: WebSocket, request: http.IncomingMessage) => void) {
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

  close(server: WebSocket.WebSocketServer) {
    server.close();
  }

  dispose(): void {
    if (this.webSocket) this.webSocket.close();
  }
}
