import { Global, Module } from '@nestjs/common';
import { dbProvider } from './db.providers.js';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [dbProvider],
  exports: [dbProvider],
})
export class DBModule {
  // empty
}
