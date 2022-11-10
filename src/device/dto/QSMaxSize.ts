import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class QSMaxSize {
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    title: 'Max len',
    type: Number,
    minimum: 1,
    description: 'The returned line size will equal or smaller than the lmit.',
    required: false,
    default: 10000,
  })
  size = 10000;
}
