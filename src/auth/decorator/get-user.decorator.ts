import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const GetUser = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request.user;
});
