import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, Min, Max, IsNumber } from 'class-validator';
import { TRUE_VALUE } from '../../common/validator/isBoolean';

export class ImgQueryJpegDto {
  // @Query('reload', new DefaultValuePipe('true'), ParseBoolPipe)
  @ApiProperty({
    title: 'force refresh',
    default: true,
    description: 'force take a new screenshot, or allow an subsecond old image to be sentback',
    required: false,
  })
  @IsBoolean()
  @Transform((value) => {
    const v = TRUE_VALUE.has(value.value);
    return v;
  })
  reload = true;

  @ApiProperty({ title: 'image scall', default: 0.5, description: 'resize image before sending it back, to reduce band width usage', required: false })
  @IsNumber()
  @Min(0)
  @Max(1)
  @Transform((value) => Number(value.value))
  scall = 0.5;

  @ApiProperty({ title: 'image quality', default: 85, description: 'Jpeg image quality tom 0 to 100 percent', required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform((value) => {
    const v = Number(value.value);
    return v;
  })
  quality = 85;
}
