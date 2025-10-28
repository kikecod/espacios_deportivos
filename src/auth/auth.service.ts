import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { Rol, TipoRol } from 'src/roles/rol.entity';
import { UsuarioRolService } from 'src/usuario_rol/usuario_rol.service';
import { CreateUsuarioRolDto } from 'src/usuario_rol/dto/create-usuario_rol.dto';
import { ClientesService } from 'src/clientes/clientes.service';
import { CreateClienteDto } from 'src/clientes/dto/create-cliente.dto';
import { jwtConstants } from './constants/jwt.constant';
import { UsuarioRol } from 'src/usuario_rol/entities/usuario_rol.entity';
import { verifyWithFallback } from './utils/jwt.util';
import { AuthTokenService } from './auth-token.service';
import { AuthTokenType } from './entities/auth-token.entity';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
import { RequestEmailVerificationDto } from './dto/request-email-verification.dto';
import { ConfirmEmailVerificationDto } from './dto/confirm-email-verification.dto';

type UsuarioWithRoles = {
  id_usuario: number;
  id_persona: number;
  correo: string;
  usuario: string;
  roles?: UsuarioRol[];
  hash_refresh_token?: string | null;
  correo_verificado?: boolean;
};

type AccessTokenPayload = {
  sub: number;
  correo: string;
  usuario: string;
  id_persona: number;
  id_usuario: number;
  roles: string[];
};

type RequestMetadata = {
  ip?: string;
  userAgent?: string;
};

type UsuarioSummary = {
  correo: string;
  usuario: string;
  id_persona: number;
  id_usuario: number;
  correoVerificado: boolean;
  roles: string[];
};

type ProfileRaw = NonNullable<
  Awaited<ReturnType<UsuariosService['findProfileData']>>
>;

