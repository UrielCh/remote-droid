import { Controller, Get, Injectable, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UnauthorizedError } from '@u4/adbkit';
import { ok } from 'assert';
import { GetUser } from './auth/decorator';
import { TokenGuard } from './auth/guard/token.guard';
import { DroidUserFull } from './db/user.entity';

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

  @ApiOperation({
    summary: 'apoptose the POD',
    description: 'cause the server to shutdown',
  })
  @Get('/apoptose')
  @ApiBearerAuth('BearerToken')
  @UseGuards(TokenGuard)
  Apoptose(@GetUser() user: DroidUserFull): void {
    if (user.allowDevice('*')) throw new UnauthorizedError();
    process.exit(0);
  }
}
