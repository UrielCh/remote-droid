import { UserModule } from "./user/user.module";
import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { DroidModule } from "./droid/droid.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [AuthModule, ConfigModule.forRoot({ isGlobal: true }), DroidModule, PrismaModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
