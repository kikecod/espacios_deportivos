import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participa } from './entities/participa.entity';
import { CreateParticipaDto } from './dto/create-participa.dto';
import { UpdateParticipaDto } from './dto/update-participa.dto';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

@Injectable()
export class ParticipaService {
  constructor(
    @InjectRepository(Participa)
    private readonly participaRepo: Repository<Participa>,
    @InjectRepository(Reserva)
    private readonly reservaRepo: Repository<Reserva>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
  ) {}

  async create(dto: CreateParticipaDto) {
    const reserva = await this.reservaRepo.findOne({ where: { idReserva: dto.idReserva } });
    if(!reserva){
      throw new NotFoundException(`Reserva #${dto.idReserva} no encontrada`);
    }

    const cliente = await this.clienteRepo.findOne({ where: { idCliente: dto.idCliente } });
    if(!cliente){
      throw new NotFoundException(`Cliente #${dto.idCliente} no encontrado`);
    }

    const participa = this.participaRepo.create(dto);
    return this.participaRepo.save(participa);
  }

  findAll() {
    return this.participaRepo.find({
      relations: ['cliente'],
    });
  }

  async findOneByReserva(idReserva: number) {
    const participa = await this.participaRepo.find({
      where: { idReserva },
      relations: ['reserva', 'cliente'],
    });
    if (!participa || participa.length === 0) {
      throw new NotFoundException(
        `No hay participantes encontrados en la reserva #${idReserva}`,
      );
    }

    return participa.map(p => p.cliente);
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
