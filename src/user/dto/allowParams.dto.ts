import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class AllowParamsDto {
  @IsEmail()
  @IsOptional()
  @ApiProperty({
    description: "recever email address",
    example: "user@domain.com",
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @ApiProperty({
    description: "device serial number to share",
    required: true,
    example: "12345678",
  })
  serial: string;
}
