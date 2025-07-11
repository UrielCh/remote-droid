import * as fs from 'node:fs';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module.js';
import { WsAdapterCatchAll } from './WsAdapterCatchAll.js';
import { globalPrefixs, globalPrefix } from './env.js';
import { logAction } from './common/Logger.js';
import { GlobalPrefixOptions } from '@nestjs/common/interfaces/index.js';

// to debug EventEmitter leaks
// import './common/patchEventEmitter.js';

const __filename = fileURLToPath(import.meta.url);

async function bootstrap() {
  const { birthtime } = fs.statSync(__filename);
  console.log('-----------');
  console.log('Build Date:', birthtime.toISOString());
  console.log('-----------');
  const SERVICE_PORT = Number(process.env.SERVICE_PORT || '3009');
  let version = '0.0.0';
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));
    if (pkg.version) version = pkg.version;
  } catch (e) {
    version = '0.0.0';
  }
  if (process.env.VERSION) {
    version = process.env.VERSION;
  }

  // const logger: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];
  const logger = console;
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true, logger });

  app.useGlobalPipes(new ValidationPipe({ transform: true })); // , whitelist: true
  app.useWebSocketAdapter(new WsAdapterCatchAll(app));
  app.enableCors({});

  const globalPrefixOption: GlobalPrefixOptions = {
    exclude: [
      { path: 'health', method: RequestMethod.GET },
      { path: 'prefix', method: RequestMethod.GET },
    ],
  };

  // if (globalPrefix)

  app.setGlobalPrefix(globalPrefix, globalPrefixOption);
  // app.useGlobalFilters(new HttpErrorFilter(httpAdapter));
  // app.useGlobalFilters(new HttpErrorFilter(app));
  // app.useGlobalInterceptors(new ErrorInterceptor());
  const options = new DocumentBuilder()
    .setTitle('Remote-droid')
    .setVersion(version)
    .setDescription('Remote control your android devices, with simple REST call')
    .addCookieAuth()
    .addSecurity('JWTtoken', {
      scheme: 'bearer',
      bearerFormat: 'JWT',
      type: 'http',
      description: 'Provide a valid JWT acess token from /auth/signin',
      flows: {
        // password: { authorizationUrl: '/auth/login', scopes: {} },
        password: { scopes: {}, tokenUrl: '/auth/signin' }, // , refreshUrl: "/auth/refresh-token"
      },
    })
    .addSecurityRequirements('JWTtoken')
    // .addBearerAuth({ // do not works
    //   type: "http",
    //   description: "Token to acess your devices",
    //   name: "BearerToken",
    //   in: "header",
    //   scheme: "bearer",
    //   bearerFormat: "text",
    //   // flows: {},//OAuthFlowsObject;
    //   // openIdConnectUrl?: string;
    // })
    .addSecurity('BearerToken', {
      name: 'BearerToken',
      scheme: 'bearer',
      bearerFormat: 'token',
      type: 'http',
      description: 'Provide a valid devices token from /user/token',
      flows: {
        password: { scopes: {}, tokenUrl: '/user/token' },
      },
    })
    .addSecurityRequirements('BearerToken')
    .addTag('Authentification', 'Create / Login an account')
    .addTag('Users', 'Manage devices access, and generate devices token')
    .addTag('Devices', 'Control devices')
    .addTag('Info', 'Node informations')
    // .setBasePath(globalPrefix)
    .build();
  const document = SwaggerModule.createDocument(app, options);
  const swaggerUrl = '/' + [...globalPrefixs].join('/'); // , "api"
  console.log(`Config swagger on ${swaggerUrl}`);
  SwaggerModule.setup(swaggerUrl, app, document);
  await app.listen(SERVICE_PORT);
  const srv = app.getHttpServer();
  // log all Request + local port to debug cnx leak

  srv.timeout = 30000;
  const srv2 = srv as unknown as { _connections: number };
  const PADDING = 25;
  srv.on('request', (req) => {
    const src = `${req.socket.remoteAddress}:${req.socket.remotePort}`.padEnd(PADDING, ' ');
    const dst = `${req.socket.localAddress}:${req.socket.localPort}`.padEnd(PADDING, ' ');
    logAction('web', `REQ  ${dst} ${src} ${srv2._connections} url:${req.url}`);
  });
  srv.on('upgrade', (req) => {
    const src = `${req.socket.remoteAddress}:${req.socket.remotePort}`.padEnd(PADDING, ' ');
    const dst = `${req.socket.localAddress}:${req.socket.localPort}`.padEnd(PADDING, ' ');
    logAction('web', `WS   ${dst} ${src} ${srv2._connections} url:${req.url}`);
  });

  srv.on('connect', (req) => {
    const src = `${req.socket.remoteAddress}:${req.socket.remotePort}`.padEnd(PADDING, ' ');
    const dst = `${req.socket.localAddress}:${req.socket.localPort}`.padEnd(PADDING, ' ');
    logAction('web', `CNT  ${dst} ${src} ${srv2._connections} url:${req.url}`);
  });

  srv.on('connection', (socket) => {
    const src = `${socket.remoteAddress}:${socket.remotePort}`.padEnd(PADDING, ' ');
    const dst = `${socket.localAddress}:${socket.localPort}`.padEnd(PADDING, ' ');
    logAction('web', `CNX  ${dst} ${src} ${srv2._connections}`);
  });

  console.log(`Application is running on: ${await app.getUrl()}${globalPrefix}`);
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

void bootstrap();
