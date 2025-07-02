import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs';
import { DynamicModule, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module.js';
import { AuthModule } from './auth/auth.module.js';
import { DeviceModule } from './device/device.module.js';
import { DBModule } from './db/db.module.js';
import { InfoModule } from './info/info.module.js';
import { PingController } from './PingController.js';
import { HealthModule } from './health/health.module.js';
import { ServeStaticModule } from '@nestjs/serve-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);  

function getStaticModule(): DynamicModule {
  let rootPath: string = "";

  rootPath = join(__dirname, '..', '..', '..','public');
  if (!fs.existsSync(rootPath)) {
    rootPath = join(__dirname, '..', '..', 'public');
  }
  if (!fs.existsSync(rootPath)) {
    rootPath = join(__dirname, '..', 'public');
  }
  console.log({rootPath});
  return ServeStaticModule.forRoot({ rootPath }); // , serveRoot: '/' 
  // serveRoot: '/frontend', // Uncomment this if you want to serve the frontend from a specific sub-path, e.g., http://localhost:3000/frontend
}


@Module({
  imports: [
    AuthModule, 
    ConfigModule.forRoot({ isGlobal: true }), 
    DeviceModule, 
    DBModule, 
    InfoModule, 
    UserModule, 
    HealthModule,
    // getStaticModule(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // This tells NestJS where to find your frontend files
      // serveRoot: '/frontend', // Uncomment this if you want to serve the frontend from a specific sub-path, e.g., http://localhost:3000/frontend
    }),
  ],
  controllers: [PingController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    // logger
    // consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
