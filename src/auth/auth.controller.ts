import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SuccessResponseDto } from 'src/common/dto/response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const token = await this.authService.login(loginDto);
    if (!token) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return new SuccessResponseDto('Login successful', { access_token: token });
  }

  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const token = await this.authService.register(createUserDto);
    if (!token) {
      throw new BadRequestException('Failed to register user');
    }
    return new SuccessResponseDto('Registration successful', { access_token: token });
  }
}1