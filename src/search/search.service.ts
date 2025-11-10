import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Sede } from 'src/sede/entities/sede.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Disciplina } from 'src/disciplina/entities/disciplina.entity';
import { SearchMainDto } from './dto/search-main.dto';
import { SearchFiltersDto } from './dto/search-filters.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import {
  SearchResponse,
  SearchResult,
  PaginationResult,
  FiltersInfo,
  AvailabilityResult,
} from './interfaces/search-result.interface';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Cancha)
    private readonly canchaRepository: Repository<Cancha>,
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    @InjectRepository(Disciplina)
    private readonly disciplinaRepository: Repository<Disciplina>,
  ) {}

  /**
   * BÚSQUEDA PRINCIPAL
   */
  async searchMain(dto: SearchMainDto): Promise<SearchResponse> {
    const queryBuilder = this.canchaRepository
      .createQueryBuilder('cancha')
      .leftJoinAndSelect('cancha.sede', 'sede')
      .leftJoinAndSelect('cancha.fotos', 'fotos')
      .where('cancha.eliminadoEn IS NULL')
      .andWhere('sede.eliminadoEn IS NULL');

    // Aplicar filtros de ubicación
    this.applyLocationFilters(queryBuilder, dto);

    // Aplicar filtro de disciplina - IMPORTANTE: usar innerJoin aquí
    if (dto.disciplina) {
      queryBuilder.innerJoin('cancha.parte', 'parte');
      queryBuilder.innerJoin('parte.disciplina', 'disciplina');
      await this.applyDisciplinaFilter(queryBuilder, dto.disciplina);
    } else {
      // Si no hay filtro de disciplina, cargar todas las disciplinas
      queryBuilder.leftJoinAndSelect('cancha.parte', 'parte');
      queryBuilder.leftJoinAndSelect('parte.disciplina', 'disciplina');
    }

    // Aplicar filtros de fecha/hora
    if (dto.fecha && dto.horaInicio && dto.horaFin) {
      await this.applyAvailabilityFilter(
        queryBuilder,
        dto.fecha,
        dto.horaInicio,
        dto.horaFin,
      );
    }

    // Obtener total de resultados
    const total = await queryBuilder.getCount();

    // Aplicar ordenamiento
    this.applySorting(queryBuilder, dto.sortBy || 'rating', dto.sortOrder || 'desc');

    // Aplicar paginación
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Ejecutar query
    const canchas = await queryBuilder.getMany();

    // Formatear resultados
    const results = await this.formatResults(canchas, dto);

    // Crear paginación
    const pagination = this.createPagination(page, limit, total);

    return {
      success: true,
      data: {
        results,
        pagination,
      },
    };
  }

  /**
   * BÚSQUEDA CON FILTROS AVANZADOS
   */
  async searchWithFilters(dto: SearchFiltersDto): Promise<SearchResponse> {
    const queryBuilder = this.canchaRepository
      .createQueryBuilder('cancha')
      .leftJoinAndSelect('cancha.sede', 'sede')
      .leftJoinAndSelect('cancha.fotos', 'fotos')
      .where('cancha.eliminadoEn IS NULL')
      .andWhere('sede.eliminadoEn IS NULL');

    // Aplicar filtros básicos
    this.applyLocationFilters(queryBuilder, dto);

    if (dto.disciplina) {
      queryBuilder.innerJoin('cancha.parte', 'parte');
      queryBuilder.innerJoin('parte.disciplina', 'disciplina');
      await this.applyDisciplinaFilter(queryBuilder, dto.disciplina);
    } else {
      queryBuilder.leftJoinAndSelect('cancha.parte', 'parte');
      queryBuilder.leftJoinAndSelect('parte.disciplina', 'disciplina');
    }

    if (dto.fecha && dto.horaInicio && dto.horaFin) {
      await this.applyAvailabilityFilter(
        queryBuilder,
        dto.fecha,
        dto.horaInicio,
        dto.horaFin,
      );
    }

    // Aplicar filtros avanzados
    this.applyAdvancedFilters(queryBuilder, dto);

    // Obtener total de resultados
    const total = await queryBuilder.getCount();

    // Aplicar ordenamiento y paginación
    this.applySorting(queryBuilder, dto.sortBy || 'rating', dto.sortOrder || 'desc');
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Ejecutar query
    const canchas = await queryBuilder.getMany();

    // Formatear resultados
    const results = await this.formatResults(canchas, dto);

    // Crear paginación
    const pagination = this.createPagination(page, limit, total);

    // Obtener información de filtros disponibles
    const filters = await this.getAvailableFilters(dto);

    return {
      success: true,
      data: {
        results,
        pagination,
        filters,
      },
    };
  }

  /**
   * VERIFICAR DISPONIBILIDAD DE CANCHA
   */
  async checkAvailability(dto: CheckAvailabilityDto): Promise<AvailabilityResult> {
    const cancha = await this.canchaRepository.findOne({
      where: { idCancha: dto.idCancha },
      relations: ['sede'],
    });

    if (!cancha) {
      throw new Error('Cancha no encontrada');
    }

    // Verificar horario de la cancha
    if (dto.horaInicio < cancha.horaApertura || dto.horaFin > cancha.horaCierre) {
      return {
        disponible: false,
        conflictos: [
          {
            tipo: 'horario',
            mensaje: `La cancha está abierta de ${cancha.horaApertura} a ${cancha.horaCierre}`,
          },
        ],
        horariosDisponibles: [],
      };
    }

    // Buscar conflictos con reservas existentes
    const conflictos = await this.reservaRepository
      .createQueryBuilder('reserva')
      .where('reserva.idCancha = :idCancha', { idCancha: dto.idCancha })
      .andWhere('DATE(reserva.iniciaEn) = :fecha', { fecha: dto.fecha })
      .andWhere(
        `(
          (TIME(reserva.iniciaEn) < :horaFin AND TIME(reserva.terminaEn) > :horaInicio)
        )`,
        {
          horaInicio: dto.horaInicio,
          horaFin: dto.horaFin,
        },
      )
      .getMany();

    if (conflictos.length > 0) {
      return {
        disponible: false,
        conflictos: conflictos.map((r) => ({
          idReserva: r.idReserva,
          inicio: r.iniciaEn,
          fin: r.terminaEn,
        })),
        horariosDisponibles: await this.getAvailableTimeSlots(
          dto.idCancha,
          dto.fecha,
          cancha,
        ),
      };
    }

    return {
      disponible: true,
      conflictos: [],
      horariosDisponibles: [{ inicio: dto.horaInicio, fin: dto.horaFin }],
    };
  }

  /**
   * OBTENER UBICACIONES DISPONIBLES
   */
  async getAvailableLocations() {
    const sedes = await this.sedeRepository.find({
      select: ['country', 'stateProvince', 'city', 'district'],
    });

    const countries = [...new Set(sedes.map((s) => s.country).filter(Boolean))];
    
    const statesByCountry = {};
    const citiesByState = {};
    const districtsByCity = {};

    sedes.forEach((sede) => {
      if (sede.country) {
        if (!statesByCountry[sede.country]) {
          statesByCountry[sede.country] = new Set();
        }
        if (sede.stateProvince) {
          statesByCountry[sede.country].add(sede.stateProvince);
        }
      }

      if (sede.stateProvince) {
        if (!citiesByState[sede.stateProvince]) {
          citiesByState[sede.stateProvince] = new Set();
        }
        if (sede.city) {
          citiesByState[sede.stateProvince].add(sede.city);
        }
      }

      if (sede.city) {
        if (!districtsByCity[sede.city]) {
          districtsByCity[sede.city] = new Set();
        }
        if (sede.district) {
          districtsByCity[sede.city].add(sede.district);
        }
      }
    });

    // Convertir Sets a Arrays
    const states = {};
    Object.keys(statesByCountry).forEach((country) => {
      states[country] = Array.from(statesByCountry[country]);
    });

    const cities = {};
    Object.keys(citiesByState).forEach((state) => {
      cities[state] = Array.from(citiesByState[state]);
    });

    const districts = {};
    Object.keys(districtsByCity).forEach((city) => {
      districts[city] = Array.from(districtsByCity[city]);
    });

    return {
      countries,
      states,
      cities,
      districts,
    };
  }

  /**
   * AUTOCOMPLETADO DE CIUDADES
   */
  async autocompleteCities(query: string) {
    const cities = await this.sedeRepository
      .createQueryBuilder('sede')
      .select('sede.city', 'city')
      .addSelect('COUNT(*)', 'count')
      .where('LOWER(sede.city) LIKE LOWER(:query)', { query: `%${query}%` })
      .andWhere('sede.city IS NOT NULL')
      .groupBy('sede.city')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      suggestions: cities.map((c) => ({
        value: c.city,
        count: parseInt(c.count),
      })),
    };
  }

  /**
   * AUTOCOMPLETADO DE DISTRITOS
   */
  async autocompleteDistricts(city: string, query: string) {
    const districts = await this.sedeRepository
      .createQueryBuilder('sede')
      .select('sede.district', 'district')
      .addSelect('COUNT(*)', 'count')
      .where('sede.city = :city', { city })
      .andWhere('LOWER(sede.district) LIKE LOWER(:query)', { query: `%${query}%` })
      .andWhere('sede.district IS NOT NULL')
      .groupBy('sede.district')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      suggestions: districts.map((d) => ({
        value: d.district,
        count: parseInt(d.count),
      })),
    };
  }

  // ============================================
  // MÉTODOS AUXILIARES PRIVADOS
  // ============================================

  private createBaseQuery(): SelectQueryBuilder<Cancha> {
    return this.canchaRepository
      .createQueryBuilder('cancha')
      .leftJoinAndSelect('cancha.sede', 'sede')
      .leftJoinAndSelect('cancha.fotos', 'fotos')
      .leftJoinAndSelect('cancha.parte', 'parte')
      .leftJoinAndSelect('parte.disciplina', 'disciplina')
      .where('cancha.eliminadoEn IS NULL')
      .andWhere('sede.eliminadoEn IS NULL');
  }

  private applyLocationFilters(
    queryBuilder: SelectQueryBuilder<Cancha>,
    dto: SearchMainDto | SearchFiltersDto,
  ) {
    if (dto.country) {
      queryBuilder.andWhere('sede.country = :country', { country: dto.country });
    }
    if (dto.stateProvince) {
      queryBuilder.andWhere('sede.stateProvince = :stateProvince', {
        stateProvince: dto.stateProvince,
      });
    }
    if (dto.city) {
      queryBuilder.andWhere('sede.city = :city', { city: dto.city });
    }
    if (dto.district) {
      queryBuilder.andWhere('sede.district = :district', { district: dto.district });
    }
  }

  private async applyDisciplinaFilter(
    queryBuilder: SelectQueryBuilder<Cancha>,
    disciplina: string | number,
  ) {
    if (typeof disciplina === 'number') {
      queryBuilder.andWhere('disciplina.idDisciplina = :idDisciplina', {
        idDisciplina: disciplina,
      });
    } else {
      // Buscar por nombre con LIKE para manejar variantes (Fútbol, Futbol, etc.)
      queryBuilder.andWhere('disciplina.nombre ILIKE :nombre', {
        nombre: `%${disciplina}%`,
      });
    }
  }

  private async applyAvailabilityFilter(
    queryBuilder: SelectQueryBuilder<Cancha>,
    fecha: string,
    horaInicio: string,
    horaFin: string,
  ) {
    // Verificar horario de apertura/cierre
    queryBuilder.andWhere('cancha.horaApertura <= :horaInicio', { horaInicio });
    queryBuilder.andWhere('cancha.horaCierre >= :horaFin', { horaFin });

    // Excluir canchas con reservas en conflicto usando NOT EXISTS
    queryBuilder.andWhere(
      `NOT EXISTS (
        SELECT 1 
        FROM reserva 
        WHERE reserva."idCancha" = cancha."idCancha"
          AND DATE(reserva."iniciaEn") = :fecha
          AND TIME(reserva."iniciaEn") < :horaFin
          AND TIME(reserva."terminaEn") > :horaInicio
          AND reserva."eliminadoEn" IS NULL
      )`,
    );
    
    queryBuilder.setParameter('fecha', fecha);
    queryBuilder.setParameter('horaInicio', horaInicio);
    queryBuilder.setParameter('horaFin', horaFin);
  }

  private applyAdvancedFilters(
    queryBuilder: SelectQueryBuilder<Cancha>,
    dto: SearchFiltersDto,
  ) {
    if (dto.precioMin !== undefined) {
      queryBuilder.andWhere('cancha.precio >= :precioMin', {
        precioMin: dto.precioMin,
      });
    }
    if (dto.precioMax !== undefined) {
      queryBuilder.andWhere('cancha.precio <= :precioMax', {
        precioMax: dto.precioMax,
      });
    }
    if (dto.ratingMin !== undefined) {
      queryBuilder.andWhere('cancha.ratingPromedio >= :ratingMin', {
        ratingMin: dto.ratingMin,
      });
    }
    if (dto.cubierta !== undefined) {
      queryBuilder.andWhere('cancha.cubierta = :cubierta', {
        cubierta: dto.cubierta,
      });
    }
    if (dto.superficie) {
      queryBuilder.andWhere('LOWER(cancha.superficie) LIKE LOWER(:superficie)', {
        superficie: `%${dto.superficie}%`,
      });
    }
    if (dto.iluminacion) {
      queryBuilder.andWhere('LOWER(cancha.iluminacion) LIKE LOWER(:iluminacion)', {
        iluminacion: `%${dto.iluminacion}%`,
      });
    }
    if (dto.aforoMin !== undefined) {
      queryBuilder.andWhere('cancha.aforoMax >= :aforoMin', {
        aforoMin: dto.aforoMin,
      });
    }
    if (dto.aforoMax !== undefined) {
      queryBuilder.andWhere('cancha.aforoMax <= :aforoMax', {
        aforoMax: dto.aforoMax,
      });
    }
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Cancha>,
    sortBy: string,
    sortOrder: string,
  ) {
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    switch (sortBy) {
      case 'precio':
        queryBuilder.orderBy('cancha.precio', order);
        break;
      case 'nombre':
        queryBuilder.orderBy('cancha.nombre', order);
        break;
      case 'rating':
      default:
        queryBuilder.orderBy('cancha.ratingPromedio', order);
        queryBuilder.addOrderBy('cancha.totalResenas', 'DESC');
        break;
    }
  }

  private async formatResults(
    canchas: Cancha[],
    dto: SearchMainDto | SearchFiltersDto,
  ): Promise<SearchResult[]> {
    return canchas.map((cancha) => ({
      idCancha: cancha.idCancha,
      nombre: cancha.nombre,
      precio: Number(cancha.precio),
      ratingPromedio: Number(cancha.ratingPromedio),
      totalResenas: cancha.totalResenas,
      superficie: cancha.superficie,
      cubierta: cancha.cubierta,
      dimensiones: cancha.dimensiones,
      aforoMax: cancha.aforoMax,
      horaApertura: cancha.horaApertura,
      horaCierre: cancha.horaCierre,
      fotos: cancha.fotos?.map((f) => ({
        idFoto: f.idFoto,
        urlFoto: f.urlFoto,
      })) || [],
      disciplinas: cancha.parte?.map((p) => ({
        idDisciplina: p.disciplina.idDisciplina,
        nombre: p.disciplina.nombre,
        categoria: p.disciplina.categoria,
      })) || [],
      sede: {
        idSede: cancha.sede.idSede,
        nombre: cancha.sede.nombre,
        country: cancha.sede.country,
        stateProvince: cancha.sede.stateProvince,
        city: cancha.sede.city,
        district: cancha.sede.district,
        addressLine: cancha.sede.addressLine,
        latitude: cancha.sede.latitude ? Number(cancha.sede.latitude) : null,
        longitude: cancha.sede.longitude ? Number(cancha.sede.longitude) : null,
        telefono: cancha.sede.telefono,
      },
      disponible: dto.fecha && dto.horaInicio && dto.horaFin ? true : undefined,
    }));
  }

  private createPagination(
    page: number,
    limit: number,
    total: number,
  ): PaginationResult {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  private async getAvailableFilters(
    dto: SearchMainDto | SearchFiltersDto,
  ): Promise<FiltersInfo> {
    const queryBuilder = this.createBaseQuery();
    this.applyLocationFilters(queryBuilder, dto);

    const canchas = await queryBuilder.getMany();

    // Obtener ciudades únicas
    const cities = [...new Set(canchas.map((c) => c.sede.city).filter(Boolean))];

    // Obtener distritos únicos
    const districts = [...new Set(canchas.map((c) => c.sede.district).filter(Boolean))];

    // Obtener disciplinas únicas
    const disciplinasSet = new Set<string>();
    const disciplinasMap = new Map<number, { id: number; nombre: string }>();

    canchas.forEach((c) => {
      c.parte?.forEach((p) => {
        if (!disciplinasSet.has(p.disciplina.nombre)) {
          disciplinasSet.add(p.disciplina.nombre);
          disciplinasMap.set(p.disciplina.idDisciplina, {
            id: p.disciplina.idDisciplina,
            nombre: p.disciplina.nombre,
          });
        }
      });
    });

    const disciplinas = Array.from(disciplinasMap.values());

    // Calcular rango de precios
    const precios = canchas.map((c) => Number(c.precio));
    const priceRange = {
      min: precios.length > 0 ? Math.min(...precios) : 0,
      max: precios.length > 0 ? Math.max(...precios) : 0,
    };

    return {
      availableCities: cities,
      availableDistricts: districts,
      availableDisciplines: disciplinas,
      priceRange,
    };
  }

  private async getAvailableTimeSlots(
    idCancha: number,
    fecha: string,
    cancha: Cancha,
  ): Promise<{ inicio: string; fin: string }[]> {
    // Obtener todas las reservas del día
    const reservas = await this.reservaRepository
      .createQueryBuilder('reserva')
      .where('reserva.idCancha = :idCancha', { idCancha })
      .andWhere('DATE(reserva.iniciaEn) = :fecha', { fecha })
      .orderBy('reserva.iniciaEn', 'ASC')
      .getMany();

    const slots: { inicio: string; fin: string }[] = [];
    
    // Simplemente devolver el horario completo si no hay reservas
    if (reservas.length === 0) {
      slots.push({
        inicio: cancha.horaApertura,
        fin: cancha.horaCierre,
      });
    }

    return slots;
  }
}
