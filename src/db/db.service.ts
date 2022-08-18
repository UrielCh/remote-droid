import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
// import { PrismaClient } from "@prisma/client";
//
@Injectable()
export class DbService {
  redis: Redis;
  constructor(config: ConfigService) {
    const provider = config.get("DATABASE_PROVIDER");
    if (provider === "redis") {
      const redisUrlTxt = config.get("DATABASE_REDIS_URL") as string;
      const redisUrl = new URL(redisUrlTxt);
      this.redis = new Redis({ host: redisUrl.host, port: Number(redisUrl.port) });
    }

    //     let datasources: any;
    //     if (provider === "sqlite") {
    //       datasources = {
    //         dbSqlite: {
    //           url: config.get("DATABASE_SQLITE_URL"),
    //         },
    //       };
    //     } else if (provider === "postgresql") {
    //       datasources = {
    //         db: {
    //           url: config.get("DATABASE_POSTGRESQL_URL"),
    //         },
    //       };
    //     } else {
    //       throw Error(`FATAL Configuration Error unsupported "DATABASE_PROVIDER"=${provider}`);
    //     }
    //     super({
    //       datasources,
    //     });
  }
  //
  //   cleanDb(): Promise<any> {
  //     return this.$transaction([this.device.deleteMany(), this.user.deleteMany()]);
  //   }
}
