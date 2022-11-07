import { Module } from '@nestjs/common';
import { WsGateway } from './ws.gateway';
// import { PrismaModule } from "../prisma/prisma.module";
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { AdbClientService } from './adbClient.service';
import { DeviceCmdController } from './DeviceCmd.controller';
import { DeviceSysdumpController } from './DeviceSysdump.controller';

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
