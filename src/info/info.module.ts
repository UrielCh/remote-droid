import { Module } from '@nestjs/common';
import { InfoController } from './info.controller.js';

@Module({
  imports: [],
  controllers: [InfoController],
  providers: [],
})
export class InfoModule {
  // empty
}
