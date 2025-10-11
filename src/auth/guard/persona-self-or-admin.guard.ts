import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Injectable()
export class PersonaSelfOrAdminGuard implements CanActivate {
  constructor(private readonly usuariosService: UsuariosService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { sub: number; roles: string[] };
    if (!user) throw new ForbiddenException('No autenticado');
    if (user.roles?.includes('ADMIN')) return true;
    const personaId = Number(req.params.id);
    if (!personaId) throw new ForbiddenException('ID inválido');
    const u = await this.usuariosService.findOne(user.sub);
    if (u.idPersona !== personaId) throw new ForbiddenException('No autorizado');
    return true;
  }
}

