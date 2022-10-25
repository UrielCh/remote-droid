import { UserModule } from './user/user.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DeviceModule } from './device/device.module';
import { ConfigModule } from '@nestjs/config';
import { DBModule } from './db/db.module';
import { InfoModule } from './info/info.module';
import { PingController } from './PingController';
// import { AppLoggerMiddleware } from './AppLoggerMiddleware ';

@Module({
  imports: [AuthModule, ConfigModule.forRoot({ isGlobal: true }), DeviceModule, DBModule, InfoModule, UserModule],
  controllers: [PingController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    // logger
    // consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
