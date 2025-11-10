import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
import { MailsService } from 'src/mails/mails.service';
import { PasesAccesoService } from 'src/pases_acceso/pases_acceso.service';

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

    private mailsService: MailsService,
    private pasesAccesoService: PasesAccesoService, // Inyectar servicio de pases
  ) {}

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

    // 3. Validar que la reserva esté dentro del horario de operación de la cancha
    this.validarHorarioOperacion(cancha, createReservaDto.iniciaEn, createReservaDto.terminaEn);

    // 4. Verificar disponibilidad de horario (excluir canceladas y eliminadas)
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

    // 5. Enviar mail de confirmación/pendiente
    try {
      await this.mailsService.sendMailReserva(reservaGuardada.idReserva);
    } catch (error) {
      console.error('Error enviando email:', (error as Error).message);
    }

    // 6. Devolver respuesta formateada
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
        completadaEn: reserva.completadaEn, // ⭐ Agregado
      };
    });
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  async findByCanchaAndDate(canchaId: number, fecha: string) {
    const reservas = await this.reservaRepository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.cancelaciones', 'cancelaciones')
      .where('reserva.idCancha = :canchaId', { canchaId })
      .andWhere('reserva.eliminadoEn IS NULL')
      .andWhere('DATE(reserva.iniciaEn) = :fecha', { fecha })
      .orderBy('reserva.iniciaEn', 'ASC')
      .getMany();

    // Transformar al formato esperado por el frontend
    return reservas.map(reserva => {
      const iniciaEn = new Date(reserva.iniciaEn);
      const terminaEn = new Date(reserva.terminaEn);

      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const formatTime = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
      };

      return {
        idReserva: reserva.idReserva,
        idCliente: reserva.idCliente,
        cantidadPersonas: reserva.cantidadPersonas,
        requiereAprobacion: reserva.requiereAprobacion,
        montoBase: reserva.montoBase,
        montoExtra: reserva.montoExtra,
        montoTotal: reserva.montoTotal,
        fecha: formatDate(iniciaEn),
        horaInicio: formatTime(iniciaEn),
        horaFin: formatTime(terminaEn),
        estado: this.determinarEstado(reserva),
        completadaEn: reserva.completadaEn, // ⭐ Agregado
      };
    });
  }

  private determinarEstado(reserva: Reserva): string {
    if (reserva.cancelaciones && reserva.cancelaciones.length > 0 && reserva.estado !== 'Cancelada') {
      return 'Cancelada';
    }
    return reserva.estado || 'Pendiente';
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

    return reservas.map(reserva => {
      const iniciaEn = new Date(reserva.iniciaEn);
      const terminaEn = new Date(reserva.terminaEn);

      return {
        idReserva: reserva.idReserva,
        fecha: iniciaEn.toISOString().split('T')[0],
        horaInicio: iniciaEn.toTimeString().slice(0, 8),
        horaFin: terminaEn.toTimeString().slice(0, 8),
        estado: this.determinarEstado(reserva),
        completadaEn: reserva.completadaEn, // ⭐ Agregado
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

    // 5. 🎯 Invalidar pases de acceso asociados
    try {
      await this.pasesAccesoService.cancelarPasesDeReserva(id);
      console.log(`✅ Pases de acceso invalidados para reserva #${id}`);
    } catch (error) {
      console.error(`❌ Error al invalidar pases para reserva #${id}:`, error);
      // No fallar la cancelación si hay error al invalidar pases
    }

    // 6. Retornar respuesta formateada
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

  /**
   * Valida que la reserva esté dentro del horario de operación de la cancha
   */
  private validarHorarioOperacion(cancha: Cancha, iniciaEn: Date, terminaEn: Date): void {
    const inicioDate = new Date(iniciaEn);
    const finDate = new Date(terminaEn);

    const horaInicioReserva = inicioDate.getHours();
    const minutoInicioReserva = inicioDate.getMinutes();
    const horaFinReserva = finDate.getHours();
    const minutoFinReserva = finDate.getMinutes();

    const horaInicioStr = `${String(horaInicioReserva).padStart(2, '0')}:${String(minutoInicioReserva).padStart(2, '0')}:00`;
    const horaFinStr = `${String(horaFinReserva).padStart(2, '0')}:${String(minutoFinReserva).padStart(2, '0')}:00`;

    const [aperturaHora, aperturaMinuto] = cancha.horaApertura.split(':').map(Number);
    const [cierreHora, cierreMinuto] = cancha.horaCierre.split(':').map(Number);

    const aperturaEnMinutos = aperturaHora * 60 + aperturaMinuto;
    const cierreEnMinutos = cierreHora * 60 + cierreMinuto;

    const inicioEnMinutos = horaInicioReserva * 60 + minutoInicioReserva;
    const finEnMinutos = horaFinReserva * 60 + minutoFinReserva;

    let problema: string | null = null;

    if (inicioEnMinutos < aperturaEnMinutos) {
      problema = `La hora de inicio (${horaInicioStr}) es antes de la apertura (${cancha.horaApertura})`;
    } else if (finEnMinutos > cierreEnMinutos) {
      problema = `La hora de fin (${horaFinStr}) es después del cierre (${cancha.horaCierre})`;
    } else if (inicioEnMinutos < aperturaEnMinutos || finEnMinutos > cierreEnMinutos) {
      problema = `La reserva está fuera del horario de operación`;
    }

    if (problema) {
      throw new BadRequestException({
        error: 'La reserva debe estar dentro del horario de operación de la cancha',
        detalles: {
          horarioCancha: {
            apertura: cancha.horaApertura,
            cierre: cancha.horaCierre,
          },
          reservaSolicitada: {
            inicio: horaInicioStr,
            fin: horaFinStr,
          },
          problema,
        },
      });
    }
  }

  /**
   * 🎯 Marcar una reserva como completada
   */
  async completarReserva(id: number) {
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

    if (reserva.estado === 'Cancelada') {
      throw new BadRequestException({
        error: 'No se puede completar una reserva cancelada',
        idReserva: id
      });
    }

    if (reserva.completadaEn) {
      throw new ConflictException({
        error: 'Esta reserva ya fue completada anteriormente',
        idReserva: id,
        completadaEn: reserva.completadaEn
      });
    }

    const completadaEn = new Date();
    await this.reservaRepository.update(id, {
      completadaEn
    });

    return {
      message: 'Reserva completada exitosamente',
      reserva: {
        idReserva: id,
        completadaEn,
        periodoResena: {
          inicio: completadaEn,
          fin: new Date(completadaEn.getTime() + 14 * 24 * 60 * 60 * 1000),
          diasRestantes: 14
        }
      }
    };
  }

  /**
   * 🤖 Completar automáticamente reservas que ya pasaron
   */
  async completarReservasAutomaticas() {
    const ahora = new Date();
    
    const reservasParaCompletar = await this.reservaRepository.find({
      where: {
        terminaEn: LessThan(ahora),
        estado: 'Confirmada',
        completadaEn: IsNull(),
        eliminadoEn: IsNull()
      }
    });

    const resultados: Array<{
      idReserva: number;
      terminaEn: Date;
      completadaEn: Date;
    }> = [];

    for (const reserva of reservasParaCompletar) {
      await this.reservaRepository.update(reserva.idReserva, {
        completadaEn: reserva.terminaEn
      });

      resultados.push({
        idReserva: reserva.idReserva,
        terminaEn: reserva.terminaEn,
        completadaEn: reserva.terminaEn
      });
    }

    return {
      message: `${reservasParaCompletar.length} reserva(s) completada(s) automáticamente`,
      cantidad: reservasParaCompletar.length,
      reservas: resultados
    };
  }

  /**
   * 🧪 [DEV ONLY] Simular el flujo completo de una reserva
   */
  async simularUsoReserva(id: number) {
    const reserva = await this.reservaRepository.findOne({
      where: { idReserva: id },
      relations: ['cliente', 'cancha']
    });

    if (!reserva) {
      throw new NotFoundException({
        error: 'Reserva no encontrada',
        idReserva: id
      });
    }

    if (reserva.estado === 'Cancelada') {
      throw new BadRequestException({
        error: 'No se puede simular una reserva cancelada'
      });
    }

    if (reserva.estado === 'Pendiente') {
      await this.reservaRepository.update(id, {
        estado: 'Confirmada'
      });
    }

    const ahora = new Date();
    await this.reservaRepository.update(id, {
      completadaEn: ahora
    });

    const reservaActualizada = await this.reservaRepository.findOne({
      where: { idReserva: id },
      relations: ['cliente', 'cancha']
    });

    if (!reservaActualizada || !reservaActualizada.completadaEn) {
      throw new Error('Error al actualizar la reserva');
    }

    return {
      message: '✅ Reserva simulada exitosamente (DEV)',
      simulacion: {
        pasos: [
          '1. ✓ Reserva confirmada',
          '2. ✓ Cliente llegó a la cancha (QR escaneado)',
          '3. ✓ Cliente usó la cancha',
          '4. ✓ Cliente salió (QR escaneado)',
          '5. ✓ Reserva marcada como completada'
        ],
        advertencia: '⚠️ Este endpoint es SOLO para desarrollo/testing'
      },
      reserva: {
        idReserva: reservaActualizada.idReserva,
        estado: reservaActualizada.estado,
        completadaEn: reservaActualizada.completadaEn,
        cliente: {
          idCliente: reservaActualizada.cliente.idCliente,
          nombre: `Cliente #${reservaActualizada.cliente.idCliente}`
        },
        cancha: {
          idCancha: reservaActualizada.cancha.idCancha,
          nombre: reservaActualizada.cancha.nombre
        },
        periodoResena: {
          inicio: reservaActualizada.completadaEn,
          fin: new Date(reservaActualizada.completadaEn.getTime() + 14 * 24 * 60 * 60 * 1000),
          diasRestantes: 14
        }
      },
      proximoPaso: {
        mensaje: 'Ahora el cliente puede dejar una reseña',
        endpoint: 'POST /califica-cancha',
        diasDisponibles: 14
      }
    };
  }
}