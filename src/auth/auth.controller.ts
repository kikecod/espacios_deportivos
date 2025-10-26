import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { CookieOptions, Request, Response } from 'express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';
import { TipoRol } from 'src/roles/rol.entity';
import { Auth } from './decorators/auth.decorators';
import { ActiveUser } from './decorators/active-user.decorator';
import { jwtConstants } from './constants/jwt.constant';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
import { RequestEmailVerificationDto } from './dto/request-email-verification.dto';
import { ConfirmEmailVerificationDto } from './dto/confirm-email-verification.dto';

type ActiveUserPayload = {
  sub: number;
  roles: string[];
  correo: string;
  usuario: string;
  id_persona: number;
  id_usuario: number;
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @ApiOperation({ summary: 'Registra un nuevo usuario cliente' })
  @ApiCreatedResponse({ description: 'Usuario registrado correctamente' })
  register(@Body() registerDTO: RegisterDto) {
    return this.authService.register(registerDTO);
  }

  @Post('/login')
  @Throttle({ login: {} })
  @ApiOperation({
    summary: 'Inicia sesian y entrega tokens de acceso y refresco',
  })
  @ApiOkResponse({ description: 'Inicio de sesian exitoso' })
  async login(
    @Body() loginDTO: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, usuario } =
      await this.authService.login(loginDTO);
    this.setRefreshTokenCookie(res, refreshToken);
    return {
      accessToken,
      usuario,
    };
  }

  @Post('/refresh')
  @Throttle({ sensitive: {} })
  @ApiOperation({
    summary: 'Genera un nuevo par de tokens usando el refresh token',
  })
  @ApiOkResponse({ description: 'Tokens renovados correctamente' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[jwtConstants.refreshCookieName];
    const {
      accessToken,
      refreshToken: newRefreshToken,
      usuario,
    } = await this.authService.refresh(refreshToken);
    this.setRefreshTokenCookie(res, newRefreshToken);
    return {
      accessToken,
      usuario,
    };
  }

  @Post('/logout')
  @Throttle({ sensitive: {} })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cierra la sesian actual e invalida el refresh token',
  })
  @ApiOkResponse({ description: 'Sesian cerrada correctamente' })
  async logout(
    @ActiveUser() user: { sub: number },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.sub);
    this.clearRefreshTokenCookie(res);
    return { success: true };
  }

  @Post('/password/reset/request')
  @Throttle({ sensitive: {} })
  @ApiOperation({
    summary: 'Solicita un token para restablecer la contrasenia',
  })
  @ApiOkResponse({
    description:
      'Se devuelve un mensaje genÃ©rico y, en entornos no productivos, el token',
  })
  async requestPasswordReset(
    @Body() dto: RequestPasswordResetDto,
    @Req() req: Request,
  ) {
    return this.authService.requestPasswordReset(
      dto,
      this.buildRequestMetadata(req),
    );
  }

  @Post('/password/reset/confirm')
  @Throttle({ sensitive: {} })
  @ApiOperation({
    summary:
      'Confirma el cambio de contrasenia usando el token de restablecimiento',
  })
  @ApiOkResponse({ description: 'Contrasenia actualizada correctamente' })
  async confirmPasswordReset(@Body() dto: ConfirmPasswordResetDto) {
    return this.authService.confirmPasswordReset(dto);
  }

  @Post('/email/verification/request')
  @Throttle({ sensitive: {} })
  @ApiOperation({
    summary: 'Solicita un token para verificar el correo electranico',
  })
  @ApiOkResponse({
    description: 'Token generado si el correo requiere verificacian',
  })
  async requestEmailVerification(
    @Body() dto: RequestEmailVerificationDto,
    @Req() req: Request,
  ) {
    return this.authService.requestEmailVerification(
      dto,
      this.buildRequestMetadata(req),
    );
  }

  @Post('/email/verification/confirm')
  @Throttle({ sensitive: {} })
  @ApiOperation({ summary: 'Confirma la verificacian del correo electranico' })
  @ApiOkResponse({ description: 'Correo verificado correctamente' })
  async confirmEmailVerification(@Body() dto: ConfirmEmailVerificationDto) {
    return this.authService.confirmEmailVerification(dto);
  }

  @Get('/profile')
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.CONTROLADOR])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtiene el perfil del usuario autenticado' })
  @ApiOkResponse({ description: 'Perfil obtenido correctamente' })
  profile(@ActiveUser() user: ActiveUserPayload) {
    return this.authService.profile(user);
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie(
      jwtConstants.refreshCookieName,
      refreshToken,
      this.getRefreshCookieOptions(),
    );
  }

  private clearRefreshTokenCookie(res: Response) {
    res.clearCookie(
      jwtConstants.refreshCookieName,
      this.getRefreshCookieOptions({ clear: true }),
    );
  }

  private getRefreshCookieOptions(options?: {
    clear?: boolean;
  }): CookieOptions {
    const base: CookieOptions = {
      httpOnly: true,
      secure: jwtConstants.refreshCookieSecure,
      sameSite: jwtConstants.refreshCookieSameSite,
      path: jwtConstants.refreshCookiePath,
    };

    if (options?.clear) {
      base.maxAge = 0;
    } else {
      base.maxAge = jwtConstants.refreshCookieMaxAgeMs;
    }

    return base;
  }

  private buildRequestMetadata(req: Request) {
    const forwardedFor = (req.headers['x-forwarded-for'] as string | undefined)
      ?.split(',')[0]
      ?.trim();
    return {
      ip: forwardedFor ?? req.ip ?? undefined,
      userAgent: req.get('user-agent') ?? undefined,
    };
  }
}
