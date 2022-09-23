import { EventEmitter } from "stream";
import * as WebSocket from "ws";
import { DbService } from "../db/db.service";

export class WsHandlerCommon extends EventEmitter {
  public user: { allowDevice: (serial: string) => boolean } | null = null;

  constructor(private dbService: DbService, protected wsc: WebSocket) {
    super();
  }

  async guard(): Promise<this> {
    // no user, no control activated
    const adminToken = this.dbService.adminToken;
    const haveUser = await this.dbService.haveUser();
    if (adminToken || haveUser) {
      await new Promise<void>((resolve, reject) => {
        this.wsc.once("message", async (data: WebSocket.RawData, isBinary: boolean) => {
          if (!isBinary) {
            const line = data.toString().trim();
            // eslint-disable-next-line prefer-const
            let [cmd, token] = line.split(/\s+/);
            cmd = cmd.toLowerCase();
            if (cmd !== "auth") {
              this.wsc.send("expected auth statement.");
              this.close("expected auth text message");
              reject(Error("invalidAuth"));
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
              this.wsc.send("invalid credencial.");
              this.close("invalid credencial");
              reject(Error("invalidAuth"));
              return;
            }
            this.user = user;
            resolve();
          } else {
            this.close("expected auth text message");
            reject(Error("invalidAuth"));
          }
        });
      });
      // wait for auth
    }
    return this;
  }

  //////////
  // general

  close(error: string | Error) {
    // this.log("clossing WS ERROR:" + error);
    if (error instanceof Error) this.wsc.close(1011, error.message); // 	Internal server error while operating
    else this.wsc.close(1000, `${error}`); // 	Internal server error while operating
    this.emit("disconnected");
  }
}
