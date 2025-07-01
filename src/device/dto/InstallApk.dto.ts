import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

// export const ON_OFF_ENUM = ['on', 'off', 'toggleOff', 'toggleOn'] as const;
// export type OnOffType = typeof ON_OFF_ENUM[number];
/**
 * use as a body
 */
export class installApkDto {
  @IsUrl()
  @ApiProperty({
    title: 'link',
    type: String,
    description: 'Url to download the APK.',
    required: true,
  })
  link!: string;
}
