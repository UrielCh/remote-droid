import { Body, Controller, Get, Post, Put, UnauthorizedException, UseGuards } from "@nestjs/common";
import { DroidUserFull, DroidUserModel } from "../db/user.entity";
import { GetUser } from "../auth/decorator";
import { JwtGuard } from "../auth/guard";
import { DbService } from "../db/db.service";
import { AllowParamsDto } from "./dto/allowParams.dto";

@Controller("users")
@UseGuards(JwtGuard)
export class UserController {
  constructor(private dbSerice: DbService) {}
  @Get("me")
  geMe(@GetUser() user: DroidUserFull): DroidUserModel {
    const userfiltered = user.toJSON();
    delete userfiltered["hash"];
    return userfiltered as DroidUserModel;
  }

  @Put("token")
  async newToken(@GetUser() user: DroidUserFull): Promise<{ token: string }> {
    const token = await this.dbSerice.addToken(user);
    return { token };
  }

  @Post("allow")
  async allowDevice(@GetUser() user: DroidUserFull, @Body() params: AllowParamsDto): Promise<string[]> {
    if (user.role !== "admin") throw new UnauthorizedException("your are not allow to share devices access");
    const devices = await this.dbSerice.allowAccess(params);
    return devices;
  }
}
