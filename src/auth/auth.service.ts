import { ForbiddenException, Injectable } from '@nestjs/common';
// import { PrismaService } from "../prisma/prisma.service";
import { AccessTokenDto, AuthDto } from './dto/index.js';
import * as argon from 'argon2';
// import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DbService } from '../db/db.service.js';
import { type DroidUserFull } from '../db/user.entity.js';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    // @Inject("DB_SERVICE")
    private dbService: DbService,
    private jwt: JwtService,
  ) { }

  async signup(dto: AuthDto): Promise<DroidUserFull> {
    const hash = await argon.hash(dto.password);
    const email = dto.email;
    const user: DroidUserFull = await this.dbService.addDroidUser({
      email,
      createdAt: Date.now(),
      devices: [],
      hash,
      name: '',
      role: '',
      tokens: [],
      updatedAt: Date.now(),
    });
    //try {
    //  await this.prisma.user.create({
    //    data: { email, hash },
    //    select: { id: true,},
    //  });
    //  return { msg: "ok" };
    //} catch (error) {
    //  if (error instanceof PrismaClientKnownRequestError) {
    //    if (error.code === "P2002") {
    //      throw new ForbiddenException("Account Exists");
    //    }
    //  }
    //  throw error;
    //}
    return user;
  }

  async signin(dto: AuthDto): Promise<AccessTokenDto> {
    const { email } = dto;
    const user = await this.dbService.getDroidUserByEmail(email);
    // const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new ForbiddenException('invalid');
    const match = await argon.verify(user.hash, dto.password);
    if (!match) throw new ForbiddenException('invalid');
    const access_token = await this.signToken(user.entityId, user.email);
    return { access_token };
    // return { access_token: "" };
  }

  signToken(userId: string | number, email: string): Promise<string> {
    return this.jwt.signAsync({ sub: userId, email }, { expiresIn: '1h', secret: this.config.get('JWT_SECRET') });
  }
}
