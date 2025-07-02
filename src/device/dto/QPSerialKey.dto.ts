import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';
import { QPSerialDto } from './QPSerial.dto.js';
import { type KeyCodes } from '@u4/adbkit';

export class QPSerialKeyDto extends QPSerialDto {
  @ApiProperty({
    title: 'Andoid keycode id',
    description: 'Andoid keycode id as describe in android source code.',
    required: true,
  })
  @IsNumber()
  @Min(1)
  @Max(288)
  @Transform((value) => Number(value.value))
  public key!: KeyCodes;
}
