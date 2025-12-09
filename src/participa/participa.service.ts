import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participa, TipoAsistente } from './entities/participa.entity';
import { CreateParticipaDto } from './dto/create-participa.dto';
import { UpdateParticipaDto } from './dto/update-participa.dto';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Persona, Genero } from 'src/personas/entities/personas.entity';
import { Usuario } from 'src/usuarios/usuario.entity';
import { MailsService } from 'src/mails/mails.service';

@Injectable()
export class ParticipaService {
  constructor(
    @InjectRepository(Participa)
    private readonly participaRepo: Repository<Participa>,
    @InjectRepository(Reserva)
    private readonly reservaRepo: Repository<Reserva>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Persona)
    private readonly personaRepo: Repository<Persona>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly mailsService: MailsService,
  ) {}

  async create(dto: CreateParticipaDto) {
    const reserva = await this.reservaRepo.findOne({
      where: { idReserva: dto.idReserva },
      relations: ['participaciones'],
    });
    if (!reserva) {
      throw new NotFoundException(`Reserva #${dto.idReserva} no encontrada`);
    }

    if (reserva.estado !== 'Confirmada') {
      throw new BadRequestException(
        `No se puede agregar participantes a una reserva no confirmada`,
      );
    }

    // Asegurar que el titular exista como participaci\u00f3n para control de cupos
    await this.ensureTitularParticipation(reserva);

    const totalParticipantes =
      (await this.participaRepo.count({
        where: { idReserva: reserva.idReserva },
      })) || 0;

    if (totalParticipantes >= reserva.cantidadPersonas) {
      throw new BadRequestException('No hay cupos disponibles en la reserva');
    }

    const {
      cliente,
      tipo,
      nombreMostrar,
      correoInvitacion,
    } = await this.resolveClienteFromPayload(dto, reserva);

    // Evitar duplicado
    const existe = await this.participaRepo.findOne({
      where: { idReserva: reserva.idReserva, idCliente: cliente.idCliente },
    });
    if (existe) {
      throw new ConflictException('Ya existe este participante en la reserva');
    }

    const participa = this.participaRepo.create({
      idReserva: reserva.idReserva,
      idCliente: cliente.idCliente,
      confirmado: dto.confirmado ?? false,
      checkInEn: dto.checkInEn ? new Date(dto.checkInEn) : undefined,
      tipoAsistente: tipo,
      nombreMostrar,
      correoInvitacion,
    });
    await this.participaRepo.save(participa);

    // Enviar invitaci\u00f3n si hay correo
    if (correoInvitacion) {
      try {
        await this.mailsService.sendMailInvitacionReserva(
          reserva.idReserva,
          correoInvitacion,
          nombreMostrar || cliente.persona?.nombres,
        );
      } catch (error) {
        // No bloquear la creaci\u00f3n por fallo de email
        console.error('No se pudo enviar correo de invitaci\u00f3n:', error);
      }
    }

    return this.findOneByReserva(reserva.idReserva);
  }

  findAll() {
    return this.participaRepo.find({
      relations: ['cliente'],
    });
  }

  async findOneByReserva(idReserva: number) {
    const reserva = await this.reservaRepo.findOne({
      where: { idReserva },
      relations: [
        'cliente',
        'cliente.persona',
        'cancha',
        'cancha.fotos',
        'cancha.sede',
        'cancha.sede.fotos',
      ],
    });

    if (!reserva) {
      throw new NotFoundException(
        `No se encontr\u00f3 la reserva #${idReserva}`,
      );
    }

    await this.ensureTitularParticipation(reserva);

    const participantes = await this.participaRepo.find({
      where: { idReserva },
      relations: ['cliente', 'cliente.persona'],
      order: { creadoEn: 'ASC' },
    });

    const cuposOcupados = participantes.length;
    const cuposTotales = reserva.cantidadPersonas;

    return {
      reserva: {
        idReserva: reserva.idReserva,
        estado: reserva.estado,
        iniciaEn: reserva.iniciaEn,
        terminaEn: reserva.terminaEn,
        cantidadPersonas: reserva.cantidadPersonas,
      },
      cupos: {
        total: cuposTotales,
        ocupados: cuposOcupados,
        disponibles: Math.max(cuposTotales - cuposOcupados, 0),
      },
      titular: reserva.cliente?.persona
        ? {
            idCliente: reserva.cliente.idCliente,
            nombre: `${reserva.cliente.persona.nombres} ${reserva.cliente.persona.paterno ?? ''}`.trim(),
          }
        : null,
      participantes: participantes.map((p) => ({
        idCliente: p.idCliente,
        tipoAsistente: p.tipoAsistente,
        nombre:
          p.nombreMostrar ||
          `${p.cliente?.persona?.nombres ?? ''} ${p.cliente?.persona?.paterno ?? ''}`.trim() ||
          'Invitado',
        correo: p.correoInvitacion ?? null,
        confirmado: p.confirmado,
        checkInEn: p.checkInEn,
      })),
      cancha: reserva.cancha
        ? {
            idCancha: reserva.cancha.idCancha,
            nombre: reserva.cancha.nombre,
            fotos: (reserva.cancha.fotos || []).map((f) => f.urlFoto),
          }
        : null,
      sede: reserva.cancha?.sede
        ? {
            idSede: reserva.cancha.sede.idSede,
            nombre: reserva.cancha.sede.nombre,
            ciudad: reserva.cancha.sede.city,
            direccion: reserva.cancha.sede.direccion,
            fotos: (reserva.cancha.sede.fotos || []).map((f) => f.urlFoto),
          }
        : null,
    };
  }

  async findOne(idReserva: number, idCliente: number) {
    const participa = await this.participaRepo.findOne({
      where: { idReserva, idCliente },
      relations: ['reserva', 'cliente'],
    });

    if (!participa) {
      throw new NotFoundException(
        `Participa no encontrada (reserva #${idReserva}, cliente #${idCliente})`,
      );
    }

    return participa;
  }

  

  async update(
    idReserva: number,
    idCliente: number,
    dto: UpdateParticipaDto,
  ) {
    const participa = await this.findOne(idReserva, idCliente);

    Object.assign(participa, dto);
    return this.participaRepo.save(participa);
  }

  async remove(idReserva: number, idCliente: number) {
    const participa = await this.findOne(idReserva, idCliente);
    await this.participaRepo.remove(participa);
    return { deleted: true };
  }

  /**
   * Garantiza que el titular de la reserva est\u00e9 registrado como participante.
   */
  private async ensureTitularParticipation(reserva: Reserva): Promise<void> {
    const titularId = reserva.idCliente;
    if (!titularId) return;

    const existeTitular = await this.participaRepo.findOne({
      where: { idReserva: reserva.idReserva, idCliente: titularId },
    });

    if (existeTitular) return;

    const titular = await this.clienteRepo.findOne({
      where: { idCliente: titularId },
      relations: ['persona'],
    });
    if (!titular) return;

    const nuevo = this.participaRepo.create({
      idReserva: reserva.idReserva,
      idCliente: titular.idCliente,
      confirmado: true,
      tipoAsistente: 'titular',
      nombreMostrar: titular.persona
        ? `${titular.persona.nombres} ${titular.persona.paterno ?? ''}`.trim()
        : 'Titular',
    });
    await this.participaRepo.save(nuevo);
  }

  /**
   * Resuelve el cliente a agregar seg\u00fan ID o correo y crea registros temporales si es necesario.
   */
  private async resolveClienteFromPayload(
    dto: CreateParticipaDto,
    reserva: Reserva,
  ): Promise<{
    cliente: Cliente;
    tipo: TipoAsistente;
    nombreMostrar?: string | null;
    correoInvitacion?: string | null;
  }> {
    // 1) Si llega ID de cliente, usarlo
    if (dto.idCliente) {
      const cliente = await this.clienteRepo.findOne({
        where: { idCliente: dto.idCliente },
        relations: ['persona'],
      });
      if (!cliente) {
        throw new NotFoundException(`Cliente #${dto.idCliente} no encontrado`);
      }
      const tipo: TipoAsistente =
        dto.idCliente === reserva.idCliente ? 'titular' : 'invitado_registrado';
      return {
        cliente,
        tipo,
        nombreMostrar: cliente.persona
          ? `${cliente.persona.nombres} ${cliente.persona.paterno ?? ''}`.trim()
          : undefined,
      };
    }

    // 2) Si llega correo, buscar usuario; si no existe, crear persona/cliente temporal
    if (dto.correo) {
      const usuario = await this.usuarioRepo.findOne({
        where: { correo: dto.correo },
        relations: ['persona'],
      });
      if (usuario && usuario.persona) {
        const clienteExistente =
          (await this.clienteRepo.findOne({
            where: { idCliente: usuario.persona.idPersona },
            relations: ['persona'],
          })) ||
          (await this.clienteRepo.save(
            this.clienteRepo.create({
              idCliente: usuario.persona.idPersona,
            }),
          ));

        return {
          cliente: clienteExistente,
          tipo:
            clienteExistente.idCliente === reserva.idCliente
              ? 'titular'
              : 'invitado_registrado',
          nombreMostrar: `${usuario.persona.nombres} ${usuario.persona.paterno ?? ''}`.trim(),
          correoInvitacion: dto.correo,
        };
      }

      // Crear persona/cliente temporal para invitado no registrado
      const personaNueva = await this.crearPersonaTemporal(
        dto.nombres ||
          `Invitado ${dto.correo.split('@')[0] || 'sin-nombre'}`,
        dto.paterno,
        dto.materno,
      );
      const clienteNuevo = await this.clienteRepo.save(
        this.clienteRepo.create({ idCliente: personaNueva.idPersona }),
      );
      return {
        cliente: clienteNuevo,
        tipo: 'invitado_no_registrado',
        nombreMostrar: personaNueva.nombres,
        correoInvitacion: dto.correo,
      };
    }

    // 3) Sin datos -> generar desconocido N
    const desconocidoIndex =
      (await this.participaRepo.count({
        where: { idReserva: reserva.idReserva, tipoAsistente: 'desconocido' },
      })) + 1;
    const personaTemp = await this.crearPersonaTemporal(
      `Desconocido ${desconocidoIndex} Reserva ${reserva.idReserva}`,
    );
    const clienteTemp = await this.clienteRepo.save(
      this.clienteRepo.create({ idCliente: personaTemp.idPersona }),
    );

    return {
      cliente: clienteTemp,
      tipo: 'desconocido',
      nombreMostrar: personaTemp.nombres,
      correoInvitacion: null,
    };
  }

  /**
   * Crea persona b\u00e1sica para invitados temporales.
   */
  private async crearPersonaTemporal(
    nombre: string,
    paterno?: string,
    materno?: string,
  ): Promise<Persona> {
    const persona = this.personaRepo.create({
      nombres: nombre,
      paterno: paterno || ' ',
      materno: materno || ' ',
      telefono: '0000000000',
      telefonoVerificado: false,
      fechaNacimiento: new Date('2000-01-01'),
      genero: Genero.OTRO,
      direccion: null,
      ciudad: null,
      pais: null,
    });
    return this.personaRepo.save(persona);
  }
}
