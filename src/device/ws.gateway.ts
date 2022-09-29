/**
 * take care of all Websocket connexions
 */
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'ws';
import * as WebSocket from 'ws';
import * as http from 'http';
import { WsHandlerSession } from './WsHandlerSession';
import { WsFowardSession } from './WsFowardSession';
import { WsHandlerTracking } from './WsHandlerTracking';
import { AdbClientService } from './adbClient.service';
import { DeviceService } from './device.service';
import { getEnv } from '../env';
import { DbService } from '../db/db.service';

const globalPrefixs = getEnv('GLOBAL_PREFIX', '/')
  .split('/')
  .filter((a) => a);
const globalPrefix = '/' + globalPrefixs.join('/');

@WebSocketGateway()
export class WsGateway implements OnGatewayConnection, OnGatewayInit {
  ids = {
    tracking: 0,
    session: 0,
    forward: 0,
  };
  sessions = {
    tracking: new Map<number, WsHandlerTracking>(),
    device: new Map<number, WsHandlerSession>(),
    forward: new Map<number, WsFowardSession>(),
  };

  @WebSocketServer()
  server!: Server;

  constructor(private dbService: DbService, private adbClient: AdbClientService, private phoneService: DeviceService) {
    // empty
  }

  afterInit(server: WebSocket.Server) {
    server.on('error', (error) => {
      console.error(error);
    });
  }

  /**
   * handle url like:
   * '/device/b2806010/'
   * '/device/b2806010/fw/{remote}/...'
   * @param wsc
   * @param req
   * @returns
   */
  async handleConnection(wsc: WebSocket, req: http.IncomingMessage) {
    const url = req.url || ''; // looks like '/device/b2806010/'

    if (!url.startsWith(globalPrefix)) {
      const message = `routing issue url sould starts with prefix ${globalPrefix}`;
      wsc.send(JSON.stringify({ message, url }));
      wsc.close(1000, message);
      return;
    }
    const userSegments = url.split('/').filter((a) => a);
    userSegments.splice(0, globalPrefixs.length);

    if (userSegments[0] !== 'device') {
      wsc.send(JSON.stringify({ message: `invalid url should with by ${globalPrefix}/device`, url }));
      wsc.close(1000);
      return;
    }

    if (userSegments.length === 1) {
      const id = this.ids.tracking++;
      const session = new WsHandlerTracking(this.dbService, this.adbClient, wsc);
      await session.guard();
      await session.start();
      this.sessions.tracking.set(id, session);
      session.on('disconnected', () => this.sessions.tracking.delete(id));
      return;
    }

    const m = url.match(/\/device\/([^/]+)\/?(.*)?$/);
    if (!m) {
      wsc.send(JSON.stringify({ message: `invalid url do not match ${globalPrefix}/device/serial/action`, url }));
      wsc.close(1000);
      return;
    }
    const [, serial, rest] = m;

    if (!rest) {
      const id = this.ids.session++;
      const session = new WsHandlerSession(this.dbService, this.phoneService, wsc, serial);
      await session.guard();
      await session.start();
      this.sessions.device.set(id, session);
      session.on('disconnected', () => this.sessions.device.delete(id));
      return;
    }

    const m2 = rest.match(/^fw\/([^/]+)(\/.+)/);
    if (!m2) {
      wsc.send(JSON.stringify({ message: `invalid url do not match ${globalPrefix}/fw/port`, url }));
      wsc.close(1000);
      return;
    }

    // looks like '/device/b2806010/fw/{remote}/{path...}'
    // foward request
    const id = this.ids.forward++;
    const [, remote, uri] = m2;
    const session = new WsFowardSession(this.dbService, this.phoneService, wsc, serial);
    await session.guard();
    await session.start(remote, uri);
    this.sessions.forward.set(id, session);
    session.on('disconnected', () => this.sessions.forward.delete(id));
  }

  getSessionCount() {
    return this.sessions.device.size;
  }

  getFowardsCount() {
    return this.sessions.forward.size;
  }

  getTrackingCount() {
    return this.sessions.tracking.size;
  }
}
