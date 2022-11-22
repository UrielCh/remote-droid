import { program } from 'commander';
import { ServiceNode } from './common';
import { RemoteDroidApi } from './RemoteDroidApi';
import { HttpServerFw } from './HttpServerFw';
import pc from 'picocolors';

program.name('remote-droid-ws-gateway').description('open a WS gateway to an remote droid').version('0.0.0');

//program
//  .command('list')
//  .description('List available phones')
//  .argument('<string>', 'cluster platforme')
//  .option('--token', 'Auth token')
//  .action(async (domain, options) => {
//    console.log(`connectuing to ${domain}`);
//    const srvs = await listServerNodes(`https://${domain}/remote`);
//    console.log(srvs);
//    // const limit = options.first ? 1 : undefined;
//    // console.log(str.split(options.separator, limit));
//  });
//

type WgOptions = {
  token?: string;
  serial?: string;
  port: number;
};

program
  .command('wg')
  .description('open a WS gateway to an remote droid')
  .argument('<string>', 'entry point ex: http://127.0.0.1/remote/local/')
  .option('--token <token>', 'Auth token')
  .option('--serial <serial>', 'phone serial number to connect to')
  .option('-p, --port <port>', 'Fowarded from local port', Number, 9999)
  // .option('-s, --separator <char>', 'separator character', ',')
  .action(async (remoteDroid: string, options: WgOptions) => {
    console.log(`connectuing to ${remoteDroid}`);
    const token = options.token || '';
    let serial = options.serial;
    if (!remoteDroid.endsWith('/')) remoteDroid += '/';
    const srv: ServiceNode = { name: 'no-name', remoteDroid, token };
    if (!serial) {
      const devices = await RemoteDroidApi.listDevices(srv);
      if (!devices.length) {
        console.log(`No devices available on ${remoteDroid}`);
        return;
      }
      console.log(`${pc.yellow(devices.length)} devices visible:`);
      for (const device of devices) {
        console.log(`- ${device.id} [${device.type}]`);
      }
      serial = devices[0].id;
      console.log(`Using ${pc.yellow(serial)}`);
    }
    const rd = new RemoteDroidApi({ ...srv, serial });
    // const fw = await rd.fw('chrome_devtools_remote', '/json/list');
    //console.log('/json/list');
    //console.log(fw);

    const server = new HttpServerFw(options.port, rd);
    await server.start();
    console.log(`Server ready on Port ${pc.green(options.port)}`);
    const discoverURL = `127.0.0.1:${options.port}`;
    console.log(`Open chrome to ${pc.green('chrome://inspect')} and connect add discover ${pc.green(discoverURL)}\n`);
  });

/// const options = program.opts();
/// const limit = options.first ? 1 : undefined;
/// console.log(program.args[0].split(options.separator, limit));
program.parse();
