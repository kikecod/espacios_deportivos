import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateControladorDto } from './dto/create-controlador.dto';
import { UpdateControladorDto } from './dto/update-controlador.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Controlador } from './entities/controlador.entity';

@Injectable()
export class ControladorService {
  constructor(
    @InjectRepository(Controlador) 
    private controladorRepository: Repository<Controlador>,
  ) {}

  create(createControladorDto: CreateControladorDto) {
    // idSede se gestiona vía 'Trabaja'; aquí solo persistimos Controlador
    const controlador = this.controladorRepository.create(createControladorDto as any);
    return this.controladorRepository.save(controlador);
  }

  findAll(): Promise<Controlador[]> {
    return this.controladorRepository.find({
      relations: ['persona'], 
    });
  }

  async findOne(id: number): Promise<Controlador> {
    const controlador = await this.controladorRepository.findOne({
      where: { idPersonaOpe: id },
      relations: ['persona'], // Carga la entidad Persona relacionada
    });

    if (!controlador) {
      throw new NotFoundException(`Controlador con ID ${id} no encontrado.`);
    }
    return controlador;
  }

  async update(id: number, updateControladorDto: UpdateControladorDto) {
    // Usamos update, que retorna un objeto UpdateResult
    const result = await this.controladorRepository.update(
      { idPersonaOpe: id }, 
      updateControladorDto
    );

    if (result.affected === 0) {
      throw new NotFoundException(`Controlador con ID ${id} no encontrado para actualizar.`);
    }

    // Opcionalmente, puedes retornar el objeto actualizado
    return this.findOne(id);
  }

  async remove(id: number) {
    const deleteResult = await this.controladorRepository.delete({ idPersonaOpe: id });

    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Controlador con ID ${id} no encontrado para eliminar.`);
    }

    return { message: `Controlador con ID ${id} eliminado exitosamente.` };
  }
}
