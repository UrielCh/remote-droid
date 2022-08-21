import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { DbService } from "../../db/db.service";

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private dbService: DbService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // no user, no control activated
    if (!(await this.dbService.haveUser())) return true;
    const request = context.switchToHttp().getRequest<Request>();
    let auth = request.headers.authorization || "";
    if (!auth.startsWith("Bearer ")) return false;
    auth = auth.substring(7);
    const user = this.dbService.getDroidUserByToken(auth);
    if (!user) return false;
    request.user = user;
    return true;
  }
}
