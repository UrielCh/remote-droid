import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PastTextDto {
  @IsString()
  @ApiProperty({
    description: 'text you want to past',
    type: String,
    required: true,
    example: 'text',
  })
  text!: string;
}
