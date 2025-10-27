import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { Transaccion } from 'src/transacciones/entities/transaccion.entity';
import {
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { BloqueoCancha } from 'src/bloqueos/entities/bloqueo_cancha.entity';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    @InjectRepository(Cancha)
    private canchaRepository: Repository<Cancha>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(BloqueoCancha)
    private bloqueoRepository: Repository<BloqueoCancha>,
  ) {}

  async create(createReservaDto: CreateReservaDto) {
    // 1. Validar que la cancha existe
    const cancha = await this.canchaRepository.findOne({
      where: { id_cancha: createReservaDto.id_cancha },
    });

    if (!cancha) {
      throw new NotFoundException({
        error: 'Cancha no encontrada',
        id_cancha: createReservaDto.id_cancha,
      });
    }

    // 2. Validar que el cliente existe
    const cliente = await this.clienteRepository.findOne({
      where: { id_cliente: createReservaDto.id_cliente },
    });

    if (!cliente) {
      throw new NotFoundException({
        error: 'Cliente no encontrado',
        id_cliente: createReservaDto.id_cliente,
      });
    }

    // 3. Verificar disponibilidad de horario
    const reservaExistente = await this.reservaRepository
      .createQueryBuilder('reserva')
      .where('reserva.id_cancha = :id_cancha', {
        id_cancha: createReservaDto.id_cancha,
      })
      .andWhere('reserva.eliminado_en IS NULL')
      // Forzar conversion a timestamp sin zona para evitar desajustes horario (DB usa timestamp)
      .andWhere(
        '(reserva.inicia_en < CAST(:termina_en AS timestamp) AND reserva.termina_en > CAST(:inicia_en AS timestamp))',
        {
          inicia_en: createReservaDto.inicia_en,
          termina_en: createReservaDto.termina_en,
        },
      )
      .getOne();

    if (reservaExistente) {
      throw new ConflictException({
        error: 'La cancha ya esta reservada en ese horario',
        detalles: {
          reservaExistente: {
            inicia_en: reservaExistente.inicia_en,
            termina_en: reservaExistente.termina_en,
          },
        },
      });
    }

    // 4. Verificar bloqueos de disponibilidad
    const bloqueo = await this.bloqueoRepository
      .createQueryBuilder('bloqueo')
      .where('bloqueo.id_cancha = :id_cancha', {
        id_cancha: createReservaDto.id_cancha,
      })
      .andWhere('bloqueo.eliminado_en IS NULL')
      // Igual que arriba, castear a timestamp para comparar correctamente
      .andWhere(
        '(bloqueo.inicia_en < CAST(:termina_en AS timestamp) AND bloqueo.termina_en > CAST(:inicia_en AS timestamp))',
        {
          inicia_en: createReservaDto.inicia_en,
          termina_en: createReservaDto.termina_en,
        },
      )
      .getOne();

    if (bloqueo) {
      throw new ConflictException({
        error: 'La cancha no esta disponible en ese horario (bloqueada)',
      });
    }

    // 5. Calcular montos en base al precio por hora de la cancha y la duracion
    const inicio = new Date(createReservaDto.inicia_en);
    const fin = new Date(createReservaDto.termina_en);
    const diffMs = fin.getTime() - inicio.getTime();
    const horas = diffMs / (1000 * 60 * 60);

    if (!Number.isFinite(horas) || horas <= 0) {
      throw new ConflictException({
        error: 'El rango horario es invalido',
        detalles: { inicia_en: createReservaDto.inicia_en, termina_en: createReservaDto.termina_en },
      });
    }

    const precioHora = Number(cancha.precio);
    const monto_base = Number((precioHora * horas).toFixed(2));
    const monto_extra = 0;
    const monto_total = Number((monto_base + monto_extra).toFixed(2));

    // 6. Crear la reserva con estado explicito y montos calculados en backend
    //    Forzar tipos correctos para columnas de fecha
    const reserva = this.reservaRepository.create({
      id_cliente: createReservaDto.id_cliente,
      id_cancha: createReservaDto.id_cancha,
      inicia_en: inicio,
      termina_en: fin,
      cantidad_personas: createReservaDto.cantidad_personas,
      requiere_aprobacion: createReservaDto.requiere_aprobacion,
      monto_base,
      monto_extra,
      monto_total,
      estado: 'Pendiente', // Valor por defecto explicito
    });
    let reservaGuardada: Reserva;
    try {
      reservaGuardada = await this.reservaRepository.save(reserva);
    } catch (err: any) {
      // Log para diagnostico y error controlado al cliente
      // eslint-disable-next-line no-console
      console.error('Error al guardar reserva:', err?.message || err);
      throw new ConflictException({
        error: 'No se pudo crear la reserva',
        detalles: err?.message || 'Error desconocido al persistir la reserva',
      });
    }

    // 7. Devolver respuesta formateada
    return {
      message: 'Reserva creada exitosamente',
      reserva: {
        id_reserva: reservaGuardada.id_reserva,
        id_cliente: reservaGuardada.id_cliente,
        id_cancha: reservaGuardada.id_cancha,
        inicia_en: reservaGuardada.inicia_en,
        termina_en: reservaGuardada.termina_en,
        cantidad_personas: reservaGuardada.cantidad_personas,
        requiere_aprobacion: reservaGuardada.requiere_aprobacion,
        monto_base: reservaGuardada.monto_base.toString(),
        monto_extra: reservaGuardada.monto_extra.toString(),
        monto_total: reservaGuardada.monto_total.toString(),
        creado_en: reservaGuardada.creado_en,
        actualizado_en: reservaGuardada.actualizado_en,
      },
    };
  }

  findAll() {
    return this.reservaRepository.find();
  }

  async findOne(id: number) {
    const reserva = await this.reservaRepository.findOne({
      where: { id_reserva: id },
      relations: [
        'cancha',
        'cancha.fotos',
        'cancha.sede',
        'cliente',
        'cliente.persona',
        'transacciones',
        'transacciones.facturas',
        'pasesAcceso',
      ],
    });

    if (!reserva) {
      throw new NotFoundException({
        error: 'Reserva no encontrada',
        id_reserva: id,
      });
    }

    return this.transformarReservaDetalle(reserva);
  }

  // Obtener todas las reservas de un usuario/cliente
  async findByUsuario(id_cliente: number) {
    const reservas = await this.reservaRepository.find({
      where: {
        id_cliente,
        eliminado_en: IsNull(),
      },
      relations: [
        'cancha',
        'cancha.fotos',
        'cancha.sede',
        'cancelaciones',
        'transacciones',
        'pasesAcceso',
      ],
      order: {
        creado_en: 'DESC',
      },
    });

    const activas = reservas.filter(
      (r) => r.estado === 'Confirmada' || r.estado === 'Pendiente',
    ).length;
    const completadas = reservas.filter(
      (r) => r.estado === 'Completada',
    ).length;
    const canceladas = reservas.filter((r) => r.estado === 'Cancelada').length;

    return {
      reservas: reservas.map((r) => this.transformarReservaLista(r)),
      total: reservas.length,
      activas,
      completadas,
      canceladas,
    };
  }

  async findByCancha(canchaId: number) {
    const reservas = await this.reservaRepository.find({
      where: {
        cancha: { id_cancha: canchaId },
        eliminado_en: IsNull(),
      },
      relations: ['cancelaciones'],
    });

    // Transformar al formato esperado por el frontend
    return reservas.map((reserva) => {
      const inicia_en = new Date(reserva.inicia_en);
      const termina_en = new Date(reserva.termina_en);

      return {
        id_reserva: reserva.id_reserva,
        fecha: inicia_en.toISOString().split('T')[0], // "2025-10-20"
        horaInicio: inicia_en.toTimeString().slice(0, 5), // "09:00"
        horaFin: termina_en.toTimeString().slice(0, 5), // "10:00"
        estado: this.determinarEstado(reserva),
      };
    });
  }

  private determinarEstado(reserva: Reserva): string {
    // Si tiene cancelaciones, esta cancelada
    if (reserva.cancelaciones && reserva.cancelaciones.length > 0) {
      return 'Cancelada';
    }
    // Si requiere aprobacion, esta pendiente
    if (reserva.requiere_aprobacion) {
      return 'Pendiente';
    }
    // Por defecto esta confirmada
    return 'Confirmada';
  }

  async findByDuenio(duenioId: number) {
    // Cargar reservas de todas las canchas pertenecientes a sedes del dueno con relaciones utiles
    const reservas = await this.reservaRepository.find({
      where: { cancha: { sede: { id_persona_d: duenioId } }, eliminado_en: IsNull() },
      relations: [
        'cancha',
        'cancha.fotos',
        'cancha.sede',
        'cliente',
        'cliente.persona',
        'participaciones',
        'participaciones.cliente',
        'participaciones.cliente.persona',
        'cancelaciones',
        'transacciones',
        'transacciones.facturas',
        'pasesAcceso',
      ],
      order: { creado_en: 'DESC' },
    });

    const activas = reservas.filter(
      (r) => r.estado === 'Confirmada' || r.estado === 'Pendiente',
    ).length;
    const completadas = reservas.filter((r) => r.estado === 'Completada').length;
    const canceladas = reservas.filter((r) => r.estado === 'Cancelada').length;

    return {
      reservas: reservas.map((r) => this.transformarReservaLista(r)),
      total: reservas.length,
      activas,
      completadas,
      canceladas,
    };
  }
  async update(id: number, updateReservaDto: UpdateReservaDto) {
    // 1. Verificar que la reserva existe y obtenerla
    const reserva = await this.reservaRepository.findOne({
      where: { id_reserva: id },
      relations: ['cancha'],
    });

    if (!reserva) {
      throw new NotFoundException({
        error: 'Reserva no encontrada',
        id_reserva: id,
      });
    }

    // 2. Validar que no este cancelada o completada
    if (reserva.estado === 'Cancelada') {
      throw new ConflictException({
        error: 'No se puede modificar una reserva cancelada',
      });
    }

    if (reserva.estado === 'Completada') {
      throw new ConflictException({
        error: 'No se puede modificar una reserva completada',
      });
    }

    // 3. Si se modifica el horario, verificar disponibilidad
    if (updateReservaDto.inicia_en || updateReservaDto.termina_en) {
      const nuevainicia_en = updateReservaDto.inicia_en || reserva.inicia_en;
      const nuevatermina_en = updateReservaDto.termina_en || reserva.termina_en;

      // Validar que no sea en el pasado
      if (new Date(nuevainicia_en) < new Date()) {
        throw new ConflictException({
          error: 'No se puede reservar en una fecha pasada',
        });
      }

      // Verificar que no haya conflicto con otras reservas
      const conflicto = await this.reservaRepository
        .createQueryBuilder('reserva')
        .where('reserva.id_cancha = :id_cancha', {
          id_cancha: reserva.id_cancha,
        })
        .andWhere('reserva.id_reserva != :id_reserva', { id_reserva: id })
        .andWhere('reserva.eliminado_en IS NULL')
        .andWhere('reserva.estado != :estado', { estado: 'Cancelada' })
        .andWhere(
          '(reserva.inicia_en < :termina_en AND reserva.termina_en > :inicia_en)',
          {
            inicia_en: nuevainicia_en,
            termina_en: nuevatermina_en,
          },
        )
        .getOne();

      if (conflicto) {
        throw new ConflictException({
          error: 'El nuevo horario ya esta reservado por otro usuario',
        });
      }
    }

    // 4. Actualizar la reserva
    await this.reservaRepository.update(id, updateReservaDto);

    // 5. Obtener y devolver la reserva actualizada
    const reservaActualizada = await this.reservaRepository.findOne({
      where: { id_reserva: id },
    });

    if (!reservaActualizada) {
      throw new NotFoundException(
        'Reserva no encontrada despues de actualizar',
      );
    }

    return {
      message: 'Reserva actualizada exitosamente',
      reserva: {
        id_reserva: reservaActualizada.id_reserva,
        id_cliente: reservaActualizada.id_cliente,
        id_cancha: reservaActualizada.id_cancha,
        inicia_en: reservaActualizada.inicia_en,
        termina_en: reservaActualizada.termina_en,
        cantidad_personas: reservaActualizada.cantidad_personas,
        monto_base: reservaActualizada.monto_base.toString(),
        monto_extra: reservaActualizada.monto_extra.toString(),
        monto_total: reservaActualizada.monto_total.toString(),
        estado: reservaActualizada.estado,
        actualizado_en: reservaActualizada.actualizado_en,
      },
    };
  }

  async cancelar(id: number, motivo?: string) {
    // 1. Verificar que la reserva existe
    const reserva = await this.reservaRepository.findOne({
      where: { id_reserva: id },
    });

    if (!reserva) {
      throw new NotFoundException({
        error: 'Reserva no encontrada',
        id_reserva: id,
      });
    }

    // 2. Validar que no este ya cancelada
    if (reserva.estado === 'Cancelada') {
      throw new ConflictException({
        error: 'Esta reserva ya esta cancelada',
      });
    }

    // 3. Validar que no este completada
    if (reserva.estado === 'Completada') {
      throw new ConflictException({
        error: 'No se puede cancelar una reserva ya completada',
      });
    }

    // 4. Calcular politica de reembolso
    const ahora = new Date();
    const inicioReserva = new Date(reserva.inicia_en);
    const horasDeAnticipacion =
      (inicioReserva.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    let reembolso = {
      aplicable: true,
      porcentaje: 100,
      monto: reserva.monto_total.toString(),
      mensaje: '',
    };

    if (horasDeAnticipacion < 2) {
      reembolso = {
        aplicable: false,
        porcentaje: 0,
        monto: '0.00',
        mensaje:
          'No se puede cancelar una reserva con menos de 2 horas de anticipacion',
      };
      throw new ConflictException({
        error:
          'No se puede cancelar una reserva con menos de 2 horas de anticipacion',
        reembolso,
      });
    } else if (horasDeAnticipacion < 24) {
      reembolso = {
        aplicable: true,
        porcentaje: 50,
        monto: (reserva.monto_total * 0.5).toFixed(2),
        mensaje:
          'Se reembolsara el 50% porque cancelaste con menos de 24 horas de anticipacion',
      };
    } else {
      reembolso.mensaje =
        'Se reembolsara el 100% porque cancelaste con mas de 24 horas de anticipacion';
    }

    // 5. Cancelar la reserva
    await this.reservaRepository.update(id, {
      estado: 'Cancelada',
    });

    const reservaCancelada = await this.reservaRepository.findOne({
      where: { id_reserva: id },
    });

    if (!reservaCancelada) {
      throw new NotFoundException('Reserva no encontrada despues de cancelar');
    }

    return {
      message: 'Reserva cancelada exitosamente',
      reserva: {
        id_reserva: reservaCancelada.id_reserva,
        id_cliente: reservaCancelada.id_cliente,
        id_cancha: reservaCancelada.id_cancha,
        estado: reservaCancelada.estado,
        canceladoEn: reservaCancelada.actualizado_en,
        motivoCancelacion: motivo || 'Sin motivo especificado',
      },
      reembolso,
    };
  }

  remove(id: number) {
    return this.reservaRepository.softDelete(id);
  }

  // ============================================
  // METODOS DE TRANSFORMACION
  // ============================================

  private transformarReservaLista(reserva: Reserva) {
    const ultimaTransaccion = this.obtenerTransaccionPrincipal(reserva);
    const pase = reserva.pasesAcceso?.[0] ?? null;
    const estadoPago = ultimaTransaccion?.estado_pago ?? 'PENDIENTE';
    const metodoPago = ultimaTransaccion ? 'LIBELULA' : null;

    return {
      id_reserva: reserva.id_reserva,
      id_cliente: reserva.id_cliente,
      id_cancha: reserva.id_cancha,
      inicia_en: reserva.inicia_en,
      termina_en: reserva.termina_en,
      cantidad_personas: reserva.cantidad_personas,
      requiere_aprobacion: reserva.requiere_aprobacion,
      monto_base: reserva.monto_base.toString(),
      monto_extra: reserva.monto_extra.toString(),
      monto_total: reserva.monto_total.toString(),
      estado: reserva.estado,
      estadoPago,
      metodoPago,
      codigoQR: pase?.qr ?? null,
      creado_en: reserva.creado_en,
      actualizado_en: reserva.actualizado_en,
      cliente: reserva.cliente
        ? {
            id_cliente: reserva.cliente.id_cliente,
            persona: reserva.cliente.persona
              ? {
                  nombres: reserva.cliente.persona.nombres,
                  paterno: reserva.cliente.persona.paterno,
                  materno: reserva.cliente.persona.materno,
                  telefono: reserva.cliente.persona.telefono,
                }
              : null,
          }
        : null,
      participantes:
        (reserva.participaciones || []).map((p) => ({
          id_cliente: p.id_cliente,
          confirmado: (p as any).confirmado ?? false,
          persona: p.cliente?.persona
            ? {
                nombres: p.cliente.persona.nombres,
                paterno: p.cliente.persona.paterno,
                materno: p.cliente.persona.materno,
                telefono: p.cliente.persona.telefono,
              }
            : null,
        })) || [],
      cancha: {
        id_cancha: reserva.cancha.id_cancha,
        nombre: reserva.cancha.nombre,
        superficie: reserva.cancha.superficie,
        cubierta: reserva.cancha.cubierta,
        precio: reserva.cancha.precio.toString(),
        fotos:
          reserva.cancha.fotos?.map((f) => ({
            id_foto: f.id_foto,
            url_foto: f.url_foto,
          })) || [],
        sede: {
          id_sede: reserva.cancha.sede.id_sede,
          nombre: reserva.cancha.sede.nombre,
          direccion: reserva.cancha.sede.direccion,
          ciudad: reserva.cancha.sede.latitud || 'N/A',
          telefono: reserva.cancha.sede.telefono,
          email: reserva.cancha.sede.email,
        },
      },
      pago: ultimaTransaccion
        ? {
            estado: estadoPago,
            fecha_pago: ultimaTransaccion.fecha_pago
              ? ultimaTransaccion.fecha_pago.toISOString()
              : null,
            url_pasarela_pagos: ultimaTransaccion.url_pasarela_pagos,
            qr_simple_url: ultimaTransaccion.qr_simple_url,
          }
        : null,
    };
  }

  private transformarReservaDetalle(reserva: Reserva) {
    const ultimaTransaccion = this.obtenerTransaccionPrincipal(reserva);
    const pase = reserva.pasesAcceso?.[0] ?? null;
    const estadoPago = ultimaTransaccion?.estado_pago ?? 'PENDIENTE';
    const metodoPago = ultimaTransaccion ? 'LIBELULA' : null;

    return {
      reserva: {
        id_reserva: reserva.id_reserva,
        id_cliente: reserva.id_cliente,
        id_cancha: reserva.id_cancha,
        inicia_en: reserva.inicia_en,
        termina_en: reserva.termina_en,
        cantidad_personas: reserva.cantidad_personas,
        requiere_aprobacion: reserva.requiere_aprobacion,
        monto_base: reserva.monto_base.toString(),
        monto_extra: reserva.monto_extra.toString(),
        monto_total: reserva.monto_total.toString(),
        estado: reserva.estado,
        estadoPago,
        metodoPago,
        codigoQR: pase?.qr ?? null,
        creado_en: reserva.creado_en,
        actualizado_en: reserva.actualizado_en,
        cliente: reserva.cliente
          ? {
              id_cliente: reserva.cliente.id_cliente,
              persona: reserva.cliente.persona
                ? {
                    nombres: reserva.cliente.persona.nombres,
                    paterno: reserva.cliente.persona.paterno,
                    materno: reserva.cliente.persona.materno,
                    telefono: reserva.cliente.persona.telefono,
                  }
                : null,
            }
          : null,
        cancha: {
          id_cancha: reserva.cancha.id_cancha,
          nombre: reserva.cancha.nombre,
          superficie: reserva.cancha.superficie,
          cubierta: reserva.cancha.cubierta,
          aforoMax: reserva.cancha.aforoMax,
          dimensiones: reserva.cancha.dimensiones,
          precio: reserva.cancha.precio.toString(),
          iluminacion: reserva.cancha.iluminacion,
          fotos:
            reserva.cancha.fotos?.map((f) => ({
              id_foto: f.id_foto,
              url_foto: f.url_foto,
            })) || [],
          sede: {
            id_sede: reserva.cancha.sede.id_sede,
            nombre: reserva.cancha.sede.nombre,
            direccion: reserva.cancha.sede.direccion,
            ciudad: reserva.cancha.sede.latitud || 'N/A',
            telefono: reserva.cancha.sede.telefono,
            email: reserva.cancha.sede.email,
            horarioApertura: '08:00:00',
            horarioCierre: '22:00:00',
          },
        },
        historial: [
          {
            accion: 'Creada',
            fecha: reserva.creado_en,
            usuario: reserva.cliente?.persona
              ? `${reserva.cliente.persona.nombres} ${reserva.cliente.persona.paterno}`
              : 'Usuario',
          },
        ],
        pago: ultimaTransaccion
          ? {
              estado: estadoPago,
              fecha_pago: ultimaTransaccion.fecha_pago
                ? ultimaTransaccion.fecha_pago.toISOString()
                : null,
              url_pasarela_pagos: ultimaTransaccion.url_pasarela_pagos,
              qr_simple_url: ultimaTransaccion.qr_simple_url,
            }
          : null,
        transacciones: this.mapTransacciones(reserva.transacciones),
        pasesAcceso:
          reserva.pasesAcceso?.map((p) => ({
            id_pase_acceso: p.id_pase_acceso,
            qr: p.qr,
            cantidad_personas: p.cantidad_personas,
          })) ?? [],
      },
    };
  }

  private obtenerTransaccionPrincipal(
    reserva: Reserva,
  ): Transaccion | null {
    const transacciones = reserva.transacciones ?? [];
    if (transacciones.length === 0) {
      return null;
    }

    return (
      transacciones
        .slice()
        .sort((a, b) => {
          const fechaA = a.fecha_pago ? a.fecha_pago.getTime() : 0;
          const fechaB = b.fecha_pago ? b.fecha_pago.getTime() : 0;
          if (fechaA === fechaB) {
            return (a.id_transaccion ?? 0) - (b.id_transaccion ?? 0);
          }
          return fechaA - fechaB;
        })
        .pop() ?? null
    );
  }

  private mapTransacciones(transacciones?: Transaccion[]) {
    return (transacciones ?? []).map((trx) => ({
      id_transaccion: trx.id_transaccion,
      id_transaccion_libelula: trx.id_transaccion_libelula,
      url_pasarela_pagos: trx.url_pasarela_pagos,
      qr_simple_url: trx.qr_simple_url,
      estado_pago: trx.estado_pago,
      fecha_pago: trx.fecha_pago ? trx.fecha_pago.toISOString() : null,
      monto_total: trx.monto_total,
      cliente_id: trx.cliente_id,
      reserva_id: trx.reserva_id,
      facturas:
        trx.facturas?.map((factura) => ({
          id_factura: factura.id_factura,
          invoice_id: factura.invoice_id,
          invoice_url: factura.invoice_url,
        })) ?? [],
    }));
  }
}
