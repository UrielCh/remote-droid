import { Body, Controller, Get, Post, Put, UnauthorizedException, UseGuards } from "@nestjs/common";
import { DroidUserFull, DroidUserModel } from "../db/user.entity";
import { GetUser } from "../auth/decorator";
import { JwtGuard } from "../auth/guard";
import { DbService } from "../db/db.service";
import { AllowParamsDto } from "./dto/allowParams.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiTags("Users")
@Controller("user")
@UseGuards(JwtGuard)
export class UserController {
  constructor(private dbSerice: DbService) {}
  @Get("me")
  @ApiBearerAuth()
  geMe(@GetUser() user: DroidUserFull): DroidUserModel {
    const userfiltered = user.toJSON();
    delete userfiltered["hash"];
    return userfiltered as DroidUserModel;
  }

  @Put("token")
  @ApiBearerAuth()
  async newToken(@GetUser() user: DroidUserFull): Promise<{ token: string }> {
    const token = await this.dbSerice.addToken(user);
    return { token };
  }

  @Post("allow")
  @ApiBearerAuth()
  async allowDevice(@GetUser() user: DroidUserFull, @Body() params: AllowParamsDto): Promise<string[]> {
    if (user.role !== "admin") throw new UnauthorizedException("your are not allow to share devices access");
    const devices = await this.dbSerice.allowAccess(params);
    return devices;
  }
}
