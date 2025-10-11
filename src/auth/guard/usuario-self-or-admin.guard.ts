import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class UsuarioSelfOrAdminGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { sub: number; roles: string[] };
    if (!user) throw new ForbiddenException('No autenticado');
    if (user.roles?.includes('ADMIN')) return true;
    const usuarioId = Number(req.params.id);
    if (!usuarioId) throw new ForbiddenException('ID inválido');
    if (usuarioId !== user.sub) throw new ForbiddenException('No autorizado');
    return true;
  }
}

