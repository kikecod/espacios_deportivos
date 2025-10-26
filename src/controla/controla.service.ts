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

  async findOne(
    id_persona_ope: number,
    id_reserva: number,
    id_pase_acceso: number,
  ): Promise<Controla> {
    const record = await this.controlaRepository.findOne({
      where: { id_persona_ope, id_reserva, id_pase_acceso },
      relations: ['controlador', 'reserva', 'paseAcceso'],
    });
    if (!record) throw new NotFoundException('Registro CONTROLA no encontrado');
    return record;
  }

  async update(
    id_persona_ope: number,
    id_reserva: number,
    id_pase_acceso: number,
    updateControlaDto: UpdateControlaDto,
  ): Promise<Controla> {
    const whereCondition = { id_persona_ope, id_reserva, id_pase_acceso };

    const result = await this.controlaRepository.update(
      whereCondition,
      updateControlaDto,
    );

    if (result.affected === 0) {
      throw new NotFoundException(
        'Registro CONTROLA no encontrado para actualizar',
      );
    }

    // Retorna el registro actualizado
    return this.findOne(id_persona_ope, id_reserva, id_pase_acceso);
  }

  async remove(
    id_persona_ope: number,
    id_reserva: number,
    id_pase_acceso: number,
  ): Promise<void> {
    const result = await this.controlaRepository.delete({
      id_persona_ope,
      id_reserva,
      id_pase_acceso,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Registro CONTROLA no encontrado');
    }
  }
}
