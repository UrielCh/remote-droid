import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DbService } from '../../db/db.service';
import { DroidUserFull } from '../../db/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private dbService: DbService) {
    const secretOrKey = config.get('JWT_SECRET');
    if (!secretOrKey) {
      throw Error('Service need a JWT secret in to be stored in "JWT_SECRET" environement var');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  async validate(payload: { sub: string; email: string; iat: number; exp: number }): Promise<DroidUserFull | null> {
    const user = await this.dbService.getDroidUser(payload.sub);
    return user;
  }
}
