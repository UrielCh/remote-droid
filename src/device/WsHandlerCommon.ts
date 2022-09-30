import { logAction } from '../common/Logger';
import { EventEmitter } from 'stream';
import * as WebSocket from 'ws';
import { DbService } from '../db/db.service';

export class WsHandlerCommon extends EventEmitter {
  private queueMsg: Array<WebSocket.MessageEvent> | null = [];
  public user: { allowDevice: (serial: string) => boolean } | null = null;

  constructor(private dbService: DbService, protected wsc: WebSocket) {
    super();
  }

  /**
   * guard and QUEUE messages
   * @returns
   */
  async guard(url: string): Promise<this> {
    // no user, no control activated
    const adminToken = this.dbService.adminToken;
    const haveUser = await this.dbService.haveUser();

    let waitForAuth = adminToken || haveUser;
    const authP = new Promise<void>((resolve, reject) => {
      this.wsc.onmessage = async (event: WebSocket.MessageEvent) => {
        // console.log('socket Type:', event.type);
        if (waitForAuth) {
          waitForAuth = false;
          const line = event.data.toString().trim();
          // eslint-disable-next-line prefer-const
          let [cmd, token] = line.split(/\s+/);
          cmd = cmd.toLowerCase();
          if (cmd !== 'auth') {
            logAction('error', `Missing auth WS to: ${url}`);
            this.wsc.send('expected auth statement.');
            this.close('expected auth text message');
            reject(Error('invalidAuth'));
            return;
          }
          if (token === adminToken) {
            this.user = {
              allowDevice: () => true,
            };
            resolve();
            return;
          }
          const user = await this.dbService.getDroidUserByToken(token);
          if (!user) {
            logAction('error', `Bad auth WS to: ${url}`);
            this.wsc.send('invalid credencial.');
            this.close('invalid credencial');
            reject(Error('invalidAuth'));
            return;
          }
          this.user = user;
          resolve();
        }
        this.queue(event);
      };
    });
    if (waitForAuth) {
      await authP;
    }
    return this;
  }

  //////////
  // general
  close(error: string | Error) {
    // this.log("clossing WS ERROR:" + error);
    if (error instanceof Error) this.wsc.close(1011, error.message); // 	Internal server error while operating
    else this.wsc.close(1000, `${error}`); // 	Internal server error while operating
    this.emit('disconnected');
  }

  flushQueue(consume?: (msg: WebSocket.MessageEvent) => void): void {
    // should add a loop detection ?
    if (consume && this.queueMsg)
      for (const event of this.queueMsg) {
        consume(event);
      }
    this.queueMsg = null;
  }

  queue(event: WebSocket.MessageEvent): void {
    if (this.queueMsg && event) this.queueMsg.push(event);
  }
}
