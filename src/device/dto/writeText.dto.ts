import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Min, IsNumber, IsString } from 'class-validator';

export class WriteTextDto {
  @IsString()
  @ApiProperty({
    description: 'text you want to tape',
    required: true,
    example: 'text',
  })
  text!: string;

  //@Query('scall', new DefaultValuePipe(0.5), new ParseFloatPipe({ min: 0.01, max: 1 }))
  @IsNumber()
  @Min(0)
  @Transform((value) => Number(value.value))
  @ApiProperty({
    description: 'delay in ms beetwen each tape',
    required: false,
    example: '0',
  })
  delay = 0;
}
