import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTrabajaDto } from './dto/create-trabaja.dto';
import { UpdateTrabajaDto } from './dto/update-trabaja.dto';
import { Trabaja } from './entities/trabaja.entity';

@Injectable()
export class TrabajaService {
  constructor(
    @InjectRepository(Trabaja)
    private readonly trabajaRepository: Repository<Trabaja>,
  ) {}

  async create(createTrabajaDto: CreateTrabajaDto): Promise<Trabaja> {
    const { idPersonaOpe, idSede } = createTrabajaDto;

    const exists = await this.trabajaRepository.findOne({
      where: { idPersonaOpe, idSede },
    });
    if (exists) {
      throw new ConflictException('La asignación ya existe');
    }

    const entity = this.trabajaRepository.create({
      idPersonaOpe,
      idSede,
      activo: true,
      asignadoDesde: createTrabajaDto['asignadoDesde'],
      asignadoHasta: createTrabajaDto['asignadoHasta'],
    });
    return this.trabajaRepository.save(entity);
  }

  findAll(): Promise<Trabaja[]> {
    return this.trabajaRepository.find({
      relations: ['controlador', 'sede'],
      where: { activo: true },
    });
  }

  async findOne(idPersonaOpe: number, idSede: number): Promise<Trabaja> {
    const trabajo = await this.trabajaRepository.findOne({
      where: { idPersonaOpe, idSede, activo: true },
      relations: ['controlador', 'sede'],
    });
    if (!trabajo) {
      throw new NotFoundException(`Trabajo (${idPersonaOpe}, ${idSede}) no encontrado`);
    }
    return trabajo;
  }

  /**
   * No tiene sentido actualizar claves primarias compuestas; se deja para compatibilidad pero no cambia PK.
   */
  async update(idPersonaOpe: number, idSede: number, updateTrabajaDto: UpdateTrabajaDto): Promise<Trabaja> {
    const trabajo = await this.trabajaRepository.findOne({
      where: { idPersonaOpe, idSede },
    });
    if (!trabajo) {
      throw new NotFoundException(`Trabajo (${idPersonaOpe}, ${idSede}) no encontrado`);
    }

    // Si intentan cambiar las claves, validar duplicado y luego guardar como nuevo estado.
    if (
      updateTrabajaDto.idPersonaOpe !== undefined &&
      updateTrabajaDto.idSede !== undefined &&
      (updateTrabajaDto.idPersonaOpe !== idPersonaOpe || updateTrabajaDto.idSede !== idSede)
    ) {
      const duplicate = await this.trabajaRepository.findOne({
        where: {
          idPersonaOpe: updateTrabajaDto.idPersonaOpe,
          idSede: updateTrabajaDto.idSede,
        },
      });
      if (duplicate) {
        throw new ConflictException('La asignación ya existe');
      }
      // eliminar la antigua y crear la nueva
      await this.trabajaRepository.delete({ idPersonaOpe, idSede });
      const newEntity = this.trabajaRepository.create({
        idPersonaOpe: updateTrabajaDto.idPersonaOpe,
        idSede: updateTrabajaDto.idSede,
        asignadoDesde: updateTrabajaDto['asignadoDesde'],
        asignadoHasta: updateTrabajaDto['asignadoHasta'],
      });
      return this.trabajaRepository.save(newEntity);
    }

    // No hay cambios en PK; simplemente devolver la relación actual
    return trabajo;
  }

  async remove(idPersonaOpe: number, idSede: number): Promise<Trabaja> {
    const trabajo = await this.trabajaRepository.findOne({
      where: { idPersonaOpe, idSede, activo: true },
    });
    if (!trabajo) {
      throw new NotFoundException(`Trabajo (${idPersonaOpe}, ${idSede}) no encontrado`);
    }
    trabajo.activo = false;
    return this.trabajaRepository.save(trabajo);
  }
}
