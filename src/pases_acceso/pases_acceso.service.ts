import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreatePasesAccesoDto } from './dto/create-pases_acceso.dto';
import { UpdatePasesAccesoDto } from './dto/update-pases_acceso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasesAcceso, EstadoPase } from './entities/pases_acceso.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Controla } from 'src/controla/entities/controla.entity';
import { Controlador } from 'src/controlador/entities/controlador.entity';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { Trabaja } from 'src/trabaja/entities/trabaja.entity';
import * as crypto from 'crypto';

@Injectable()
export class PasesAccesoService {

  constructor(
    @InjectRepository(PasesAcceso)
    private pasesAccesoRepository: Repository<PasesAcceso>,
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    @InjectRepository(Controla)
    private controlaRepository: Repository<Controla>,
    @InjectRepository(Controlador)
    private controladorRepository: Repository<Controlador>,
    private readonly usuariosService: UsuariosService,
    @InjectRepository(Trabaja)
    private trabajaRepository: Repository<Trabaja>,
  ){}

  create(createPasesAccesoDto: CreatePasesAccesoDto) {
    const paseAcceso = this.pasesAccesoRepository.create(createPasesAccesoDto);
    return this.pasesAccesoRepository.save(paseAcceso);
  }

  private base64url(buf: Buffer) {
    return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  async createForReserva(reservaId: number, userId: number) {
    const reserva = await this.reservaRepository.findOne({ where: { idReserva: reservaId }, relations: ['cliente', 'cliente.persona', 'cliente.persona.usuario', 'cancha', 'cancha.sede'] });
    if (!reserva) throw new NotFoundException('Reserva no encontrada');

    // owner check: el controller aplicará guard, pero revalidamos
    const usuario = await this.usuariosService.findOne(userId);
    const reservaUsuarioId = (reserva as any).cliente?.persona?.usuario?.idUsuario;
    if (usuario.idUsuario !== reservaUsuarioId) throw new UnauthorizedException('No eres dueño de la reserva');

    const tolMin = parseInt(process.env.TOLERANCE_MINUTES || '10', 10);
    const desde = new Date(new Date(reserva.iniciaEn).getTime() - tolMin * 60000);
    const hasta = new Date(new Date(reserva.terminaEn).getTime() + tolMin * 60000);

    const codeBytes = crypto.randomBytes(32);
    const code = this.base64url(codeBytes);
    const hash = crypto.createHash('sha256').update(code).digest('hex');

    const pase = this.pasesAccesoRepository.create({
      idReserva: reserva.idReserva,
      reserva,
      hashCode: hash,
      validoDesde: desde as any,
      validoHasta: hasta as any,
      estado: 'ACTIVO',
    } as any);
    await this.pasesAccesoRepository.save(pase);
    return { code, validoDesde: desde, validoHasta: hasta };
  }

  async verifyScan(code: string, userId: number, roles: string[]) {
    if (!code) throw new BadRequestException('Código requerido');
    const hash = crypto.createHash('sha256').update(code).digest('hex');
    const pase = await this.pasesAccesoRepository.findOne({ where: { hashCode: hash } });
    if (!pase) throw new NotFoundException('Pase no encontrado');
    if (pase.estado === EstadoPase.USADO) {
      await this.controlaRepository.save(this.controlaRepository.create({
        idPersonaOpe: 0,
        idReserva: pase.idReserva,
        idPaseAcceso: pase.idPaseAcceso,
        accion: 'SCAN',
        resultado: 'REUSO',
      } as any));
      throw new UnauthorizedException('Pase ya utilizado');
    }
    const now = new Date();
    if (now < pase.validoDesde || now > pase.validoHasta) {
      await this.controlaRepository.save(this.controlaRepository.create({
        idPersonaOpe: 0,
        idReserva: pase.idReserva,
        idPaseAcceso: pase.idPaseAcceso,
        accion: 'SCAN',
        resultado: 'FUERA_DE_VENTANA',
      } as any));
      throw new UnauthorizedException('Pase fuera de ventana');
    }

    const usuario = await this.usuariosService.findOne(userId);
    let controlador = await this.controladorRepository.findOne({ where: { idPersonaOpe: usuario.idPersona } });
    if (!controlador) {
      // si es ADMIN, se le permite escanear; upsert de Controlador efímero
      if (roles.includes('ADMIN')) {
        const nuevo = this.controladorRepository.create({
          idPersonaOpe: usuario.idPersona,
          codigoEmpleado: 'ADMIN',
          activo: true,
          turno: 'ADMIN',
        } as any);
        controlador = await this.controladorRepository.save(nuevo as any);
      } else {
        throw new UnauthorizedException('No eres controlador');
      }
    }

    // Validar que el controlador trabaje en la sede de la reserva (ADMIN bypass)
    if (!roles.includes('ADMIN')) {
      const reservaFull = await this.reservaRepository.findOne({ where: { idReserva: pase.idReserva }, relations: ['cancha', 'cancha.sede'] });
      if (!reservaFull) throw new NotFoundException('Reserva no encontrada');
      const sedeId = (reservaFull as any).cancha?.sede?.idSede;
      if (!sedeId) throw new UnauthorizedException('Reserva sin sede');
      const trabaja = await this.trabajaRepository.findOne({ where: { idPersonaOpe: (controlador as any).idPersonaOpe, idSede: sedeId, activo: true } });
      if (!trabaja) {
        await this.controlaRepository.save(this.controlaRepository.create({
          idPersonaOpe: (controlador as any).idPersonaOpe,
          idReserva: pase.idReserva,
          idPaseAcceso: pase.idPaseAcceso,
          accion: 'SCAN',
          resultado: 'NO_AUTORIZADO',
        } as any));
        throw new UnauthorizedException('No estás habilitado para esta sede');
      }
      const today = new Date();
      const fi = trabaja.fechaInicio ? new Date(trabaja.fechaInicio) : undefined;
      const ff = (trabaja as any).fechaFin ? new Date((trabaja as any).fechaFin) : undefined;
      if ((fi && today < fi) || (ff && today > ff)) {
        await this.controlaRepository.save(this.controlaRepository.create({
          idPersonaOpe: (controlador as any).idPersonaOpe,
          idReserva: pase.idReserva,
          idPaseAcceso: pase.idPaseAcceso,
          accion: 'SCAN',
          resultado: 'FUERA_DE_TURNO',
        } as any));
        throw new UnauthorizedException('Controlador fuera de turno');
      }
    }

    await this.controlaRepository.save(this.controlaRepository.create({
      idPersonaOpe: (controlador as any).idPersonaOpe,
      idReserva: pase.idReserva,
      idPaseAcceso: pase.idPaseAcceso,
      accion: 'SCAN',
      resultado: 'OK',
    } as any));
    // marcar como USADO si el pase es one-time
    pase.estado = EstadoPase.USADO;
    await this.pasesAccesoRepository.save(pase);

    return { ok: true, reservaId: pase.idReserva };
  }

  findAll() {
    return this.pasesAccesoRepository.find();
  }

  findOne(id: number) {
    return this.pasesAccesoRepository.findOneBy ({ idPaseAcceso: id });
  }

  update(id: number, updatePasesAccesoDto: UpdatePasesAccesoDto) {
    return this.pasesAccesoRepository.update(id, updatePasesAccesoDto);
  }

  remove(id: number) {
    return this.pasesAccesoRepository.delete(id);
  }
}
