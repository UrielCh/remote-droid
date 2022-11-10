import { ApiProperty } from '@nestjs/swagger';
import { StartServiceOptions } from '@u4/adbkit';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { IsStringOrStrings } from '../../common/validator/IsStringOrStrings';

// export const ON_OFF_ENUM = ['on', 'off', 'toggleOff', 'toggleOn'] as const;
// export type OnOffType = typeof ON_OFF_ENUM[number];
/**
 * use as a body
 */
export class startActivityDto implements StartServiceOptions {
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    title: 'user',
    type: Number,
    description:
      'The user to run as. Not set by default. If the option is unsupported by the device, an attempt will be made to run the same command again without the user option.',
    required: false,
  })
  user?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    title: 'action',
    description: 'The action. (the -a parameter)',
    required: false,
  })
  action?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    title: 'data',
    description: 'The data URI, if any. (the -d parameter)',
    required: false,
  })
  data?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    title: 'mimeType',
    description: 'The mime type, if any. (the -rt parameter)',
    required: false,
  })
  mimeType?: string;

  @IsStringOrStrings()
  @IsOptional()
  @ApiProperty({
    title: 'category',
    description: 'The category. For multiple categories, pass an `Array`. (the -c parameter)',
    type: [String],
    required: false,
  })
  category?: string | string[];

  @IsString()
  @IsOptional()
  @ApiProperty({
    title: 'component',
    example: 'com.android.chrome/com.google.android.apps.chrome.Main',
    description: 'The component. (the -n parameter)',
    required: false,
  })
  component?: string;

  // @IsArray()
  // @IsString({ each: true })
  @IsStringOrStrings()
  @IsOptional()
  @ApiProperty({
    title: 'args',
    description: 'extra args to append at the end',
    type: [String],
    required: false,
  })
  args?: string | string[];
}
