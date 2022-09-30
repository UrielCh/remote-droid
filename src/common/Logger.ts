import * as fs from 'fs';
import * as path from 'path';

import { join } from 'path';
import rimraf from 'rimraf';

const logDir = join(__dirname, '..', '..', 'log');
try {
  fs.mkdirSync(logDir);
} catch (e) {
  /* ignore*/
}

function ansiRegex({ onlyFirst = false } = {}) {
  const pattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
  ].join('|');
  return new RegExp(pattern, onlyFirst ? undefined : 'g');
}

const filter = ansiRegex();

/**
 * TODO reduce FS access due to cvheck pog file presences
 * @param serial
 * @returns
 */

export function getLogFile(serial: string): string {
  serial = serial || 'na';
  serial = serial.replace(/\//g, '');
  const dt = new Date().toISOString().substring(0, 19);
  const day = dt.substring(0, 10);
  const logDir2 = path.join(logDir, day);
  if (!fs.existsSync(logDir2)) {
    fs.mkdirSync(logDir2);
    for (const d of [6, 7, 8, 9, 10]) {
      const dt = new Date(Date.now() - 1000 * 60 * 60 * 24 * d).toISOString().substring(0, 10);
      rimraf.sync(path.join(logDir, dt));
    }
  }
  return path.join(logDir2, `${serial}.log`);
}

export function logAction(serial: string, message: string): void {
  const logFile = getLogFile(serial);
  const dt = new Date().toISOString().substring(0, 19);
  let line = `[${dt}] ${message}\r\n`;
  line = line.replace(filter, '');
  fs.appendFileSync(logFile, line, { encoding: 'utf-8' });
}
