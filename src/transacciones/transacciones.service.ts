import { Injectable } from '@nestjs/common';
import { CreateTransaccioneDto } from './dto/create-transaccione.dto';
import { UpdateTransaccioneDto } from './dto/update-transaccione.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaccion } from './entities/transaccion.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransaccionesService {
  constructor(
    @InjectRepository(Transaccion)
    private transaccionRepository: Repository<Transaccion>,
  ) {}

  create(createTransaccioneDto: CreateTransaccioneDto) {
    const transaccion = this.transaccionRepository.create(
      createTransaccioneDto,
    );
    return this.transaccionRepository.save(transaccion);
  }

  findAll() {
    return this.transaccionRepository.find();
  }

  findOne(id: number) {
    return this.transaccionRepository.findOneBy({ id_transaccion: id });
  }

  update(id: number, updateTransaccioneDto: UpdateTransaccioneDto) {
    return this.transaccionRepository.update(id, updateTransaccioneDto);
  }

  remove(id: number) {
    return this.transaccionRepository.delete(id);
  }
}
