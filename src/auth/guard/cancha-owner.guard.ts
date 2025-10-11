import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Injectable()
export class CanchaOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(Cancha) private readonly canchaRepo: Repository<Cancha>,
    private readonly usuariosService: UsuariosService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { sub: number; roles: string[] };
    if (!user) throw new ForbiddenException('No autenticado');
    const roles = user.roles || [];
    if (roles.includes('ADMIN')) return true;
    if (!roles.includes('DUENIO')) throw new ForbiddenException('No autorizado');

    const u = await this.usuariosService.findOne(user.sub);
    const userPersonaId = u.idPersona;

    const idCancha = Number(req.params.id || req.params.idCancha || req.body?.idCancha);
    if (!idCancha) throw new ForbiddenException('Cancha inválida');
    const cancha = await this.canchaRepo.findOne({ where: { idCancha }, relations: ['sede'] });
    if (!cancha) throw new ForbiddenException('Cancha no encontrada');
    if ((cancha as any).sede?.idPersonaD !== userPersonaId) throw new ForbiddenException('No eres dueño de la cancha');
    return true;
  }
}

