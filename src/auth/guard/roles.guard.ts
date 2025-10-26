import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorators';
import { TipoRol } from 'src/roles/rol.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { roles?: string[] } }>();
    const userRoles = request.user?.roles ?? [];

    if (userRoles.includes(TipoRol.ADMIN)) {
      return true;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [];
    return allowedRoles.some((role) => userRoles.includes(role));
  }
}
