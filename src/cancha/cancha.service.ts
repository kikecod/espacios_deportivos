import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCanchaDto } from './dto/create-cancha.dto';
import { UpdateCanchaDto } from './dto/update-cancha.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cancha } from './entities/cancha.entity';
import { Sede } from 'src/sede/entities/sede.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';

@Injectable()
export class CanchaService {

  constructor(
    @InjectRepository(Cancha)
    private readonly canchaRepository: Repository<Cancha>,
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>
  ) { }

  async create(createCanchaDto: CreateCanchaDto): Promise<Cancha> {
    const sede = await this.sedeRepository.findOneBy({ idSede: createCanchaDto.idSede });
    if (!sede) {
      throw new NotFoundException('Sede no encontrada');
    }

    const cancha = this.canchaRepository.create({
      ...createCanchaDto,
      id_Sede: sede.idSede,
    });

    return this.canchaRepository.save(cancha);
  }

  async findAll() {
    return await this.canchaRepository.find();
  }

  async findOne(id: number) {
    const cancha = await this.canchaRepository.findOne({
      where: { idCancha: id },
      relations: ['sede', 'fotos'],
    });
    
    if (!cancha) {
      throw new NotFoundException("Cancha no encontrada");
    }

    // Transformar al formato esperado por el frontend
    return {
      idCancha: cancha.idCancha,
      id_Sede: cancha.id_Sede,
      nombre: cancha.nombre,
      superficie: cancha.superficie,
      cubierta: cancha.cubierta,
      aforoMax: cancha.aforoMax,
      dimensiones: cancha.dimensiones,
      reglasUso: cancha.reglasUso,
      iluminacion: cancha.iluminacion,
      estado: cancha.estado,
      precio: cancha.precio.toString(),
      creadoEn: cancha.creadoEn,
      actualizadoEn: cancha.actualizadoEn,
      eliminadoEn: cancha.eliminadoEn,
      fotos: cancha.fotos?.map(foto => ({
        idFoto: foto.idFoto,
        idCancha: foto.idCancha,
        urlFoto: foto.urlFoto,
      })) || [],
      sede: cancha.sede ? {
        idSede: cancha.sede.idSede,
        nombre: cancha.sede.nombre,
        direccion: cancha.sede.direccion,
        ciudad: cancha.sede.latitud || 'N/A', // Temporal: usar latitud como ciudad
        telefono: cancha.sede.telefono,
        email: cancha.sede.email,
        horarioApertura: '06:00', // Valor por defecto
        horarioCierre: '23:00', // Valor por defecto
        descripcion: cancha.sede.descripcion,
      } : null,
    };
  }

  async update(id: number, updateCanchaDto: UpdateCanchaDto) {
    const exists = await this.canchaRepository.exist({ where: { idCancha: id } });
    if (!exists) {
      throw new NotFoundException("Cancha no encontrada");
    }

    return await this.canchaRepository.update(id, updateCanchaDto);
  }

  async restore(id: number){
    const exists = await this.canchaRepository.exist({ where: { idCancha: id }, withDeleted: true });
    if (!exists) {
      throw new NotFoundException("Cancha no encontrada");
    }

    return await this.canchaRepository.restore(id);
  }

  async remove(id: number) {
    const exists = await this.canchaRepository.exist({ where: { idCancha: id } });
    if (!exists) {
      throw new NotFoundException("Cancha no encontrada");
    }
    return await this.canchaRepository.softDelete(id);
  }

