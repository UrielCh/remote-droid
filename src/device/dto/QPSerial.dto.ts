import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class QPSerialDto {
  @ApiProperty({
    description: 'phone serial number',
    title: 'serial number',
    type: String,
  })
  @Length(1, 20)
  serial!: string;
}
