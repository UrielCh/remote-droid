import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, Max, Min } from 'class-validator';

// 'jp2',
const imageTypes = ['png', 'jpg', 'webp', 'gif'] as const;

export type ImageType = typeof imageTypes[number];

export class QSDeviceListDto {
  @ApiProperty({
    title: 'thumbnails',
    description: 'add an extra thumbnails in each device, only work if some process are currently using the screen',
    type: String,
    enum: imageTypes,
    required: false,
  })
  @IsOptional()
  @Type(() => String)
  public thumbnails: ImageType;

  @ApiProperty({
    title: 'thumbnails width',
    description: 'thumbnails width',
    type: Number,
    default: 128,
    minimum: 16,
    maximum: 320,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @Min(16)
  @Max(320)
  public width = 128;
}
