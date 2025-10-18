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

  async findOne(id_reserva: number, id_cliente: number) {
    const participa = await this.participaRepo.findOne({
      where: { id_reserva, id_cliente },
      relations: ['reserva', 'cliente'],
    });

    if (!participa) {
      throw new NotFoundException(
        `Participa no encontrada (reserva #${id_reserva}, cliente #${id_cliente})`,
      );
    }

    return participa;
  }

  async update(
    id_reserva: number,
    id_cliente: number,
    dto: UpdateParticipaDto,
  ) {
    const participa = await this.findOne(id_reserva, id_cliente);

    Object.assign(participa, dto);
    return this.participaRepo.save(participa);
  }

  async remove(id_reserva: number, id_cliente: number) {
    const participa = await this.findOne(id_reserva, id_cliente);
    await this.participaRepo.remove(participa);
    return { deleted: true };
  }
}
