import { IsString } from "class-validator";
import { QPSerialDto } from "./QPSerial.dto";

export class QPSerialPastDto extends QPSerialDto {
  @IsString()
  public text: string;
}
