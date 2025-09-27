import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCalificaCanchaDto } from './dto/create-califica_cancha.dto';
import { UpdateCalificaCanchaDto } from './dto/update-califica_cancha.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CalificaCancha } from './entities/califica_cancha.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CalificaCanchaService {

  constructor(
    @InjectRepository(CalificaCancha)
    private calificaCanchaRepository: Repository<CalificaCancha>,
  ) {}

  create(createCalificaCanchaDto: CreateCalificaCanchaDto) {
    const calificaCancha = this.calificaCanchaRepository.create(createCalificaCanchaDto);
    return this.calificaCanchaRepository.save(calificaCancha);
  }

  async findAll(): Promise<CalificaCancha[]> {
    return this.calificaCanchaRepository.find({
      relations: ['cliente', 'cancha', 'cancha.sede'],
    });
  }

  async findOne(idCliente: number, idCancha: number, idSede: number): Promise<CalificaCancha> {
    const record = await this.calificaCanchaRepository.findOne({
      where: { idCliente, idCancha, idSede },
      relations: ['cliente', 'cancha'],
    });
    if (!record) throw new NotFoundException("Calificación no encontrada");
    return record;
  }

  async update(
    idCliente: number,
    idCancha: number,
    idSede: number,
    updateCalificaCanchaDto: UpdateCalificaCanchaDto,
  ): Promise<CalificaCancha> {
    const result = await this.calificaCanchaRepository.update(
      { idCliente, idCancha, idSede },
      updateCalificaCanchaDto,
    );

    if (result.affected === 0) {
      throw new NotFoundException(`Calificación con IDs ${idCliente}/${idCancha}/${idSede} no encontrada para actualizar`);
    }

    // Devuelve el registro actualizado
    return this.findOne(idCliente, idCancha, idSede);
  }

  async remove(idCliente: number, idCancha: number, idSede: number): Promise<void> {
    const result = await this.calificaCanchaRepository.delete({ idCliente, idCancha, idSede });
    if (result.affected === 0) {
      throw new NotFoundException("Calificación no encontrada");
    }
  }
}
