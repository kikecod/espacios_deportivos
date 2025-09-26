// sede.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sede } from './entities/sede.entity';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';

@Injectable()
export class SedeService {
  constructor(
    @InjectRepository(Sede)
    private readonly sedeRepo: Repository<Sede>,
  ) {}

  async create(dto: CreateSedeDto) {
    // Si en tu DTO vienen fechas como string ISO, conviértelas aquí si hace falta
    const sede = this.sedeRepo.create({
      ...dto,
    });
    return this.sedeRepo.save(sede);
  }

  findAll() {
    // Trae dueño y canchas (canchas ya está eager: true en tu entidad)
    return this.sedeRepo.find({
      relations: ['duenio'],
      withDeleted: false,
      order: { idSede: 'ASC' },
    });
  }

  async findOne(id: number) {
    const sede = await this.sedeRepo.findOne({
      where: { idSede: id },
      relations: ['duenio'],
      withDeleted: false,
    });
    if (!sede) throw new NotFoundException(`Sede #${id} no encontrada`);
    return sede;
  }

  async update(id: number, dto: UpdateSedeDto) {
    const sede = await this.findOne(id);
    Object.assign(sede, dto);
    return this.sedeRepo.save(sede);
  }

  async remove(id: number) {
    const sede = await this.findOne(id);
    // Soft delete, porque tienes @DeleteDateColumn()
    await this.sedeRepo.softRemove(sede);
    return { deleted: true };
  }
}
