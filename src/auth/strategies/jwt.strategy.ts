// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { normalizeRole } from '../utils/role.util';
import { RedisService } from 'src/common/redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    config: ConfigService,
    private readonly usuariosService: UsuariosService,
    private readonly redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    // payload firmado: { sub, correo, roles: string[] } pero verificamos contra BD
    const userId = payload?.sub;
    const email = payload?.correo;

    if (!userId) {
      this.logger.warn(`JWT sin sub: ${JSON.stringify(payload)}`);
      throw new UnauthorizedException('Token inválido');
    }

    try {
      const user = await this.usuariosService.findByIdWithRoles(userId);
      if (!user) throw new UnauthorizedException('Usuario no encontrado');

      // Normaliza roles desde BD (evita números del enum)
      const roles = (user.usuarioRoles ?? []).map((ur) => normalizeRole(ur.rol.rol));

      // Enforce inactivity window via Redis
      const inactivityMinutes = parseInt(process.env.INACTIVITY_MINUTES || '15', 10);
      const now = Date.now();
      const last = await this.redis.getLastActivity(user.idUsuario).catch(() => null);
      if (last && now - last > inactivityMinutes * 60 * 1000) {
        throw new UnauthorizedException('Sesión expirada por inactividad');
      }
      await this.redis.setLastActivity(user.idUsuario, now).catch(() => {});

      // Lo que se adjunta en req.user para guards/controllers
      return {
        sub: user.idUsuario,
        correo: user.correo,
        roles,
      };
    } catch (err) {
      this.logger.warn(`JWT válido pero usuario no encontrado/id inválido: ${userId} (${email})`);
      throw new UnauthorizedException('Usuario inválido');
    }
  }
}
