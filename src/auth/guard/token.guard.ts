import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { DbService } from '../../db/db.service.js';

function getBearerToken(context: ExecutionContext): string {
  const request = context.switchToHttp().getRequest<Request>();
  const auth = request.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return '';
  return auth.substring(7);
}

const fakeAdmin = {
  email: 'root@local',
  name: 'root',
  role: 'admin',
  devices: [],
  tokens: [],
  allowDevice: () => true,
};

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private dbService: DbService) {
    // empty
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let defaultAuth = true;
    const request = context.switchToHttp().getRequest<Request>();

    // no user, no control activated
    const adminToken = this.dbService.adminToken;
    if (adminToken) {
      defaultAuth = false;
      const auth = getBearerToken(context);
      if (auth === adminToken) {
        request.user = fakeAdmin;
        return true;
      }
    }
    if (!(await this.dbService.haveUser())) {
      request.user = fakeAdmin;
      return defaultAuth;
    }
    const auth = getBearerToken(context);
    const user = this.dbService.getDroidUserByToken(auth);
    if (!user) return false;
    request.user = user;
    return true;
  }
}
