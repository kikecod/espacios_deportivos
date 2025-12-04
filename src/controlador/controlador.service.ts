import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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

  async create(createControladorDto: CreateControladorDto) {
    // Verificar si ya existe
    const existe = await this.controladorRepository.findOne({
      where: { idPersonaOpe: createControladorDto.idPersonaOpe }
    });

    if (existe) {
      throw new ConflictException(
        `La persona ${createControladorDto.idPersonaOpe} ya está registrada como controlador`
      );
    }

    const controlador = this.controladorRepository.create(createControladorDto);
    return this.controladorRepository.save(controlador);
  }

  findAll(): Promise<Controlador[]> {
    return this.controladorRepository.find({
      where: { activo: true },
      relations: ['persona'], 
    });
  }

  async findOne(id: number, incluirInactivos = false): Promise<Controlador> {
    const where: any = { idPersonaOpe: id };
    
    if (!incluirInactivos) {
      where.activo = true;
    }

    const controlador = await this.controladorRepository.findOne({
      where,
      relations: ['persona'], // Carga la entidad Persona relacionada
    });

    if (!controlador) {
      throw new NotFoundException(`Controlador con ID ${id} no encontrado.`);
    }
    return controlador;
  }

  async findByPersona(idPersona: number): Promise<Controlador | null> {
    const controlador = await this.controladorRepository.findOne({
      where: { idPersonaOpe: idPersona },
      relations: ['persona'],
    });
    
    return controlador; // Puede ser null
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
    const controlador = await this.findOne(id, true);

    // Baja lógica
    controlador.activo = false;
    await this.controladorRepository.save(controlador);

    return { 
      message: `Controlador con ID ${id} desactivado exitosamente.`,
      controlador 
    };
  }

  async reactivar(id: number): Promise<Controlador> {
    const controlador = await this.controladorRepository.findOne({
      where: { idPersonaOpe: id },
    });

    if (!controlador) {
      throw new NotFoundException(`Controlador con ID ${id} no encontrado.`);
    }

    if (controlador.activo) {
      return controlador; // Ya está activo
    }

    controlador.activo = true;
    await this.controladorRepository.save(controlador);

    console.log(`✅ Controlador ${id} reactivado`);
    return controlador;
  }
}
