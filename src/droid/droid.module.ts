import { Module } from "@nestjs/common";
import { WsGateway } from "./ws.gateway";
import { PrismaModule } from "../prisma/prisma.module";
import { PhoneController } from "./phone.controller";
import { PhoneService } from "./phone.service";

@Module({
  imports: [PrismaModule],
  controllers: [PhoneController],
  providers: [PhoneService, WsGateway],
})
export class DroidModule {}
