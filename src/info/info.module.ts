import { InfoController } from "./info.controller";
import { Module } from "@nestjs/common";
// import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [],
  controllers: [InfoController],
  providers: [],
})
export class InfoModule {}