  async busqueda(filtros: {
    ubicacion?: string;
    fecha?: string;
    hora?: string;
    deporte?: string;
    page?: number;
    limit?: number;
  }) {
    const query = this.canchaRepository
      .createQueryBuilder('cancha')
      .leftJoinAndSelect('cancha.sede', 'sede')
      .leftJoinAndSelect('cancha.fotos', 'fotos')
      .leftJoinAndSelect('cancha.parte', 'parte')
      .leftJoinAndSelect('parte.disciplina', 'disciplina')
      .where('cancha.estado = :estado', { estado: 'Disponible' })
      .andWhere('cancha.eliminadoEn IS NULL');

    // Filtro por zona/ubicación
    if (filtros.ubicacion) {
      query.andWhere('sede.zona = :zona', { zona: filtros.ubicacion });
    }

    // Filtro por deporte (a través de Disciplina)
    if (filtros.deporte) {
      query.andWhere('disciplina.nombre = :deporte', { deporte: filtros.deporte });
    }

    // Filtro por disponibilidad (fecha + hora)
    if (filtros.fecha) {
      if (filtros.hora) {
        // Si se proporciona hora, buscar disponibilidad en ese horario específico
        const fechaHoraInicio = new Date(`${filtros.fecha}T${filtros.hora}:00`);
        
        // Validar que la fecha sea válida
        if (isNaN(fechaHoraInicio.getTime())) {
          throw new Error(`Fecha u hora inválida: fecha=${filtros.fecha}, hora=${filtros.hora}`);
        }
        
        // Subquery para excluir canchas con reservas en ese horario
        const subQuery = this.reservaRepository
          .createQueryBuilder('reserva')
          .select('reserva.idCancha')
          .where('DATE(reserva.iniciaEn) = :fecha', { fecha: filtros.fecha })
          .andWhere('reserva.iniciaEn <= :horaInicio', { horaInicio: fechaHoraInicio })
          .andWhere('reserva.terminaEn > :horaInicio', { horaInicio: fechaHoraInicio })
          .andWhere('reserva.estado != :cancelada', { cancelada: 'Cancelada' })
          .andWhere('reserva.eliminadoEn IS NULL')
          .getQuery();

        query.andWhere(`cancha.idCancha NOT IN (${subQuery})`);
        query.setParameter('fecha', filtros.fecha);
        query.setParameter('horaInicio', fechaHoraInicio);
        query.setParameter('cancelada', 'Cancelada');
      }
      // Si solo hay fecha sin hora, no filtrar por disponibilidad horaria
      // (mostrar todas las canchas, independiente de sus reservas)
    }

    // Paginación
    const page = filtros.page || 1;
    const limit = filtros.limit || 20;
    query.skip((page - 1) * limit).take(limit);

    const [canchas, total] = await query.getManyAndCount();

    return {
      total,
      page,
      limit,
      canchas: canchas.map(cancha => ({
        idCancha: cancha.idCancha,
        nombre: cancha.nombre,
        precio: cancha.precio.toString(),
        estado: cancha.estado,
        sede: {
          idSede: cancha.sede.idSede,
          nombre: cancha.sede.nombre,
          direccion: cancha.sede.direccion,
          zona: cancha.sede.zona,
          latitud: cancha.sede.latitud,
          longitud: cancha.sede.longitud,
        },
        fotos: cancha.fotos?.map(foto => ({
          idFoto: foto.idFoto,
          urlFoto: foto.urlFoto,
        })) || [],
        disciplinas: cancha.parte?.map(p => p.disciplina.nombre) || [],
      })),
    };
  }

  async obtenerDisponibilidad(idCancha: number, fecha: string) {
    const cancha = await this.canchaRepository.findOne({
      where: { idCancha },
      relations: ['sede'],
    });

    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }

    // Obtener todas las reservas de ese día que no estén canceladas
    const reservas = await this.reservaRepository
      .createQueryBuilder('reserva')
      .where('reserva.idCancha = :idCancha', { idCancha })
      .andWhere('DATE(reserva.iniciaEn) = :fecha', { fecha })
      .andWhere('reserva.eliminadoEn IS NULL')
      .andWhere('reserva.estado != :cancelada', { cancelada: 'Cancelada' })
      .getMany();

    // Generar horarios disponibles (6:00 - 22:00)
    const horarios: Array<{ hora: string; disponible: boolean; precio: string }> = [];
    for (let h = 6; h <= 22; h++) {
      const hora = `${h.toString().padStart(2, '0')}:00`;
      const fechaHoraInicio = new Date(`${fecha}T${hora}:00`);
      const fechaHoraFin = new Date(fechaHoraInicio.getTime() + 60 * 60 * 1000); // +1 hora

      // Verificar si está ocupada
      const ocupada = reservas.some(r => {
        const iniciaEn = new Date(r.iniciaEn);
        const terminaEn = new Date(r.terminaEn);
        return iniciaEn < fechaHoraFin && terminaEn > fechaHoraInicio;
      });

      horarios.push({
        hora,
        disponible: !ocupada,
        precio: cancha.precio.toString(),
      });
    }

    return {
      idCancha: cancha.idCancha,
      fecha,
      disponible: horarios.some(h => h.disponible),
      horariosDisponibles: horarios,
    };
  }
}
