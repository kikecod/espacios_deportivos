import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Persona } from './personas.entity';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';

@Injectable()
export class PersonasService {
  constructor(
    @InjectRepository(Persona)
    private personasRepository: Repository<Persona>,
  ) {}

  async create(createPersonaDto: CreatePersonaDto): Promise<Persona> {
    try {
      // Verificar si ya existe una persona con el mismo documento
      const existePersona = await this.personasRepository.findOne({
        where: { documentoNumero: createPersonaDto.documentoNumero }
      });

      if (existePersona) {
        throw new BadRequestException(
          `Ya existe una persona with documento número ${createPersonaDto.documentoNumero}`
        );
      }

      const persona = this.personasRepository.create(createPersonaDto);
      return await this.personasRepository.save(persona);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al crear la persona');
    }
  }

  async findAll(): Promise<Persona[]> {
    return await this.personasRepository.find({
      order: { creadoEn: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Persona> {
    const persona = await this.personasRepository.findOne({
      where: { idPersona: id }
    });

    if (!persona) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }

    return persona;
  }

  async findByDocumento(documentoNumero: string): Promise<Persona> {
    const persona = await this.personasRepository.findOne({
      where: { documentoNumero }
    });

    if (!persona) {
      throw new NotFoundException(`Persona con documento ${documentoNumero} no encontrada`);
    }

    return persona;
  }

  async update(id: number, updatePersonaDto: UpdatePersonaDto): Promise<Persona> {
    const persona = await this.findOne(id);

    // Si se está actualizando el número de documento, verificar que no exista
    if (updatePersonaDto.documentoNumero && updatePersonaDto.documentoNumero !== persona.documentoNumero) {
      const existePersona = await this.personasRepository.findOne({
        where: { documentoNumero: updatePersonaDto.documentoNumero }
      });

      if (existePersona) {
        throw new BadRequestException(
          `Ya existe una persona con documento número ${updatePersonaDto.documentoNumero}`
        );
      }
    }

    Object.assign(persona, updatePersonaDto);
    return await this.personasRepository.save(persona);
  }

  async remove(id: number): Promise<void> {
    const persona = await this.findOne(id);
    await this.personasRepository.remove(persona);
  }

  async count(): Promise<number> {
    return await this.personasRepository.count();
  }

  // Búsquedas adicionales
  async findByNombre(nombre: string): Promise<Persona[]> {
    return await this.personasRepository
      .createQueryBuilder('persona')
      .where('persona.nombres LIKE :nombre OR persona.paterno LIKE :nombre OR persona.materno LIKE :nombre', 
        { nombre: `%${nombre}%` })
      .getMany();
  }

  async findByGenero(genero: string): Promise<Persona[]> {
    return await this.personasRepository.find({
      where: { genero: genero as any }
    });
  }
}