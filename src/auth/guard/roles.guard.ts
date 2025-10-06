// src/auth/guard/roles.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator'; // ojo: misma ruta/constante

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const { user } = ctx.switchToHttp().getRequest();
    const roles: string[] = user?.roles ?? [];

    const ok = required.some((r) => roles.includes(r));
    if (!ok) throw new ForbiddenException('No tienes permiso para este recurso');
    return true;
  }
}
