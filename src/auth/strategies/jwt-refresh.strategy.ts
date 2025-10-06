import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

const cookieExtractor = (req: any) => {
  let token = null;
  if (req && req.cookies && req.cookies.rt) token = req.cookies.rt;
  // fallback to Authorization header
  if (!token) token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  return token;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  validate(payload: any) {
    // solo necesitamos el sub para emitir nuevos tokens
    return { sub: payload.sub };
  }
}
