import { Controller, Get, UseGuards } from "@nestjs/common";
import { GetUser } from "../auth/decorator";
import { JwtGuard } from "../auth/guard";

@Controller("users")
@UseGuards(JwtGuard)
export class UserController {
  @Get("me")
  geMe(@GetUser() user: any): { email: string; exp: number; iat: number; sub: string } {
    return user;
  }
}
