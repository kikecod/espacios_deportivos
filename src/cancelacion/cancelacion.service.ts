// cancelacion.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Cancelacion } from './entities/cancelacion.entity';
import { CreateCancelacionDto } from './dto/create-cancelacion.dto';
import { UpdateCancelacionDto } from './dto/update-cancelacion.dto';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Injectable()
export class CancelacionService {
  constructor(
    @InjectRepository(Cancelacion)
    private readonly cancelacionRepo: Repository<Cancelacion>,

    private readonly dataSource: DataSource,
    private readonly usuariosService: UsuariosService,
  ) {}

  async create(dto: CreateCancelacionDto) {
    return this.dataSource.transaction(async (manager) => {
      const reserva = await manager.getRepository(Reserva).findOne({
        where: { idReserva: dto.idReserva },
        relations: ['cliente'],
        withDeleted: true,
      });

      if (!reserva) {
        throw new NotFoundException(`Reserva #${dto.idReserva} no encontrada`);
      }

      if (reserva.cliente && reserva.cliente.idCliente !== dto.idCliente) {
        throw new BadRequestException(
          `La reserva #${dto.idReserva} no pertenece al cliente #${dto.idCliente}`,
        );
      }

      if (!reserva.eliminadoEn) {
        await manager.getRepository(Reserva).softRemove(reserva);
      }

      const cancelacion = manager.getRepository(Cancelacion).create({ ...dto });
      return manager.getRepository(Cancelacion).save(cancelacion);
    });
  }

  findAll() {
    return this.cancelacionRepo.find({ relations: ['cliente', 'reserva'] });
  }

  async findAllScoped(user: { sub: number; roles: string[] }) {
    if (user?.roles?.includes('ADMIN')) return this.findAll();
    const qb = this.cancelacionRepo.createQueryBuilder('c').leftJoinAndSelect('c.reserva', 'r').leftJoinAndSelect('c.cliente', 'cl');
    if (user?.roles?.includes('DUENIO')) {
      const u = await this.usuariosService.findOne(user.sub);
      return qb
        .innerJoin('r.cancha', 'ca')
        .innerJoin('ca.sede', 's')
        .where('s.idPersonaD = :pid', { pid: u.idPersona })
        .getMany();
    }
    return qb
      .innerJoin('cl.persona', 'p')
      .innerJoin('p.usuario', 'u')
      .where('u.idUsuario = :uid', { uid: user.sub })
      .getMany();
  }

  async findOne(id: number) {
    const cancelacion = await this.cancelacionRepo.findOne({
      where: { idCancelacion: id },
      relations: ['cliente', 'reserva'],
    });
    if (!cancelacion) throw new NotFoundException(`Cancelación #${id} no encontrada`);
    return cancelacion;
  }

  async findOneScoped(id: number, user: { sub: number; roles: string[] }) {
    if (user?.roles?.includes('ADMIN')) return this.findOne(id);
    const qb = this.cancelacionRepo.createQueryBuilder('c').where('c.idCancelacion = :id', { id }).leftJoinAndSelect('c.reserva', 'r').leftJoinAndSelect('c.cliente', 'cl');
    if (user?.roles?.includes('DUENIO')) {
      const u = await this.usuariosService.findOne(user.sub);
      return qb.innerJoin('r.cancha', 'ca').innerJoin('ca.sede', 's').andWhere('s.idPersonaD = :pid', { pid: u.idPersona }).getOne();
    }
    return qb.innerJoin('cl.persona', 'p').innerJoin('p.usuario', 'u').andWhere('u.idUsuario = :uid', { uid: user.sub }).getOne();
  }

  async update(id: number, dto: UpdateCancelacionDto) {
    const cancelacion = await this.findOne(id);
    Object.assign(cancelacion, dto);
    return this.cancelacionRepo.save(cancelacion);
  }

  async remove(id: number) {
    const cancelacion = await this.findOne(id);
    await this.cancelacionRepo.remove(cancelacion);
    return { deleted: true };
  }
}
