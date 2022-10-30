import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QSGrepDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    title: 'grep',
    type: String,
    description: 'filter returned lines by regexp.',
    required: false,
  })
  grep?: string;
}
