import { Body, Delete, Post, Req, ServiceUnavailableException } from "@nestjs/common";
import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { PhoneService } from "./phone.service";
import { Request, Response } from "express";
import { TabCoordDto } from "./dto/TapCoord.dto";
import { SwipeCoordDto } from "./dto/SwipeCoord.dto";
import { WriteTextDto } from "./dto/writeText.dto";
import { ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiProduces, ApiResponse, ApiTags } from "@nestjs/swagger";
import DeviceDto from "./dto/Device.dto";
import { QPSerialDto } from "./dto/QPSerial.dto";
import { QPSerialPhonesubinfoDto } from "./dto/QPSerialPhonesubinfo.dto";
import { ImgQueryPngDto } from "./dto/ImgQueryPng.dto";
import { QPSerialKeyDto } from "./dto/QPSerialKey.dto";
import { ImgQueryJpegDto } from "./dto/ImgQueryJpeg.dto";
import { execOutDto } from "./dto/execOut.dto";
import { startActivityDto } from "./dto/startActivity.dto";
import { QPSerialClearDto } from "./dto/QPSerialClear.dto";
import { OnOffDto } from "./dto/onOff.dto";
import { PsEntry } from "@u4/adbkit";
import { QPSerialForwardDto } from "./dto/QPSerialForward.dto";
import { fetch } from "undici";
import { QSSmsOptionDto } from "./dto/QSSmsOption.dto";
import { SMSDto } from "./dto/sms.dto";
import { QPSerialIdDto } from "./dto/QPSerialId.dto";
import { rebootDto } from "./dto/reboot.dto";

@ApiTags("main")
@Controller("/phone")
export class PhoneController {
  constructor(private readonly phoneService: PhoneService) {}
  /**
   * list devices
   */
  @ApiOperation({
    summary: "List connected phone / track device connection",
    description: "Get all visible phone serial numbers, If connected as websocket, get offline / online notification from adb service.",
  })
  @ApiOkResponse({
    isArray: true,
    type: DeviceDto,
    // links: {
    //   reboot_phone: {
    //     operationId: "PhoneController_reboot_Post",
    //     description: "the device identifyed by serial number",
    //     parameters: { serial: "$response.body#/0/id" },
    //   },
    //   reboot_phone_alt: {
    //     operationId: "PhoneController_reboot_Get",
    //     description: "the device identifyed by serial number",
    //     parameters: { serial: "$response.body#/0/id" },
    //   },
    //   write_text: {
    //     operationId: "PhoneController_write_Post",
    //     description: "the device identifyed by serial number",
    //     parameters: { serial: "$response.body#/0/id" },
    //   },
    // },
  })
  @Get("/")
  async getDevices(): Promise<DeviceDto[]> {
    const devices: DeviceDto[] = await this.phoneService.getDevices();
    return devices;
  }

  /**
   * /phone/device/:serial/reboot
   */
  @Post("/:serial/reboot")
  @ApiOperation({
    description: "reboot the device",
    summary: "reboot the device to system, of to any availible mode using the type body option",
    // operationId: "PhoneController_reboot_Post",
  })
  async reboot_Post(@Param() params: QPSerialDto, @Body() body: rebootDto): Promise<void> {
    await this.phoneService.reboot(params.serial, body.type);
  }
  /**
   * /phone/:serial/reboot
   */
  // @Get("/:serial/reboot")
  // @ApiOperation({
  //   description: "reboot the devices GET flavor",
  //   summary: "reboot the devices",
  //   // operationId: "PhoneController_reboot_Post",
  // })
  // async reboot_Get(@Param() params: QueryParamSerialDto): Promise<void> {
  //   await this.phoneService.reboot(params.serial);
  // }
  @ApiOperation({
    summary: "write text",
    description: "write a text in the device",
  })
  @Post("/:serial/text")
  async write_Post(@Param() params: QPSerialDto, @Body() data: WriteTextDto): Promise<boolean> {
    await this.phoneService.write(params.serial, data.text, data.delay);
    return true;
  }

