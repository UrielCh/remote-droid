/**
 * take care of all Websocket connexions
 */
import * as http from 'node:http';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayInit } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { WsHandlerSession } from './WsHandlerSession.js';
import { WsFowardSession } from './WsFowardSession.js';
import { WsHandlerTracking } from './WsHandlerTracking.js';
import { AdbClientService } from './adbClient.service.js';
import { DeviceService } from './device.service.js';
import { DbService } from '../db/db.service.js';
import { globalPrefixs, globalPrefix } from '../env.js';

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

  afterInit(server: Server) {
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
    // console.log(`new CNX drom port ${req.socket.remotePort} to ${url}`);

    // debug only
    // setTimeout(() => {
    //   if (wsc.readyState !== WebSocket.CLOSED) {
    //     // CONNECTING: 0;
    //     // OPEN: 1;
    //     // CLOSING: 2;
    //     // CLOSED: 3;
    //     console.log(`after 3min cnx ${url} readyState is ${wsc.readyState}`);
    //   }
    // }, 180000);

    if (!url.startsWith(globalPrefix)) {
      const message = `routing issue url should starts with prefix ${globalPrefix}`;
      wsc.send(JSON.stringify({ message, url }));
      wsc.close(1000, message);
      return;
    }

    const userSegments = url.split('/').filter((a) => a);
    userSegments.splice(0, globalPrefixs.length);

    if (userSegments[0] !== 'device') {
      wsc.send(JSON.stringify({ message: `invalid url should with by ${globalPrefix.replace(/\/$/, '')}/device`, url }));
      wsc.close(1000);
      return;
    }

    /**
     * url is /device handle a traker request
     */
    if (userSegments.length === 1) {
      const id = this.ids.tracking++;
      const session = new WsHandlerTracking(this.dbService, this.adbClient, wsc);
      this.sessions.tracking.set(id, session);
      session.on('disconnected', () => {
        this.sessions.tracking.delete(id);
      });
      await session.guard(url);
      await session.start();
      // this.logSession();
      return;
    }

    /**
     * Invalid URL check
     */
    const m = url.match(/\/device\/([^/]+)\/?(.*)?$/);
    if (!m) {
      wsc.send(JSON.stringify({ message: `invalid url do not match ${globalPrefix.replace(/\/$/, '')}/device/serial/action`, url }));
      wsc.close(1000);
      return;
    }
    const [, serial, rest] = m;

    /**
     * Handle to Device Websocket
     */
    if (!rest) {
      const id = this.ids.session++;
      const session = new WsHandlerSession(this.dbService, this.phoneService, wsc, serial);
      this.sessions.device.set(id, session);
      session.on('disconnected', () => {
        // console.log('disconnected Session');
        this.sessions.device.delete(id);
      });
      await session.guard(url);
      await session.start();
      this.logSession();
      return;
    }

    /**
     * Invalid URL check
     */
    const m2 = rest.match(/^fw\/([^/]+)(\/.+)/);
    if (!m2) {
      wsc.send(JSON.stringify({ message: `invalid url do not match ${globalPrefix.replace(/\/$/, '')}/fw/port`, url }));
      wsc.close(1000);
      return;
    }

    /**
     * Handle foward request
     * looks like '/device/b2806010/fw/{remote}/{path...}'
     */
    const id = this.ids.forward++;
    const [, remote, uri] = m2;
    const session = new WsFowardSession(this.dbService, this.phoneService, wsc, serial);
    this.sessions.forward.set(id, session);
    session.on('disconnected', () => {
      this.sessions.forward.delete(id);
    });
    await session.guard(url);
    await session.start(remote, uri);
    // this.logSession();
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

  logSession() {
    console.log('device:' + this.getSessionCount() + ' forward:' + this.getFowardsCount() + ' tracking:' + this.getTrackingCount());
  }
}
