import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: "Your email",
    required: true,
    example: "user@domain.com",
  })
  email: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "account password",
    required: true,
    example: "password",
  })
  password: string;
}
