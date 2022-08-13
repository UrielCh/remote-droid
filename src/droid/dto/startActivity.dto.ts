import { ApiProperty } from "@nestjs/swagger";
import { StartServiceOptions } from "@u4/adbkit";
import { IsNumber, IsOptional, IsString } from "class-validator";

export const ON_OFF_ENUM = ["on", "off", "toggleOff", "toggleOn"] as const;
export type OnOffType = typeof ON_OFF_ENUM[number];
/**
 * use as a body
 */
export class startActivityDto implements StartServiceOptions {
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description:
      "The user to run as. Not set by default. If the option is unsupported by the device, an attempt will be made to run the same command again without the user option.",
    required: false,
  })
  user?: number;
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "The action. (the -a parameter)",
    required: false,
  })
  action?: string;
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "The data URI, if any. (the -d parameter)",
    required: false,
  })
  data?: string;
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "The mime type, if any. (the -rt parameter)",
    required: false,
  })
  mimeType?: string;
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "The category. For multiple categories, pass an `Array`. (the -c parameter)",
    required: false,
  })
  category?: string | string[];
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "The component. (the -n parameter)",
    required: false,
  })
  component?: string;
}
