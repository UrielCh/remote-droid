import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const start = Date.now();
    const { method, path: url } = request;
    let { ip } = request;
    ip = ip.replace('::ffff:', '');

    let timer: NodeJS.Timeout | null = setTimeout(() => {
      this.logger.log(`${method} ${url} from ip ${ip} timeout`);
      timer = null;
    }, 5000);

    response.on('close', () => {
      const dur = Date.now() - start;
      const { statusCode } = response;
      // const contentLength = response.get('content-length');
      if (timer) {
        this.logger.log(`${method} ${url} Ret:${statusCode} - ${ip} in ${dur}ms`);
        clearTimeout(timer);
        timer = null;
      } else {
        this.logger.log(`${method} ${url} Ret:${statusCode} - ${ip} in ${dur}ms After timeout`);
      }
    });

    next();
  }
}
