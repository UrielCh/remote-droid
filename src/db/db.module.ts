import { Global, Module } from "@nestjs/common";
import { dbProvider } from "./db.providers";

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [dbProvider],
  exports: [dbProvider],
})
export class DBModule {}