type ProfileResponse = {
  persona: {
    paterno: string;
    materno: string;
    nombres: string;
    documentoTipo: string | null;
    documentoNumero: string | null;
    telefono: string;
    fechaNacimiento: string | Date | null;
    genero: string;
    url_foto: string | null;
  };
  usuario: UsuarioSummary & {
    hashContrasena: string | null;
  };
  cliente?: {
    apodo: string | null;
    nivel: number | null;
    observaciones: string | null;
  };
  duenio?: {
    verificado: boolean;
  };
  controlador?: {
    codigoEmpleado: string;
    activo: boolean;
    turno: string;
  };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly usuarioRolService: UsuarioRolService,
    private readonly clientesService: ClientesService,
    private readonly authTokenService: AuthTokenService,
    private readonly configService: ConfigService,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async register(registerDTO: RegisterDto) {
    const rol = await this.rolRepository.findOneBy({ rol: TipoRol.CLIENTE });
    if (!rol) {
      throw new NotFoundException('Rol CLIENTE no encontrado');
    }
    const usuario = await this.usuariosService.findByCorreoLogin(
      registerDTO.correo,
    );
    if (usuario) {
      throw new BadRequestException('El correo ya esta registrado');
    }

    const newUsuario = await this.usuariosService.create(registerDTO);

    const newCliente: CreateClienteDto = {
      id_cliente: newUsuario.id_persona,
    };

    await this.clientesService.create(newCliente);

    const dto: CreateUsuarioRolDto = {
      id_usuario: newUsuario.id_usuario,
      id_rol: rol.id_rol,
    };
    await this.usuarioRolService.create(dto);

    return newUsuario;
  }

  async login(loginDTO: LoginDto) {
    const usuario = await this.usuariosService.findByCorreoLogin(
      loginDTO.correo,
    );
    if (!usuario) {
      throw new UnauthorizedException('Email invalido');
    }

    const isValidPassword = await bcrypt.compare(
      loginDTO.contrasena,
      usuario.hash_contrasena,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Contrasena invalida');
    }

    const tokens = await this.generateTokens(usuario);
    await this.usuariosService.setCurrentRefreshToken(
      tokens.refreshToken,
      usuario.id_usuario,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      usuario: this.mapUsuario(usuario),
    };
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Token de refresco no provisto');
    }

    let payload: { sub: number };
    try {
      payload = await verifyWithFallback<{ sub: number }>(
        this.jwtService,
        refreshToken,
        jwtConstants.refreshSecret,
        jwtConstants.legacyRefreshSecrets,
      );
    } catch {
      throw new UnauthorizedException('Token de refresco invalido');
    }

    const usuario = await this.usuariosService.findByIdWithRoles(payload.sub);
    if (!usuario || !usuario.hash_refresh_token) {
      throw new UnauthorizedException('Token de refresco invalido');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      usuario.hash_refresh_token,
    );
    if (!isRefreshTokenValid) {
      await this.usuariosService.clearRefreshToken(payload.sub);
      throw new UnauthorizedException('Token de refresco invalido');
    }

    const tokens = await this.generateTokens(usuario);
    await this.usuariosService.setCurrentRefreshToken(
      tokens.refreshToken,
      usuario.id_usuario,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      usuario: this.mapUsuario(usuario),
    };
  }

  async logout(userId: number): Promise<void> {
    await this.usuariosService.clearRefreshToken(userId);
  }

  async profile(activeUser: AccessTokenPayload) {
    const usuario = await this.usuariosService.findByIdWithRoles(
      activeUser.sub,
    );
    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${activeUser.sub} no encontrado`,
      );
    }

    const profileRaw = await this.usuariosService.findProfileData(
      activeUser.sub,
    );
    if (!profileRaw) {
      throw new NotFoundException(
        `Perfil para usuario ${activeUser.sub} no encontrado`,
      );
    }

    return this.buildProfileResponse(usuario, profileRaw);
  }

  async requestPasswordReset(
    requestPasswordResetDto: RequestPasswordResetDto,
    metadata: RequestMetadata,
  ) {
    const usuario = await this.usuariosService.findByCorreoLogin(
      requestPasswordResetDto.correo,
    );
    if (!usuario) {
      return this.buildPublicTokenResponse();
    }

    await this.authTokenService.invalidateTokens(
      usuario.id_usuario,
      AuthTokenType.PASSWORD_RESET,
    );
    const { token, expiresAt } = await this.authTokenService.createToken({
      userId: usuario.id_usuario,
      type: AuthTokenType.PASSWORD_RESET,
      ttlSeconds: this.passwordResetTtl,
      requestIp: metadata.ip,
      userAgent: metadata.userAgent,
    });

    return this.buildPublicTokenResponse(token, expiresAt);
  }

  async confirmPasswordReset(confirmPasswordResetDto: ConfirmPasswordResetDto) {
    const authToken = await this.authTokenService.consumeToken(
      confirmPasswordResetDto.token,
      AuthTokenType.PASSWORD_RESET,
    );

    await this.usuariosService.updatePassword(
      authToken.userId,
      confirmPasswordResetDto.nuevaContrasena,
    );
    await this.usuariosService.clearRefreshToken(authToken.userId);

    return { message: 'Contrasena actualizada correctamente' };
  }

  async requestEmailVerification(
    requestEmailVerificationDto: RequestEmailVerificationDto,
    metadata: RequestMetadata,
  ) {
    const usuario = await this.usuariosService.findByCorreoLogin(
      requestEmailVerificationDto.correo,
    );
    if (!usuario) {
      return this.buildPublicTokenResponse();
    }

    if (usuario.correo_verificado) {
      return { message: 'El correo ya esta verificado' };
    }

    await this.authTokenService.invalidateTokens(
      usuario.id_usuario,
      AuthTokenType.EMAIL_VERIFICATION,
    );
    const { token, expiresAt } = await this.authTokenService.createToken({
      userId: usuario.id_usuario,
      type: AuthTokenType.EMAIL_VERIFICATION,
      ttlSeconds: this.emailVerificationTtl,
      requestIp: metadata.ip,
      userAgent: metadata.userAgent,
    });

    return this.buildPublicTokenResponse(token, expiresAt);
  }

  async confirmEmailVerification(
    confirmEmailVerificationDto: ConfirmEmailVerificationDto,
  ) {
    const authToken = await this.authTokenService.consumeToken(
      confirmEmailVerificationDto.token,
      AuthTokenType.EMAIL_VERIFICATION,
    );

    await this.usuariosService.markEmailVerified(authToken.userId);
    await this.authTokenService.invalidateTokens(
      authToken.userId,
      AuthTokenType.EMAIL_VERIFICATION,
    );

    return { message: 'Correo verificado correctamente' };
  }

  private buildProfileResponse(
    usuario: UsuarioWithRoles,
    raw: ProfileRaw,
  ): ProfileResponse {
    const usuarioBase = this.mapUsuario(usuario);
    const roles = usuarioBase.roles;
    const profile: ProfileResponse = {
      persona: this.mapPersonaProfile(raw),
      usuario: {
        ...usuarioBase,
        hashContrasena: raw.usuario_hash_contrasena ?? null,
      },
    };

    if (
      this.shouldExposeSegment(roles, TipoRol.CLIENTE) &&
      (raw.cliente_apodo !== null ||
        raw.cliente_nivel !== null ||
        raw.cliente_observaciones !== null)
    ) {
      profile.cliente = {
        apodo: raw.cliente_apodo,
        nivel:
          raw.cliente_nivel !== null
            ? this.toNullableNumber(raw.cliente_nivel)
            : null,
        observaciones: raw.cliente_observaciones,
      };
    }

    if (
      this.shouldExposeSegment(roles, TipoRol.DUENIO) &&
      raw.duenio_verificado !== null
    ) {
      profile.duenio = {
        verificado: Boolean(raw.duenio_verificado),
      };
    }

    if (
      this.shouldExposeSegment(roles, TipoRol.CONTROLADOR) &&
      raw.controlador_codigo_empleado !== null &&
      raw.controlador_activo !== null &&
      raw.controlador_turno !== null
    ) {
      profile.controlador = {
        codigoEmpleado: raw.controlador_codigo_empleado,
        activo: Boolean(raw.controlador_activo),
        turno: raw.controlador_turno,
      };
    }

    return profile;
  }

  private mapUsuario(usuario: UsuarioWithRoles): UsuarioSummary {
    return {
      correo: usuario.correo,
      usuario: usuario.usuario,
      id_persona: usuario.id_persona,
      id_usuario: usuario.id_usuario,
      correoVerificado: usuario.correo_verificado ?? false,
      roles: this.getRoles(usuario),
    };
  }

  private mapPersonaProfile(raw: ProfileRaw): ProfileResponse['persona'] {
    return {
      paterno: raw.persona_paterno,
      materno: raw.persona_materno,
      nombres: raw.persona_nombres,
      documentoTipo: raw.persona_documento_tipo,
      documentoNumero: raw.persona_documento_numero,
      telefono: raw.persona_telefono,
      fechaNacimiento: this.normalizeDate(raw.persona_fecha_nacimiento),
      genero: raw.persona_genero,
      url_foto: raw.persona_url_foto,
    };
  }

  private shouldExposeSegment(roles: string[], role: TipoRol): boolean {
    return roles.includes(role) || roles.includes(TipoRol.ADMIN);
  }

  private normalizeDate(
    value: ProfileRaw['persona_fecha_nacimiento'],
  ): string | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return value;
  }

  private toNullableNumber(value: number | string): number {
    return typeof value === 'number' ? value : Number(value);
  }

  private getRoles(usuario: UsuarioWithRoles): string[] {
    return usuario.roles?.map((usuarioRol) => usuarioRol.rol.rol) ?? [];
  }

  private buildAccessTokenPayload(
    usuario: UsuarioWithRoles,
  ): AccessTokenPayload {
    return {
      sub: usuario.id_usuario,
      correo: usuario.correo,
      usuario: usuario.usuario,
      id_persona: usuario.id_persona,
      id_usuario: usuario.id_usuario,
      roles: this.getRoles(usuario),
    };
  }

  private async generateTokens(
    usuario: UsuarioWithRoles,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = this.buildAccessTokenPayload(usuario);
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtConstants.accessSecret,
        expiresIn: jwtConstants.accessTokenExpiresIn,
      }),
      this.jwtService.signAsync(
        { sub: usuario.id_usuario },
        {
          secret: jwtConstants.refreshSecret,
          expiresIn: jwtConstants.refreshTokenExpiresIn,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private buildPublicTokenResponse(token?: string, expiresAt?: Date) {
    const payload: Record<string, unknown> = {
      message: 'Si el correo existe se enviaran instrucciones',
    };

    if (!this.isProduction() && token && expiresAt) {
      payload['token'] = token;
      payload['expiresAt'] = expiresAt.toISOString();
    }

    return payload;
  }

  private get passwordResetTtl(): number {
    return this.getNumber('PASSWORD_RESET_TOKEN_TTL', 15 * 60);
  }

  private get emailVerificationTtl(): number {
    return this.getNumber('EMAIL_VERIFICATION_TOKEN_TTL', 60 * 60);
  }

  private getNumber(key: string, fallback: number): number {
    const value = this.configService.get<string>(key);
    const parsed = value ? Number(value) : NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }
}
