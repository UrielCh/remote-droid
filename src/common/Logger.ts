import * as fs from "fs";
import { join } from "path";
import rimraf from "rimraf";

const logDir = join(__dirname, "..", "..", "log");
try {
  fs.mkdirSync(logDir);
} catch (e) {
  /* ignore*/
}

function ansiRegex({ onlyFirst = false } = {}) {
  const pattern = [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))",
  ].join("|");
  return new RegExp(pattern, onlyFirst ? undefined : "g");
}

const filter = ansiRegex();

export function logAction(serial: string, message: string): void {
  serial = serial || "na";
  serial = serial.replace(/\//g, "");
  // const dt = new Date().toISOString().substring(8, 23);
  const dt = new Date().toISOString().substring(0, 19);
  console.log(`[${dt}] ${serial} ${message}`);
  const day = dt.substring(0, 10);
  const logDir2 = join(logDir, day);
  if (!fs.existsSync(logDir2)) {
    fs.mkdirSync(logDir2);
    for (const d of [6, 7, 8, 9, 10]) {
      const dt = new Date(Date.now() - 1000 * 60 * 60 * 24 * d).toISOString().substring(0, 10);
      rimraf.sync(join(logDir, dt));
    }
  }
  let line = `[${dt}] ${message}\r\n`;
  line = line.replace(filter, "");
  fs.appendFileSync(join(logDir2, `${serial}.log`), line, {
    encoding: "utf-8",
  });
}
