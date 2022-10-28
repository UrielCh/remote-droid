import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheckService, HealthCheck, DiskHealthIndicator, MemoryHealthIndicator, HealthIndicatorFunction } from '@nestjs/terminus';

// const isWin = process.platform === 'win32';

@ApiTags('Info')
@Controller('health')
export class HealthController {
  // private http: HttpHealthIndicator
  constructor(private health: HealthCheckService, private readonly disk: DiskHealthIndicator, private memory: MemoryHealthIndicator) {
    // empty
  }

  @ApiOperation({
    summary: 'health check.',
    description: 'health check.',
  })
  @Get()
  @HealthCheck()
  check() {
    const checks: HealthIndicatorFunction[] = [];
    // checks.push(() => this.memory.checkRSS('memory_rss', 50 * 1024 * 1024));
    // checks.push(() => this.memory.checkHeap('memory_heap', 50 * 1024 * 1024)];
    // if (!isWin) checks.push(() => this.disk.checkStorage('storage', { path: '/', threshold: 50 * 1024 * 1024 * 1024 }));
    // () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com')
    return this.health.check(checks);
  }
}
