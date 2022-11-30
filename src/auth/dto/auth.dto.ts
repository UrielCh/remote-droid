import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Your email',
    required: true,
    example: 'user@domain.com',
  })
  email!: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'account password',
    required: true,
    example: 'password',
  })
  password!: string;
}

export class AccessTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'your access token',
    required: true,
    example: 'abcdefg123456789',
  })
  access_token!: string;
}
