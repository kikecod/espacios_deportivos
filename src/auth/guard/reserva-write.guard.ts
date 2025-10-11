import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { ClientesService } from 'src/clientes/clientes.service';

@Injectable()
export class ReservaWriteGuard implements CanActivate {
  constructor(
    @InjectRepository(Reserva) private readonly reservaRepo: Repository<Reserva>,
    @InjectRepository(Cancha) private readonly canchaRepo: Repository<Cancha>,
    private readonly usuariosService: UsuariosService,
    private readonly clientesService: ClientesService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { sub: number; roles: string[] };
    if (!user) throw new ForbiddenException('No autenticado');
    const roles = user.roles || [];
    if (roles.includes('ADMIN')) return true; // Admin todo

    // POST: solo CLIENTE dueño (crea su propia reserva)
    if (req.method === 'POST') {
      if (!roles.includes('CLIENTE')) throw new ForbiddenException('Solo cliente puede crear');
      const idCliente = Number(req.body?.idCliente);
      if (!idCliente) throw new ForbiddenException('idCliente requerido');
      const cliente = await this.clientesService.findByUsuarioId(user.sub);
      if (!cliente || cliente.idCliente !== idCliente) throw new ForbiddenException('No eres dueño del cliente');
      return true;
    }

    // PATCH/DELETE
    const reservaId = Number(req.params?.id);
    if (!reservaId) throw new ForbiddenException('Reserva inválida');
    const reserva = await this.reservaRepo.findOne({ where: { idReserva: reservaId }, relations: ['cliente', 'cliente.persona', 'cliente.persona.usuario', 'cancha', 'cancha.sede'] });
    if (!reserva) throw new ForbiddenException('Reserva no encontrada');

    // CLIENTE: puede modificar/cancelar solo su reserva
    if (roles.includes('CLIENTE')) {
      const reservaUsuarioId = (reserva as any).cliente?.persona?.usuario?.idUsuario;
      if (reservaUsuarioId !== user.sub) throw new ForbiddenException('No eres dueño de la reserva');
      return true;
    }

    // DUENIO: puede modificar/cancelar reservas de sus canchas
    if (roles.includes('DUENIO')) {
      const userPersona = await this.usuariosService.findOne(user.sub);
      const duenoPersonaId = userPersona.idPersona;
      const sedePersona = (reserva as any).cancha?.sede?.idPersonaD;
      if (sedePersona !== duenoPersonaId) throw new ForbiddenException('No eres dueño de la sede de la reserva');
      return true;
    }

    throw new ForbiddenException('No autorizado');
  }
}

