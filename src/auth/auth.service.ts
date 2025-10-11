// src/auth/auth.service.ts
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsuariosService } from 'src/usuarios/usuarios.service';
import { PersonasService } from 'src/personas/personas.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';
import { jwtConstants } from './constants/jwt.constant';
import { RedisService } from '../common/redis/redis.service';

// entidades para rol y cliente
import { Rol, TipoRol } from 'src/roles/entities/rol.entity';
import { UsuarioRol } from 'src/usuario_rol/entities/usuario_rol.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Persona } from 'src/personas/entities/personas.entity';

import { normalizeRole } from './utils/role.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly personasService: PersonasService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,

    @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>,
    @InjectRepository(UsuarioRol) private readonly urRepo: Repository<UsuarioRol>,
    @InjectRepository(Cliente) private readonly clienteRepo: Repository<Cliente>,
  ) {}

  private async signAccessToken(user: { idUsuario: number; correo: string; roles?: unknown[] }) {
    const roles = (user.roles ?? []).map(normalizeRole);
    const payload = { sub: user.idUsuario, correo: user.correo, roles };
    const access_token = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: jwtConstants.accessTtl,
    });
    return { access_token };
  }

  /** Registro: Persona -> Usuario -> Cliente + rol CLIENTE */
  async register(dto: RegisterDto) {
    const exists = await this.usuariosService.findByCorreoLogin(dto.correo);
    if (exists) throw new BadRequestException('El correo ya está registrado');

    // 1) Persona
    const persona = await this.personasService.create(dto.persona);

    // 2) Usuario (UsuariosService hashea internamente)
    const usuarioDto: CreateUsuarioDto = {
      idPersona: persona.idPersona,
      usuario: dto.usuario ?? dto.correo.split('@')[0],
      correo: dto.correo,
      contrasena: dto.contrasena,
      correoVerificado: dto.correoVerificado ?? false,
    };
    const usuario = await this.usuariosService.create(usuarioDto);

    // 3) Cliente por defecto (perfil de negocio)
    await this.clienteRepo.save(
      this.clienteRepo.create({
        persona: { idPersona: persona.idPersona } as Persona,
        apodo: usuarioDto.usuario,
        nivel: 1,
        observaciones: undefined,
      }),
    );

    // 4) Rol CLIENTE por defecto
    let rolUser = await this.rolRepo.findOne({ where: { rol: TipoRol.CLIENTE } });
    if (!rolUser) {
      rolUser = await this.rolRepo.save(this.rolRepo.create({ rol: TipoRol.CLIENTE }));
    }
    await this.urRepo.save(this.urRepo.create({ idUsuario: usuario.idUsuario, idRol: rolUser.idRol }));

    // 5) Firmar access token con roles normalizados
    const withRoles = await this.usuariosService.findByCorreoWithRoles(dto.correo);
    const roles = (withRoles.usuarioRoles ?? []).map((ur) => normalizeRole(ur.rol.rol));

    const tokens = await this.signAccessToken({
      idUsuario: withRoles.idUsuario,
      correo: withRoles.correo,
      roles,
    });
    // iniciar ventana de inactividad
    await this.redis.setLastActivity(withRoles.idUsuario).catch(() => {});
    return tokens;
  }

  async login(dto: LoginDto) {
    const userWithHash = await this.usuariosService.findByCorreoLogin(dto.correo);
    if (!userWithHash) throw new UnauthorizedException('Email inválido');

    // Check lock
    const isLocked = await this.usuariosService.isLocked(userWithHash.idUsuario).catch(() => false);
    if (isLocked) throw new UnauthorizedException('Cuenta bloqueada temporalmente. Intenta más tarde.');

    const ok = await bcrypt.compare(dto.contrasena, userWithHash.hashContrasena);
    if (!ok) {
      await this.usuariosService.registerFailedLoginAttempt(userWithHash.idUsuario);
      throw new UnauthorizedException('Contraseña inválida');
    }

    // success -> reset attempts + update ultimo acceso
    await this.usuariosService.resetFailedLoginAttempts(userWithHash.idUsuario);
    await this.usuariosService.actualizarUltimoAcceso(userWithHash.idUsuario);

    const withRoles = await this.usuariosService.findByIdWithRoles(userWithHash.idUsuario);
    const roles = (withRoles.usuarioRoles ?? []).map((ur) => normalizeRole(ur.rol.rol));

    const tokens = await this.signAccessToken({
      idUsuario: withRoles.idUsuario,
      correo: withRoles.correo,
      roles,
    });
    await this.redis.setLastActivity(withRoles.idUsuario).catch(() => {});
    return tokens;
  }

  async profile(userFromToken: { sub: number; correo: string }) {
    const usuario = await this.usuariosService.findByCorreo(userFromToken.correo);
    return { usuario };
  }
}
