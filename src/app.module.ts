import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module.js';
import { AuthModule } from './auth/auth.module.js';
import { DeviceModule } from './device/device.module.js';
import { DBModule } from './db/db.module.js';
import { InfoModule } from './info/info.module.js';
import { PingController } from './PingController.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [AuthModule, ConfigModule.forRoot({ isGlobal: true }), DeviceModule, DBModule, InfoModule, UserModule, HealthModule],
  controllers: [PingController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    // logger
    // consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