  @ApiOperation({
    summary: "get screen size",
    description: "get device screen size",
  })
  @Get("/:serial/screen-size")
  async screenSize_Get(@Param() params: QPSerialDto): Promise<{ width: number; height: number }> {
    return this.phoneService.getSize(params.serial);
  }

  /**
   * Presskey
   * /phone/:serial/press/:keyApiConsumes,
   */
  @ApiOperation({
    summary: "press a special key in the device",
    description: `Press a special key in the device using android KeyCodes ex: 
- HOME = 3
- BACK = 4
- ENTER = 66

for [full list see here](https://android.googlesource.com/platform/frameworks/native/+/master/include/android/keycodes.h)`,
  })
  @Post("/:serial/press/:key")
  async press_Post(@Param() params: QPSerialKeyDto): Promise<void> {
    await this.phoneService.press(params.serial, params.key);
  }
  // /**
  //  * Presskey
  //  * /phone/:serial/press/:key
  //  */
  // @Get("/:serial/press/:key")
  // async press_Get(@Param() params: QueryParamSerialKeyDto): Promise<void> {
  //   await this.phoneService.press(params.serial, params.key);
  // }

  /**
   * get device info
   * /phone/:serial/info
   */
  @ApiOperation({
    summary: "emit a touch screen event",
    description: `Touch the screen in a specific position; all coordinates are provided in percent, so you do not need to care about the screen size.
    
The android device will receive a position as an integer; two-digit precision is enough to reach every pixel on the screen; for example, use 33,33 for a 1/3 of the screen.`,
  })
  @Post("/:serial/tap")
  async tap(@Param() params: QPSerialDto, @Body() coord: TabCoordDto): Promise<void> {
    await this.phoneService.tap(params.serial, coord);
  }

  /**
   * get device info
   * /phone/:serial/info
   */
  @ApiOperation({
    summary: "Swipe a finger in a straight line.",
    description: `Swipe a finger in a straight line; if you want complete control of the swipe, use the WebSocket interface to stream your movement.`,
  })
  @Post("/:serial/swipe")
  async swipe(@Param() params: QPSerialDto, @Body() coord: SwipeCoordDto): Promise<void> {
    await this.phoneService.swipe(params.serial, coord);
  }

  @ApiOperation({
    summary: "Execute a shell command.",
    description: `Execute a shell command and retrieve the standard output response.`,
  })
  @Post("/:serial/exec-out")
  execout(@Param() params: QPSerialDto, @Body() body: execOutDto): Promise<string> {
    return this.phoneService.execOut(params.serial, body.command, body.sudo);
  }

  /**
   * get device info
   * /phone/:serial/info
   */
  @ApiOperation({
    summary: "Get phone system props.",
    description: `Get the phone props; those values are cached by default.`,
  })
  @Get("/:serial/props")
  async getInfo2(@Param() params: QPSerialDto): Promise<Record<string, string>> {
    return this.phoneService.getProps(params.serial);
  }

  @ApiOperation({
    summary: "Call iphonesubinfo service. (EXPERIMENTAL)",
    description: `Call iphonesubinfo service. (EXPERIMENTAL) use with care; Ids depend on the android version.`,
  })
  @Get("/:serial/phonesubinfo/:id")
  async getIphonesubinfo(@Param() params: QPSerialPhonesubinfoDto): Promise<string> {
    return this.phoneService.getIphonesubinfo(params.serial, params.id);
  }

  @ApiOperation({
    summary: "Clear package data.",
    description: `Clear package data.`,
  })
  @Post("/:serial/clear/:package(*)")
  async clearPackage(@Param() params: QPSerialClearDto): Promise<boolean> {
    return this.phoneService.clear(params.serial, params.package);
  }

