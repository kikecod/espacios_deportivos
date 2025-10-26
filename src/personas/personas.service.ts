import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Persona } from './entities/personas.entity';
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
      // Verificar si ya existe una persona con el mismo documento (solo si se proporciona)
      if (createPersonaDto.documento_numero) {
        const existePersona = await this.personasRepository.findOne({
          where: { documento_numero: createPersonaDto.documento_numero },
        });

        if (existePersona) {
          throw new BadRequestException(
            `Ya existe una persona con documento número ${createPersonaDto.documento_numero}`,
          );
        }
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
      order: { creado_en: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Persona> {
    const persona = await this.personasRepository.findOne({
      where: { id_persona: id },
    });

    if (!persona) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }

    return persona;
  }

  async findByDocumento(documento_numero: string): Promise<Persona> {
    const persona = await this.personasRepository.findOne({
      where: { documento_numero },
    });

    if (!persona) {
      throw new NotFoundException(
        `Persona con documento ${documento_numero} no encontrada`,
      );
    }

    return persona;
  }

  async update(
    id: number,
    updatePersonaDto: UpdatePersonaDto,
  ): Promise<Persona> {
    const persona = await this.findOne(id);

    // Si se está actualizando el número de documento, verificar que no exista
    if (
      updatePersonaDto.documento_numero &&
      updatePersonaDto.documento_numero !== persona.documento_numero
    ) {
      const existePersona = await this.personasRepository.findOne({
        where: { documento_numero: updatePersonaDto.documento_numero },
      });

      if (existePersona) {
        throw new BadRequestException(
          `Ya existe una persona con documento número ${updatePersonaDto.documento_numero}`,
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
      .where(
        'persona.nombres LIKE :nombre OR persona.paterno LIKE :nombre OR persona.materno LIKE :nombre',
        { nombre: `%${nombre}%` },
      )
      .getMany();
  }

  async findByGenero(genero: string): Promise<Persona[]> {
    return await this.personasRepository.find({
      where: { genero: genero as any },
    });
  }
}
