import { UserModule } from "./user/user.module";
import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { DroidModule } from "./droid/droid.module";
// import { PrismaModule } from "./prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { DBModule } from "./db/db.module";
import { InfoModule } from "./info/info.module";

@Module({
  imports: [AuthModule, ConfigModule.forRoot({ isGlobal: true }), DroidModule, DBModule, InfoModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
