import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export const ON_OFF_ENUM = ['on', 'off', 'toggleOff', 'toggleOn'] as const;
export type OnOffType = typeof ON_OFF_ENUM[number];
/**
 * use as a body
 */
export class OnOffDto {
  @IsString()
  @IsEnum(ON_OFF_ENUM)
  @ApiProperty({
    title: 'new State',
    description: 'Change stat to new value.',
    required: true,
    enum: ON_OFF_ENUM,
  })
  mode!: OnOffType;
}
