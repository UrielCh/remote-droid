import { Module } from '@nestjs/common';
import { InfoController } from './info.controller.js';
// import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [],
  controllers: [InfoController],
  providers: [],
})
export class InfoModule {
  // empty
}
