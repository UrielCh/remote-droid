import * as WebSocket from "ws";
import { WebSocketAdapter } from "@nestjs/common";
import { MessageMappingProperties } from "@nestjs/websockets";
import { Observable } from "rxjs";
import * as http from "http";
import { NestExpressApplication } from "@nestjs/platform-express";

export class WsAdapterCatchAll implements WebSocketAdapter<any, any, any> {
  constructor(private readonly app: NestExpressApplication) {}

  create(): WebSocket.Server {
    const server = this.app.getHttpServer();
    return new WebSocket.Server({ server });
  }

  bindClientConnect(server: WebSocket.Server, callback: (this: WebSocket.Server, socket: WebSocket, request: http.IncomingMessage) => void) {
    server.on("connection", (socket: WebSocket, request: http.IncomingMessage) => {
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

  close(server: any) {
    server.close();
  }
}
