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

// entidades para rol y cliente
import { Rol, TipoRol } from 'src/roles/entities/rol.entity';
import { UsuarioRol } from 'src/usuario_rol/entities/usuario_rol.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Persona } from 'src/personas/entities/personas.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly personasService: PersonasService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,

    @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>,
    @InjectRepository(UsuarioRol) private readonly urRepo: Repository<UsuarioRol>,
    @InjectRepository(Cliente) private readonly clienteRepo: Repository<Cliente>,
  ) {}

  private async signTokens(user: { idUsuario: number; correo: string; roles?: string[] }) {
    const payload = { sub: user.idUsuario, correo: user.correo, roles: user.roles ?? [] };

    const access_token = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: jwtConstants.accessTtl,
    });

    const refresh_token = await this.jwt.signAsync({ sub: user.idUsuario }, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: jwtConstants.refreshTtl,
    });

    return { access_token, refresh_token };
  }

  /** Registro: Persona -> Usuario -> Cliente + rol USER */
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
            persona: { idPersona: persona.idPersona } as Persona, // o simplemente persona
            apodo: usuarioDto.usuario,
            nivel: 1,
            observaciones: undefined,
        }),
    );

    // 4) Rol CLIENTE por defecto (técnico)
    let rolUser = await this.rolRepo.findOne({ where: { rol: TipoRol.CLIENTE } });
    if (!rolUser) rolUser = await this.rolRepo.save(this.rolRepo.create({ rol: TipoRol.CLIENTE }));
    await this.urRepo.save(this.urRepo.create({ idUsuario: usuario.idUsuario, idRol: rolUser.idRol }));

    // 5) Firmar tokens con roles
    const withRoles = await this.usuariosService.findByCorreoWithRoles(dto.correo);
    return this.signTokens({
      idUsuario: withRoles.idUsuario,
      correo: withRoles.correo,
      roles: withRoles.usuarioRoles?.map((ur) => ur.rol.rol) ?? [],
    });
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.findByCorreoLogin(dto.correo);
    if (!usuario) throw new UnauthorizedException('Email inválido');

    const ok = await bcrypt.compare(dto.contrasena, usuario.hashContrasena);
    if (!ok) throw new UnauthorizedException('Contraseña inválida');

    const withRoles = await this.usuariosService.findByCorreoWithRoles(dto.correo);
    return this.signTokens({
      idUsuario: withRoles.idUsuario,
      correo: withRoles.correo,
      roles: withRoles.usuarioRoles?.map((ur) => ur.rol.rol) ?? [],
    });
  }

  async refresh(userId: number) {
    const user = await this.usuariosService.findByIdWithRoles(userId);
    return this.signTokens({
      idUsuario: user.idUsuario,
      correo: user.correo,
      roles: user.usuarioRoles?.map((ur) => ur.rol.rol) ?? [],
    });
  }

  async profile(userFromToken: { sub: number; correo: string }) {
    const usuario = await this.usuariosService.findByCorreo(userFromToken.correo);
    return { usuario };
  }
}
