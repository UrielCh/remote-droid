import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { QPSerialDto } from './QPSerial.dto.js';

export class QPSerialClearDto extends QPSerialDto {
  @ApiProperty({
    title: 'package name',
    description: 'package that will be clear.',
    required: true,
  })
  @IsString()
  public package!: string;
}
