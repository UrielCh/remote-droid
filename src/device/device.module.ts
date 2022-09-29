import { Module } from '@nestjs/common';
import { WsGateway } from './ws.gateway';
// import { PrismaModule } from "../prisma/prisma.module";
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { AdbClientService } from './adbClient.service';

@Module({
  imports: [
    /*PrismaModule*/
  ],
  controllers: [DeviceController],
  providers: [AdbClientService, DeviceService, WsGateway],
})
export class DeviceModule {
  // empty
}
