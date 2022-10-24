import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  nbOpen = 0;
  nbClose = 0;
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    this.nbOpen++;
    const start = Date.now();
    const { method, originalUrl: url } = request;
    let { ip } = request;
    ip = ip.replace('::ffff:', '');

    let timer: NodeJS.Timeout | null = setTimeout(() => {
      const live = this.nbOpen - this.nbClose;
      this.logger.log(`${ip.padEnd(11)} ${method} ${url} - TIMEOUT live:${live} from port:${request.socket.remotePort}`);
      timer = null;
    }, 10000);

    response.on('close', () => {
      this.nbClose++;
      const { statusCode } = response;
      // const contentLength = response.get('content-length');
      if (timer) {
        // if (dur > 100)
        this.logger.log(`${method} ${url} Ret:${statusCode} - ${ip} from port:${request.socket.remotePort}`);
        clearTimeout(timer);
        timer = null;
      } else {
        const dur = Date.now() - start;
        const live = this.nbOpen - this.nbClose;
        this.logger.log(`${ip.padEnd(11)} ${method} ${url} - ${statusCode} -${dur}ms After timeout live:${live} from port:${request.socket.remotePort}`);
      }
    });
    next();
  }
}
