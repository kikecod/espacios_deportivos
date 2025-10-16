import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { IsNull, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    @InjectRepository(Cancha)
    private canchaRepository: Repository<Cancha>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
  ) { }

  async create(createReservaDto: CreateReservaDto) {
    // 1. Validar que la cancha existe
    const cancha = await this.canchaRepository.findOne({
      where: { idCancha: createReservaDto.idCancha }
    });

    if (!cancha) {
      throw new NotFoundException({
        error: 'Cancha no encontrada',
        idCancha: createReservaDto.idCancha
      });
    }

    // 2. Validar que el cliente existe
    const cliente = await this.clienteRepository.findOne({
      where: { idCliente: createReservaDto.idCliente }
    });

    if (!cliente) {
      throw new NotFoundException({
        error: 'Cliente no encontrado',
        idCliente: createReservaDto.idCliente
      });
    }

    // 3. Verificar disponibilidad de horario
    const reservaExistente = await this.reservaRepository
      .createQueryBuilder('reserva')
      .where('reserva.idCancha = :idCancha', { idCancha: createReservaDto.idCancha })
      .andWhere('reserva.eliminadoEn IS NULL')
      .andWhere(
        '(reserva.iniciaEn < :terminaEn AND reserva.terminaEn > :iniciaEn)',
        {
          iniciaEn: createReservaDto.iniciaEn,
          terminaEn: createReservaDto.terminaEn,
        }
      )
      .getOne();

    if (reservaExistente) {
      throw new ConflictException({
        error: 'La cancha ya está reservada en ese horario',
        detalles: {
          reservaExistente: {
            iniciaEn: reservaExistente.iniciaEn,
            terminaEn: reservaExistente.terminaEn,
          },
        },
      });
    }

    // 4. Crear la reserva con estado explícito
    const reserva = this.reservaRepository.create({
      ...createReservaDto,
      estado: 'Pendiente', // Valor por defecto explícito
    });
    const reservaGuardada = await this.reservaRepository.save(reserva);

    // 5. Devolver respuesta formateada
    return {
      message: 'Reserva creada exitosamente',
      reserva: {
        idReserva: reservaGuardada.idReserva,
        idCliente: reservaGuardada.idCliente,
        idCancha: reservaGuardada.idCancha,
        iniciaEn: reservaGuardada.iniciaEn,
        terminaEn: reservaGuardada.terminaEn,
        cantidadPersonas: reservaGuardada.cantidadPersonas,
        requiereAprobacion: reservaGuardada.requiereAprobacion,
        montoBase: reservaGuardada.montoBase.toString(),
        montoExtra: reservaGuardada.montoExtra.toString(),
        montoTotal: reservaGuardada.montoTotal.toString(),
        creadoEn: reservaGuardada.creadoEn,
        actualizadoEn: reservaGuardada.actualizadoEn,
      },
    };
  }

  findAll() {
    return this.reservaRepository.find();
  }

  async findOne(id: number) {
    const reserva = await this.reservaRepository.findOne({
      where: { idReserva: id },
      relations: ['cancha', 'cancha.fotos', 'cancha.sede', 'cliente', 'cliente.persona'],
    });

    if (!reserva) {
      throw new NotFoundException({
        error: 'Reserva no encontrada',
        idReserva: id
      });
    }

    return this.transformarReservaDetalle(reserva);
  }

  // Obtener todas las reservas de un usuario/cliente
  async findByUsuario(idCliente: number) {
    const reservas = await this.reservaRepository.find({
      where: { 
        idCliente,
        eliminadoEn: IsNull()
      },
      relations: ['cancha', 'cancha.fotos', 'cancha.sede', 'cancelaciones'],
      order: {
        creadoEn: 'DESC'
      }
    });

    const activas = reservas.filter(r => r.estado === 'Confirmada' || r.estado === 'Pendiente').length;
    const completadas = reservas.filter(r => r.estado === 'Completada').length;
    const canceladas = reservas.filter(r => r.estado === 'Cancelada').length;

    return {
      reservas: reservas.map(r => this.transformarReservaLista(r)),
      total: reservas.length,
      activas,
      completadas,
      canceladas
    };
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  async findByCancha(canchaId: number) {
    const reservas = await this.reservaRepository.find({
      where: { 
        cancha: { idCancha: canchaId },
        eliminadoEn: IsNull()
      },
      relations: ['cancelaciones']
    });

    // Transformar al formato esperado por el frontend
    return reservas.map(reserva => {
      const iniciaEn = new Date(reserva.iniciaEn);
      const terminaEn = new Date(reserva.terminaEn);

      return {
        idReserva: reserva.idReserva,
        fecha: iniciaEn.toISOString().split('T')[0], // "2025-10-20"
        horaInicio: iniciaEn.toTimeString().slice(0, 5), // "09:00"
        horaFin: terminaEn.toTimeString().slice(0, 5), // "10:00"
        estado: this.determinarEstado(reserva),
      };
    });
  }

  private determinarEstado(reserva: Reserva): string {
    // Si tiene cancelaciones, está cancelada
    if (reserva.cancelaciones && reserva.cancelaciones.length > 0) {
      return 'Cancelada';
    }
    // Si requiere aprobación, está pendiente
    if (reserva.requiereAprobacion) {
      return 'Pendiente';
    }
    // Por defecto está confirmada
    return 'Confirmada';
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  findByDuenio(duenioId: number) {
  return this.reservaRepository.find({
    where: { cancha: { sede: { idPersonaD: duenioId } } },
    relations: ['cliente']
  });
}
  async update(id: number, updateReservaDto: UpdateReservaDto) {
    // 1. Verificar que la reserva existe y obtenerla
    const reserva = await this.reservaRepository.findOne({
      where: { idReserva: id },
      relations: ['cancha']
    });

    if (!reserva) {
      throw new NotFoundException({
        error: 'Reserva no encontrada',
        idReserva: id
      });
    }

    // 2. Validar que no esté cancelada o completada
    if (reserva.estado === 'Cancelada') {
      throw new ConflictException({
        error: 'No se puede modificar una reserva cancelada'
      });
    }

    if (reserva.estado === 'Completada') {
      throw new ConflictException({
        error: 'No se puede modificar una reserva completada'
      });
    }

    // 3. Si se modifica el horario, verificar disponibilidad
    if (updateReservaDto.iniciaEn || updateReservaDto.terminaEn) {
      const nuevaIniciaEn = updateReservaDto.iniciaEn || reserva.iniciaEn;
      const nuevaTerminaEn = updateReservaDto.terminaEn || reserva.terminaEn;

      // Validar que no sea en el pasado
      if (new Date(nuevaIniciaEn) < new Date()) {
        throw new ConflictException({
          error: 'No se puede reservar en una fecha pasada'
        });
      }

      // Verificar que no haya conflicto con otras reservas
      const conflicto = await this.reservaRepository
        .createQueryBuilder('reserva')
        .where('reserva.idCancha = :idCancha', { idCancha: reserva.idCancha })
        .andWhere('reserva.idReserva != :idReserva', { idReserva: id })
        .andWhere('reserva.eliminadoEn IS NULL')
        .andWhere('reserva.estado != :estado', { estado: 'Cancelada' })
        .andWhere(
          '(reserva.iniciaEn < :terminaEn AND reserva.terminaEn > :iniciaEn)',
          {
            iniciaEn: nuevaIniciaEn,
            terminaEn: nuevaTerminaEn,
          }
        )
        .getOne();

      if (conflicto) {
        throw new ConflictException({
          error: 'El nuevo horario ya está reservado por otro usuario'
        });
      }
    }

    // 4. Actualizar la reserva
    await this.reservaRepository.update(id, updateReservaDto);

    // 5. Obtener y devolver la reserva actualizada
    const reservaActualizada = await this.reservaRepository.findOne({
      where: { idReserva: id }
    });

    if (!reservaActualizada) {
      throw new NotFoundException('Reserva no encontrada después de actualizar');
    }

    return {
      message: 'Reserva actualizada exitosamente',
      reserva: {
        idReserva: reservaActualizada.idReserva,
        idCliente: reservaActualizada.idCliente,
        idCancha: reservaActualizada.idCancha,
        iniciaEn: reservaActualizada.iniciaEn,
        terminaEn: reservaActualizada.terminaEn,
        cantidadPersonas: reservaActualizada.cantidadPersonas,
        montoBase: reservaActualizada.montoBase.toString(),
        montoExtra: reservaActualizada.montoExtra.toString(),
        montoTotal: reservaActualizada.montoTotal.toString(),
        estado: reservaActualizada.estado,
        actualizadoEn: reservaActualizada.actualizadoEn,
      }
    };
  }

  async cancelar(id: number, motivo?: string) {
    // 1. Verificar que la reserva existe
    const reserva = await this.reservaRepository.findOne({
      where: { idReserva: id }
    });

    if (!reserva) {
      throw new NotFoundException({
        error: 'Reserva no encontrada',
        idReserva: id
      });
    }

    // 2. Validar que no esté ya cancelada
    if (reserva.estado === 'Cancelada') {
      throw new ConflictException({
        error: 'Esta reserva ya está cancelada'
      });
    }

    // 3. Validar que no esté completada
    if (reserva.estado === 'Completada') {
      throw new ConflictException({
        error: 'No se puede cancelar una reserva ya completada'
      });
    }

    // 4. Calcular política de reembolso
    const ahora = new Date();
    const inicioReserva = new Date(reserva.iniciaEn);
    const horasDeAnticipacion = (inicioReserva.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    let reembolso = {
      aplicable: true,
      porcentaje: 100,
      monto: reserva.montoTotal.toString(),
      mensaje: ''
    };

    if (horasDeAnticipacion < 2) {
      reembolso = {
        aplicable: false,
        porcentaje: 0,
        monto: '0.00',
        mensaje: 'No se puede cancelar una reserva con menos de 2 horas de anticipación'
      };
      throw new ConflictException({
        error: 'No se puede cancelar una reserva con menos de 2 horas de anticipación',
        reembolso
      });
    } else if (horasDeAnticipacion < 24) {
      reembolso = {
        aplicable: true,
        porcentaje: 50,
        monto: (reserva.montoTotal * 0.5).toFixed(2),
        mensaje: 'Se reembolsará el 50% porque cancelaste con menos de 24 horas de anticipación'
      };
    } else {
      reembolso.mensaje = 'Se reembolsará el 100% porque cancelaste con más de 24 horas de anticipación';
    }

    // 5. Cancelar la reserva
    await this.reservaRepository.update(id, {
      estado: 'Cancelada'
    });

    const reservaCancelada = await this.reservaRepository.findOne({
      where: { idReserva: id }
    });

    if (!reservaCancelada) {
      throw new NotFoundException('Reserva no encontrada después de cancelar');
    }

    return {
      message: 'Reserva cancelada exitosamente',
      reserva: {
        idReserva: reservaCancelada.idReserva,
        idCliente: reservaCancelada.idCliente,
        idCancha: reservaCancelada.idCancha,
        estado: reservaCancelada.estado,
        canceladoEn: reservaCancelada.actualizadoEn,
        motivoCancelacion: motivo || 'Sin motivo especificado'
      },
      reembolso
    };
  }

  remove(id: number) {
    return this.reservaRepository.softDelete(id);
  }

  // ============================================
  // MÉTODOS DE TRANSFORMACIÓN
  // ============================================

  private transformarReservaLista(reserva: Reserva) {
    const foto = reserva.cancha?.fotos?.[0];
    
    return {
      idReserva: reserva.idReserva,
      idCliente: reserva.idCliente,
      idCancha: reserva.idCancha,
      iniciaEn: reserva.iniciaEn,
      terminaEn: reserva.terminaEn,
      cantidadPersonas: reserva.cantidadPersonas,
      requiereAprobacion: reserva.requiereAprobacion,
      montoBase: reserva.montoBase.toString(),
      montoExtra: reserva.montoExtra.toString(),
      montoTotal: reserva.montoTotal.toString(),
      estado: reserva.estado,
      metodoPago: 'Tarjeta', // TODO: Agregar campo real
      codigoQR: this.generarCodigoQR(reserva.idReserva),
      creadoEn: reserva.creadoEn,
      actualizadoEn: reserva.actualizadoEn,
      cancha: {
        idCancha: reserva.cancha.idCancha,
        nombre: reserva.cancha.nombre,
        superficie: reserva.cancha.superficie,
        cubierta: reserva.cancha.cubierta,
        precio: reserva.cancha.precio.toString(),
        fotos: reserva.cancha.fotos?.map(f => ({
          idFoto: f.idFoto,
          urlFoto: f.urlFoto
        })) || [],
        sede: {
          idSede: reserva.cancha.sede.idSede,
          nombre: reserva.cancha.sede.nombre,
          direccion: reserva.cancha.sede.direccion,
          ciudad: reserva.cancha.sede.latitud || 'N/A',
          telefono: reserva.cancha.sede.telefono,
          email: reserva.cancha.sede.email
        }
      }
    };
  }

  private transformarReservaDetalle(reserva: Reserva) {
    return {
      reserva: {
        idReserva: reserva.idReserva,
        idCliente: reserva.idCliente,
        idCancha: reserva.idCancha,
        iniciaEn: reserva.iniciaEn,
        terminaEn: reserva.terminaEn,
        cantidadPersonas: reserva.cantidadPersonas,
        requiereAprobacion: reserva.requiereAprobacion,
        montoBase: reserva.montoBase.toString(),
        montoExtra: reserva.montoExtra.toString(),
        montoTotal: reserva.montoTotal.toString(),
        estado: reserva.estado,
        metodoPago: 'Tarjeta',
        codigoQR: this.generarCodigoQR(reserva.idReserva),
        creadoEn: reserva.creadoEn,
        actualizadoEn: reserva.actualizadoEn,
        cliente: reserva.cliente ? {
          idCliente: reserva.cliente.idCliente,
          persona: reserva.cliente.persona ? {
            nombres: reserva.cliente.persona.nombres,
            paterno: reserva.cliente.persona.paterno,
            materno: reserva.cliente.persona.materno,
            telefono: reserva.cliente.persona.telefono
          } : null
        } : null,
        cancha: {
          idCancha: reserva.cancha.idCancha,
          nombre: reserva.cancha.nombre,
          superficie: reserva.cancha.superficie,
          cubierta: reserva.cancha.cubierta,
          aforoMax: reserva.cancha.aforoMax,
          dimensiones: reserva.cancha.dimensiones,
          precio: reserva.cancha.precio.toString(),
          iluminacion: reserva.cancha.iluminacion,
          fotos: reserva.cancha.fotos?.map(f => ({
            idFoto: f.idFoto,
            urlFoto: f.urlFoto
          })) || [],
          sede: {
            idSede: reserva.cancha.sede.idSede,
            nombre: reserva.cancha.sede.nombre,
            direccion: reserva.cancha.sede.direccion,
            ciudad: reserva.cancha.sede.latitud || 'N/A',
            telefono: reserva.cancha.sede.telefono,
            email: reserva.cancha.sede.email,
            horarioApertura: '08:00:00',
            horarioCierre: '22:00:00'
          }
        },
        historial: [
          {
            accion: 'Creada',
            fecha: reserva.creadoEn,
            usuario: reserva.cliente?.persona ? 
              `${reserva.cliente.persona.nombres} ${reserva.cliente.persona.paterno}` : 
              'Usuario'
          }
        ]
      }
    };
  }

  private generarCodigoQR(idReserva: number): string {
    return `ROGU-${String(idReserva).padStart(8, '0')}`;
  }
}
