// src/auth/auth.controller.ts
import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard, JwtRefreshGuard } from './guard/auth.guard';

interface RequestWithUser extends Request {
  user: {
    sub: number;
    correo: string;
    roles: string[];
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // Crea Persona + Usuario y devuelve { access_token, refresh_token }
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  // Valida credenciales y devuelve { access_token, refresh_token }
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  // Usa el refresh token (estrategia 'jwt-refresh') para emitir nuevos tokens
  @ApiBearerAuth('refresh-token')
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(@Req() req: any) {
    return this.auth.refresh(req.user.sub);
  }

  // Devuelve info básica del perfil a partir del access token
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Req() req: RequestWithUser) {
    return this.auth.profile(req.user);
  }

  @HttpCode(200)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    // si usas cookies para refresh:
    res.clearCookie('rt', { path: '/api/auth' });
    return { ok: true };
  }
}
