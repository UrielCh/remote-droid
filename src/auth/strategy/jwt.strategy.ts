import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { DbService } from "../../db/db.service";
import { DroidUserFull } from "../../db/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(config: ConfigService, private dbService: DbService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get("JWT_SECRET"),
    });
  }

  async validate(payload: { sub: string; email: string; iat: number; exp: number }): Promise<DroidUserFull> {
    const user: DroidUserFull = await this.dbService.getDroidUser(payload.sub);
    return user;
  }
}
