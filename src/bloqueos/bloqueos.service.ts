import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloqueoCancha } from './entities/bloqueo_cancha.entity';
import { CreateBloqueoDto } from './dto/create-bloqueo.dto';
import { Cancha } from 'src/cancha/entities/cancha.entity';

@Injectable()
export class BloqueosService {
  constructor(
    @InjectRepository(BloqueoCancha)
    private readonly bloqueoRepo: Repository<BloqueoCancha>,
    @InjectRepository(Cancha)
    private readonly canchaRepo: Repository<Cancha>,
  ) {}

  async create(dto: CreateBloqueoDto, duenioId?: number) {
    const cancha = await this.canchaRepo.findOne({
      where: { id_cancha: dto.id_cancha },
      relations: ['sede'],
    });
    if (!cancha) throw new NotFoundException('Cancha no encontrada');

    // Verificar propiedad de la sede si tenemos duenioId
    if (duenioId && cancha.sede && cancha.sede.id_persona_d !== duenioId) {
      throw new UnauthorizedException('No puedes bloquear canchas de otra sede');
    }

    const inicio = new Date(dto.inicia_en);
    const fin = new Date(dto.termina_en);
    if (fin <= inicio) {
      throw new ConflictException('El rango horario es inválido');
    }

    // Conflicto con bloqueos existentes
    const conflicto = await this.bloqueoRepo
      .createQueryBuilder('bloqueo')
      .where('bloqueo.id_cancha = :id_cancha', { id_cancha: dto.id_cancha })
      .andWhere('bloqueo.eliminado_en IS NULL')
      .andWhere('(bloqueo.inicia_en < :fin AND bloqueo.termina_en > :inicio)', {
        inicio,
        fin,
      })
      .getOne();

    if (conflicto) {
      throw new ConflictException('La cancha ya está bloqueada en ese horario');
    }

    const bloqueo = this.bloqueoRepo.create({
      id_cancha: dto.id_cancha,
      inicia_en: inicio,
      termina_en: fin,
      motivo: dto.motivo ?? null,
    });
    const guardado = await this.bloqueoRepo.save(bloqueo);
    return guardado;
  }

  async findByCancha(id_cancha: number) {
    const list = await this.bloqueoRepo.find({
      where: { id_cancha },
      order: { inicia_en: 'ASC' },
    });
    return list.map((b) => ({
      id_bloqueo: b.id_bloqueo,
      id_cancha: b.id_cancha,
      inicia_en: b.inicia_en,
      termina_en: b.termina_en,
      motivo: b.motivo,
    }));
  }

  async remove(id_bloqueo: number, duenioId?: number) {
    const bloqueo = await this.bloqueoRepo.findOne({
      where: { id_bloqueo },
      relations: ['cancha', 'cancha.sede'],
    });
    if (!bloqueo) throw new NotFoundException('Bloqueo no encontrado');
    if (duenioId && bloqueo.cancha?.sede?.id_persona_d !== duenioId) {
      throw new UnauthorizedException('No puedes eliminar bloqueos de otra sede');
    }
    await this.bloqueoRepo.softDelete(id_bloqueo);
    return { message: 'Bloqueo eliminado' };
  }
}
