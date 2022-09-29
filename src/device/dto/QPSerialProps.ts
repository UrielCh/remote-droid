import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { QPSerialDto } from './QPSerial.dto';

export class QPSerialPropsDto extends QPSerialDto {
  @ApiProperty({
    title: 'Filter props by prefix',
    description: 'return only props starting with prefix, multiple prefix can be provide, separeted by comma, semi-comma or space',
    required: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @Transform(({ value }) => value.split(/[,; ]/g).filter((a: string) => a))
  public prefix?: string[];
}
