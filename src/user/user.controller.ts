import { Body, Controller, Get, Post, Put, UnauthorizedException, UseGuards } from "@nestjs/common";
import { DroidUserFull, DroidUserModel } from "../db/user.entity";
import { GetUser } from "../auth/decorator";
import { JwtGuard } from "../auth/guard";
import { DbService } from "../db/db.service";
import { AllowParamsDto } from "./dto/allowParams.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Users")
@Controller("user")
@UseGuards(JwtGuard)
export class UserController {
  constructor(private dbSerice: DbService) {}
  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get your account data.",
    description: "Your account contains a devices list you can access and your tokens.",
  })
  geMe(@GetUser() user: DroidUserFull): DroidUserModel {
    const userfiltered = user.toJSON();
    delete userfiltered["hash"];
    return userfiltered as DroidUserModel;
  }

  @Put("token")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Issue a token to control your devices.",
    description: "Device control uses a token base authentication to be easy to integrate. An account can get up to 3 tokens",
  })
  async newToken(@GetUser() user: DroidUserFull): Promise<{ token: string }> {
    const token = await this.dbSerice.addToken(user);
    return { token };
  }

  @Post("allow")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Give access to a device to a user.",
    description: "Only the admin account can access a new device. Give access to a device using this call.",
  })
  async allowDevice(@GetUser() user: DroidUserFull, @Body() params: AllowParamsDto): Promise<string[]> {
    if (user.role !== "admin") throw new UnauthorizedException("your are not allow to share devices access");
    const devices = await this.dbSerice.allowAccess(params);
    return devices;
  }
}
