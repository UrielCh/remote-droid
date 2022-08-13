import { Transform } from "class-transformer";
import { IsNumber, Max, Min } from "class-validator";
import { QPSerialDto } from "./QPSerial.dto";

export class QPSerialKeyDto extends QPSerialDto {
  @IsNumber()
  @Min(1)
  @Max(288)
  @Transform((value) => Number(value.value))
  public key: number;
}
