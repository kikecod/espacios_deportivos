import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCalificaCanchaDto } from './dto/create-califica_cancha.dto';
import { UpdateCalificaCanchaDto } from './dto/update-califica_cancha.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CalificaCancha } from './entities/califica_cancha.entity';
import { Reserva } from '../reservas/entities/reserva.entity';
import { Cancha } from '../cancha/entities/cancha.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Repository, Not, IsNull } from 'typeorm';
import { ValidarResenaDto } from './dto/validar-resena.dto';
import { ResenaResponseDto } from './dto/resena-response.dto';
import { RatingCanchaDto } from './dto/rating-cancha.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CalificaCanchaService {

  constructor(
    @InjectRepository(CalificaCancha)
    private calificaCanchaRepository: Repository<CalificaCancha>,
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    @InjectRepository(Cancha)
    private canchaRepository: Repository<Cancha>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private eventEmitter: EventEmitter2,
  ) {}

  // ==========================================
  // HELPER: Convertir idUsuario a idCliente
  // ==========================================
  private async getClienteIdFromUsuarioId(idUsuario: number): Promise<number> {
    const result = await this.clienteRepository
      .createQueryBuilder('cliente')
      .innerJoin('usuarios', 'usuario', 'usuario.idPersona = cliente.idCliente')
      .where('usuario.idUsuario = :idUsuario', { idUsuario })
      .select('cliente.idCliente')
      .getRawOne();

    if (!result) {
      throw new UnauthorizedException('Usuario no tiene perfil de cliente');
    }

    return result.cliente_idCliente;
  }  // ==========================================
  // VALIDACIÓN CRÍTICA ⭐⭐⭐
  // ==========================================
  async canUserReviewFromUsuario(idUsuario: number, idReserva: number): Promise<ValidarResenaDto> {
    const idCliente = await this.getClienteIdFromUsuarioId(idUsuario);
    return this.canUserReview(idCliente, idReserva);
  }

  async findByClienteFromUsuario(idUsuario: number) {
    const idCliente = await this.getClienteIdFromUsuarioId(idUsuario);
    return this.findByCliente(idCliente);
  }

  async getMisReservasPendientesFromUsuario(idUsuario: number) {
    const idCliente = await this.getClienteIdFromUsuarioId(idUsuario);
    return this.getMisReservasPendientes(idCliente);
  }

  async updateFromUsuario(idUsuario: number, idCancha: number, updateDto: UpdateCalificaCanchaDto) {
    const idCliente = await this.getClienteIdFromUsuarioId(idUsuario);
    return this.update(idCliente, idCancha, updateDto);
  }

  async removeFromUsuario(idUsuario: number, idCancha: number) {
    const idCliente = await this.getClienteIdFromUsuarioId(idUsuario);
    return this.remove(idCliente, idCancha);
  }

  async canUserReview(idCliente: number, idReserva: number): Promise<ValidarResenaDto> {
    // 1. Buscar reserva con relaciones
    const reserva = await this.reservaRepository.findOne({
      where: { idReserva },
      relations: ['cliente', 'cancha'],
    });

    // 2. Validar que la reserva existe
    if (!reserva) {
      return {
        puedeResenar: false,
        razon: 'La reserva no existe',
      };
    }

    // 3. Validar que es su reserva
    if (reserva.idCliente !== idCliente) {
      return {
        puedeResenar: false,
        razon: 'Esta reserva no te pertenece',
      };
    }

    // 4. Validar que la reserva fue completada
    if (!reserva.completadaEn) {
      return {
        puedeResenar: false,
        razon: 'La reserva aún no ha sido completada',
      };
    }

    // 5. Calcular días transcurridos desde que se completó
    const ahora = new Date();
    const milisegundosPorDia = 1000 * 60 * 60 * 24;
    const diasTranscurridos = Math.floor(
      (ahora.getTime() - reserva.completadaEn.getTime()) / milisegundosPorDia
    );

    // 6. Validar período de 14 días
    if (diasTranscurridos > 14) {
      return {
        puedeResenar: false,
        razon: 'El período de 14 días para reseñar ha expirado',
      };
    }

    // 7. Verificar que no tenga reseña previa para esta cancha
    const resenaExistente = await this.calificaCanchaRepository.findOne({
      where: {
        idCliente,
        idCancha: reserva.idCancha,
      },
    });

    if (resenaExistente) {
      return {
        puedeResenar: false,
        razon: 'Ya dejaste una reseña para esta cancha',
      };
    }

    // 8. Calcular fecha límite y días restantes
    const fechaLimite = new Date(reserva.completadaEn);
    fechaLimite.setDate(fechaLimite.getDate() + 14);
    const diasRestantes = 14 - diasTranscurridos;

    return {
      puedeResenar: true,
      diasRestantes,
      fechaLimite,
    };
  }

  // ==========================================
  // CREAR RESEÑA
  // ==========================================
  async create(idUsuario: number, createDto: CreateCalificaCanchaDto): Promise<ResenaResponseDto> {
    // 0. Obtener idCliente desde idUsuario
    const idCliente = await this.getClienteIdFromUsuarioId(idUsuario);

    // 1. Validar que puede reseñar
    const validacion = await this.canUserReview(idCliente, createDto.idReserva);
    
    if (!validacion.puedeResenar) {
      throw new BadRequestException(validacion.razon);
    }

    // 2. Obtener reserva para idCancha
    const reserva = await this.reservaRepository.findOne({
      where: { idReserva: createDto.idReserva },
      relations: ['cancha'],
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    // 3. Crear reseña
    const nuevaResena = this.calificaCanchaRepository.create({
      idCliente,
      idCancha: reserva.idCancha,
      idReserva: createDto.idReserva,
      puntaje: createDto.puntaje,
      comentario: createDto.comentario,
      estado: 'ACTIVA',
    });

    const resenaGuardada = await this.calificaCanchaRepository.save(nuevaResena);

    // 4. Recalcular rating de la cancha
    await this.calcularRatingPromedio(reserva.idCancha);

    // 5. Emitir evento para sincronización con Neo4j
    this.eventEmitter.emit('calificacion.creada', {
      idCliente,
      idCancha: reserva.idCancha,
      puntaje: createDto.puntaje,
      comentario: createDto.comentario || '',
      creadaEn: resenaGuardada.creadaEn,
    });

    // 6. Retornar con formato completo
    return this.mapToResenaResponse(resenaGuardada);
  }

  // ==========================================
  // ACTUALIZAR RESEÑA
  // ==========================================
  async update(
    idCliente: number,
    idCancha: number,
    updateDto: UpdateCalificaCanchaDto,
  ): Promise<ResenaResponseDto> {
    // 1. Buscar reseña
    const resena = await this.calificaCanchaRepository.findOne({
      where: { idCliente, idCancha },
      relations: ['cliente', 'cliente.persona', 'reserva'],
    });

    if (!resena) {
      throw new NotFoundException('Reseña no encontrada');
    }

    // 2. Validar que esté activa
    if (resena.estado === 'ELIMINADA') {
      throw new BadRequestException('No puedes editar una reseña eliminada');
    }

    // 3. Opcional: validar tiempo máximo para editar (ej. 7 días)
    const diasDesdeCreacion = Math.floor(
      (new Date().getTime() - resena.creadaEn.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diasDesdeCreacion > 7) {
      throw new BadRequestException('Ya no puedes editar esta reseña (máximo 7 días)');
    }

    // 4. Actualizar campos
    const puntajeAnterior = resena.puntaje;
    if (updateDto.puntaje !== undefined) {
      resena.puntaje = updateDto.puntaje;
    }
    if (updateDto.comentario !== undefined) {
      resena.comentario = updateDto.comentario;
    }
    resena.editadaEn = new Date();

    const resenaActualizada = await this.calificaCanchaRepository.save(resena);

    // 5. Si cambió el puntaje, recalcular rating
    if (updateDto.puntaje !== undefined && puntajeAnterior !== updateDto.puntaje) {
      await this.calcularRatingPromedio(idCancha);
    }

    // 6. Emitir evento para sincronización con Neo4j
    this.eventEmitter.emit('calificacion.creada', {
      idCliente,
      idCancha,
      puntaje: resenaActualizada.puntaje,
      comentario: resenaActualizada.comentario || '',
      creadaEn: resenaActualizada.editadaEn || resenaActualizada.creadaEn,
    });

    return this.mapToResenaResponse(resenaActualizada);
  }

  // ==========================================
  // ELIMINAR RESEÑA (SOFT DELETE)
  // ==========================================
  async remove(idCliente: number, idCancha: number): Promise<void> {
    const resena = await this.calificaCanchaRepository.findOne({
      where: { idCliente, idCancha },
    });

    if (!resena) {
      throw new NotFoundException('Reseña no encontrada');
    }

    // Soft delete
    resena.estado = 'ELIMINADA';
    await this.calificaCanchaRepository.save(resena);

    // Recalcular rating sin esta reseña
    await this.calcularRatingPromedio(idCancha);
  }

  // ==========================================
  // CONSULTAS
  // ==========================================
  async findByCancha(
    idCancha: number,
    page: number = 1,
    limit: number = 10,
    ordenar: string = 'recientes',
  ): Promise<RatingCanchaDto> {
    // 1. Query base
    const queryBuilder = this.calificaCanchaRepository
      .createQueryBuilder('resena')
      .leftJoinAndSelect('resena.cliente', 'cliente')
      .leftJoinAndSelect('cliente.persona', 'persona')
      .where('resena.idCancha = :idCancha', { idCancha })
      .andWhere('resena.estado = :estado', { estado: 'ACTIVA' });

    // 2. Ordenamiento
    switch (ordenar) {
      case 'mejores':
        queryBuilder.orderBy('resena.puntaje', 'DESC').addOrderBy('resena.creadaEn', 'DESC');
        break;
      case 'peores':
        queryBuilder.orderBy('resena.puntaje', 'ASC').addOrderBy('resena.creadaEn', 'DESC');
        break;
      case 'recientes':
      default:
        queryBuilder.orderBy('resena.creadaEn', 'DESC');
        break;
    }

    // 3. Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // 4. Ejecutar query
    const [resenas, total] = await queryBuilder.getManyAndCount();

    // 5. Calcular distribución
    const distribucion = await this.calcularDistribucion(idCancha);

    // 6. Obtener rating de la cancha
    const cancha = await this.canchaRepository.findOne({ where: { idCancha } });

    // 7. Mapear respuestas
    const resenasMapeadas = await Promise.all(
      resenas.map(r => this.mapToResenaResponse(r))
    );

    return {
      ratingPromedio: cancha?.ratingPromedio || 0,
      totalResenas: cancha?.totalResenas || 0,
      distribucion,
      resenas: resenasMapeadas,
      paginacion: {
        pagina: page,
        limite: limit,
        total,
        totalPaginas: Math.ceil(total / limit),
      },
    };
  }

  async findByCliente(idCliente: number): Promise<ResenaResponseDto[]> {
    const resenas = await this.calificaCanchaRepository.find({
      where: { idCliente, estado: 'ACTIVA' },
      relations: ['cancha', 'cancha.sede', 'cliente', 'cliente.persona'],
      order: { creadaEn: 'DESC' },
    });

    return Promise.all(resenas.map(r => this.mapToResenaResponse(r)));
  }

  async findOne(idCliente: number, idCancha: number): Promise<ResenaResponseDto> {
    const resena = await this.calificaCanchaRepository.findOne({
      where: { idCliente, idCancha },
      relations: ['cliente', 'cliente.persona', 'cancha'],
    });

    if (!resena) {
      throw new NotFoundException('Reseña no encontrada');
    }

    return this.mapToResenaResponse(resena);
  }

  async getMisReservasPendientes(idCliente: number): Promise<any[]> {
    const ahora = new Date();
    const hace14Dias = new Date();
    hace14Dias.setDate(hace14Dias.getDate() - 14);

    // Buscar reservas que tienen completadaEn (fueron completadas)
    const reservas = await this.reservaRepository.find({
      where: {
        idCliente,
        completadaEn: Not(IsNull()), // Buscar solo las que fueron completadas
      },
      relations: ['cancha', 'cancha.sede'],
      order: { completadaEn: 'DESC' },
    });

    // Filtrar las que están en período de reseña y no tienen reseña
    const reservasPendientes: any[] = [];
    
    for (const reserva of reservas) {
      // Verificar que se completó hace menos de 14 días
      if (!reserva.completadaEn) continue; // Skip si no tiene completadaEn

      const diasTranscurridos = Math.floor(
        (ahora.getTime() - reserva.completadaEn.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diasTranscurridos <= 14) {
        // Verificar si ya tiene reseña
        const resenaExistente = await this.calificaCanchaRepository.findOne({
          where: {
            idCliente,
            idCancha: reserva.idCancha,
          },
        });

        if (!resenaExistente) {
          const diasRestantes = 14 - diasTranscurridos;

          reservasPendientes.push({
            ...reserva,
            diasRestantes,
            fechaLimite: new Date(reserva.completadaEn.getTime() + 14 * 24 * 60 * 60 * 1000),
          });
        }
      }
    }

    return reservasPendientes;
  }

  // ==========================================
  // CÁLCULO DE RATING
  // ==========================================
  async calcularRatingPromedio(idCancha: number): Promise<void> {
    const result = await this.calificaCanchaRepository
      .createQueryBuilder('resena')
      .select('AVG(resena.puntaje)', 'promedio')
      .addSelect('COUNT(resena.puntaje)', 'total')
      .where('resena.idCancha = :idCancha', { idCancha })
      .andWhere('resena.estado = :estado', { estado: 'ACTIVA' })
      .getRawOne();

    const promedio = parseFloat(result.promedio) || 0;
    const total = parseInt(result.total) || 0;

    // Redondear a 2 decimales
    const promedioRedondeado = Math.round(promedio * 100) / 100;

    await this.canchaRepository.update(
      { idCancha },
      {
        ratingPromedio: promedioRedondeado,
        totalResenas: total,
      },
    );
  }

  async calcularDistribucion(idCancha: number): Promise<{
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  }> {
    const distribucion = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    for (let i = 1; i <= 5; i++) {
      const count = await this.calificaCanchaRepository.count({
        where: {
          idCancha,
          puntaje: i,
          estado: 'ACTIVA',
        },
      });
      distribucion[i] = count;
    }

    return distribucion;
  }

  // ==========================================
  // MAPPERS
  // ==========================================
  private async mapToResenaResponse(resena: CalificaCancha): Promise<ResenaResponseDto> {
    const persona = resena.cliente?.persona;
    const nombreCompleto = persona
      ? `${persona.nombres} ${persona.paterno}`.trim()
      : 'Usuario Anónimo';

    // Obtener el avatar del usuario (avatarPath tiene prioridad sobre urlFoto)
    let avatarUrl: string | null = null;
    if (persona) {
      const usuario = await this.usuarioRepository.findOne({
        where: { idPersona: persona.idPersona }
      });
      avatarUrl = usuario?.avatarPath || persona.urlFoto || null;
    }

    return {
      idCliente: resena.idCliente,
      idCancha: resena.idCancha,
      idReserva: resena.idReserva,
      cliente: {
        nombre: nombreCompleto,
        avatar: avatarUrl || '/uploads/avatar_default.jpg',
      },
      puntaje: resena.puntaje,
      comentario: resena.comentario,
      creadaEn: resena.creadaEn,
      editadaEn: resena.editadaEn,
      estado: resena.estado,
    };
  }
}
