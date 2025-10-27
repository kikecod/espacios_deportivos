import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateControlaDto } from './dto/create-controla.dto';
import { UpdateControlaDto } from './dto/update-controla.dto';
import { Controla } from './entities/controla.entity';

@Injectable()
export class ControlaService {
  constructor(
    @InjectRepository(Controla)
    private readonly controlaRepository: Repository<Controla>,
  ) {}

  async create(createControlaDto: CreateControlaDto): Promise<Controla> {
    const control = this.controlaRepository.create(createControlaDto);
    return this.controlaRepository.save(control);
  }

  findAll(): Promise<Controla[]> {
    return this.controlaRepository.find({
      relations: ['controlador', 'paseAcceso', 'paseAcceso.reserva'],
    });
  }

  async findOne(
    id_controlador: number,
    id_pase_acceso: number,
  ): Promise<Controla> {
    const record = await this.controlaRepository.findOne({
      where: { id_controlador, id_pase_acceso },
      relations: ['controlador', 'paseAcceso', 'paseAcceso.reserva'],
    });

    if (!record) {
      throw new NotFoundException('Registro de control inexistente');
    }

    return record;
  }

  async update(
    id_controlador: number,
    id_pase_acceso: number,
    updateControlaDto: UpdateControlaDto,
  ): Promise<Controla> {
    const where = { id_controlador, id_pase_acceso };
    const result = await this.controlaRepository.update(where, updateControlaDto);

    if (result.affected === 0) {
      throw new NotFoundException('Registro de control inexistente');
    }

    return this.findOne(id_controlador, id_pase_acceso);
  }

  async remove(id_controlador: number, id_pase_acceso: number): Promise<void> {
    const result = await this.controlaRepository.delete({
      id_controlador,
      id_pase_acceso,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Registro de control inexistente');
    }
  }
}
