import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Min, Max, IsNumber } from 'class-validator';

export class QSImgQueryPngDto {
  @ApiProperty({
    title: 'screenshot maxAge in ms',
    default: 0,
    description: `Generating an png is time consumming, for the device, and use to take beteween 200 and 600ms, to avoid bricking the device, any new png request durring a png pending generation will be resolve with the current processing one.
    if the last generated png is age is newser that the maxAge, the prevous png will be sent.`,
    type: Number,
    required: false,
  })
  @IsNumber()
  @Transform((value) => Number(value.value))
  maxAge = 0;

  @ApiProperty({
    title: 'image scall',
    default: 1,
    description: 'Resize image before sending it back, to reduce band width usage, by defaut sent the original png file.',
    required: false,
    type: Number,
    minimum: 0,
    maximum: 1,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  @Transform((value) => Number(value.value))
  scall = 1;
}
