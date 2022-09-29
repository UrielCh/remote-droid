import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

// 'jp2',
const imageTypes = ['png', 'jpg', 'webp', 'gif'] as const;

export type ImageType = typeof imageTypes[number];

export class QSDeviceListDto {
  @ApiProperty({
    title: 'tumbnails',
    description: 'add an extra tumbnails in each device, only work if some process are currently using the screen',
    type: String,
    enum: imageTypes,
    required: false,
  })
  @IsOptional()
  @Type(() => String)
  public tumbnails: ImageType;
}
