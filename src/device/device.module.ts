import { Module } from '@nestjs/common';
import { WsGateway } from './ws.gateway';
// import { PrismaModule } from "../prisma/prisma.module";
import { PhoneController } from './phone.controller';
import { PhoneService } from './phone.service';
import { AdbClientService } from './adbClient.service';

@Module({
  imports: [
    /*PrismaModule*/
  ],
  controllers: [PhoneController],
  providers: [AdbClientService, PhoneService, WsGateway],
})
export class DeviceModule {
  // empty
}
