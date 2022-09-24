import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { DbService } from '../../db/db.service';

function getBearerToken(context: ExecutionContext): string {
  const request = context.switchToHttp().getRequest<Request>();
  const auth = request.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return '';
  return auth.substring(7);
}

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private dbService: DbService) {
    // empty
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let defaultAuth = true;
    // no user, no control activated
    const adminToken = this.dbService.adminToken;
    if (adminToken) {
      defaultAuth = false;
      const auth = getBearerToken(context);
      if (auth === adminToken) {
        const request = context.switchToHttp().getRequest<Request>();
        request.user = {
          email: 'root@local',
          name: 'root',
          role: 'admin',
          devices: [],
          tokens: [],
          allowDevice: () => true,
        };
        return true;
      }
    }
    if (!(await this.dbService.haveUser())) return defaultAuth;
    const auth = getBearerToken(context);
    const user = this.dbService.getDroidUserByToken(auth);
    if (!user) return false;
    const request = context.switchToHttp().getRequest<Request>();
    request.user = user;
    return true;
  }
}
