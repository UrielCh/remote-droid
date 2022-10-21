import { logAction } from '../common/Logger';
import { EventEmitter } from 'stream';
import * as WebSocket from 'ws';
import { DbService } from '../db/db.service';

export class WsHandlerCommon extends EventEmitter {
  closed = false;
  private queueMsg: Array<WebSocket.MessageEvent> | null = [];
  public user: { allowDevice: (serial: string) => boolean } | null = null;

  constructor(private dbService: DbService, protected wsc: WebSocket) {
    super();

    // tmp close function will be overwrite after init
    this.wsc.onclose = (event: WebSocket.CloseEvent) => {
      this.notifyDisconect();
    };
  }

  public notifyDisconect(): void {
    if (this.wsc.readyState !== WebSocket.CLOSED) {
      if (this.wsc.readyState === WebSocket.CLOSING) {
        console.log('force Closing WS from state: CLOSING');
      } else if (this.wsc.readyState === WebSocket.OPEN) {
        console.log('force Closing WS from state: OPEN');
      } else if (this.wsc.readyState === WebSocket.CONNECTING) {
        console.log('force Closing WS from state: CONNECTING');
      } else {
        console.log(`force Closing WS from state: ${this.wsc.readyState}`);
      }
      this.wsc.close(1000);
    }
    this.closed = true;
    this.emit('disconnected');
  }

  /**
   * copy from ws lin
   * Checks if a status code is allowed in a close frame.
   *
   * @param {Number} code The status code
   * @return {Boolean} `true` if the status code is valid, else `false`
   * @public
   */
  isValidStatusCode(code: number) {
    return (code >= 1000 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006) || (code >= 3000 && code <= 4999);
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
            logAction('error', `Missing auth WS to: ${url}, RCV ${line}`);
            this.wsc.send('expected auth statement.');
            this.close('expected auth text message');
            reject(Error(`invalidAuth to: ${url}, RCV ${line}`));
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
            logAction('error', `Bad auth WS to: ${url} bad token: ${token}`);
            this.wsc.send('invalid credencial.');
            this.close('invalid credencial');
            reject(Error(`invalidAuth to: ${url} bad token: ${token}`));
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
