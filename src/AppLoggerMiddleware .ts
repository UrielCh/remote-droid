import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const start = Date.now();
    const { method, originalUrl: url } = request;
    let { ip } = request;
    ip = ip.replace('::ffff:', '');

    let timer: NodeJS.Timeout | null = setTimeout(() => {
      this.logger.log(`${ip.padEnd(11)} ${method} ${url} - TIMEOUT`);
      timer = null;
    }, 10000);

    response.on('close', () => {
      const dur = Date.now() - start;
      const { statusCode } = response;
      // const contentLength = response.get('content-length');
      if (timer) {
        // if (dur > 100) this.logger.log(`${method} ${url} Ret:${statusCode} - ${ip} in ${dur}ms`);
        clearTimeout(timer);
        timer = null;
      } else {
        this.logger.log(`${ip.padEnd(11)} ${method} ${url} - ${statusCode} -${dur}ms After timeout`);
      }
    });

    next();
  }
}
