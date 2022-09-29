import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { isArray, IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class QSSerialPropsDto {

  @ApiProperty({
    title: 'Max props ages in millisec',
    description: 'Limit excessive get props calls, Default value is 1 min, minimal value is 100 ms',
    example: 100,
    minimum: 100,
    default: 60000,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  })
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @Min(100)
  public maxAge = 60000;

  @ApiProperty({
    title: 'Filter props by prefix',
    description: 'Return only props starting with prefix, multiple prefix can be provide, each prefix can be separeted by comma, semi-comma or space',
    isArray: true,
    required: false,
  })

  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  @Transform(({ value }) => {
    if (!(typeof value === 'string') && isArray(value)) {
      value = (value as Array<string>).join(',');
    }
    if (typeof value === 'string')
      value = value.split(/[,; ]/g).filter((a: string) => a);
    return value;
  })
  public prefix?: string[];
}
