import { UserModule } from './user/user.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DeviceModule } from './device/device.module';
// import { PrismaModule } from "./prisma/prisma.module";
import { ConfigModule } from '@nestjs/config';
import { DBModule } from './db/db.module';
import { InfoModule } from './info/info.module';
import { AppLoggerMiddleware } from './AppLoggerMiddleware ';

@Module({
  imports: [AuthModule, ConfigModule.forRoot({ isGlobal: true }), DeviceModule, DBModule, InfoModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
