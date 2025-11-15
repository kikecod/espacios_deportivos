import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sede } from './entities/sede.entity';
import { Repository } from 'typeorm';
import { Duenio } from 'src/duenio/entities/duenio.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';

@Injectable()
export class SedeService {

  constructor(
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
    @InjectRepository(Duenio)
    private readonly duenioRepository: Repository<Duenio>,
    @InjectRepository(Cancha)
    private readonly canchaRepository: Repository<Cancha>,
  ) { }

  async create(createSedeDto: CreateSedeDto): Promise<Sede>{
    const duenio = await this.duenioRepository.findOneBy({ idPersonaD: createSedeDto.idPersonaD });
    if (!duenio) {
      throw new NotFoundException("Dueño no encontrado");
    }

    const sede = this.sedeRepository.create({
      ...createSedeDto,
      idPersonaD: duenio.idPersonaD
    });

    return await this.sedeRepository.save(sede);
  }

  async findAll() {
    
    const a = await this.sedeRepository.find();

    return a
  }

  /**
   * Obtener listado de sedes con filtros y paginación
   */
  async findAllWithFilters(filtros: {
    buscar?: string;
    ciudad?: string;
    estado?: string;
    verificada?: boolean;
    activa?: boolean;
    idDuenio?: number;
    page?: number;
    limit?: number;
    ordenarPor?: string;
    ordenDireccion?: 'asc' | 'desc';
  }) {
    const { 
      buscar, 
      ciudad, 
      estado, 
      verificada, 
      activa, 
      idDuenio, 
      page = 1, 
      limit = 12,
      ordenarPor = 'idSede',
      ordenDireccion = 'desc'
    } = filtros;

    const queryBuilder = this.sedeRepository
      .createQueryBuilder('sede')
      .leftJoinAndSelect('sede.duenio', 'duenio')
      .leftJoinAndSelect('duenio.persona', 'persona')
      .leftJoinAndSelect('sede.canchas', 'canchas')
      .where('sede.eliminadoEn IS NULL'); // Solo sedes no eliminadas

    // Filtro por búsqueda (nombre o descripción)
    if (buscar) {
      queryBuilder.andWhere(
        '(LOWER(sede.nombre) LIKE LOWER(:buscar) OR LOWER(sede.descripcion) LIKE LOWER(:buscar))',
        { buscar: `%${buscar}%` }
      );
    }

    // Filtro por ciudad
    if (ciudad) {
      queryBuilder.andWhere('LOWER(sede.city) LIKE LOWER(:ciudad)', { 
        ciudad: `%${ciudad}%` 
      });
    }

    // Filtro por estado (provincia)
    if (estado) {
      queryBuilder.andWhere('LOWER(sede.stateProvince) LIKE LOWER(:estado)', { 
        estado: `%${estado}%` 
      });
    }

    // Filtro por verificación
    if (verificada !== undefined) {
      queryBuilder.andWhere('sede.verificada = :verificada', { verificada });
    }

    // Filtro por estado activo/inactivo
    if (activa !== undefined) {
      queryBuilder.andWhere('sede.inactivo = :inactivo', { inactivo: !activa });
    }

    // Filtro por dueño
    if (idDuenio) {
      queryBuilder.andWhere('sede.idPersonaD = :idDuenio', { idDuenio });
    }

    // Ordenamiento
    let ordenCampo = 'sede.idSede';
    if (ordenarPor === 'nombre') ordenCampo = 'sede.nombre';
    else if (ordenarPor === 'fecha') ordenCampo = 'sede.creadoEn';
    else if (ordenarPor === 'calificacion') ordenCampo = 'sede.ratingPromedioSede';
    
    queryBuilder.orderBy(ordenCampo, ordenDireccion.toUpperCase() as 'ASC' | 'DESC');

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Ejecutar consulta
    const [sedes, total] = await queryBuilder.getManyAndCount();

    // Formatear respuesta
    const sedesFormateadas = sedes.map(sede => ({
      idSede: sede.idSede,
      nombre: sede.nombre,
      descripcion: sede.descripcion,
      direccion: sede.addressLine,
      ciudad: sede.city,
      city: sede.city,
      distrito: sede.district,
      district: sede.district,
      estado: sede.stateProvince,
      latitud: sede.latitude,
      longitud: sede.longitude,
      telefono: sede.telefono,
      email: sede.email,
      verificada: sede.verificada,
      activa: !sede.inactivo,
      inactivo: sede.inactivo,
      idDuenio: sede.idPersonaD,
      duenio: sede.duenio ? {
        idUsuario: sede.duenio.idPersonaD,
        usuario: sede.duenio.persona?.nombres || '',
        correo: sede.email,
        persona: {
          nombre: sede.duenio.persona?.nombres || '',
          apellidoPaterno: sede.duenio.persona?.paterno || '',
          apellidoMaterno: sede.duenio.persona?.materno || '',
        }
      } : undefined,
      totalCanchas: sede.canchas?.length || 0,
      promedioCalificacion: Number(sede.ratingPromedioSede) || 0,
      totalResenas: sede.totalResenasSede || 0,
      totalReservas: 0, // TODO: Implementar si tienes relación con reservas
      creadoEn: sede.creadoEn,
      actualizadoEn: sede.actualizadoEn,
    }));

    return {
      sedes: sedesFormateadas,
      total,
      pagina: page,
      limite: limit,
      totalPaginas: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener todas las sedes con información completa para página de inicio
   * Público - No requiere autenticación
   */
  async getSedesInicio() {
    const sedes = await this.sedeRepository.find({
      where: { estado: 'Activo' },
      relations: ['fotos', 'duenio', 'duenio.persona', 'canchas', 'canchas.parte', 'canchas.parte.disciplina', 'canchas.fotos'],
    });

    return Promise.all(sedes.map(async (sede) => {
      // Calcular estadísticas
      const estadisticas = await this.calcularEstadisticasSede(sede);

      // Obtener foto principal (primera foto de sede o primera de cancha)
      let fotoPrincipal: string | null = null;
      const fotosSede = sede.fotos?.filter(f => f.tipo === 'sede') || [];
      
      if (fotosSede.length > 0) {
        fotoPrincipal = fotosSede[0].urlFoto;
      } else {
        const primeraFotoCancha = sede.canchas
          ?.flatMap(c => c.fotos || [])
          .find(f => f?.urlFoto);
        if (primeraFotoCancha) {
          fotoPrincipal = primeraFotoCancha.urlFoto;
        }
      }

      // Preparar array de fotos con orden
      const todasLasFotos = [
        ...(fotosSede.map((f, index) => ({
          idFoto: f.idFoto,
          urlFoto: f.urlFoto,
          tipo: f.tipo,
          orden: index + 1,
        }))),
        ...(sede.canchas
          ?.flatMap(c => c.fotos || [])
          .map((f, index) => ({
            idFoto: f.idFoto,
            urlFoto: f.urlFoto,
            tipo: 'cancha' as const,
            orden: fotosSede.length + index + 1,
          })) || []),
      ];

      return {
        idSede: sede.idSede,
        nombre: sede.nombre,
        descripcion: sede.descripcion,
        country: sede.country,
        stateProvince: sede.stateProvince,
        city: sede.city,
        district: sede.district,
        addressLine: sede.addressLine,
        latitude: sede.latitude,
        longitude: sede.longitude,
        telefono: sede.telefono,
        email: sede.email,
        verificada: sede.verificada || false,
        fotoPrincipal,
        fotos: todasLasFotos,
        estadisticas,
        duenio: {
          idUsuario: sede.duenio.idPersonaD,
          nombre: sede.duenio.persona?.nombres || '',
          apellido: sede.duenio.persona?.paterno || '',
          correo: sede.email,
          telefono: sede.duenio.persona?.telefono || sede.telefono,
          avatar: sede.duenio.persona?.urlFoto || null,
        },
      };
    }));
  }

  async findSedeByDuenio(idPersonaD: number) {
    const sede = await this.sedeRepository.find({ where: { idPersonaD } });
    if (!sede) {
      throw new NotFoundException("Sede no encontrada para el dueño especificado");
    }
    return sede;
  }

  async findOne(id: number) {
    const exists = await this.sedeRepository.exists({ where: { idSede: id } });
    if (!exists) {
      throw new NotFoundException("Sede no encontrada");
    }
    return await this.sedeRepository.findOneBy({ idSede: id })
  }

  /**
   * Obtener una sede con toda su información para el panel de admin
   */
  async findOneAdmin(id: number) {
    const sede = await this.sedeRepository.findOne({
      where: { idSede: id },
      relations: ['duenio', 'duenio.persona', 'canchas'],
    });

    if (!sede) {
      throw new NotFoundException("Sede no encontrada");
    }

    return {
      idSede: sede.idSede,
      nombre: sede.nombre,
      descripcion: sede.descripcion,
      direccion: sede.addressLine,
      ciudad: sede.city,
      city: sede.city,
      distrito: sede.district,
      district: sede.district,
      estado: sede.stateProvince,
      latitud: sede.latitude,
      longitud: sede.longitude,
      telefono: sede.telefono,
      email: sede.email,
      politicas: sede.politicas,
      NIT: sede.NIT,
      LicenciaFuncionamiento: sede.LicenciaFuncionamiento,
      verificada: sede.verificada,
      activa: !sede.inactivo,
      inactivo: sede.inactivo,
      estadoSede: sede.estado,
      idDuenio: sede.idPersonaD,
      duenio: sede.duenio ? {
        idUsuario: sede.duenio.idPersonaD,
        usuario: sede.duenio.persona?.nombres || '',
        correo: sede.email,
        persona: {
          nombre: sede.duenio.persona?.nombres || '',
          apellidoPaterno: sede.duenio.persona?.paterno || '',
          apellidoMaterno: sede.duenio.persona?.materno || '',
        }
      } : undefined,
      totalCanchas: sede.canchas?.length || 0,
      promedioCalificacion: Number(sede.ratingPromedioSede) || 0,
      totalResenas: sede.totalResenasSede || 0,
      creadoEn: sede.creadoEn,
      actualizadoEn: sede.actualizadoEn,
    };
  }

  async update(id: number, updateSedeDto: UpdateSedeDto) {
    const exists = await this.sedeRepository.exists({ where: { idSede: id } });
    if (!exists) {
      throw new NotFoundException("Sede no encontrada");
    }
    return await this.sedeRepository.update(id, updateSedeDto);
  }

  async restore(id: number){
    const exists = await this.sedeRepository.exist({ where: { idSede: id }, withDeleted: true });
    if (!exists) {
      throw new NotFoundException("Cancha no encontrada");
    }

    return await this.sedeRepository.restore(id);
  }

  async remove(id: number) {
    const exists = await this.sedeRepository.exists({ where: { idSede: id } });
    if (!exists) {
      throw new NotFoundException("Sede no encontrada");
    }
    return await this.sedeRepository.softDelete(id);
  }

  // ============================================
  // MÉTODOS ADMINISTRATIVOS
  // ============================================

  /**
   * Verificar una sede (solo admin)
   */
  async verificar(id: number) {
    const sede = await this.sedeRepository.findOne({ where: { idSede: id } });
    if (!sede) {
      throw new NotFoundException("Sede no encontrada");
    }

    await this.sedeRepository.update(id, { 
      verificada: true,
      inactivo: false,
      estado: 'Activo'
    });

    return {
      mensaje: 'Sede verificada exitosamente',
      sede: await this.sedeRepository.findOne({ where: { idSede: id } }),
    };
  }

  /**
   * Rechazar verificación de una sede
   */
  async rechazarVerificacion(id: number, motivo: string) {
    const sede = await this.sedeRepository.findOne({ where: { idSede: id } });
    if (!sede) {
      throw new NotFoundException("Sede no encontrada");
    }

    await this.sedeRepository.update(id, { 
      verificada: false,
      inactivo: true,
      estado: 'Inactivo'
    });

    return {
      mensaje: 'Verificación de sede rechazada',
      motivo,
      sede: await this.sedeRepository.findOne({ where: { idSede: id } }),
    };
  }

  /**
   * Activar una sede
   */
  async activar(id: number) {
    const sede = await this.sedeRepository.findOne({ where: { idSede: id } });
    if (!sede) {
      throw new NotFoundException("Sede no encontrada");
    }

    await this.sedeRepository.update(id, { estado: 'Activo' });

    return {
      mensaje: 'Sede activada exitosamente',
      sede: await this.sedeRepository.findOne({ where: { idSede: id } }),
    };
  }

  /**
   * Desactivar una sede
   */
  async desactivar(id: number, motivo: string, temporal: boolean = false) {
    const sede = await this.sedeRepository.findOne({ where: { idSede: id } });
    if (!sede) {
      throw new NotFoundException("Sede no encontrada");
    }

    await this.sedeRepository.update(id, { 
      inactivo: true,
      estado: 'Inactivo' 
    });

    return {
      mensaje: temporal 
        ? 'Sede desactivada temporalmente' 
        : 'Sede desactivada',
      motivo,
      temporal,
      sede: await this.sedeRepository.findOne({ where: { idSede: id } }),
    };
  }

  /**
   * Reactivar una sede
   */
  async reactivar(id: number) {
    const sede = await this.sedeRepository.findOne({ where: { idSede: id } });
    if (!sede) {
      throw new NotFoundException("Sede no encontrada");
    }

    await this.sedeRepository.update(id, { estado: 'Activo' });

    return {
      mensaje: 'Sede reactivada exitosamente',
      sede: await this.sedeRepository.findOne({ where: { idSede: id } }),
    };
  }

  /**
   * Obtener estadísticas de una sede específica
   */
  async getEstadisticasSede(id: number) {
    const sede = await this.sedeRepository.findOne({
      where: { idSede: id },
      relations: ['canchas', 'canchas.parte', 'canchas.parte.disciplina'],
    });

    if (!sede) {
      throw new NotFoundException("Sede no encontrada");
    }

    const estadisticas = await this.calcularEstadisticasSede(sede);

    return {
      idSede: sede.idSede,
      nombre: sede.nombre,
      estadisticas,
    };
  }

  // ============================================
  // NUEVOS MÉTODOS PARA SISTEMA DE BÚSQUEDA POR SEDES
  // ============================================

  /**
   * Obtener detalle completo de una sede (SIN canchas)
   * Público - No requiere autenticación
   */
  async findOneDetalle(idSede: number) {
    const sede = await this.sedeRepository.findOne({
      where: { idSede, estado: 'Activo' },
      relations: ['fotos', 'duenio', 'duenio.persona', 'canchas', 'canchas.parte', 'canchas.parte.disciplina'],
    });

    if (!sede) {
      throw new NotFoundException(`Sede con ID ${idSede} no encontrada o no está activa`);
    }

    // Calcular estadísticas
    const estadisticas = await this.calcularEstadisticasSede(sede);

    // Obtener fotos (prioridad: fotos de sede, sino fotos de canchas)
    const fotos = await this.obtenerFotosVisualizacion(idSede);

    return {
      sede: {
        idSede: sede.idSede,
        nombre: sede.nombre,
        descripcion: sede.descripcion,
        country: sede.country,
        stateProvince: sede.stateProvince,
        city: sede.city,
        district: sede.district,
        addressLine: sede.addressLine,
        latitude: sede.latitude,
        longitude: sede.longitude,
        telefono: sede.telefono,
        email: sede.email,
        politicas: sede.politicas,
        estado: sede.estado,
        NIT: sede.NIT,
        fotos,
        duenio: {
          idPersonaD: sede.duenio.idPersonaD,
          nombre: sede.duenio.persona?.nombres || 'Dueño',
          telefono: sede.duenio.persona?.telefono,
        },
        estadisticas,
      },
    };
  }

  /**
   * Obtener todas las canchas de una sede específica
   * Público - No requiere autenticación
   */
  async findCanchasBySede(idSede: number) {
    const sede = await this.sedeRepository.findOne({
      where: { idSede },
      select: ['idSede', 'nombre'],
    });

    if (!sede) {
      throw new NotFoundException(`Sede con ID ${idSede} no encontrada`);
    }

    // Obtener todas las canchas de la sede usando QueryBuilder
    const canchas = await this.canchaRepository
      .createQueryBuilder('cancha')
      .leftJoinAndSelect('cancha.parte', 'parte')
      .leftJoinAndSelect('parte.disciplina', 'disciplina')
      .leftJoinAndSelect('cancha.fotos', 'fotos')
      .where('cancha.idSede = :idSede', { idSede })
      .getMany();

    return {
      idSede: sede.idSede,
      nombreSede: sede.nombre,
      canchas: canchas.map(cancha => ({
        idCancha: cancha.idCancha,
        nombre: cancha.nombre,
        superficie: cancha.superficie,
        cubierta: cancha.cubierta,
        dimensiones: cancha.dimensiones,
        precio: cancha.precio,
        horaApertura: cancha.horaApertura,
        horaCierre: cancha.horaCierre,
        estado: cancha.estado,
        ratingPromedio: cancha.ratingPromedio,
        totalResenas: cancha.totalResenas,
        disciplinas: cancha.parte?.map(p => ({
          idDisciplina: p.disciplina.idDisciplina,
          nombre: p.disciplina.nombre,
          categoria: p.disciplina.categoria,
        })) || [],
        fotos: cancha.fotos?.map(f => ({
          idFoto: f.idFoto,
          url: f.urlFoto,
        })) || [],
      })),
      total: canchas.length,
    };
  }

  /**
   * Calcular estadísticas de una sede
   */
  private async calcularEstadisticasSede(sede: Sede) {
    const canchas = sede.canchas || [];

    // Deportes únicos disponibles
    const deportesSet = new Set<string>();
    canchas.forEach(cancha => {
      cancha.parte?.forEach(p => {
        if (p.disciplina?.nombre) {
          deportesSet.add(p.disciplina.nombre);
        }
      });
    });

    // Precios
    const precios = canchas.map(c => Number(c.precio)).filter(p => p > 0);
    const precioDesde = precios.length > 0 ? Math.min(...precios) : 0;
    const precioHasta = precios.length > 0 ? Math.max(...precios) : 0;

    // Rating promedio de canchas
    const canchasConRating = canchas.filter(c => Number(c.ratingPromedio) > 0);
    const ratingCanchas = canchasConRating.length > 0
      ? canchasConRating.reduce((sum, c) => sum + Number(c.ratingPromedio), 0) / canchasConRating.length
      : 0;

    // Total de reseñas de canchas
    const totalResenasCanchas = canchas.reduce((sum, c) => sum + (c.totalResenas || 0), 0);

    return {
      totalCanchas: canchas.length,
      deportesDisponibles: Array.from(deportesSet),
      precioDesde,
      precioHasta,
      ratingGeneral: Number(sede.ratingPromedioSede) || 0,
      ratingCanchas: Number(ratingCanchas.toFixed(2)),
      ratingFinal: Number(sede.ratingFinal) || 0,
      totalResenasSede: sede.totalResenasSede || 0,
      totalResenasCanchas,
    };
  }

  /**
   * Obtener fotos para visualización (sede o fallback a canchas)
   */
  private async obtenerFotosVisualizacion(idSede: number) {
    const sede = await this.sedeRepository.findOne({
      where: { idSede },
      relations: ['fotos', 'canchas', 'canchas.fotos'],
    });

    if (!sede) return [];

    // Prioridad 1: Fotos de la sede
    const fotosSede = sede.fotos?.filter(f => f.tipo === 'sede') || [];
    if (fotosSede.length > 0) {
      return fotosSede.map(f => ({
        idFoto: f.idFoto,
        tipo: f.tipo,
        url: f.urlFoto,
      }));
    }

    // Prioridad 2: Fotos de canchas (fallback)
    const fotosCanchas = sede.canchas
      ?.flatMap(c => c.fotos || [])
      .slice(0, 5) || [];

    return fotosCanchas.map(f => ({
      idFoto: f.idFoto,
      tipo: 'cancha',
      url: f.urlFoto,
      esBackup: true,
    }));
  }
}
