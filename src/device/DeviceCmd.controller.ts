import { Body, Delete, Injectable, NotFoundException, Post, Req, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { DeviceService } from './device.service';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import DeviceDto from './dto/Device.dto';
import { QPSerialDto } from './dto/QPSerial.dto';
import { TokenGuard } from '../auth/guard/token.guard';
import { DroidUserFull } from '../db/user.entity';
import { GetUser } from '../auth/decorator';

function checkaccess(serial: string, user?: DroidUserFull): void {
  if (!user) return;
  if (!user.allowDevice(serial)) throw new NotFoundException(`no visible device ${serial}`);
}

@ApiTags('Devices')
@Controller('/device/:serial/cmd')
@ApiBearerAuth('BearerToken')
@UseGuards(TokenGuard)
@Injectable()
export class DeviceCmdController {
  constructor(private readonly phoneService: DeviceService) {
    // empty
  }

  @ApiOperation({
    summary: 'List all services',
    description: 'Use cmd command to list all services.',
  })
  @ApiOkResponse({
    isArray: true,
    type: String,
  })
  @Get('/')
  async getServices(@GetUser() user: DroidUserFull, @Param() params: QPSerialDto): Promise<string[]> {
    let devices: DeviceDto[] = await this.phoneService.getDevices();
    if (user) devices = devices.filter((d) => user.allowDevice(d.id));
    checkaccess(params.serial, user);
    const services = await this.phoneService.execOut(params.serial, 'cmd -l');
    return services.split(/[\s\r\n]+/g);
  }

  @Get('/package/list/packages')
  async listPackages(@GetUser() user: DroidUserFull, @Param() params: QPSerialDto): Promise<string[]> {
    let devices: DeviceDto[] = await this.phoneService.getDevices();
    if (user) devices = devices.filter((d) => user.allowDevice(d.id));
    checkaccess(params.serial, user);
    const services = await this.phoneService.execOut(params.serial, 'cmd package list packages');
    return services.split(/[\r\n]+/g).map((s) => s.replace(/^package:/, ''));
  }
}
