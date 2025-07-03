import { ApiProperty } from '@nestjs/swagger';
import { IsString, ValidateIf, IsArray } from 'class-validator';
import { QPSerialDto } from './QPSerial.dto.js';

export class QPSerialForwardDto extends QPSerialDto {
  @ApiProperty({
    title: 'remote port name or number',
    description: `Remote port name or number to access into the device.
    Common values are:
    - **tcp:PORT_NUMBER**: Forward a new port
    - **localabstract:PORT_NAME**: Forward a new port
    - **PORT_NUMBER**: connect to a localhost port`,
    required: true,
  })
  @IsString()
  public remote!: string;
  @ApiProperty({
    title: 'http request path',
    description: 'Path of the http request in the phone.',
    required: true,
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  @ValidateIf(o => typeof o.path === 'string')
  @IsString()
  @ValidateIf(o => Array.isArray(o.path))
  @IsArray()
  @IsString({ each: true })
  public path!: string | string[];
}
