import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { QPDumpsysTypeDto } from './QPDumpsysType.dto.js';

/**
 * use as a body
 */
export class QPDumpsysTypeExtraDto extends QPDumpsysTypeDto {
  @IsString()
  @ApiProperty({
    title: 'extra',
    description: 'exrta argument',
    required: true,
    type: String,
  })
  extra!: string;
}
