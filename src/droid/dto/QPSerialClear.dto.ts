import { IsString } from "class-validator";
import { QPSerialDto } from "./QPSerial.dto";

export class QPSerialClearDto extends QPSerialDto {
  @IsString()
  public package: string;
}
