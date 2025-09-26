// duenios.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Duenio } from './entities/duenio.entity';
import { Persona } from 'src/personas/entities/personas.entity';
import { CreateDuenioDto } from './dto/create-duenio.dto';
import { UpdateDuenioDto } from './dto/update-duenio.dto';

@Injectable()
export class DueniosService {
  constructor(
    @InjectRepository(Duenio)
    private readonly duenioRepo: Repository<Duenio>,
    @InjectRepository(Persona)
    private readonly personaRepo: Repository<Persona>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateDuenioDto) {
    // flujo en cascada: crea persona y luego duenio con idPersonaD = persona.idPersona
    return this.dataSource.transaction(async (manager) => {
      const persona = manager.create(Persona, dto.persona);
      const savedPersona = await manager.save(Persona, persona);

      const duenio = manager.create(Duenio, {
        idPersonaD: savedPersona.idPersona,
        persona: savedPersona,
        verificado: dto.verificado ?? false,
        verificadoEn: dto.verificadoEn ? new Date(dto.verificadoEn) : undefined,
        imagenCi: dto.imagenCi,
        imgfacial: dto.imgfacial,
      });

      await manager.save(Duenio, duenio);
      return duenio;
    });
  }

  findAll() {
    return this.duenioRepo.find({
      relations: ['persona'],
    });
  }

  async findOne(id: number) {
    const duenio = await this.duenioRepo.findOne({
      where: { idPersonaD: id },
      relations: ['persona'],
    });
    if (!duenio) {
      throw new NotFoundException(`Dueño #${id} no encontrado`);
    }
    return duenio;
  }

  async update(id: number, dto: UpdateDuenioDto) {
    // Si viene dto.persona, actualizamos la persona vinculada
    if (dto.persona) {
      const existente = await this.findOne(id);
      await this.personaRepo.update(existente.persona.idPersona, dto.persona);
    }

    // Preload del dueño y merge del resto de campos
    const preload = await this.duenioRepo.preload({
      idPersonaD: id,
      verificado: dto.verificado,
      verificadoEn: dto.verificadoEn ? new Date(dto.verificadoEn) : undefined,
      imagenCi: dto.imagenCi,
      imgfacial: dto.imgfacial,
    });

    if (!preload) {
      throw new NotFoundException(`Dueño #${id} no encontrado`);
    }

    await this.duenioRepo.save(preload);
    // devolver con relaciones actualizadas
    return this.findOne(id);
  }

  async remove(id: number) {
    const duenio = await this.findOne(id);
    await this.duenioRepo.remove(duenio);
    return { deleted: true };
  }
}
