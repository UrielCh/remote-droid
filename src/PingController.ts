import { Controller, Get, Injectable, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UnauthorizedError } from '@u4/adbkit';
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
  Apoptose(@GetUser() user: DroidUserFull): string {
    console.log('Apoptose called');
    if (!user.allowDevice('*')) throw new UnauthorizedError();
    setTimeout(() => process.exit(0), 100);
    return 'will reboot in 100 ms';
  }
}
