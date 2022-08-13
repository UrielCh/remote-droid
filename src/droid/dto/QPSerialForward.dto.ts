import { IsString } from "class-validator";
import { QPSerialDto } from "./QPSerial.dto";

export class QPSerialForwardDto extends QPSerialDto {
  @IsString()
  public remote: string;
  @IsString()
  public path: string;
}
