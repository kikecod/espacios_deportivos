import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePasesAccesoDto } from './dto/create-pases_acceso.dto';
import { UpdatePasesAccesoDto } from './dto/update-pases_acceso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository, Not, IsNull } from 'typeorm';
import { EstadoPaseAcceso, PasesAcceso } from './entities/pases_acceso.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import { ValidarQRDto } from './dto/validar-qr.dto';
import { ResultadoValidacionDto } from './dto/resultado-validacion.dto';
import { Controla } from 'src/controla/entities/controla.entity';
import { QRDesigner } from './utils/qr-designer';
import { Trabaja } from 'src/trabaja/entities/trabaja.entity';
import { Participa, TipoAsistente } from 'src/participa/entities/participa.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Persona, Genero } from 'src/personas/entities/personas.entity';

@Injectable()
export class PasesAccesoService {

  constructor(
    @InjectRepository(PasesAcceso)
    private pasesAccesoRepository: Repository<PasesAcceso>,
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    @InjectRepository(Controla)
    private controlaRepository: Repository<Controla>,
    @InjectRepository(Trabaja)
    private trabajaRepository: Repository<Trabaja>,
    @InjectRepository(Participa)
    private participaRepository: Repository<Participa>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
  ) { }

  /**
   * Genera un pase de acceso para una reserva confirmada
   * El usoMaximo se establece según cantidadPersonas de la reserva
   */
  async generarPaseParaReserva(reserva: Reserva): Promise<PasesAcceso> {
    // Validar que no exista ya un pase para esta reserva
    const paseExistente = await this.pasesAccesoRepository.findOne({
      where: { 
        idReserva: reserva.idReserva,
        estado: In([EstadoPaseAcceso.PENDIENTE, EstadoPaseAcceso.ACTIVO, EstadoPaseAcceso.USADO])
      }
    });

    if (paseExistente) {
      return paseExistente; // Retornar el existente
    }

    // 1. Generar código QR único (UUID v4)
    const codigoQR = uuidv4();

    // 2. Generar hash seguro
    const hashCode = crypto
      .createHash('sha256')
      .update(`${codigoQR}-${reserva.idReserva}-${Date.now()}`)
      .digest('hex');

    // 3. Calcular ventana de validez (30 min antes y después)
    const validoDesde = new Date(reserva.iniciaEn.getTime() - 30 * 60 * 1000);
    const validoHasta = new Date(reserva.terminaEn.getTime() + 30 * 60 * 1000);

    // 4. Establecer usoMaximo = cantidadPersonas (PUNTO CLAVE)
    const usoMaximo = reserva.cantidadPersonas;

    // 5. Crear pase
    const pase = this.pasesAccesoRepository.create({
      idReserva: reserva.idReserva,
      codigoQR,
      hashCode,
      validoDesde,
      validoHasta,
      estado: EstadoPaseAcceso.PENDIENTE,
      vecesUsado: 0,
      usoMaximo,
      primerUsoEn: null,
      ultimoUsoEn: null
    });

    // 6. Guardar y retornar
    return await this.pasesAccesoRepository.save(pase);
  }