  @ApiExcludeEndpoint()
  @Get("/:serial/clear/:package(*)")
  async clearPackageGet(@Param() params: QPSerialClearDto): Promise<boolean> {
    return this.phoneService.clear(params.serial, params.package);
  }

  @ApiOperation({
    summary: "Past text from clipboard.",
    description: `Past text from clipboard.`,
  })
  @Post("/:serial/past")
  async pastClipboard(@Param() params: QPSerialDto, @Body() data: WriteTextDto): Promise<void> {
    return this.phoneService.pastText(params.serial, data.text);
  }
  // @Get("/:serial/past")
  // @ApiExcludeEndpoint()
  // async pastClipboardGet(@Param() params: QPSerialPastDto): Promise<void> {
  //   return this.phoneService.pastText(params.serial, params.text);
  // }

  /**
   * get live screen
   * /phone/:serial/png
   */
  @ApiOperation({
    summary: "Capture screen as PNG",
    description: `PNG capture is a slow process, relaying on screencap android binary; this call handles excessive call rate for you; you can also explicitly provide a png expiration time.`,
  })
  @Get("/:serial/png")
  @ApiProduces("image/png")
  // @Header('Content-Type', 'image/png')
  async getPng(@Res() response: Response, @Param() params: QPSerialDto, @Query() query: ImgQueryPngDto): Promise<void> {
    const buffer: Buffer = await this.phoneService.getDeviceScreenPng(params.serial, query);
    response.set("Content-Length", `${buffer.length}`);
    response.set("Content-Type", "image/png");
    response.send(buffer);
  }

  /**
   * /phone/:serial/jpeg
   */
  @ApiOperation({
    summary: "Capture screen as JPG",
    description: `Send the last minicap captured JPEG.`,
  })
  @Get("/:serial/jpeg")
  @ApiProduces("image/jpeg")
  async getJpeg(@Res() response: Response, @Param() params: QPSerialDto, @Query() query: ImgQueryJpegDto): Promise<void> {
    const option = {
      reload: query.reload,
      scall: query.scall,
      fileExt: ".jpeg" as const,
      quality: query.quality,
    };
    const buffer: Buffer = await this.phoneService.getDeviceScreen(params.serial, option);
    response.set("Content-Length", `${buffer.length}`);
    response.set("Content-Type", "image/jpeg");
    response.send(buffer);
  }

  @ApiOperation({
    summary: "Control wifi state.",
    description: `Enable / disable wifi, or toogle if to the expected value`,
  })
  @Post("/:serial/wifi")
  async setWifi(@Param() params: QPSerialDto, @Body() body: OnOffDto): Promise<void> {
    await this.phoneService.setSvc(params.serial, "wifi", body.mode);
  }

  @ApiOperation({
    summary: "Control mobile data state.",
    description: `Enable / disable mobile data, or toogle if to the expected value`,
  })
  @Post("/:serial/data")
  async setData(@Param() params: QPSerialDto, @Body() body: OnOffDto): Promise<void> {
    await this.phoneService.setSvc(params.serial, "data", body.mode);
  }

  @ApiOperation({
    summary: "Control airplane state.",
    description: `Enable / disable airplane, or toogle if to the expected value`,
  })
  @Post("/:serial/airplane")
  async setAirplane(@Param() params: QPSerialDto, @Body() body: OnOffDto): Promise<boolean> {
    try {
      return await this.phoneService.setAirplane(params.serial, body.mode);
    } catch (e) {
      console.log(e);
    }
    return false;
  }

  @ApiOperation({
    summary: "List all packages.",
    description: `List all packages.`,
  })
  @Get("/:serial/packages")
  async getPackages(@Param() params: QPSerialDto): Promise<string[]> {
    return this.phoneService.getPackages(params.serial);
  }

  @ApiOperation({
    summary: "List all running process.",
    description: `List all running process.`,
  })
  @Get("/:serial/ps")
  getPs(@Param() params: QPSerialDto): Promise<Array<Partial<PsEntry>>> {
    return this.phoneService.getPs(params.serial);
  }

