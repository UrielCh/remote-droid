import { program } from 'commander';
import { ServiceNode } from 'common';
import { RemoteDroidApi } from './RemoteDroidApi';

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
program
  .command('wg')
  .description('open a WS gateway to an remote droid')
  .argument('<string>', 'entry point ex: http://127.0.0.1/remote/local/')
  .option('--token <token>', 'Auth token')
  .option('--serial <serial>', 'phone serial number to connect to')
  // .option('-s, --separator <char>', 'separator character', ',')
  .action(async (remoteDroid: string, options) => {
    console.log(`connectuing to ${remoteDroid}`);
    const token = options.token;
    let serial = options.serial;
    if (!remoteDroid.endsWith('/')) remoteDroid += '/';
    const srv: ServiceNode = { name: 'no-name', remoteDroid, token };
    if (!serial) {
      const devices = await RemoteDroidApi.listDevices(srv);
      if (!devices.length) {
        console.log(`No devices available on ${remoteDroid}`);
        return;
      }
      console.log(`${devices.length} devices visible:`);
      for (const device of devices) {
        console.log(`- ${device.id} [${device.type}]`);
      }
      serial = devices[0].id;
      console.log(`Using ${serial}`);
    }
    const rd = new RemoteDroidApi({ ...srv, serial });
    const fw = await rd.fw('chrome_devtools_remote', '/json/list');
    console.log('/json/list:');
    console.log(fw);
  });

/// const options = program.opts();
/// const limit = options.first ? 1 : undefined;
/// console.log(program.args[0].split(options.separator, limit));
program.parse();
