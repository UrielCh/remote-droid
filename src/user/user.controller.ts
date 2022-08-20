import { Controller, Get, Post, Put, UseGuards } from "@nestjs/common";
import { DroidUserFull, DroidUserModel } from "../db/user.entity";
import { GetUser } from "../auth/decorator";
import { JwtGuard } from "../auth/guard";
import { DbService } from "../db/db.service";

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
}
