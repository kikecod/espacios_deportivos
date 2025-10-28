import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IsNull,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CreateCanchaDto } from './dto/create-cancha.dto';
import { UpdateCanchaDto } from './dto/update-cancha.dto';
import { Cancha } from './entities/cancha.entity';
import { Sede } from 'src/sede/entities/sede.entity';

type CanchaResponse = ReturnType<CanchaService['mapCancha']>;

@Injectable()
export class CanchaService {
  constructor(
    @InjectRepository(Cancha)
    private readonly canchaRepository: Repository<Cancha>,
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
  ) {}

  async create(dto: CreateCanchaDto): Promise<CanchaResponse> {
    const normalized = await this.normalizeCreatePayload(dto);
    const entity = this.canchaRepository.create(normalized);
    const saved = await this.canchaRepository.save(entity);
    const withRelations = await this.findEntityOrFail(saved.id_cancha);
    return this.mapCancha(withRelations);
  }

  async findAll(): Promise<CanchaResponse[]> {
    const canchas = await this.canchaRepository.find({
      where: { eliminado_en: IsNull() },
      relations: ['sede', 'fotos'],
      order: { creado_en: 'DESC' },
    });
    return canchas.map((cancha) => this.mapCancha(cancha));
  }

  async findOne(id: number): Promise<CanchaResponse> {
    const cancha = await this.findEntityOrFail(id);
    return this.mapCancha(cancha);
  }

  async update(id: number, dto: UpdateCanchaDto): Promise<CanchaResponse> {
    const payload = await this.normalizeUpdatePayload(dto);
    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('No se proporcionaron cambios para actualizar');
    }

    await this.ensureExists(id);
    await this.canchaRepository.update(id, payload);
    const updated = await this.findEntityOrFail(id);
    return this.mapCancha(updated);
  }

  async restore(id: number) {
    const exists = await this.canchaRepository.findOne({
      where: { id_cancha: id },
      withDeleted: true,
    });
    if (!exists) {
      throw new NotFoundException('Cancha no encontrada');
    }
    await this.canchaRepository.restore(id);
    return { message: 'Cancha restaurada correctamente' };
  }

  async remove(id: number) {
    await this.ensureExists(id);
    await this.canchaRepository.softDelete(id);
    return { message: 'Cancha eliminada correctamente' };
  }

  async findBySede(id_sede: number): Promise<CanchaResponse[]> {
    const canchas = await this.canchaRepository.find({
      where: { id_sede, eliminado_en: IsNull() },
      relations: ['sede', 'fotos'],
      order: { nombre: 'ASC' },
    });
    return canchas.map((cancha) => this.mapCancha(cancha));
  }

  // Helpers -------------------------------------------------------

  private async ensureExists(id: number): Promise<void> {
    const exists = await this.canchaRepository.exists({
      where: { id_cancha: id, eliminado_en: IsNull() },
    });
    if (!exists) {
      throw new NotFoundException('Cancha no encontrada');
    }
  }

  private async findEntityOrFail(id: number): Promise<Cancha> {
    const cancha = await this.canchaRepository.findOne({
      where: { id_cancha: id },
      relations: ['sede', 'fotos'],
    });
    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }
    return cancha;
  }

  private mapCancha(cancha: Cancha) {
    return {
      id_cancha: cancha.id_cancha,
      id_sede: cancha.id_sede,
      nombre: cancha.nombre,
      superficie: cancha.superficie,
      cubierta: cancha.cubierta,
      aforoMax: cancha.aforoMax,
      dimensiones: cancha.dimensiones,
      reglasUso: cancha.reglas_uso,
      iluminacion: cancha.iluminacion,
      estado: cancha.estado,
      precio: Number(cancha.precio),
      creado_en: cancha.creado_en,
      actualizado_en: cancha.actualizado_en,
      eliminado_en: cancha.eliminado_en,
      sede: cancha.sede
        ? {
            id_sede: cancha.sede.id_sede,
            nombre: cancha.sede.nombre,
            direccion: cancha.sede.direccion,
            ciudad: cancha.sede.latitud ?? 'N/A',
            telefono: cancha.sede.telefono,
            email: cancha.sede.email,
            descripcion: cancha.sede.descripcion ?? null,
            horarioApertura: '08:00',
            horarioCierre: '22:00',
          }
        : null,
      fotos:
        cancha.fotos?.map((foto) => ({
          id_foto: foto.id_foto,
          id_cancha: foto.id_cancha,
          url_foto: foto.url_foto,
        })) ?? [],
    };
  }

  private async normalizeCreatePayload(
    dto: CreateCanchaDto,
  ): Promise<Partial<Cancha>> {
    const sede = await this.sedeRepository.findOne({
      where: { id_sede: dto.id_sede },
    });
    if (!sede) {
      throw new NotFoundException('Sede no encontrada');
    }

    const trimmed = (value: string | undefined, fallback = '') =>
      value !== undefined ? value.trim() : fallback;

    return {
      id_sede: dto.id_sede,
      sede,
      nombre: trimmed(dto.nombre),
      superficie: trimmed(dto.superficie),
      cubierta: dto.cubierta ?? false,
      aforoMax: this.ensureFiniteNumber(dto.aforoMax, 'aforoMax'),
      dimensiones: trimmed(dto.dimensiones),
      reglas_uso: trimmed(dto.reglasUso),
      iluminacion: trimmed(dto.iluminacion),
      estado: trimmed(dto.estado, 'Disponible'),
      precio: this.ensureFiniteNumber(dto.precio, 'precio'),
    };
  }

  private async normalizeUpdatePayload(
    dto: UpdateCanchaDto,
  ): Promise<QueryDeepPartialEntity<Cancha>> {
    const payload: QueryDeepPartialEntity<Cancha> = {};

    const maybeTrim = (value: unknown): string | undefined => {
      if (typeof value === 'string') {
        return value.trim();
      }
      return undefined;
    };

    if (dto.id_sede !== undefined) {
      const sede = await this.sedeRepository.findOne({
        where: { id_sede: dto.id_sede },
      });
      if (!sede) {
        throw new NotFoundException('Sede no encontrada');
      }
      payload.id_sede = dto.id_sede;
    }
    if (dto.nombre !== undefined) {
      payload.nombre = maybeTrim(dto.nombre);
    }
    if (dto.superficie !== undefined) {
      payload.superficie = maybeTrim(dto.superficie);
    }
    if (dto.cubierta !== undefined) {
      payload.cubierta = dto.cubierta;
    }
    if (dto.aforoMax !== undefined) {
      payload.aforoMax = this.ensureFiniteNumber(dto.aforoMax, 'aforoMax');
    }
    if (dto.dimensiones !== undefined) {
      payload.dimensiones = maybeTrim(dto.dimensiones);
    }
    if (dto.reglasUso !== undefined) {
      payload.reglas_uso = maybeTrim(dto.reglasUso);
    }
    if (dto.iluminacion !== undefined) {
      payload.iluminacion = maybeTrim(dto.iluminacion);
    }
    if (dto.estado !== undefined) {
      payload.estado = maybeTrim(dto.estado);
    }
    if (dto.precio !== undefined) {
      payload.precio = this.ensureFiniteNumber(dto.precio, 'precio');
    }

    return payload;
  }

  private ensureFiniteNumber(value: unknown, field: string): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new BadRequestException(`${field} debe ser un numero valido`);
    }
    return parsed;
  }
}
