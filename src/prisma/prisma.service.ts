import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    const provider = config.get("DATABASE_PROVIDER");
    let datasources: any;
    if (provider === "sqlite") {
      datasources = {
        dbSqlite: {
          url: config.get("DATABASE_SQLITE_URL"),
        },
      };
    } else if (provider === "postgresql") {
      datasources = {
        db: {
          url: config.get("DATABASE_POSTGRESQL_URL"),
        },
      };
    } else {
      throw Error(`FATAL Configuration Error unsupported "DATABASE_PROVIDER"=${provider}`);
    }
    super({
      datasources,
    });
  }

  cleanDb(): Promise<any> {
    return this.$transaction([this.device.deleteMany(), this.user.deleteMany()]);
  }
}
