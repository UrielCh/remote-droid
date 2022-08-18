import { ForbiddenException, Injectable } from "@nestjs/common";
// import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2";
// import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(private config: ConfigService, /*private prisma: PrismaService, */ private jwt: JwtService) {}

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);
    try {
      await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
        select: {
          id: true,
        },
      });
      return { msg: "ok" };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ForbiddenException("Account Exists");
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto): Promise<{ access_token: string }> {
    const { email } = dto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new ForbiddenException("invalid");
    const match = await argon.verify(user.hash, dto.password);
    if (!match) throw new ForbiddenException("invalid");
    const access_token = await this.signToken(user.id, user.email);
    return { access_token };
  }

  signToken(userId: number, email: string): Promise<string> {
    return this.jwt.signAsync({ sub: userId, email }, { expiresIn: "1h", secret: this.config.get("JWT_SECRET") });
  }
}
