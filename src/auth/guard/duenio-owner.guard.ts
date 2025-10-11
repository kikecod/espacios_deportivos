import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sede } from 'src/sede/entities/sede.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Injectable()
export class DuenioOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(Sede) private readonly sedeRepo: Repository<Sede>,
    @InjectRepository(Cancha) private readonly canchaRepo: Repository<Cancha>,
    private readonly usuariosService: UsuariosService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { sub: number; roles: string[] };
    if (!user) throw new ForbiddenException('No autenticado');

    const roles = user.roles || [];
    if (!roles.includes('DUENIO') && !roles.includes('ADMIN')) {
      throw new ForbiddenException('No tienes rol adecuado');
    }

    const usuario = await this.usuariosService.findOne(user.sub);
    const userPersonaId = usuario.idPersona;

    // Create: verifica body.idSede
    if (req.method === 'POST' && req.body?.idSede) {
      const sede = await this.sedeRepo.findOne({ where: { idSede: Number(req.body.idSede) } });
      if (!sede) throw new ForbiddenException('Sede no encontrada');
      if (roles.includes('ADMIN')) return true;
      if (sede.idPersonaD !== userPersonaId) throw new ForbiddenException('No eres dueño de la sede');
      return true;
    }

    // Update/Delete: verifica param :id de cancha
    const canchaId = Number(req.params?.id);
    if (!canchaId) throw new ForbiddenException('Cancha inválida');
    const cancha = await this.canchaRepo.findOne({ where: { idCancha: canchaId }, relations: ['sede'] });
    if (!cancha) throw new ForbiddenException('Cancha no encontrada');
    if (roles.includes('ADMIN')) return true;
    if ((cancha as any).sede?.idPersonaD !== userPersonaId) {
      throw new ForbiddenException('No eres dueño de la cancha');
    }
    return true;
  }
}

