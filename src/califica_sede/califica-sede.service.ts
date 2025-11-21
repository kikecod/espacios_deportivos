import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalificaSede } from './entities/califica-sede.entity';
import { CreateCalificaSedeDto } from './dto/create-califica-sede.dto';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Sede } from 'src/sede/entities/sede.entity';

@Injectable()
export class CalificaSedeService {
  
  constructor(
    @InjectRepository(CalificaSede)
    private readonly calificaSedeRepository: Repository<CalificaSede>,
    
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
  ) {}

  /**
   * Crear una calificación de sede
   */
  async create(idCliente: number, createDto: CreateCalificaSedeDto) {
    const { idSede, idReserva, ...datosCalificacion } = createDto;

    // 1. Verificar que la sede existe
    const sede = await this.sedeRepository.findOne({ where: { idSede } });
    if (!sede) {
      throw new NotFoundException(`Sede con ID ${idSede} no encontrada`);
    }

    // 2. Verificar que la reserva existe y pertenece al cliente
    const reserva = await this.reservaRepository.findOne({
      where: { idReserva },
      relations: ['cancha', 'cancha.sede', 'cliente'],
    });

    if (!reserva) {
      throw new NotFoundException(`Reserva con ID ${idReserva} no encontrada`);
    }

    if (reserva.cliente.idCliente !== idCliente) {
      throw new BadRequestException('La reserva no pertenece a este cliente');
    }

    // 3. Verificar que la reserva fue en esta sede
    if (reserva.cancha.sede.idSede !== idSede) {
      throw new BadRequestException('La reserva no fue realizada en esta sede');
    }

    // 4. Verificar que la reserva esté completada
    if (reserva.estado !== 'completada') {
      throw new BadRequestException('Solo puedes calificar reservas completadas');
    }

    // 5. Verificar que no hayan pasado más de 14 días
    const fechaReserva = new Date(reserva.iniciaEn);
    const hoy = new Date();
    const diasTranscurridos = Math.floor((hoy.getTime() - fechaReserva.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasTranscurridos > 14) {
      throw new BadRequestException('Solo puedes calificar dentro de los 14 días posteriores a la reserva');
    }

    // 6. Verificar que el cliente no haya calificado ya esta sede
    const calificacionExistente = await this.calificaSedeRepository.findOne({
      where: { idCliente, idSede },
    });

    if (calificacionExistente) {
      throw new BadRequestException('Ya has calificado esta sede');
    }

    // 7. Crear la calificación
    const nuevaCalificacion = this.calificaSedeRepository.create({
      idCliente,
      idSede,
      idReserva,
      ...datosCalificacion,
      fechaCalificacion: new Date(),
    });

    const calificacionGuardada = await this.calificaSedeRepository.save(nuevaCalificacion);

    // 8. Actualizar estadísticas de la sede
    await this.actualizarRatingSede(idSede);

    return calificacionGuardada;
  }

  /**
   * Obtener todas las reseñas de una sede
   */
  async findBySedeId(idSede: number) {
    const calificaciones = await this.calificaSedeRepository.find({
      where: { idSede },
      relations: ['cliente', 'cliente.persona'],
      order: { fechaCalificacion: 'DESC' },
    });

    // Calcular estadísticas
    const estadisticas = await this.calcularEstadisticasSede(idSede);

    return {
      resenas: calificaciones.map(cal => ({
        idCliente: cal.idCliente,
        nombreCliente: cal.cliente?.persona?.nombres || 'Usuario',
        avatarCliente: cal.cliente?.persona?.urlFoto || null,
        puntajeGeneral: cal.puntajeGeneral,
        atencion: cal.atencion,
        instalaciones: cal.instalaciones,
        ubicacion: cal.ubicacion,
        estacionamiento: cal.estacionamiento,
        vestuarios: cal.vestuarios,
        limpieza: cal.limpieza,
        seguridad: cal.seguridad,
        comentario: cal.comentario,
        fechaCalificacion: cal.fechaCalificacion,
      })),
      estadisticas,
    };
  }

  /**
   * Calcular estadísticas de calificaciones de una sede
   */
  private async calcularEstadisticasSede(idSede: number) {
    const calificaciones = await this.calificaSedeRepository.find({
      where: { idSede },
    });

    if (calificaciones.length === 0) {
      return {
        totalResenas: 0,
        promedioGeneral: 0,
        promedioAtencion: 0,
        promedioInstalaciones: 0,
        promedioUbicacion: 0,
        promedioEstacionamiento: 0,
        promedioVestuarios: 0,
        promedioLimpieza: 0,
        promedioSeguridad: 0,
      };
    }

    const calcularPromedio = (campo: keyof CalificaSede) => {
      const valores = calificaciones
        .map(c => c[campo] as number)
        .filter(v => v !== null && v !== undefined);
      
      if (valores.length === 0) return 0;
      return Number((valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2));
    };

    return {
      totalResenas: calificaciones.length,
      promedioGeneral: calcularPromedio('puntajeGeneral'),
      promedioAtencion: calcularPromedio('atencion'),
      promedioInstalaciones: calcularPromedio('instalaciones'),
      promedioUbicacion: calcularPromedio('ubicacion'),
      promedioEstacionamiento: calcularPromedio('estacionamiento'),
      promedioVestuarios: calcularPromedio('vestuarios'),
      promedioLimpieza: calcularPromedio('limpieza'),
      promedioSeguridad: calcularPromedio('seguridad'),
    };
  }

  /**
   * Actualizar el rating de la sede (campo en tabla Sede)
   */
  private async actualizarRatingSede(idSede: number) {
    const estadisticas = await this.calcularEstadisticasSede(idSede);
    
    // Actualizar campos de la sede
    await this.sedeRepository.update(idSede, {
      ratingPromedioSede: estadisticas.promedioGeneral,
      totalResenasSede: estadisticas.totalResenas,
    });

    // Calcular rating final híbrido (sede 40% + canchas 60%)
    // Esto se puede mejorar calculando también el promedio de canchas
    await this.calcularRatingFinal(idSede);
  }

  /**
   * Calcular rating final híbrido (CalificaSede + CalificaCancha)
   */
  private async calcularRatingFinal(idSede: number) {
    const sede = await this.sedeRepository.findOne({
      where: { idSede },
      relations: ['canchas'],
    });

    if (!sede) return;

    // Rating de la sede
    const ratingSede = sede.ratingPromedioSede || 0;

    // Rating promedio de todas las canchas
    const canchasConRating = sede.canchas.filter(c => c.ratingPromedio > 0);
    const ratingCanchas = canchasConRating.length > 0
      ? canchasConRating.reduce((sum, c) => sum + Number(c.ratingPromedio), 0) / canchasConRating.length
      : 0;

    // Fórmula híbrida: 40% sede + 60% canchas
    const ratingFinal = (ratingSede * 0.4) + (ratingCanchas * 0.6);

    await this.sedeRepository.update(idSede, {
      ratingFinal: Number(ratingFinal.toFixed(2)),
    });
  }

  /**
   * Verificar si un cliente puede calificar una sede
   */
  async puedeCalificar(idCliente: number, idSede: number): Promise<{ puede: boolean; motivo?: string }> {
    // Verificar si ya calificó
    const yaCalifico = await this.calificaSedeRepository.findOne({
      where: { idCliente, idSede },
    });

    if (yaCalifico) {
      return { puede: false, motivo: 'Ya has calificado esta sede' };
    }

    // Verificar si tiene reservas completadas en esta sede (últimos 14 días)
    const hace14Dias = new Date();
    hace14Dias.setDate(hace14Dias.getDate() - 14);

    const reservasValidas = await this.reservaRepository
      .createQueryBuilder('reserva')
      .innerJoin('reserva.cancha', 'cancha')
      .innerJoin('cancha.sede', 'sede')
      .where('reserva.idCliente = :idCliente', { idCliente })
      .andWhere('sede.idSede = :idSede', { idSede })
      .andWhere('reserva.estado = :estado', { estado: 'completada' })
      .andWhere('reserva.fecha >= :fecha', { fecha: hace14Dias })
      .getMany();

    if (reservasValidas.length === 0) {
      return { 
        puede: false, 
        motivo: 'No tienes reservas completadas en esta sede en los últimos 14 días' 
      };
    }

    return { puede: true };
  }

  /**
   * Recalcular ratings de todas las sedes
   */
  async recalcularTodosLosRatings() {
    const sedes = await this.sedeRepository.find();
    
    for (const sede of sedes) {
      await this.actualizarRatingSede(sede.idSede);
    }
    
    return {
      mensaje: `Ratings recalculados para ${sedes.length} sedes`,
      sedesActualizadas: sedes.length
    };
  }
}