  @ApiOperation({
    summary: "Get SMS.",
    description: `Get SMS message from internal SQLite database, this call only works on rooter devices and requier the sqlite3 binary to be present on the devices.`,
  })
  @ApiResponse({ status: 200, description: "SMS list.", isArray: true, type: SMSDto })
  @Get("/:serial/SMS")
  getSMS(@Param() params: QPSerialDto, @Query() options: QSSmsOptionDto): Promise<SMSDto[]> {
    return this.phoneService.getSMS(params.serial, options);
  }

  @ApiOperation({
    summary: "Delete SMS.",
    description: `Delete a SMS message identify by it's id.`,
  })
  @Delete("/:serial/SMS/:id")
  deleteSMS(@Param() params: QPSerialDto, @Query() options: QPSerialIdDto): Promise<boolean> {
    return this.phoneService.deleteSMS(params.serial, options);
  }

  @ApiOperation({
    summary: "start Activity.",
    description: `start Activity.`,
  })
  @Post("/:serial/start-activity")
  async startActivity(@Param() params: QPSerialDto, @Body() body: startActivityDto): Promise<boolean> {
    return await this.phoneService.startActivity(params.serial, body);
  }

  @ApiOperation({
    summary: "Forward http request.",
    description: `Forward http request to the android device.`,
  })
  @Get("/:serial/fw/:remote/:path(*)")
  async forwardGet(@Req() req: Request, @Res() response: Response, @Param() params: QPSerialForwardDto): Promise<any> {
    const port = await this.phoneService.forward(params.serial, params.remote);
    const url = `http://127.0.0.1:${port}/${params.path}`;
    // const headersFlat = Object.entries(req.headers).filter(([k]) => {
    //   k = k.toLocaleString();
    //   if (k === "host") return false;
    //   // if (k === "connection") return false;
    //   // if (k.startsWith("sec-")) return false;
    //   // if (k.startsWith("upgrade-")) return false;
    //   return true;
    // });
    // const headers = Object.fromEntries(headersFlat);
    try {
      const req2 = await fetch(url, { method: "GET" }); // , headers
      const arrayBuffer = await req2.arrayBuffer();
      // console.log('fetch', url , 'ok');
      const buffer = Buffer.from(arrayBuffer);
      // const headers2 = Object.fromEntries(req2.headers.entries());
      const headers2 = { ...req2.headers };
      response.set(headers2);
      response.send(buffer);
    } catch (e) {
      // console.error('Fetch Error URL:', url, headers, e);
      if (e instanceof Error) {
        if (e.cause) {
          throw new ServiceUnavailableException(e.cause.message);
        }
        throw new ServiceUnavailableException(e.message);
      }
      throw new ServiceUnavailableException(e);
    }
  }
  //@Post("/:serial/fw/:remote/:path(*)")
  //async forwardPost(@Req() req: Request, @Res() response: Response, @Param() params: QPSerialForwardDto): Promise<any> {
  //  const port = await this.phoneService.forward(params.serial, params.remote);
  //  const url = `http://127.0.0.1:${port}/${params.path}`;
  //  // http://127.0.0.1:59170/json/list
  //  const headersFlat = Object.entries(req.headers).filter(([k]) => {
  //    k = k.toLocaleString();
  //    if (k === "host") return false;
  //    if (k === "connection") return false;
  //    return true;
  //  });
  //  const headers = Object.fromEntries(headersFlat);
  //  try {
  //    const req2 = await fetch(url, { method: "POST", headers });
  //    const arrayBuffer = await req2.arrayBuffer();
  //    const buffer = Buffer.from(arrayBuffer);
  //    const headers2 = Object.fromEntries(req2.headers.entries());
  //    response.set(headers2);
  //    response.send(buffer);
  //  } catch (e) {
  //    console.log(url, headers, e);
  //  }
  //}
}
