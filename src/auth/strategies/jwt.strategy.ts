import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(config: ConfigService, private readonly usuariosService: UsuariosService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    // payload que firmaremos: { sub, correo, roles: string[] }
    const userId = payload?.sub;
    const email = payload?.correo;

    if (!userId) {
      this.logger.warn(`JWT sin sub: ${JSON.stringify(payload)}`);
      throw new UnauthorizedException('Token inválido');
    }

    // Validación adicional: verificar que el usuario exista y esté activo
    try {
      const user = await this.usuariosService.findByIdWithRoles(userId);
      // Optional: comprobar estado o flags adicionales (correoVerificado, estado, etc.)
      // if (!user || user.estado !== 'ACTIVE') throw new UnauthorizedException('Usuario no activo');

      // Devolver un objeto minimalista y seguro que se adjunta a req.user
      return {
        sub: user.idUsuario,
        correo: user.correo,
        roles: user.usuarioRoles?.map((ur) => ur.rol.rol) ?? [],
      };
    } catch (err) {
      this.logger.warn(`JWT valid pero usuario no encontrado/id inválido: ${userId} (${email})`);
      throw new UnauthorizedException('Usuario inválido');
    }
  }
}