import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { QPSerialDto } from "./QPSerial.dto";

export class QPSerialForwardDto extends QPSerialDto {
  @ApiProperty({
    title: "remote port name or number",
    description: `Remote port name or number to access into the device.
    Common values are:
    - **tcp:PORT_NUMBER**: Forward a new port
    - **localabstract:PORT_NAME**: Forward a new port
    - **PORT_NUMBER**: connect to a localhost port`,
    required: true,
  })
  @IsString()
  public remote: string;
  @ApiProperty({
    title: "http request path",
    description: "Path of the http request in the phone.",
    required: true,
  })
  @IsString()
  public path: string;
}
