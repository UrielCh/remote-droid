import { ApiProperty } from '@nestjs/swagger';
import { DeviceType } from '@u4/adbkit';

export default class DeviceDto {
  @ApiProperty({
    description: 'phone serial number',
    required: true,
    example: '112abc',
  })
  id: string;
  @ApiProperty({
    description: 'phone statuis',
    enum: ['emulator', 'device', 'offline'],
    required: true,
  })
  type: DeviceType;
}
