import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber } from "class-validator";
import { QPSerialDto } from "./QPSerial.dto";

export class QPSerialIdDto extends QPSerialDto {
  @ApiProperty({
    title: "ressource id",
    default: true,
    required: false,
  })
  @IsNumber()
  @Transform((value) => Number(value.value))
  public id: number;
}
