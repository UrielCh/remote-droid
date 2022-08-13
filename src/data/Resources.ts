import { resolve } from "path";
import { existsSync } from "fs";

class Resources {
  rootRes: string;
  // rootImg: string;
  constructor() {
    let root = __dirname;
    do {
      root = resolve(root, "..");
    } while (!existsSync(resolve(root, "resources")));
    this.rootRes = resolve(root, "resources");
    // this.rootImg = resolve(root, "img");
    // const debug = resolve(this.rootImg, "debug");
    // try {
    //   mkdirSync(debug);
    // } catch (e) {
    //   // already exists
    // }
  }

  apk(filename: "Adb Clipboard_v2.0_apkpure.com.apk" | "stfservice.apk"): string {
    return resolve(this.rootRes, filename);
  }

  raw(filename: string): string {
    return resolve(this.rootRes, filename);
  }
}

export const resources = new Resources();

export default resources;
