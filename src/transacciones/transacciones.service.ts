import { Injectable } from '@nestjs/common';
import { CreateTransaccioneDto } from './dto/create-transaccione.dto';
import { UpdateTransaccioneDto } from './dto/update-transaccione.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaccion } from './entities/transaccion.entity';
import { TransaccionFactura } from './entities/transaccion-factura.entity';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class TransaccionesService {
  constructor(
    @InjectRepository(Transaccion)
    private readonly transaccionRepository: Repository<Transaccion>,
    @InjectRepository(TransaccionFactura)
    private readonly facturaRepository: Repository<TransaccionFactura>,
  ) {}

  async create(createTransaccioneDto: CreateTransaccioneDto) {
    const transaccion = this.transaccionRepository.create({
      ...createTransaccioneDto,
      monto_total: Number(createTransaccioneDto.monto_total),
    });
    return this.transaccionRepository.save(transaccion);
  }

  findAll() {
    return this.transaccionRepository.find({
      relations: ['cliente', 'reserva', 'facturas'],
    });
  }

  findOne(id: number) {
    return this.transaccionRepository.findOne({
      where: { id_transaccion: id },
      relations: ['cliente', 'reserva', 'facturas'],
    });
  }

  async update(id: number, updateTransaccioneDto: UpdateTransaccioneDto) {
    const updatePayload: QueryDeepPartialEntity<Transaccion> = {
      ...updateTransaccioneDto,
    };
    if (updateTransaccioneDto.monto_total !== undefined) {
      updatePayload.monto_total = Number(updateTransaccioneDto.monto_total);
    }
    await this.transaccionRepository.update(id, updatePayload);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.facturaRepository.delete({ transaccion_id: id });
    await this.transaccionRepository.delete(id);
  }
}
