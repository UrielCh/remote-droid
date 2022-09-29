import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Adb, { Client, Tracker } from '@u4/adbkit';

/**
 * Injectable Adb Client for Eacy Mocking
 */
@Injectable()
export class AdbClientService implements OnModuleDestroy {
  client: Client;

  #tracker?: Promise<Tracker>;
  get tracker(): Promise<Tracker> {
    if (!this.#tracker) this.#tracker = this.client.trackDevices();
    return this.#tracker;
  }

  constructor() {
    this.client = Adb.createClient();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.#tracker) {
      const tracker = await this.#tracker;
      tracker.end();
      this.#tracker = undefined;
    }
    this.client.once('error', () => null);
    await this.client.kill();
    // await this.client.disconnect(this.client.host);
  }

  listDevices(): ReturnType<Client['listDevices']> {
    return this.client.listDevices();
  }
}
