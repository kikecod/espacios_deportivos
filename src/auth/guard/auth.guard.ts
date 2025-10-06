import { AuthGuard } from '@nestjs/passport';

export class JwtAuthGuard extends AuthGuard('jwt') {}
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}

