import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@exemplo.com' })
  @IsEmail({}, { message: 'E-mail inválido.' })
  email: string;

  @ApiProperty({ example: 'senha1234', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter ao menos 8 caracteres.' })
  password: string;
}
