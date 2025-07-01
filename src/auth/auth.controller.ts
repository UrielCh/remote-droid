import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DroidUser } from '../db/user.entity.js';
import { AuthService } from './auth.service.js';
import { AccessTokenDto, AuthDto } from './dto/index.js';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
    // empty
  }

  @Post('signup')
  @ApiOperation({
    summary: 'Create an account',
    // description: "",
  })
  async signup(@Body() dto: AuthDto): Promise<DroidUser> {
    try {
      const user = await this.authService.signup(dto);
      return user;
    } catch (e) {
      throw e;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  @ApiOperation({
    summary: 'Emit a valid JWT token',
    // description: "",
  })
  @ApiCreatedResponse({
    description: 'A new JWT token',
    isArray: false,
  })
  @ApiForbiddenResponse({
    description: 'Invalid credencial.',
    type: AccessTokenDto,
  })
  signin(@Body() dto: AuthDto): Promise<AccessTokenDto> {
    return this.authService.signin(dto);
  }
}
