import { ApiProperty } from '@nestjs/swagger';
import { RebootType } from '@u4/adbkit';
import { IsEnum, IsString } from 'class-validator';

const rebootTypes = ['bootloader', 'recovery', 'sideload', 'fastboot', 'system'];
/**
 * use as a body
 */
export class rebootDto {
  @ApiProperty({
    title: 'reboot mode',
    description: 'reboot type, if not secifyed reboot to system.',
    enum: rebootTypes,
    required: false,
  })
  @IsString()
  @IsEnum(rebootTypes)
  type: RebootType | 'system' = 'system';
}
