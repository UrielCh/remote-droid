import { Controller, Get, UseGuards } from "@nestjs/common";
import { DroidUserFull, DroidUserModel } from "../db/user.entity";
import { GetUser } from "../auth/decorator";
import { JwtGuard } from "../auth/guard";

@Controller("users")
@UseGuards(JwtGuard)
export class UserController {
  @Get("me")
  geMe(@GetUser() user: DroidUserFull): DroidUserModel {
    const userfiltered = user.toJSON();
    delete userfiltered["hash"];
    return userfiltered as DroidUserModel;
  }
}
