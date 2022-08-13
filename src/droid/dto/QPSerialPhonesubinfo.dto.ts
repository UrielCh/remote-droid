import { Transform } from "class-transformer";
import { IsNumber, Max, Min } from "class-validator";
import { QPSerialDto } from "./QPSerial.dto";

export class QPSerialPhonesubinfoDto extends QPSerialDto {
  @IsNumber()
  @Min(1)
  @Max(31)
  @Transform((value) => Number(value.value))
  public id: number;
}
