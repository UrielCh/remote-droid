import { UserController } from "./user.controller";
import { Module } from "@nestjs/common";
// import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [
    /*PrismaModule*/
  ],
  controllers: [UserController],
  providers: [],
})
export class UserModule {}
