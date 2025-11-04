import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Transaccion } from 'src/transacciones/entities/transaccion.entity';
import { CalificaCancha } from 'src/califica_cancha/entities/califica_cancha.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Cancelacion } from 'src/cancelacion/entities/cancelacion.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Reserva)
    private reservaRepo: Repository<Reserva>,
    @InjectRepository(Transaccion)
    private transaccionRepo: Repository<Transaccion>,
    @InjectRepository(CalificaCancha)
    private calificacionRepo: Repository<CalificaCancha>,
    @InjectRepository(Cancha)
    private canchaRepo: Repository<Cancha>,
    @InjectRepository(Cancelacion)
    private cancelacionRepo: Repository<Cancelacion>,
  ) {}

  /**
   * 📊 DASHBOARD PRINCIPAL
   * Obtiene todas las métricas principales de una o todas las canchas
   */
  async getDashboard(idDuenio?: number, idCancha?: number, idSede?: number) {
    const fechaActual = new Date();
    const mesActual = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const mesAnterior = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1);
    const finMesAnterior = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 0, 23, 59, 59);

    // Calcular métricas del mes actual
    const ingresosMesActual = await this.calcularIngresos(mesActual, fechaActual, idDuenio, idCancha, idSede);
    const totalReservasMesActual = await this.contarReservas(mesActual, fechaActual, idDuenio, idCancha, idSede);
    
    // Calcular métricas del mes anterior
    const ingresosMesAnterior = await this.calcularIngresos(mesAnterior, finMesAnterior, idDuenio, idCancha, idSede);
    const totalReservasMesAnterior = await this.contarReservas(mesAnterior, finMesAnterior, idDuenio, idCancha, idSede);

    // Otras métricas
    const tasaOcupacion = await this.calcularTasaOcupacion(mesActual, fechaActual, idDuenio, idCancha, idSede);
    const ratingPromedio = await this.calcularRatingPromedio(idDuenio, idCancha, idSede);

    // Calcular variaciones porcentuales
    const variacionIngresos = this.calcularVariacion(ingresosMesActual, ingresosMesAnterior);
    const variacionReservas = this.calcularVariacion(totalReservasMesActual, totalReservasMesAnterior);

    // Datos para gráficos
    const ingresosUltimos12Meses = await this.getIngresosMensuales(12, idDuenio, idCancha, idSede);
    const reservasPorEstado = await this.getReservasPorEstado(mesActual, fechaActual, idDuenio, idCancha, idSede);
    const reservasPorDia = await this.getReservasPorDia(mesActual, fechaActual, idDuenio, idCancha, idSede);
    const horariosPopulares = await this.getHorariosPopulares(idDuenio, idCancha, idSede);

    return {
      periodo: {
        mesActual: mesActual.toISOString().split('T')[0],
        fechaConsulta: fechaActual.toISOString(),
      },
      metricas: {
        ingresosMes: {
          valor: parseFloat(ingresosMesActual.toFixed(2)),
          variacion: parseFloat(variacionIngresos.toFixed(2)),
          tendencia: variacionIngresos >= 0 ? 'up' : 'down',
          mesAnterior: parseFloat(ingresosMesAnterior.toFixed(2)),
        },
        totalReservas: {
          valor: totalReservasMesActual,
          variacion: parseFloat(variacionReservas.toFixed(2)),
          tendencia: variacionReservas >= 0 ? 'up' : 'down',
          mesAnterior: totalReservasMesAnterior,
        },
        tasaOcupacion: {
          valor: parseFloat(tasaOcupacion.toFixed(2)),
          unidad: '%',
        },
        ratingPromedio: {
          valor: parseFloat(ratingPromedio.toFixed(2)),
          max: 5,
        },
      },
      graficos: {
        ingresosUltimos12Meses,
        reservasPorEstado,
        reservasPorDia,
        horariosPopulares,
      },
    };
  }

  /**
   * 💰 Calcular ingresos en un periodo
   */
  private async calcularIngresos(
    fechaInicio: Date,
    fechaFin: Date,
    idDuenio?: number,
    idCancha?: number,
    idSede?: number,
  ): Promise<number> {
    const query = this.transaccionRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.monto), 0)', 'total')
      .innerJoin('t.reserva', 'r')
      .innerJoin('r.cancha', 'c')
      .innerJoin('c.sede', 's')
      .where('t.estado = :estado', { estado: 'APROBADA' })
      .andWhere('t.creadoEn BETWEEN :inicio AND :fin', {
        inicio: fechaInicio,
        fin: fechaFin,
      });

    if (idCancha) {
      query.andWhere('c.idCancha = :idCancha', { idCancha });
    }
    if (idSede) {
      query.andWhere('s.idSede = :idSede', { idSede });
    }
    if (idDuenio) {
      query.andWhere('s.idPersonaD = :idDuenio', { idDuenio });
    }

    const result = await query.getRawOne();
    return parseFloat(result?.total || '0');
  }

  /**
   * 📝 Contar reservas en un periodo
   */
  private async contarReservas(
    fechaInicio: Date,
    fechaFin: Date,
    idDuenio?: number,
    idCancha?: number,
    idSede?: number,
  ): Promise<number> {
    const query = this.reservaRepo
      .createQueryBuilder('r')
      .innerJoin('r.cancha', 'c')
      .innerJoin('c.sede', 's')
      .where('r.creadoEn BETWEEN :inicio AND :fin', {
        inicio: fechaInicio,
        fin: fechaFin,
      })
      .andWhere('r.eliminadoEn IS NULL');

    if (idCancha) {
      query.andWhere('c.idCancha = :idCancha', { idCancha });
    }
    if (idSede) {
      query.andWhere('s.idSede = :idSede', { idSede });
    }
    if (idDuenio) {
      query.andWhere('s.idPersonaD = :idDuenio', { idDuenio });
    }

    return await query.getCount();
  }

  /**
   * 📊 Calcular tasa de ocupación
   * (Total horas reservadas / Total horas disponibles) * 100
   */
  private async calcularTasaOcupacion(
    fechaInicio: Date,
    fechaFin: Date,
    idDuenio?: number,
    idCancha?: number,
    idSede?: number,
  ): Promise<number> {
    // Obtener canchas aplicables
    const canchasQuery = this.canchaRepo
      .createQueryBuilder('c')
      .innerJoin('c.sede', 's')
      .where('c.eliminadoEn IS NULL')
      .andWhere('c.estado = :estado', { estado: 'Disponible' });

    if (idCancha) {
      canchasQuery.andWhere('c.idCancha = :idCancha', { idCancha });
    }
    if (idSede) {
      canchasQuery.andWhere('s.idSede = :idSede', { idSede });
    }
    if (idDuenio) {
      canchasQuery.andWhere('s.idPersonaD = :idDuenio', { idDuenio });
    }

    const canchas = await canchasQuery.getMany();
    if (canchas.length === 0) return 0;

    // Calcular días en el periodo
    const diasEnPeriodo = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
    
    // Asumir 12 horas disponibles por día por cancha (ej: 8am-8pm)
    const horasDisponiblesPorCancha = 12;
    const totalHorasDisponibles = canchas.length * diasEnPeriodo * horasDisponiblesPorCancha;

    // Calcular horas reservadas (usando sintaxis PostgreSQL)
    const reservasQuery = this.reservaRepo
      .createQueryBuilder('r')
      .select('SUM(EXTRACT(EPOCH FROM (r.terminaEn - r.iniciaEn)) / 3600)', 'totalHoras')
      .innerJoin('r.cancha', 'c')
      .innerJoin('c.sede', 's')
      .where('r.iniciaEn BETWEEN :inicio AND :fin', {
        inicio: fechaInicio,
        fin: fechaFin,
      })
      .andWhere('r.eliminadoEn IS NULL')
      .andWhere('r.estado != :estadoCancelada', { estadoCancelada: 'Cancelada' });

    if (idCancha) {
      reservasQuery.andWhere('c.idCancha = :idCancha', { idCancha });
    }
    if (idSede) {
      reservasQuery.andWhere('s.idSede = :idSede', { idSede });
    }
    if (idDuenio) {
      reservasQuery.andWhere('s.idPersonaD = :idDuenio', { idDuenio });
    }

    const result = await reservasQuery.getRawOne();
    const horasReservadas = parseFloat(result?.totalHoras || '0');

    if (totalHorasDisponibles === 0) return 0;

    return (horasReservadas / totalHorasDisponibles) * 100;
  }

  /**
   * ⭐ Calcular rating promedio
   */
  private async calcularRatingPromedio(
    idDuenio?: number,
    idCancha?: number,
    idSede?: number,
  ): Promise<number> {
    const query = this.calificacionRepo
      .createQueryBuilder('cal')
      .select('AVG(cal.puntaje)', 'promedio')
      .innerJoin('cal.cancha', 'c')
      .innerJoin('c.sede', 's');

    if (idCancha) {
      query.andWhere('cal.idCancha = :idCancha', { idCancha });
    }
    if (idSede) {
      query.andWhere('c.idSede = :idSede', { idSede });
    }
    if (idDuenio) {
      query.andWhere('s.idPersonaD = :idDuenio', { idDuenio });
    }

    const result = await query.getRawOne();
    return parseFloat(result?.promedio || '0');
  }

  /**
   * 📈 Calcular variación porcentual
   */
  private calcularVariacion(actual: number, anterior: number): number {
    if (anterior === 0) {
      return actual > 0 ? 100 : 0;
    }
    return ((actual - anterior) / anterior) * 100;
  }

  /**
   * 📊 Obtener ingresos de los últimos N meses
   */
  private async getIngresosMensuales(
  meses: number,
  idDuenio?: number,
  idCancha?: number,
  idSede?: number,
) {
  const resultados: Array<{
    mes: string;
    nombreMes: string;
    ingresos: number;
  }> = [];
  
  const fechaActual = new Date();

  for (let i = meses - 1; i >= 0; i--) {
    const mes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i, 1);
    const finMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i + 1, 0, 23, 59, 59);

    const ingresos = await this.calcularIngresos(mes, finMes, idDuenio, idCancha, idSede);

    resultados.push({
      mes: mes.toISOString().split('T')[0].substring(0, 7), // YYYY-MM
      nombreMes: mes.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
      ingresos: parseFloat(ingresos.toFixed(2)),
    });
  }

  return resultados;
}

  /**
   * 📊 Obtener reservas por estado en el mes
   */
  private async getReservasPorEstado(
    fechaInicio: Date,
    fechaFin: Date,
    idDuenio?: number,
    idCancha?: number,
    idSede?: number,
  ) {
    const query = this.reservaRepo
      .createQueryBuilder('r')
      .select('r.estado', 'estado')
      .addSelect('COUNT(*)', 'cantidad')
      .innerJoin('r.cancha', 'c')
      .innerJoin('c.sede', 's')
      .where('r.creadoEn BETWEEN :inicio AND :fin', {
        inicio: fechaInicio,
        fin: fechaFin,
      })
      .andWhere('r.eliminadoEn IS NULL')
      .groupBy('r.estado');

    if (idCancha) {
      query.andWhere('c.idCancha = :idCancha', { idCancha });
    }
    if (idSede) {
      query.andWhere('s.idSede = :idSede', { idSede });
    }
    if (idDuenio) {
      query.andWhere('s.idPersonaD = :idDuenio', { idDuenio });
    }

    const resultados = await query.getRawMany();

    // Formatear resultados
    const estados = {
      Confirmada: 0,
      Pendiente: 0,
      Cancelada: 0,
    };

    resultados.forEach((r) => {
      estados[r.estado] = parseInt(r.cantidad);
    });

    return [
      { estado: 'Confirmada', cantidad: estados.Confirmada },
      { estado: 'Pendiente', cantidad: estados.Pendiente },
      { estado: 'Cancelada', cantidad: estados.Cancelada },
    ];
  }

  /**
   * 📅 Obtener reservas por día del mes
   */
  private async getReservasPorDia(
    fechaInicio: Date,
    fechaFin: Date,
    idDuenio?: number,
    idCancha?: number,
    idSede?: number,
  ) {
    const query = this.reservaRepo
      .createQueryBuilder('r')
      .select('DATE(r.creadoEn)', 'fecha')
      .addSelect('COUNT(*)', 'cantidad')
      .innerJoin('r.cancha', 'c')
      .innerJoin('c.sede', 's')
      .where('r.creadoEn BETWEEN :inicio AND :fin', {
        inicio: fechaInicio,
        fin: fechaFin,
      })
      .andWhere('r.eliminadoEn IS NULL')
      .groupBy('DATE(r.creadoEn)')
      .orderBy('DATE(r.creadoEn)', 'ASC');

    if (idCancha) {
      query.andWhere('c.idCancha = :idCancha', { idCancha });
    }
    if (idSede) {
      query.andWhere('s.idSede = :idSede', { idSede });
    }
    if (idDuenio) {
      query.andWhere('s.idPersonaD = :idDuenio', { idDuenio });
    }

    const resultados = await query.getRawMany();

    return resultados.map((r) => ({
      fecha: r.fecha,
      cantidad: parseInt(r.cantidad),
    }));
  }

  /**
   * ⏰ Obtener horarios más populares
   */
  private async getHorariosPopulares(
    idDuenio?: number,
    idCancha?: number,
    idSede?: number,
  ) {
    const query = this.reservaRepo
      .createQueryBuilder('r')
      .select('EXTRACT(HOUR FROM r.iniciaEn)', 'hora')
      .addSelect('COUNT(*)', 'cantidad')
      .innerJoin('r.cancha', 'c')
      .innerJoin('c.sede', 's')
      .where('r.eliminadoEn IS NULL')
      .andWhere('r.estado != :estadoCancelada', { estadoCancelada: 'Cancelada' })
      .groupBy('EXTRACT(HOUR FROM r.iniciaEn)')
      .orderBy('cantidad', 'DESC')
      .limit(10);

    if (idCancha) {
      query.andWhere('c.idCancha = :idCancha', { idCancha });
    }
    if (idSede) {
      query.andWhere('s.idSede = :idSede', { idSede });
    }
    if (idDuenio) {
      query.andWhere('s.idPersonaD = :idDuenio', { idDuenio });
    }

    const resultados = await query.getRawMany();

    return resultados.map((r) => ({
      hora: `${r.hora.toString().padStart(2, '0')}:00`,
      cantidad: parseInt(r.cantidad),
    }));
  }

  /**
   * � Obtener ingresos mensuales agrupados (última versión simplificada)
   */
  async getIngresosMensualesAgrupados(
    idDuenio?: number,
    idCancha?: number,
    idSede?: number,
    limite: number = 12,
  ) {
    const query = this.transaccionRepo
      .createQueryBuilder('t')
      .select("TO_CHAR(t.creadoEn, 'YYYY-MM')", 'mes')
      .addSelect('SUM(t.monto)', 'ingresos')
      .addSelect('COUNT(t.idTransaccion)', 'transacciones')
      .innerJoin('t.reserva', 'r')
      .innerJoin('r.cancha', 'c')
      .innerJoin('c.sede', 's')
      .where('t.estado = :estado', { estado: 'APROBADA' })
      .groupBy("TO_CHAR(t.creadoEn, 'YYYY-MM')")
      .orderBy("TO_CHAR(t.creadoEn, 'YYYY-MM')", 'DESC')
      .limit(limite);

    if (idCancha) {
      query.andWhere('c.idCancha = :idCancha', { idCancha });
    }
    if (idSede) {
      query.andWhere('s.idSede = :idSede', { idSede });
    }
    if (idDuenio) {
      query.andWhere('s.idPersonaD = :idDuenio', { idDuenio });
    }

    const resultados = await query.getRawMany();

    return {
      periodo: 'mes',
      limite,
      datos: resultados.map((r) => ({
        mes: r.mes,
        ingresos: parseFloat(parseFloat(r.ingresos).toFixed(2)),
        transacciones: parseInt(r.transacciones),
      })),
    };
  }

  /**
   * 📅 Obtener calendario de disponibilidad de canchas
   * Retorna las canchas y reservas del mes. El frontend se encarga de renderizar el calendario.
   */
  async getCalendarioDisponibilidad(
    mes: string, // formato YYYY-MM
    idDuenio?: number,
    idCancha?: number,
    idSede?: number,
  ) {
    // Parse del mes
    const [year, month] = mes.split('-').map(Number);
    const fechaInicio = new Date(year, month - 1, 1);
    const fechaFin = new Date(year, month, 0, 23, 59, 59);

    // Obtener canchas aplicables
    const canchasQuery = this.canchaRepo
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.sede', 's')
      .where('c.eliminadoEn IS NULL')
      .andWhere('c.estado = :estado', { estado: 'Disponible' });

    if (idCancha) {
      canchasQuery.andWhere('c.idCancha = :idCancha', { idCancha });
    }
    if (idSede) {
      canchasQuery.andWhere('s.idSede = :idSede', { idSede });
    }
    if (idDuenio) {
      canchasQuery.andWhere('s.idPersonaD = :idDuenio', { idDuenio });
    }

    const canchas = await canchasQuery.getMany();

    // Obtener todas las reservas del mes
    const reservasQuery = this.reservaRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.cliente', 'cl')
      .leftJoinAndSelect('cl.persona', 'p')
      .innerJoin('r.cancha', 'c')
      .where('r.iniciaEn >= :fechaInicio', { fechaInicio })
      .andWhere('r.iniciaEn <= :fechaFin', { fechaFin })
      .andWhere('r.eliminadoEn IS NULL')
      .andWhere('r.estado != :estadoCancelada', { estadoCancelada: 'Cancelada' });

    if (idCancha) {
      reservasQuery.andWhere('c.idCancha = :idCancha', { idCancha });
    }

    const reservas = await reservasQuery.getMany();

    // Formatear datos para el frontend
    const canchasFormateadas = canchas.map((c) => ({
      idCancha: c.idCancha,
      nombre: c.nombre,
      sede: {
        idSede: c.sede.idSede,
        nombre: c.sede.nombre,
      },
    }));

    const reservasFormateadas = reservas.map((r) => ({
      idReserva: r.idReserva,
      idCancha: r.idCancha,
      estado: r.estado,
      iniciaEn: r.iniciaEn.toISOString(),
      terminaEn: r.terminaEn.toISOString(),
      montoBase: r.montoBase,
      montoExtra: r.montoExtra,
      montoTotal: r.montoTotal,
      cantidadPersonas: r.cantidadPersonas,
      cliente: {
        idCliente: r.cliente.idCliente,
        nombre: r.cliente.persona.nombres,
        apellido: `${r.cliente.persona.paterno} ${r.cliente.persona.materno}`,
        apodo: r.cliente.apodo || null,
      },
    }));

    return {
      mes,
      year,
      month,
      diasEnMes: fechaFin.getDate(),
      canchas: canchasFormateadas,
      reservas: reservasFormateadas,
    };
  }

  /**
   * ⭐ Obtener resumen de reseñas y calificaciones
   */
  async getResumenResenas(
    idDuenio?: number,
    idCancha?: number,
    idSede?: number,
  ) {
    // Query base para calificaciones
    const queryBase = this.calificacionRepo
      .createQueryBuilder('cal')
      .innerJoin('cal.cancha', 'c')
      .innerJoin('c.sede', 's');

    if (idCancha) {
      queryBase.andWhere('cal.idCancha = :idCancha', { idCancha });
    }
    if (idSede) {
      queryBase.andWhere('c.idSede = :idSede', { idSede });
    }
    if (idDuenio) {
      queryBase.andWhere('s.idPersonaD = :idDuenio', { idDuenio });
    }

    // Obtener rating promedio y total de reseñas
    const queryResumen = queryBase.clone()
      .select('AVG(cal.puntaje)', 'promedio')
      .addSelect('COUNT(*)', 'total');

    const resumen = await queryResumen.getRawOne();
    const ratingPromedio = parseFloat(resumen?.promedio || '0');
    const totalResenas = parseInt(resumen?.total || '0');

    // Obtener distribución por estrellas
    const queryDistribucion = queryBase.clone()
      .select('cal.puntaje', 'estrellas')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('cal.puntaje')
      .orderBy('cal.puntaje', 'DESC');

    const distribucionRaw = await queryDistribucion.getRawMany();

    // Formatear distribución (asegurar que existan todas las estrellas de 1 a 5)
    const distribucion = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    distribucionRaw.forEach((item) => {
      const estrellas = parseInt(item.estrellas);
      if (estrellas >= 1 && estrellas <= 5) {
        distribucion[estrellas] = parseInt(item.cantidad);
      }
    });

    // Obtener últimas reseñas con detalles
    const queryUltimasResenas = this.calificacionRepo
      .createQueryBuilder('cal')
      .leftJoinAndSelect('cal.cliente', 'cl')
      .leftJoinAndSelect('cl.persona', 'p')
      .leftJoinAndSelect('cal.cancha', 'c')
      .leftJoinAndSelect('c.sede', 's')
      .orderBy('cal.creadaEn', 'DESC')
      .limit(10);

    if (idCancha) {
      queryUltimasResenas.andWhere('cal.idCancha = :idCancha', { idCancha });
    }
    if (idSede) {
      queryUltimasResenas.andWhere('c.idSede = :idSede', { idSede });
    }
    if (idDuenio) {
      queryUltimasResenas.andWhere('s.idPersonaD = :idDuenio', { idDuenio });
    }

    const ultimasResenas = await queryUltimasResenas.getMany();

    const resenasFormateadas = ultimasResenas.map((resena) => ({
      puntaje: resena.puntaje,
      comentario: resena.comentario,
      fecha: resena.creadaEn.toISOString(),
      cancha: {
        idCancha: resena.cancha.idCancha,
        nombre: resena.cancha.nombre,
      },
      sede: {
        idSede: resena.cancha.sede?.idSede || null,
        nombre: resena.cancha.sede?.nombre || 'N/A',
      },
      cliente: {
        idCliente: resena.cliente.idCliente,
        nombre: resena.cliente.persona.nombres,
        apellido: `${resena.cliente.persona.paterno} ${resena.cliente.persona.materno}`,
        apodo: resena.cliente.apodo || null,
      },
    }));

    // Calcular porcentajes de distribución
    const distribucionConPorcentajes = Object.entries(distribucion).map(
      ([estrellas, cantidad]) => ({
        estrellas: parseInt(estrellas),
        cantidad,
        porcentaje:
          totalResenas > 0
            ? parseFloat(((cantidad / totalResenas) * 100).toFixed(2))
            : 0,
      }),
    );

    return {
      resumen: {
        ratingPromedio: parseFloat(ratingPromedio.toFixed(2)),
        totalResenas,
        maxRating: 5,
      },
      distribucion: distribucionConPorcentajes,
      ultimasResenas: resenasFormateadas,
    };
  }

  /**
   * 📊 Obtener estadísticas detalladas por cancha
   */
  async getEstadisticasPorCancha(idCancha: number, mes?: string) {
    // Si no se proporciona mes, usar el mes actual
    let fechaInicio: Date;
    let fechaFin: Date;

    if (mes) {
      const [year, month] = mes.split('-').map(Number);
      fechaInicio = new Date(year, month - 1, 1);
      fechaFin = new Date(year, month, 0, 23, 59, 59);
    } else {
      const ahora = new Date();
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      fechaFin = ahora;
    }

    // Verificar que la cancha existe
    const cancha = await this.canchaRepo.findOne({
      where: { idCancha },
      relations: ['sede'],
    });

    if (!cancha) {
      throw new Error('Cancha no encontrada');
    }

    const totalReservas = await this.contarReservas(fechaInicio, fechaFin, undefined, idCancha);
    const ingresos = await this.calcularIngresos(fechaInicio, fechaFin, undefined, idCancha);
    const tasaOcupacion = await this.calcularTasaOcupacion(fechaInicio, fechaFin, undefined, idCancha);
    const rating = await this.calcularRatingPromedio(undefined, idCancha);
    const reservasPorEstado = await this.getReservasPorEstado(fechaInicio, fechaFin, undefined, idCancha);

    // Obtener total de calificaciones
    const totalCalificaciones = await this.calificacionRepo.count({
      where: { idCancha },
    });

    return {
      cancha: {
        idCancha: cancha.idCancha,
        nombre: cancha.nombre,
        sede: {
          idSede: cancha.sede.idSede,
          nombre: cancha.sede.nombre,
        },
      },
      periodo: {
        inicio: fechaInicio.toISOString().split('T')[0],
        fin: fechaFin.toISOString().split('T')[0],
      },
      metricas: {
        totalReservas,
        ingresos: parseFloat(ingresos.toFixed(2)),
        tasaOcupacion: parseFloat(tasaOcupacion.toFixed(2)),
        rating: parseFloat(rating.toFixed(2)),
        totalCalificaciones,
      },
      reservasPorEstado,
    };
  }
}
