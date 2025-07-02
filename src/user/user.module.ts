import { Module } from '@nestjs/common';
import { UserController } from './user.controller.js';
// import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [
    /*PrismaModule*/
  ],
  controllers: [UserController],
  providers: [],
})
export class UserModule {
  //empty
}
