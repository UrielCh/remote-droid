import { ApiProperty } from '@nestjs/swagger';
import { DeviceType } from '@u4/adbkit';

export default class DeviceDto {
  @ApiProperty({
    type: String,
    description: 'phone serial number',
    required: true,
    example: '112abc',
  })
  id!: string;
  @ApiProperty({
    description: 'phone status',
    type: String,
    enum: ['emulator', 'device', 'offline'],
    required: true,
  })
  type!: DeviceType;

  @ApiProperty({
    type: String,
    description: 'phone screen thumbnails as base64',
    required: false,
  })
  thumbnails?: string;

  @ApiProperty({
    type: Number,
    description: 'thumbnails Width',
    required: false,
  })
  w?: number;

  @ApiProperty({
    type: Number,
    description: 'thumbnails heigth',
    required: false,
  })
  h?: number;

  @ApiProperty({
    type: 'object',
    description: 'requested props',
    required: false,
    additionalProperties: {
      oneOf: [{ type: 'string' }],
    },
  })
  props?: Record<string, string>;
}
