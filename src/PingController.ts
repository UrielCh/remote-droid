import { Controller, Get, Injectable } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Injectable()
@ApiTags('Info')
@Controller('/ping')
export class PingController {
  @ApiOperation({
    summary: 'ping',
    description: 'ping entry point replay pong',
  })
  @Get('/')
  getPing(): string {
    return 'pong';
  }
}
