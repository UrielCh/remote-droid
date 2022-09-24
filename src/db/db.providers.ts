import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DbService } from './db.service';

export const dbProvider: FactoryProvider<DbService> = {
  provide: DbService,
  useFactory: (config: ConfigService): Promise<DbService> => {
    return new DbService(config).init();
  },
  inject: [ConfigService],
};
