import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthLoginResponseDto } from './dto/auth-login-response.dto';
import { Public } from './decorators/auth-public.decorator';

@ApiTags('auth')
@Controller(['auth', 'usuarios'])
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión y obtener un JWT' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario autenticado y accessToken.',
    type: AuthLoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Usuario o clave incorrectos.' })
  async login(
    @Body() authLoginDto: AuthLoginDto,
  ): Promise<AuthLoginResponseDto> {
    return this.authService.login(authLoginDto);
  }
}

