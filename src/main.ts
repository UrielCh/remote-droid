import { LogLevel, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsAdapterCatchAll } from './WsAdapterCatchAll';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import process from 'process';
import { getEnv } from './env';
import { Server } from 'http';
import { logAction } from './common/Logger';

async function bootstrap() {
  const SERVICE_PORT = Number(process.env.SERVICE_PORT || '3009');
  const globalPrefixs = getEnv('GLOBAL_PREFIX', '/')
    .split('/')
    .filter((a) => a);

  const globalPrefix = '/' + [...globalPrefixs].join('/');
  let version = '0.0.0';
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));
    if (pkg.version) version = pkg.version;
  } catch (e) {
    version = '0.0.0';
  }
  // const logger: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];
  const logger = console;
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true, logger });
  app.useGlobalPipes(new ValidationPipe({ transform: true })); // , whitelist: true
  app.useWebSocketAdapter(new WsAdapterCatchAll(app));
  app.enableCors({});
  app.setGlobalPrefix(globalPrefix);
  // app.useGlobalFilters(new HttpErrorFilter(httpAdapter));
  // app.useGlobalFilters(new HttpErrorFilter(app));
  // app.useGlobalInterceptors(new ErrorInterceptor());
  const options = new DocumentBuilder()
    .setTitle('Remote-droid')
    .setVersion(version)
    .setDescription('Remote control your android devices, with simple REST call')
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
  const srv = app.getHttpServer() as Server;
  // log all Request + local port to debug cnx leak
  const PADDING = 25;
  srv.on('request', (req) => {
    const src = `${req.socket.remoteAddress}:${req.socket.remotePort}`.padEnd(PADDING, ' ');
    const dst = `${req.socket.localAddress}:${req.socket.localPort}`.padEnd(PADDING, ' ');
    logAction('web', `REQ  ${dst} ${src} url:${req.url}`);
  });
  srv.on('upgrade', (req) => {
    const src = `${req.socket.remoteAddress}:${req.socket.remotePort}`.padEnd(PADDING, ' ');
    const dst = `${req.socket.localAddress}:${req.socket.localPort}`.padEnd(PADDING, ' ');
    logAction('web', `WS   ${dst} ${src} url:${req.url}`);
  });

  srv.on('connect', (req) => {
    const src = `${req.socket.remoteAddress}:${req.socket.remotePort}`.padEnd(PADDING, ' ');
    const dst = `${req.socket.localAddress}:${req.socket.localPort}`.padEnd(PADDING, ' ');
    logAction('web', `CNT  ${dst} ${src}  url:${req.url}`);
  });

  srv.on('connection', (socket) => {
    const src = `${socket.remoteAddress}:${socket.remotePort}`.padEnd(PADDING, ' ');
    const dst = `${socket.localAddress}:${socket.localPort}`.padEnd(PADDING, ' ');
    logAction('web', `CNX  ${dst} ${src}`);
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
