import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participa } from './entities/participa.entity';
import { CreateParticipaDto } from './dto/create-participa.dto';
import { UpdateParticipaDto } from './dto/update-participa.dto';

@Injectable()
export class ParticipaService {
  constructor(
    @InjectRepository(Participa)
    private readonly participaRepo: Repository<Participa>,
  ) {}

  async create(dto: CreateParticipaDto) {
    const participa = this.participaRepo.create(dto);
    return this.participaRepo.save(participa);
  }

  findAll() {
    return this.participaRepo.find({
      relations: ['reserva', 'cliente'],
    });
  }

  async findOne(idReserva: number, idCliente: number) {
    const participa = await this.participaRepo.findOne({
      where: { idReserva, idCliente },
      relations: ['reserva', 'cliente'],
    });

    if (!participa) {
      throw new NotFoundException(
        `Participa no encontrada (reserva #${idReserva}, cliente #${idCliente})`,
      );
    }

    return participa;
  }

  async update(
    idReserva: number,
    idCliente: number,
    dto: UpdateParticipaDto,
  ) {
    const participa = await this.findOne(idReserva, idCliente);

    Object.assign(participa, dto);
    return this.participaRepo.save(participa);
  }

  async remove(idReserva: number, idCliente: number) {
    const participa = await this.findOne(idReserva, idCliente);
    await this.participaRepo.remove(participa);
    return { deleted: true };
  }
}
