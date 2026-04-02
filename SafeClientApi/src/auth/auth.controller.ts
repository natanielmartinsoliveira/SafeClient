import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Criar nova conta de usuário' })
  @ApiBody({
    type: RegisterDto,
    examples: { default: { value: { email: 'usuario@exemplo.com', password: 'Senha@1234' } } },
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuário e obter JWT' })
  @ApiBody({
    type: LoginDto,
    examples: { default: { value: { email: 'admin@safeclient.com', password: 'Admin@123456' } } },
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
