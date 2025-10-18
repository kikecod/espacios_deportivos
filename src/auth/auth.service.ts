import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Rol, TipoRol } from 'src/roles/rol.entity';
import { UsuarioRolService } from 'src/usuario_rol/usuario_rol.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from './decorators/roles.decorators';
import { Repository } from 'typeorm';
import { CreateUsuarioRolDto } from 'src/usuario_rol/dto/create-usuario_rol.dto';
import { ClientesService } from 'src/clientes/clientes.service';
import { CreateClienteDto } from 'src/clientes/dto/create-cliente.dto';

@Injectable()
export class AuthService {

    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService,
        private readonly usuarioRolService: UsuarioRolService,
        private readonly clientesService: ClientesService,
        @InjectRepository(Rol)
        private readonly rolRepository: Repository<Rol>
    ) { }

    async register(registerDTO: RegisterDto) {
        const rol = await this.rolRepository.findOneBy({ rol: TipoRol.CLIENTE });
        if (!rol) {
            throw new NotFoundException("Rol CLIENTE no encontrado");
        }
        const usuario = await this.usuariosService.findByCorreoLogin(registerDTO.correo);
        if (usuario) {
            throw new BadRequestException('El correo ya está registrado');
        }

        const newUsuario = await this.usuariosService.create(registerDTO);

        const newCliente: CreateClienteDto = {
            id_cliente: newUsuario.id_persona
        };

        await this.clientesService.create(newCliente);

        const dto: CreateUsuarioRolDto = {
            id_usuario: newUsuario.id_usuario,
            id_rol: rol.id_rol
        };
        await this.usuarioRolService.create(dto);

        return newUsuario;

    }


    async login(loginDTO: LoginDto) {
        const usuario = await this.usuariosService.findByCorreoLogin(loginDTO.correo);
        if (!usuario) {
            throw new UnauthorizedException('Email inválido');
        }

        const isValidPassword = await bcrypt.compare(loginDTO.contrasena, usuario.hash_contrasena);
        if (!isValidPassword) {
            throw new UnauthorizedException('Contraseña inválida');
        }

        const payload = {
            correo: usuario.correo,
            usuario: usuario.usuario,
            id_persona: usuario.id_persona,
            id_usuario: usuario.id_usuario,
            roles: usuario.roles?.map(rol => rol.rol.rol) ?? []
        };
        const token = await this.jwtService.signAsync(payload);

        return {
            token,
            usuario: {
                correo: usuario.correo,
                usuario: usuario.usuario,
                id_persona: usuario.id_persona,
                id_usuario: usuario.id_usuario,
                roles: usuario.roles?.map(rol => rol.rol.rol) ?? []

            }
        };
    }

    async profile({ correo, roles }: { correo: string, roles: string[] }) {
        const usuario = await this.usuariosService.findByCorreo(correo);

        /*
        if(!roles.includes(TipoRol.ADMIN)) {
            throw new UnauthorizedException('No tienes permiso para acceder a este recurso');
        }*/

        return {
            correo,
            usuario: usuario.usuario,
            id_persona: usuario.id_persona,
            id_usuario: usuario.id_usuario,
            roles
        };

    }
}
