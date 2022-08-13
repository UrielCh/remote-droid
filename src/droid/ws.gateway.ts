/**
 * take care of all Websocket connexions
 */
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayInit } from "@nestjs/websockets";
import { Server } from "ws";
import * as WebSocket from "ws";
import * as http from "http";
import { PhoneService } from "./phone.service";
import { WsHandlerSession } from "./WsHandlerSession";
import { WsFowardSession } from "./WsFowardSession";

@WebSocketGateway()
export class WsGateway implements OnGatewayConnection, OnGatewayInit {
  sessionid = 0;
  forwardid = 0;
  sessions: Map<number, WsHandlerSession> = new Map();
  sessionsFw: Map<number, WsFowardSession> = new Map();

  @WebSocketServer()
  server!: Server;

  constructor(private phoneService: PhoneService) {}

  afterInit(server: WebSocket.Server) {
    server.on("error", (error) => {
      console.error(error);
    });
  }

  /**
   * handle url like:
   * '/phone/b2806010/'
   * '/phone/b2806010/fw/{remote}/...'
   * @param wsc
   * @param req
   * @returns
   */
  async handleConnection(wsc: WebSocket, req: http.IncomingMessage) {
    const url = req.url || ""; // looks like '/phone/b2806010/'
    const m = url.match(/\/phone\/([^/]+)\/?(.*)?$/);
    if (!m) {
      wsc.send(JSON.stringify({ message: "invalid url", url }));
      wsc.close(1000);
      return;
    }
    const [, serial, rest] = m;

    if (!rest) {
      const id = this.sessionid++;
      const session = new WsHandlerSession(this.phoneService, wsc, serial);
      await session.start();
      this.sessions.set(id, session);
      session.on("disconnected", () => this.sessions.delete(id));
      return;
    }

    const m2 = rest.match(/^fw\/([^/]+)(\/.+)/);
    if (!m2) {
      wsc.send(JSON.stringify({ message: "invalid url", url }));
      wsc.close(1000);
      return;
    }

    // looks like '/phone/b2806010/fw/{remote}/{path...}'
    // foward request
    const id = this.forwardid++;
    const [, remote, uri] = m2;
    const session = new WsFowardSession(this.phoneService, wsc, serial);
    await session.start(remote, uri);
    this.sessionsFw.set(id, session);
    session.on("disconnected", () => this.sessionsFw.delete(id));
  }

  getSessionCount() {
    return this.sessions.size;
  }

  getFowardsCount() {
    return this.sessions.size;
  }
}
