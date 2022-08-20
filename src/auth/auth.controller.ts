import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { DroidUser } from "src/db/user.entity";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  async signup(@Body() dto: AuthDto): Promise<DroidUser> {
    try {
      const user = await this.authService.signup(dto);
      return user;
    } catch (e) {
      console.log(e);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post("signin")
  signin(@Body() dto: AuthDto): Promise<{ access_token: string }> {
    return this.authService.signin(dto);
  }
}
