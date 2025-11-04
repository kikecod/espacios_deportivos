import { Injectable } from '@nestjs/common';
import { CreateTransaccioneDto } from './dto/create-transaccione.dto';
import { UpdateTransaccioneDto } from './dto/update-transaccione.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaccion } from './entities/transaccion.entity';
import { Repository } from 'typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';

@Injectable()
export class TransaccionesService {

  constructor(
    @InjectRepository(Transaccion)
    private transaccionRepository: Repository<Transaccion>,
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>
  ){}

  async create(createTransaccioneDto: CreateTransaccioneDto) {
    const reserva = await this.reservaRepository.findOneBy({ idReserva: createTransaccioneDto.idReserva });
    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }

    const transaccion = this.transaccionRepository.create({
      ...createTransaccioneDto,
      id_Reserva: reserva.idReserva,
    });

    return this.transaccionRepository.save(transaccion);
  }

  findAll() {
    return this.transaccionRepository.find();
  }

  findOne(id: number) {
    return this.transaccionRepository.findOneBy({ idTransaccion: id });
  }

  update(id: number, updateTransaccioneDto: UpdateTransaccioneDto) {
    return this.transaccionRepository.update(id, updateTransaccioneDto)
  }

  remove(id: number) {
    return this.transaccionRepository.delete(id);
  }
}
