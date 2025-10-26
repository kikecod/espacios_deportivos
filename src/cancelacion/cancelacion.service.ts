// cancelacion.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Cancelacion } from './entities/cancelacion.entity';
import { CreateCancelacionDto } from './dto/create-cancelacion.dto';
import { UpdateCancelacionDto } from './dto/update-cancelacion.dto';
import { Reserva } from 'src/reservas/entities/reserva.entity';

@Injectable()
export class CancelacionService {
  constructor(
    @InjectRepository(Cancelacion)
    private readonly cancelacionRepo: Repository<Cancelacion>,

    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateCancelacionDto) {
    return this.dataSource.transaction(async (manager) => {
      const reserva = await manager.getRepository(Reserva).findOne({
        where: { id_reserva: dto.id_reserva },
        relations: ['cliente'],
        withDeleted: true,
      });

      if (!reserva) {
        throw new NotFoundException(`Reserva #${dto.id_reserva} no encontrada`);
      }

      if (reserva.cliente && reserva.cliente.id_cliente !== dto.id_cliente) {
        throw new BadRequestException(
          `La reserva #${dto.id_reserva} no pertenece al cliente #${dto.id_cliente}`,
        );
      }

      if (!reserva.eliminado_en) {
        await manager.getRepository(Reserva).softRemove(reserva);
      }

      const cancelacion = manager.getRepository(Cancelacion).create({ ...dto });
      return manager.getRepository(Cancelacion).save(cancelacion);
    });
  }

  findAll() {
    return this.cancelacionRepo.find({ relations: ['cliente', 'reserva'] });
  }

  async findOne(id: number) {
    const cancelacion = await this.cancelacionRepo.findOne({
      where: { id_cancelacion: id },
      relations: ['cliente', 'reserva'],
    });
    if (!cancelacion)
      throw new NotFoundException(`Cancelación #${id} no encontrada`);
    return cancelacion;
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
