// src/auth/guard/self-or-admin.guard.ts (o donde esté)
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientesService } from 'src/clientes/clientes.service';

@Injectable()
export class SelfOrAdminGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly clientesService: ClientesService, // <- tipado correcto
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { sub: number; roles: string[] };
    const idCliente = Number(req.params.id);

    if (user?.roles?.includes('ADMIN')) return true;
    if (!idCliente || !user?.sub) throw new ForbiddenException('No permitido');

    const esDueno = await this.clientesService.isOwner(user.sub, idCliente);
    if (!esDueno) throw new ForbiddenException('No eres dueño del recurso');
    return true;
  }
}
