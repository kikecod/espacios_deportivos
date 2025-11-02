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
import { Cancelacion } from 'src/cancelacion/entities/cancelacion.entity';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    @InjectRepository(Cancha)
    private canchaRepository: Repository<Cancha>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(Cancelacion)
    private cancelacionRepository: Repository<Cancelacion>,
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

    // 3. Verificar disponibilidad de horario (excluir canceladas y eliminadas)
    const reservaExistente = await this.reservaRepository
      .createQueryBuilder('reserva')
      .where('reserva.idCancha = :idCancha', { idCancha: createReservaDto.idCancha })
      .andWhere('reserva.eliminadoEn IS NULL')
      .andWhere('reserva.estado != :estadoCancelada', { estadoCancelada: 'Cancelada' })
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
            idReserva: reservaExistente.idReserva,
            iniciaEn: reservaExistente.iniciaEn,
            terminaEn: reservaExistente.terminaEn,
            estado: reservaExistente.estado,
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

  findOne(id: number) {
    return this.reservaRepository.findOneBy({ idReserva: id });
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
        idCliente: reserva.idCliente,
        cantidadPersonas: reserva.cantidadPersonas,
        requiereAprobacion: reserva.requiereAprobacion,
        montoBase: reserva.montoBase,
        montoExtra: reserva.montoExtra,
        montoTotal: reserva.montoTotal,
        fecha: iniciaEn.toISOString().split('T')[0], // "2025-10-20"
        horaInicio: iniciaEn.toTimeString().slice(0, 5), // "09:00"
        horaFin: terminaEn.toTimeString().slice(0, 5), // "10:00"
        estado: this.determinarEstado(reserva),
      };
    });
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  async findByCanchaAndDate(canchaId: number, fecha: string) {
    // Parse fecha en formato YYYY-MM-DD
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    // Usar query builder para mayor flexibilidad con las fechas
    const reservas = await this.reservaRepository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.cancelaciones', 'cancelaciones')
      .where('reserva.idCancha = :canchaId', { canchaId })
      .andWhere('reserva.eliminadoEn IS NULL')
      .andWhere(
        '(DATE(reserva.iniciaEn) = :fecha OR (reserva.iniciaEn <= :fechaFin AND reserva.terminaEn >= :fechaInicio))',
        {
          fecha: fecha,
          fechaInicio: fechaInicio,
          fechaFin: fechaFin,
        }
      )
      .orderBy('reserva.iniciaEn', 'ASC')
      .getMany();

    // Transformar al formato esperado por el frontend
    return reservas.map(reserva => {
      const iniciaEn = new Date(reserva.iniciaEn);
      const terminaEn = new Date(reserva.terminaEn);

      return {
        idReserva: reserva.idReserva,
        idCliente: reserva.idCliente,
        cantidadPersonas: reserva.cantidadPersonas,
        requiereAprobacion: reserva.requiereAprobacion,
        montoBase: reserva.montoBase,
        montoExtra: reserva.montoExtra,
        montoTotal: reserva.montoTotal,
        fecha: iniciaEn.toISOString().split('T')[0], // "2025-10-28"
        horaInicio: iniciaEn.toTimeString().slice(0, 8), // "09:00:00"
        horaFin: terminaEn.toTimeString().slice(0, 8), // "10:00:00"
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

  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE])
  async findByUsuario(idUsuario: number) {
    const reservas = await this.reservaRepository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.cliente', 'cliente')
      .leftJoinAndSelect('cliente.persona', 'persona')
      .leftJoin('usuarios', 'usuario', 'usuario.idPersona = persona.idPersona')
      .leftJoinAndSelect('reserva.cancha', 'cancha')
      .leftJoinAndSelect('cancha.sede', 'sede')
      .leftJoinAndSelect('reserva.cancelaciones', 'cancelaciones')
      .where('usuario.idUsuario = :idUsuario', { idUsuario })
      .andWhere('reserva.eliminadoEn IS NULL')
      .orderBy('reserva.iniciaEn', 'DESC')
      .getMany();

    // Transformar al formato esperado
    return reservas.map(reserva => {
      const iniciaEn = new Date(reserva.iniciaEn);
      const terminaEn = new Date(reserva.terminaEn);

      return {
        idReserva: reserva.idReserva,
        fecha: iniciaEn.toISOString().split('T')[0],
        horaInicio: iniciaEn.toTimeString().slice(0, 8),
        horaFin: terminaEn.toTimeString().slice(0, 8),
        estado: this.determinarEstado(reserva),
        cancha: {
          idCancha: reserva.cancha.idCancha,
          nombre: reserva.cancha.nombre,
          sede: {
            idSede: reserva.cancha.sede.idSede,
            nombre: reserva.cancha.sede.nombre
          }
        },
        montoTotal: reserva.montoTotal,
        cantidadPersonas: reserva.cantidadPersonas
      };
    });
  }

  update(id: number, updateReservaDto: UpdateReservaDto) {
    return this.reservaRepository.update(id, updateReservaDto);
  }

  async remove(id: number, motivo?: string, canal: string = 'API') {
    // 1. Verificar que la reserva existe
    const reserva = await this.reservaRepository.findOne({
      where: { idReserva: id },
      relations: ['cancelaciones']
    });

    if (!reserva) {
      throw new NotFoundException({
        error: 'Reserva no encontrada',
        idReserva: id
      });
    }

    // 2. Verificar si ya está cancelada
    if (reserva.cancelaciones && reserva.cancelaciones.length > 0) {
      throw new ConflictException({
        error: 'La reserva ya está cancelada',
        canceladaEn: reserva.cancelaciones[0].canceladaEn
      });
    }

    // 3. Crear el registro de cancelación
    const cancelacion = this.cancelacionRepository.create({
      idReserva: id,
      idCliente: reserva.idCliente,
      motivo: motivo || 'Cancelación solicitada por el usuario',
      canal: canal
    });

    await this.cancelacionRepository.save(cancelacion);

    // 4. Actualizar el estado de la reserva
    await this.reservaRepository.update(id, {
      estado: 'Cancelada'
    });

    // 5. Retornar respuesta formateada
    return {
      message: 'Reserva cancelada exitosamente',
      cancelacion: {
        idCancelacion: cancelacion.idCancelacion,
        idReserva: id,
        canceladaEn: cancelacion.canceladaEn,
        motivo: cancelacion.motivo,
        canal: cancelacion.canal
      }
    };
  }
}
