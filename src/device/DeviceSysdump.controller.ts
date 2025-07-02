import { Header, Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { DeviceService } from './device.service.js';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import DeviceDto from './dto/Device.dto.js';
import { QPSerialDto } from './dto/QPSerial.dto.js';
import { TokenGuard } from '../auth/guard/token.guard.js';
import { type DroidUserFull } from '../db/user.entity.js';
import { GetUser } from '../auth/decorator/index.js';
import { LRUCache } from 'lru-cache';
import { QPDumpsysTypeDto } from './dto/QPDumpsysType.dto.js';
import { QPDumpsysTypeExtraDto } from './dto/QPDumpsysTypeExtra.dto.js';
import { QSGrepDto } from './dto/QSGrep.dto.js';

type PromiseSized = { v: Promise<string>; size: number };

const sysdumpCache = new LRUCache<string, PromiseSized>({
  max: 100,
  maxSize: 500_000,
  ttl: 120_000,
  sizeCalculation: (value, key) => {
    return value.size;
  },
});

function checkaccess(serial: string, user?: DroidUserFull): void {
  if (!user) return;
  if (!user.allowDevice(serial)) throw new NotFoundException(`no visible device ${serial}`);
}

@ApiTags('Devices')
@Controller('/device/:serial/dumpsys')
@ApiBearerAuth('BearerToken')
@UseGuards(TokenGuard)
@Injectable()
export class DeviceSysdumpController {
  constructor(private readonly phoneService: DeviceService) {
    // empty
  }

  @ApiOperation({
    summary: 'List dumpsys section',
    description: 'List dumpsys section',
  })
  @ApiOkResponse({
    isArray: true,
    type: String,
  })
  @Get('/')
  async getSysdumpsType(@GetUser() user: DroidUserFull, @Param() params: QPSerialDto): Promise<string[]> {
    let devices: DeviceDto[] = await this.phoneService.getDevices();
    if (user) devices = devices.filter((d) => user.allowDevice(d.id));
    checkaccess(params.serial, user);
    const services = await this.phoneService.execOut(params.serial, 'dumpsys -l');
    return services
      .split(/[\r\n]+/g)
      .map((s) => s.trim())
      .filter((s) => s && !s.includes(' '));
  }

  @Get('/:type')
  @Header('Content-Type', 'text/plain')
  async dumpsys(@GetUser() user: DroidUserFull, @Param() params: QPDumpsysTypeDto): Promise<string> {
    let devices: DeviceDto[] = await this.phoneService.getDevices();
    if (user) devices = devices.filter((d) => user.allowDevice(d.id));
    checkaccess(params.serial, user);
    const { type } = params;
    const cacheKey = `${params.serial}-${type}`;
    const old = sysdumpCache.get(cacheKey);
    if (old) return old.v;
    const dump = this.phoneService.execOut(params.serial, `dumpsys ${type}`);
    const cached: PromiseSized = { v: dump, size: 1000 };
    void dump.then((txt) => {
      cached.size = txt.length;
    });
    sysdumpCache.set(cacheKey, cached);
    return dump;
  }

  // gep chrome verison
  // http://127.0.0.1:3009/remote/local/device/SN/dumpsys/package/com.android.chrome?grep=versionName
  @ApiOperation({
    summary: 'dumpsy with extra params',
  })
  @Get('/:type/:extra')
  @Header('Content-Type', 'text/plain')
  async dumpsysExtra(@GetUser() user: DroidUserFull, @Param() params: QPDumpsysTypeExtraDto, @Query() query: QSGrepDto): Promise<string> {
    let devices: DeviceDto[] = await this.phoneService.getDevices();
    if (user) devices = devices.filter((d) => user.allowDevice(d.id));
    checkaccess(params.serial, user);
    const { type, extra } = params;
    const cacheKey = `${params.serial}-${type}-${extra}`;
    let cached = sysdumpCache.get(cacheKey);
    if (!cached) {
      const dump = this.phoneService.execOut(params.serial, `dumpsys ${type} ${extra}`);
      cached = { v: dump, size: 1000 };
      void dump.then((txt) => {
        (cached as PromiseSized).size = txt.length;
      });
      sysdumpCache.set(cacheKey, cached);
    }
    let text = await cached.v;
    if (query.grep) {
      const r = new RegExp(query.grep);
      const filtered = text.split(/\n/g).filter((l) => l.match(r));
      text = filtered.join('\n');
    }

    return text;
  }
}
