import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TipoRol } from 'src/roles/rol.entity';

@Injectable()
export class AuthService {

    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService
    ) { }

    async register(registerDTO: RegisterDto) {
        const usuario = await this.usuariosService.findByCorreoLogin(registerDTO.correo);

        if (usuario) {
            throw new BadRequestException('El correo ya está registrado');
        }
        return await this.usuariosService.create(registerDTO);
    }


    async login(loginDTO: LoginDto) {
        const usuario = await this.usuariosService.findByCorreoLogin(loginDTO.correo);
        if (!usuario) {
            throw new UnauthorizedException('Email inválido');
        }

        const isValidPassword = await bcrypt.compare(loginDTO.contrasena, usuario.hashContrasena);
        if (!isValidPassword) {
            throw new UnauthorizedException('Contraseña inválida');
        }

        const payload = { correo: usuario.correo};
        const token = await this.jwtService.signAsync(payload);

        return { token, usuario: { correo: usuario.correo } };
    }

    async profile({ correo }: { correo: string }) {


        const usuario = await this.usuariosService.findByCorreo(correo);

        return { usuario}

    }
}
