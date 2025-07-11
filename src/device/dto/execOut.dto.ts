import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsString } from 'class-validator';
import { TRUE_VALUE } from '../../common/validator/isBoolean.js';

/**
 * use as a body
 */
export class execOutDto {
  @ApiProperty({
    title: 'command to execute',
    description: 'command to execute as shell user, you can sudo this call using sudo flag if your device is rooted',
    type: String,
    example: 'ls /',
    required: true,
  })
  @IsString()
  command!: string;

  @ApiProperty({
    title: 'sudo the command',
    type: Boolean,
    required: false,
  })
  @IsBoolean()
  @Transform((value) => {
    const v = TRUE_VALUE.has(value.value);
    return v;
  })
  sudo = false;
}