  /**
   * Genera imagen QR como Buffer (PNG)
   */
  async generarImagenQR(idPase: number): Promise<Buffer> {
    const pase = await this.pasesAccesoRepository.findOne({
      where: { idPaseAcceso: idPase },
      relations: ['reserva', 'reserva.cliente', 'reserva.cancha']
    });

    if (!pase) {
      throw new NotFoundException('Pase de acceso no encontrado');
    }

    // Preparar datos para el QR
    const datosQR = {
      paseId: pase.idPaseAcceso,
      reservaId: pase.idReserva,
      codigo: pase.codigoQR,
      hash: pase.hashCode,
      valido: pase.validoHasta.toISOString(),
      cancha: pase.reserva?.cancha?.nombre || 'N/A',
      cliente: pase.reserva?.cliente?.persona?.nombres || 'N/A'
    };

    // Generar QR como Buffer PNG
    const qrString = JSON.stringify(datosQR);
    const qrBuffer = await QRCode.toBuffer(qrString, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrBuffer;
  }

  /**
   * Genera una imagen QR estilizada con branding y detalles de la reserva
   * Utiliza canvas para crear un diseño profesional
   */
  async generarQREstilizado(idPaseAcceso: number): Promise<Buffer> {
    // 1. Obtener pase con todas las relaciones necesarias
    const pase = await this.pasesAccesoRepository.findOne({
      where: { idPaseAcceso },
      relations: [
        'reserva', 
        'reserva.cancha', 
        'reserva.cliente', 
        'reserva.cliente.persona'
      ]
    });

    if (!pase) {
      throw new NotFoundException(`Pase de acceso #${idPaseAcceso} no encontrado`);
    }

    // 2. Formatear información para el diseñador
    const nombreCliente = pase.reserva.cliente?.persona?.nombres 
      ? `${pase.reserva.cliente.persona.nombres} ${pase.reserva.cliente.persona.paterno || ''}`
      : 'Cliente';

    const canchaInfo = pase.reserva.cancha?.nombre || 'Cancha';

    const fechaInicio = new Date(pase.reserva.iniciaEn);
    const fechaHora = `${fechaInicio.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })} - ${fechaInicio.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;

    // 3. Crear instancia del diseñador
    const designer = new QRDesigner();

    // 4. Generar QR estilizado
    const styledQRBuffer = await designer.generateStyledQR({
      codigoQR: pase.codigoQR,
      reservaId: pase.idReserva,
      canchaInfo: canchaInfo,
      fechaHora: fechaHora,
      clienteNombre: nombreCliente,
      cantidadPersonas: pase.reserva.cantidadPersonas,
      estado: pase.estado,
    });

    return styledQRBuffer;
  }

  /**
   * Valida un código QR escaneado
   * Retorna resultado con información detallada
   */
  async validarQR(dto: ValidarQRDto): Promise<ResultadoValidacionDto> {
    if (!dto.idControlador) {
      throw new BadRequestException('Falta idPersonaOpe/idControlador');
    }

    const pase = await this.pasesAccesoRepository.findOne({
      where: { codigoQR: dto.codigoQR },
      relations: ['reserva', 'reserva.cliente', 'reserva.cancha', 'reserva.cancha.sede'],
    });

    if (!pase) {
      await this.registrarValidacion(null, dto.idControlador, dto.accion, 'QR_NO_EXISTE');
      return {
        valido: false,
        motivo: 'QR_NO_EXISTE',
        mensaje: 'Codigo QR invalido o no registrado',
      };
    }

    const idSedeReserva = pase.reserva?.cancha?.id_Sede || pase.reserva?.cancha?.sede?.idSede;
    if (!idSedeReserva) {
      await this.registrarValidacion(pase, dto.idControlador, dto.accion, 'SEDE_NO_RELACIONADA');
      return {
        valido: false,
        motivo: 'SEDE_NO_RELACIONADA',
        mensaje: 'No se pudo determinar la sede de la reserva para validar el pase',
      };
    }

    const asignacion = await this.trabajaRepository.findOne({
      where: { idPersonaOpe: dto.idControlador, idSede: idSedeReserva, activo: true },
    });

    if (!asignacion) {
      await this.registrarValidacion(pase, dto.idControlador, dto.accion, 'CONTROLADOR_NO_ASIGNADO');
      return {
        valido: false,
        motivo: 'CONTROLADOR_NO_ASIGNADO',
        mensaje: 'El controlador no esta asignado a la sede de esta reserva',
        sede: idSedeReserva,
      };
    }

    if (pase.estado === EstadoPaseAcceso.CANCELADO) {
      await this.registrarValidacion(pase, dto.idControlador, dto.accion, 'PASE_CANCELADO');
      return {
        valido: false,
        motivo: 'PASE_CANCELADO',
        mensaje: 'La reserva fue cancelada',
      };
    }

    if (pase.estado === EstadoPaseAcceso.EXPIRADO) {
      await this.registrarValidacion(pase, dto.idControlador, dto.accion, 'PASE_EXPIRADO');
      return {
        valido: false,
        motivo: 'PASE_EXPIRADO',
        mensaje: 'El pase ha expirado',
      };
    }

    const ahora = new Date();
    if (ahora < pase.validoDesde) {
      await this.registrarValidacion(pase, dto.idControlador, dto.accion, 'DEMASIADO_TEMPRANO');
      return {
        valido: false,
        motivo: 'DEMASIADO_TEMPRANO',
        mensaje: `El pase sera valido desde ${pase.validoDesde.toLocaleString('es-ES')}`,
        validoDesde: pase.validoDesde,
      };
    }

    if (ahora > pase.validoHasta) {
      await this.pasesAccesoRepository.update(pase.idPaseAcceso, {
        estado: EstadoPaseAcceso.EXPIRADO,
      });
      await this.registrarValidacion(pase, dto.idControlador, dto.accion, 'PASE_VENCIDO');
      return {
        valido: false,
        motivo: 'PASE_VENCIDO',
        mensaje: `El pase vencio el ${pase.validoHasta.toLocaleString('es-ES')}`,
      };
    }

    const reservaDetallada = await this.reservaRepository.findOne({
      where: { idReserva: pase.idReserva },
      relations: [
        'cliente',
        'cliente.persona',
        'cancha',
        'cancha.fotos',
        'cancha.sede',
        'cancha.sede.fotos',
      ],
    });

    if (!reservaDetallada) {
      throw new NotFoundException('Reserva asociada no encontrada');
    }

    await this.ensureTitularParticipation(reservaDetallada);

    const usosRegistrados = Math.max(
      pase.vecesUsado,
      await this.participaRepository.count({
        where: { idReserva: pase.idReserva, checkInEn: Not(IsNull()) },
      }),
    );

    if (usosRegistrados >= pase.usoMaximo) {
      await this.completarReservaSiCorresponde(pase.reserva, ahora);
      if (pase.estado !== EstadoPaseAcceso.USADO) {
        await this.pasesAccesoRepository.update(pase.idPaseAcceso, {
          estado: EstadoPaseAcceso.USADO,
          vecesUsado: usosRegistrados,
          ultimoUsoEn: ahora,
        });
      }
      await this.registrarValidacion(pase, dto.idControlador, dto.accion, 'AGOTADO');
      return {
        valido: false,
        motivo: 'AGOTADO',
        mensaje: `Pase agotado: Ya ingresaron las ${pase.usoMaximo} personas permitidas`,
        pase: {
          id: pase.idPaseAcceso,
          vecesUsado: usosRegistrados,
          usosRestantes: 0,
          ultimoUso: pase.ultimoUsoEn || new Date(),
        },
      };
    }

    if (pase.reserva.estado !== 'Confirmada') {
      await this.registrarValidacion(pase, dto.idControlador, dto.accion, 'RESERVA_NO_CONFIRMADA');
      return {
        valido: false,
        motivo: 'RESERVA_NO_CONFIRMADA',
        mensaje: `Reserva en estado: ${pase.reserva.estado}`,
      };
    }

    const participante = await this.asignarParticipanteParaAcceso(reservaDetallada);
    if (!participante) {
      await this.registrarValidacion(pase, dto.idControlador, dto.accion, 'AGOTADO');
      return {
        valido: false,
        motivo: 'AGOTADO',
        mensaje: 'No hay cupos disponibles para esta reserva',
      };
    }

    await this.participaRepository.update(
      { idReserva: participante.idReserva, idCliente: participante.idCliente },
      { confirmado: true, checkInEn: ahora },
    );

    const usosDespues = Math.max(
      usosRegistrados + 1,
      await this.participaRepository.count({
        where: { idReserva: pase.idReserva, checkInEn: Not(IsNull()) },
      }),
    );

    const nuevoEstado =
      usosDespues >= pase.usoMaximo ? EstadoPaseAcceso.USADO : EstadoPaseAcceso.ACTIVO;

    await this.pasesAccesoRepository.update(pase.idPaseAcceso, {
      estado: nuevoEstado,
      vecesUsado: usosDespues,
      primerUsoEn: pase.primerUsoEn || ahora,
      ultimoUsoEn: ahora,
    });

    await this.registrarValidacion(
      pase,
      dto.idControlador,
      dto.accion,
      'EXITOSO',
      participante,
    );

    if (nuevoEstado === EstadoPaseAcceso.USADO) {
      await this.completarReservaSiCorresponde(pase.reserva, ahora);
    }

    const iniciaEn = new Date(pase.reserva.iniciaEn);
    const terminaEn = new Date(pase.reserva.terminaEn);
    const horario = `${iniciaEn.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${terminaEn.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;

    return {
      valido: true,
      motivo: 'ACCESO_PERMITIDO',
      mensaje: `Acceso concedido - Persona ${usosDespues} de ${pase.usoMaximo}`,
      pase: {
        id: pase.idPaseAcceso,
        vecesUsado: usosDespues,
        usosRestantes: Math.max(pase.usoMaximo - usosDespues, 0),
        ultimoUso: ahora,
      },
      reserva: {
        id: pase.reserva.idReserva,
        cliente: pase.reserva.cliente?.persona?.nombres || 'N/A',
        cancha: pase.reserva.cancha?.nombre || 'N/A',
        horario,
        cantidadPersonas: pase.reserva.cantidadPersonas,
        sede: reservaDetallada.cancha?.sede?.nombre,
        canchaFoto: reservaDetallada.cancha?.fotos?.[0]?.urlFoto,
        sedeFoto: reservaDetallada.cancha?.sede?.fotos?.[0]?.urlFoto,
      },
      asistente: {
        idCliente: participante.idCliente,
        tipo: participante.tipoAsistente,
        nombre: participante.nombreMostrar || participante.cliente?.persona?.nombres || 'Invitado',
        checkInEn: ahora,
      },
      cupos: {
        total: pase.usoMaximo,
        usados: usosDespues,
        disponibles: Math.max(pase.usoMaximo - usosDespues, 0),
      },
    };
  }


  /**
   * Registra una validación en la tabla Controla
   */
    private async registrarValidacion(
    pase: PasesAcceso | null,
    idControlador: number,
    accion: string,
    resultado: string,
    participante?: Participa,
  ): Promise<void> {
    if (!pase) return;

    try {
      await this.controlaRepository.save({
        idPersonaOpe: idControlador,
        idReserva: pase.idReserva,
        idPaseAcceso: pase.idPaseAcceso,
        accion,
        resultado,
        fecha: new Date(),
        idClienteAcceso: participante?.idCliente,
        tipoAsistente: participante?.tipoAsistente,
        nombreAsistente:
          participante?.nombreMostrar || participante?.cliente?.persona?.nombres,
      });
    } catch (error) {
      console.error('Error al registrar validacion:', error);
    }
  }

  private async ensureTitularParticipation(reserva: Reserva): Promise<void> {
    const titularId = reserva.idCliente;
    if (!titularId) return;

    const existe = await this.participaRepository.findOne({
      where: { idReserva: reserva.idReserva, idCliente: titularId },
    });
    if (existe) return;

    const titular = await this.clienteRepository.findOne({
      where: { idCliente: titularId },
      relations: ['persona'],
    });
    if (!titular) return;

    const nuevo = this.participaRepository.create({
      idReserva: reserva.idReserva,
      idCliente: titular.idCliente,
      confirmado: false,
      tipoAsistente: 'titular',
      nombreMostrar: titular.persona
        ? `${titular.persona.nombres} ${titular.persona.paterno ?? ''}`.trim()
        : 'Titular',
    });
    await this.participaRepository.save(nuevo);
  }

  private async asignarParticipanteParaAcceso(reserva: Reserva): Promise<Participa | null> {
    const participantes = await this.participaRepository.find({
      where: { idReserva: reserva.idReserva },
      relations: ['cliente', 'cliente.persona'],
      order: { creadoEn: 'ASC' },
    });

    const pendiente = participantes.find((p) => !p.checkInEn);
    if (pendiente) return pendiente;

    if (participantes.length < reserva.cantidadPersonas) {
      const indiceDesconocido =
        participantes.filter((p) => p.tipoAsistente === 'desconocido').length + 1;

      const personaTemp = await this.crearPersonaTemporal(
        `Desconocido ${indiceDesconocido} Reserva ${reserva.idReserva}`,
      );
      const clienteTemp = await this.clienteRepository.save(
        this.clienteRepository.create({ idCliente: personaTemp.idPersona }),
      );

      const nuevo = this.participaRepository.create({
        idReserva: reserva.idReserva,
        idCliente: clienteTemp.idCliente,
        tipoAsistente: 'desconocido' as TipoAsistente,
        nombreMostrar: personaTemp.nombres,
        confirmado: false,
      });
      await this.participaRepository.save(nuevo);
      return this.participaRepository.findOne({
        where: { idReserva: reserva.idReserva, idCliente: clienteTemp.idCliente },
        relations: ['cliente', 'cliente.persona'],
      });
    }

    return null;
  }

  private async crearPersonaTemporal(nombre: string): Promise<Persona> {
    const persona = this.personaRepository.create({
      nombres: nombre,
      paterno: ' ',
      materno: ' ',
      telefono: '0000000000',
      telefonoVerificado: false,
      fechaNacimiento: new Date('2000-01-01'),
      genero: Genero.OTRO,
    });
    return this.personaRepository.save(persona);
  }

  /**
   * Obtiene el pase de una reserva (solo información necesaria)
   */
  async findByReserva(idReserva: number): Promise<any> {
    const pase = await this.pasesAccesoRepository.findOne({
      where: { idReserva },
      relations: ['reserva', 'reserva.cliente', 'reserva.cliente.persona', 'reserva.cancha']
    });

    if (!pase) {
      throw new NotFoundException('No se encontró pase para esta reserva');
    }

    // Retornar solo información esencial (sin relaciones innecesarias)
    return {
      idPaseAcceso: pase.idPaseAcceso,
      codigoQR: pase.codigoQR,
      estado: pase.estado,
      vecesUsado: pase.vecesUsado,
      usoMaximo: pase.usoMaximo,
      usosRestantes: pase.usoMaximo - pase.vecesUsado,
      validoDesde: pase.validoDesde,
      validoHasta: pase.validoHasta,
      primerUsoEn: pase.primerUsoEn,
      ultimoUsoEn: pase.ultimoUsoEn,
      creadoEn: pase.creadoEn,
      reserva: {
        idReserva: pase.reserva.idReserva,
        estado: pase.reserva.estado,
        iniciaEn: pase.reserva.iniciaEn,
        terminaEn: pase.reserva.terminaEn,
        cantidadPersonas: pase.reserva.cantidadPersonas,
        montoTotal: pase.reserva.montoTotal,
        cliente: {
          nombre: pase.reserva.cliente?.persona?.nombres || 'N/A',
          apellido: pase.reserva.cliente?.persona?.paterno || ''
        },
        cancha: {
          idCancha: pase.reserva.cancha?.idCancha,
          nombre: pase.reserva.cancha?.nombre || 'N/A',
          superficie: pase.reserva.cancha?.superficie,
          aforoMax: pase.reserva.cancha?.aforoMax
        }
      }
    };
  }

  /**
   * Obtiene todos los pases activos (para dashboard de controladores)
   */
  async findActivos(): Promise<PasesAcceso[]> {
    const ahora = new Date();
    
    return await this.pasesAccesoRepository.find({
      where: {
        estado: In([EstadoPaseAcceso.ACTIVO, EstadoPaseAcceso.PENDIENTE]),
        validoHasta: MoreThan(ahora)
      },
      relations: ['reserva', 'reserva.cliente', 'reserva.cancha'],
      order: {
        validoDesde: 'ASC'
      }
    });
  }

  /**
   * Obtiene historial de validaciones de un pase
   */
  async obtenerHistorialValidaciones(idPase: number): Promise<Controla[]> {
    return await this.controlaRepository.find({
      where: { idPaseAcceso: idPase },
      relations: ['controlador', 'controlador.persona'],
      order: { fecha: 'DESC' }
    });
  }

  /**
   * Marca la reserva como completada si no lo está ya.
   */
  private async completarReservaSiCorresponde(reserva: Reserva, fecha?: Date): Promise<void> {
    if (!reserva) return;
    if (reserva.completadaEn) return;
    const completadaEn = fecha ?? new Date();
    try {
      await this.reservaRepository.update(reserva.idReserva, {
        estado: 'Completada',
        completadaEn,
      });
    } catch (error) {
      console.error('Error al marcar reserva completada:', (error as any)?.message ?? error);
    }
  }

  /**
   * Cancela todos los pases de una reserva
   */
  async cancelarPasesDeReserva(idReserva: number): Promise<void> {
    await this.pasesAccesoRepository.update(
      { 
        idReserva,
        estado: In([EstadoPaseAcceso.PENDIENTE, EstadoPaseAcceso.ACTIVO])
      },
      { estado: EstadoPaseAcceso.CANCELADO }
    );
  }

  /**
   * Activa pases pendientes que ya entraron en su ventana de validez
   * Este método se ejecuta periódicamente (Cron Job)
   */
  async activarPasesPendientes(): Promise<number> {
    const ahora = new Date();
    
    const result = await this.pasesAccesoRepository
      .createQueryBuilder()
      .update(PasesAcceso)
      .set({ estado: EstadoPaseAcceso.ACTIVO })
      .where('estado = :estado', { estado: EstadoPaseAcceso.PENDIENTE })
      .andWhere('validoDesde <= :ahora', { ahora })
      .andWhere('validoHasta > :ahora', { ahora })
      .execute();

    return result.affected || 0;
  }

  /**
   * Expira pases vencidos
   * Este método se ejecuta periódicamente (Cron Job)
   */
  async expirarPasesVencidos(): Promise<number> {
    const ahora = new Date();
    
    const result = await this.pasesAccesoRepository
      .createQueryBuilder()
      .update(PasesAcceso)
      .set({ estado: EstadoPaseAcceso.EXPIRADO })
      .where('estado IN (:...estados)', { 
        estados: [EstadoPaseAcceso.PENDIENTE, EstadoPaseAcceso.ACTIVO] 
      })
      .andWhere('validoHasta < :ahora', { ahora })
      .execute();

    return result.affected || 0;
  }

  // ========== MÉTODOS CRUD BÁSICOS ==========

  create(createPasesAccesoDto: CreatePasesAccesoDto) {
    const paseAcceso = this.pasesAccesoRepository.create(createPasesAccesoDto);
    return this.pasesAccesoRepository.save(paseAcceso);
  }

  findAll() {
    return this.pasesAccesoRepository.find({
      relations: ['reserva', 'reserva.cliente', 'reserva.cancha']
    });
  }

  findOne(id: number) {
    return this.pasesAccesoRepository.findOne({
      where: { idPaseAcceso: id },
      relations: ['reserva', 'reserva.cliente', 'reserva.cancha']
    });
  }

  update(id: number, updatePasesAccesoDto: UpdatePasesAccesoDto) {
    return this.pasesAccesoRepository.update(id, updatePasesAccesoDto);
  }

  remove(id: number) {
    return this.pasesAccesoRepository.delete(id);
  }
}
