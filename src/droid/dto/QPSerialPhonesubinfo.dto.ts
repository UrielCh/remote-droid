import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';
import { QPSerialDto } from './QPSerial.dto';

export class QPSerialPhonesubinfoDto extends QPSerialDto {
  @ApiProperty({
    title: 'Phonesubinfo id',
    description: 'Phonesubinfo id is Android version dependent.',
    required: true,
  })
  @IsNumber()
  @Min(1)
  @Max(31)
  @Transform((value) => Number(value.value))
  public id: number;
}
