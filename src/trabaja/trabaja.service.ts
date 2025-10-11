import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTrabajaDto } from './dto/create-trabaja.dto';
import { UpdateTrabajaDto } from './dto/update-trabaja.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trabaja } from './entities/trabaja.entity';
import { Controlador } from 'src/controlador/entities/controlador.entity';
import { Sede } from 'src/sede/entities/sede.entity';

@Injectable()
export class TrabajaService {
  constructor(
    @InjectRepository(Trabaja)
    private readonly trabajaRepository: Repository<Trabaja>,
    @InjectRepository(Controlador)
    private readonly controladorRepository: Repository<Controlador>,
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
  ) {}

  async create(createTrabajaDto: CreateTrabajaDto) {
    // Validar controlador (idPersonaOpe) y sede
    const controlador = await this.controladorRepository.findOneBy({ idPersonaOpe: createTrabajaDto.idPersonaOpe });
    if (!controlador) throw new NotFoundException('Controlador no encontrado');

    const sede = await this.sedeRepository.findOneBy({ idSede: createTrabajaDto.idSede });
    if (!sede) throw new NotFoundException('Sede no encontrada');

    const exists = await this.trabajaRepository.findOne({ where: { idPersonaOpe: createTrabajaDto.idPersonaOpe, idSede: createTrabajaDto.idSede } });
    if (exists) throw new BadRequestException('El registro de trabajo ya existe');

    const toCreate: Partial<Trabaja> = {
      idPersonaOpe: createTrabajaDto.idPersonaOpe,
      idSede: createTrabajaDto.idSede,
      fechaInicio: new Date(createTrabajaDto.fechaInicio),
      fechaFin: null as any,
      activo: true,
    };

    const created = this.trabajaRepository.create(toCreate as Trabaja);
    return await this.trabajaRepository.save(created);
  }

  async findAll() {
    return await this.trabajaRepository.find();
  }

  async findOne(idPersonaOpe: number, idSede: number) {
    const trabaja = await this.trabajaRepository.findOne({ where: { idPersonaOpe, idSede } });
    if (!trabaja) throw new NotFoundException('Registro trabaja no encontrado');
    return trabaja;
  }

  async update(idPersonaOpe: number, idSede: number, updateTrabajaDto: UpdateTrabajaDto) {
    const trabaja = await this.trabajaRepository.findOne({ where: { idPersonaOpe, idSede } });
    if (!trabaja) throw new NotFoundException('Registro trabaja no encontrado');

    if (updateTrabajaDto.fechaInicio) trabaja.fechaInicio = new Date(updateTrabajaDto.fechaInicio as any);
    if ((updateTrabajaDto as any).fechaFin) trabaja.fechaFin = new Date((updateTrabajaDto as any).fechaFin as any);
    if ((updateTrabajaDto as any).activo !== undefined) trabaja.activo = (updateTrabajaDto as any).activo;

    return await this.trabajaRepository.save(trabaja);
  }

  async remove(idPersonaOpe: number, idSede: number) {
    const trabaja = await this.trabajaRepository.findOne({ where: { idPersonaOpe, idSede } });
    if (!trabaja) throw new NotFoundException('Registro trabaja no encontrado');

    await this.trabajaRepository.delete({ idPersonaOpe, idSede });
    return { ok: true };
  }
}
