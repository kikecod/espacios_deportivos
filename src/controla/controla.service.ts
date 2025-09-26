import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateControlaDto } from './dto/create-controla.dto';
import { UpdateControlaDto } from './dto/update-controla.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Controla } from './entities/controla.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ControlaService {

  constructor(
    @InjectRepository(Controla)
    private controlaRepository: Repository<Controla>,
  ) {}

  create(createControlaDto: CreateControlaDto) {
    const controla = this.controlaRepository.create(createControlaDto);
    return this.controlaRepository.save(controla);
  }

  findAll() {
    return this.controlaRepository.find({
      relations: ['controlador', 'reserva', 'paseAcceso'],
    });
  }

  async findOne(idPersonaOpe: number, idReserva: number, idPaseAcceso: number): Promise<Controla> {
    const record = await this.controlaRepository.findOne({
      where: { idPersonaOpe, idReserva, idPaseAcceso },
      relations: ['controlador', 'reserva', 'paseAcceso'],
    });
    if (!record) throw new NotFoundException("Registro no encontrado");
    return record;
  }

  update(id: number, updateControlaDto: UpdateControlaDto) {
    return this.controlaRepository.update(id, updateControlaDto);
  }

  async remove(idPersonaOpe: number, idReserva: number, idPaseAcceso: number): Promise<void> {
    const result = await this.controlaRepository.delete({ idPersonaOpe, idReserva, idPaseAcceso });
    if (result.affected === 0) {
      throw new NotFoundException("Registro no encontrado");
    }
  }
}
