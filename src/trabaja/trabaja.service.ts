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
    // Validar controlador (id_persona_ope) y sede
  const controlador = await this.controladorRepository.findOneBy({ id_persona_ope: createTrabajaDto.id_persona_ope });
    if (!controlador) throw new NotFoundException('Controlador no encontrado');

  const sede = await this.sedeRepository.findOneBy({ id_sede: createTrabajaDto.id_sede });
    if (!sede) throw new NotFoundException('Sede no encontrada');

    const exists = await this.trabajaRepository.findOne({ where: { id_persona_ope: createTrabajaDto.id_persona_ope, id_sede: createTrabajaDto.id_sede } });
    if (exists) throw new BadRequestException('El registro de trabajo ya existe');

    const toCreate: Partial<Trabaja> = {
      id_persona_ope: createTrabajaDto.id_persona_ope,
      id_sede: createTrabajaDto.id_sede,
      fecha_inicio: new Date(createTrabajaDto.fecha_inicio),
      fecha_fin: null as any,
      activo: true,
    };

    const created = this.trabajaRepository.create(toCreate as Trabaja);
    return await this.trabajaRepository.save(created);
  }

  async findAll() {
    return await this.trabajaRepository.find();
  }

  async findOne(id_persona_ope: number, id_sede: number) {
    const trabaja = await this.trabajaRepository.findOne({ where: { id_persona_ope, id_sede } });
    if (!trabaja) throw new NotFoundException('Registro trabaja no encontrado');
    return trabaja;
  }

  async update(id_persona_ope: number, id_sede: number, updateTrabajaDto: UpdateTrabajaDto) {
    const trabaja = await this.trabajaRepository.findOne({ where: { id_persona_ope, id_sede } });
    if (!trabaja) throw new NotFoundException('Registro trabaja no encontrado');

    if (updateTrabajaDto.fecha_inicio) trabaja.fecha_inicio = new Date(updateTrabajaDto.fecha_inicio as any);
    if ((updateTrabajaDto as any).fecha_fin) trabaja.fecha_fin = new Date((updateTrabajaDto as any).fecha_fin as any);
    if ((updateTrabajaDto as any).activo !== undefined) trabaja.activo = (updateTrabajaDto as any).activo;

    return await this.trabajaRepository.save(trabaja);
  }

  async remove(id_persona_ope: number, id_sede: number) {
    const trabaja = await this.trabajaRepository.findOne({ where: { id_persona_ope, id_sede } });
    if (!trabaja) throw new NotFoundException('Registro trabaja no encontrado');

    await this.trabajaRepository.delete({ id_persona_ope, id_sede });
    return { ok: true };
  }
}
