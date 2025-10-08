import { SetMetadata } from "@nestjs/common";
import { TipoRol } from "src/roles/rol.entity";

export const ROLES_KEY = 'roles';
export const Roles = (roles: TipoRol[]) => SetMetadata(ROLES_KEY, roles);