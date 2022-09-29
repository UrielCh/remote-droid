import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QSSmsOptionDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    title: 'from',
    type: String,
    description: 'filter by sms emiter.',
    required: false
  })
  from?: string;
}
