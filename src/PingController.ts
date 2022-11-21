import { Controller, Get, Injectable, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UnauthorizedError } from '@u4/adbkit';
import { GetUser } from './auth/decorator';
import { TokenGuard } from './auth/guard/token.guard';
import { DroidUserFull } from './db/user.entity';

@Injectable()
@ApiTags('Info')
@Controller('/')
export class PingController {
  @ApiOperation({
    summary: 'ping',
    description: 'ping entry point replay pong',
  })
  @Get('/ping')
  getPing(): string {
    return 'pong';
  }

  @ApiOperation({
    summary: 'Apoptosis, apoptose the POD',
    description: 'cause the server to shutdown',
  })
  @Get('/apoptose')
  @ApiBearerAuth('BearerToken')
  @UseGuards(TokenGuard)
  Apoptose(@GetUser() user: DroidUserFull): string {
    if (!user.allowDevice('*')) throw new UnauthorizedError();
    setTimeout(() => process.exit(0), 100);
    return 'will reboot in 100 ms';
  }

  @ApiOperation({
    summary: 'Apoptosis, apoptose the POD [deprecated]',
    description: 'cause the server to shutdown',
  })
  @Get('/ping/apoptose')
  @ApiBearerAuth('BearerToken')
  @UseGuards(TokenGuard)
  ApoptoseOld(@GetUser() user: DroidUserFull): string {
    if (!user.allowDevice('*')) throw new UnauthorizedError();
    setTimeout(() => process.exit(0), 100);
    return 'will reboot in 100 ms';
  }
}
