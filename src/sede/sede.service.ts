import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sede } from './entities/sede.entity';
import { Repository } from 'typeorm';
import { Duenio } from 'src/duenio/entities/duenio.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { join } from 'path';
import { existsSync } from 'fs';

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
   * Obtener todas las sedes con información completa para página de inicio
   * Público - No requiere autenticación
   */
  async getSedesInicio() {
    const sedes = await this.sedeRepository.find({
      where: { estado: 'Activo', verificada: true },
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

  async updateVerificada(id: number, verificada: boolean) {
    const exists = await this.sedeRepository.exists({ where: { idSede: id } });
    if (!exists) {
      throw new NotFoundException("Sede no encontrada");
    }
    await this.sedeRepository.update(id, { verificada });
    return { message: 'Estado de verificación actualizado', idSede: id, verificada };
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

  // ============================================
  // MÉTODOS PARA LICENCIA DE FUNCIONAMIENTO
  // ============================================

  /**
   * Actualizar la ruta de la licencia de funcionamiento
   */
  async updateLicencia(idSede: number, filename: string) {
    const sede = await this.sedeRepository.findOne({
      where: { idSede },
    });

    if (!sede) {
      throw new NotFoundException(`Sede con ID ${idSede} no encontrada`);
    }

    const licenciaPath = `uploads/licencias/${filename}`;
    await this.sedeRepository.update(idSede, {
      LicenciaFuncionamiento: licenciaPath,
    });

    return {
      message: 'Licencia de funcionamiento actualizada exitosamente',
      idSede,
      rutaLicencia: licenciaPath,
    };
  }

  /**
   * Obtener la ruta completa de la licencia de funcionamiento
   */
  async getLicenciaPath(idSede: number): Promise<string | null> {
    const sede = await this.sedeRepository.findOne({
      where: { idSede },
      select: ['idSede', 'LicenciaFuncionamiento'],
    });

    if (!sede) {
      throw new NotFoundException(`Sede con ID ${idSede} no encontrada`);
    }

    if (!sede.LicenciaFuncionamiento) {
      return null;
    }

    const fullPath = join(process.cwd(), sede.LicenciaFuncionamiento);
    
    if (!existsSync(fullPath)) {
      throw new NotFoundException('El archivo de licencia no existe en el servidor');
    }

    return fullPath;
  }
}
