import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { QPSerialDto } from './QPSerial.dto.js';

export class QPSerialIdDto extends QPSerialDto {
  @ApiProperty({
    title: 'ressource id',
    required: true,
  })
  @IsNumber()
  @Transform((value) => Number(value.value))
  public id!: number;
}
