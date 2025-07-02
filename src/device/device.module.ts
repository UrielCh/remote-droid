import { Module } from '@nestjs/common';
import { WsGateway } from './ws.gateway.js';
// import { PrismaModule } from "../prisma/prisma.module";
import { DeviceController } from './device.controller.js';
import { DeviceService } from './device.service.js';
import { AdbClientService } from './adbClient.service.js';
import { DeviceCmdController } from './DeviceCmd.controller.js';
import { DeviceSysdumpController } from './DeviceSysdump.controller.js';

@Module({
  imports: [
    /*PrismaModule*/
  ],
  controllers: [DeviceController, DeviceCmdController, DeviceSysdumpController],
  providers: [AdbClientService, DeviceService, WsGateway],
})
export class DeviceModule {
  // empty
}
