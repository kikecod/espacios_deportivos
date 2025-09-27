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
    if (!record) throw new NotFoundException("Registro CONTROLA no encontrado");
    return record;
  }

  async update(
    idPersonaOpe: number,
    idReserva: number,
    idPaseAcceso: number,
    updateControlaDto: UpdateControlaDto,
  ): Promise<Controla> {
    const whereCondition = { idPersonaOpe, idReserva, idPaseAcceso };
    
    const result = await this.controlaRepository.update(
      whereCondition,
      updateControlaDto,
    );

    if (result.affected === 0) {
      throw new NotFoundException('Registro CONTROLA no encontrado para actualizar');
    }

    // Retorna el registro actualizado
    return this.findOne(idPersonaOpe, idReserva, idPaseAcceso);
  }

  async remove(idPersonaOpe: number, idReserva: number, idPaseAcceso: number): Promise<void> {
    const result = await this.controlaRepository.delete({ idPersonaOpe, idReserva, idPaseAcceso });
    if (result.affected === 0) {
      throw new NotFoundException("Registro CONTROLA no encontrado");
    }
  }
}
