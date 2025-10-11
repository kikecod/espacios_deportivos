import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Injectable()
export class ReservaOwnerOrAdminGuard implements CanActivate {
  constructor(
    @InjectRepository(Reserva) private readonly reservaRepo: Repository<Reserva>,
    private readonly usuariosService: UsuariosService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { sub: number; roles: string[] };
    if (!user) throw new ForbiddenException('No autenticado');

    const roles = user.roles || [];
    if (roles.includes('ADMIN')) return true; // Admin acceso total

    const reservaId = Number(req.params.id);
    if (!reservaId) throw new ForbiddenException('Reserva inválida');

    const u = await this.usuariosService.findOne(user.sub);
    const reserva = await this.reservaRepo.findOne({ where: { idReserva: reservaId }, relations: ['cliente', 'cliente.persona', 'cliente.persona.usuario'] });
    if (!reserva) throw new ForbiddenException('Reserva no encontrada');

    // Dueño si su usuario coincide con el usuario de la persona del cliente de la reserva
    const reservaUsuarioId = (reserva as any).cliente?.persona?.usuario?.idUsuario;
    if (reservaUsuarioId !== u.idUsuario) throw new ForbiddenException('No eres dueño de la reserva');
    return true;
  }
}

