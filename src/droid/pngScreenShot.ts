import { DeviceClient, Utils } from '@u4/adbkit';

export class PngScreenShot {
  png!: Buffer;
  capureTime: number;
  captureDuration: number;
  constructor(private client: DeviceClient) {
    // empty
  }

  async capture(): Promise<this> {
    this.capureTime = Date.now();
    const stream = await this.client.screencap();
    this.png = await Utils.readAll(stream);
    this.captureDuration = Date.now() - this.capureTime;
    return this;
  }

  get age(): number {
    return Date.now() - this.capureTime;
  }
}
