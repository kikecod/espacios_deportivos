import { applyDecorators, UseGuards } from "@nestjs/common";
import { TipoRol } from "src/roles/rol.entity";
import { Roles } from "./roles.decorators";
import { AuthGuard } from "../guard/auth.guard";
import { RolesGuard } from "../guard/roles.guard";


export function Auth(roles: TipoRol[]){
    return applyDecorators(
        // spread the roles array into varargs to match Roles(...roles)
        Roles(...roles),
        UseGuards(AuthGuard, RolesGuard)
    )
}