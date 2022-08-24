import { Controller, Get } from "@nestjs/common";
import * as os from "os";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Info")
@Controller("info")
export class InfoController {
  constructor() {}
  @ApiOperation({
    summary: "Get the node name.",
    description: "Get the node name or the hostname.",
  })
  @Get("nodename")
  getNodename(): {nodename: string} {
    return { nodename: os.hostname() };
  }
}
