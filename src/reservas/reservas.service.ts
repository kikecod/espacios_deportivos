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
  update(id: number, updateReservaDto: UpdateReservaDto) {
    return this.reservaRepository.update(id, updateReservaDto);
  }

  remove(id: number) {
    return this.reservaRepository.delete(id);
  }
}
