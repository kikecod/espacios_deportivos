import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateControlaDto } from './dto/create-controla.dto';
import { UpdateControlaDto } from './dto/update-controla.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Controla } from './entities/controla.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ControlaService {

  constructor(
    @InjectRepository(Controla)
    private controlaRepository: Repository<Controla>,
  ) {}

  create(createControlaDto: CreateControlaDto) {
    const controla = this.controlaRepository.create(createControlaDto);
    return this.controlaRepository.save(controla);
  }

  findAll() {
    return this.controlaRepository.find({
      relations: ['controlador', 'reserva', 'paseAcceso'],
    });
  }

  async findBySede(idSede: number) {
    const registros = await this.controlaRepository
      .createQueryBuilder('controla')
      .leftJoinAndSelect('controla.controlador', 'controlador')
      .leftJoinAndSelect('controlador.persona', 'persona')
      .leftJoinAndSelect('controla.reserva', 'reserva')
      .leftJoinAndSelect('reserva.cancha', 'cancha')
      .leftJoinAndSelect('cancha.sede', 'sede')
      .leftJoinAndSelect('reserva.cliente', 'cliente')
      .leftJoinAndSelect('cliente.persona', 'clientePersona')
      .leftJoinAndSelect('controla.paseAcceso', 'paseAcceso')
      .where('sede.idSede = :idSede', { idSede })
      .orderBy('controla.fecha', 'DESC')
      .getMany();

    return registros.map(r => ({
      idPersonaOpe: r.idPersonaOpe,
      idReserva: r.idReserva,
      idPaseAcceso: r.idPaseAcceso,
      accion: r.accion,
      resultado: r.resultado,
      fecha: r.fecha,
      controlador: r.controlador?.persona ? {
        nombre: r.controlador.persona.nombres,
        apellido: `${r.controlador.persona.paterno} ${r.controlador.persona.materno}`.trim(),
      } : null,
      cliente: r.reserva?.cliente?.persona ? {
        nombre: r.reserva.cliente.persona.nombres,
        apellido: `${r.reserva.cliente.persona.paterno} ${r.reserva.cliente.persona.materno}`.trim(),
      } : null,
      cancha: r.reserva?.cancha ? {
        nombre: r.reserva.cancha.nombre,
        idCancha: r.reserva.cancha.idCancha,
      } : null,
      codigoQR: r.paseAcceso?.codigoQR,
      iniciaEn: r.reserva?.iniciaEn,
      terminaEn: r.reserva?.terminaEn,
    }));
  }

  async findOne(idPersonaOpe: number, idReserva: number, idPaseAcceso: number): Promise<Controla> {
    const record = await this.controlaRepository.findOne({
      where: { idPersonaOpe, idReserva, idPaseAcceso },
      relations: ['controlador', 'reserva', 'paseAcceso'],
    });
    if (!record) throw new NotFoundException("Registro CONTROLA no encontrado");
    return record;
  }

  async update(
    idPersonaOpe: number,
    idReserva: number,
    idPaseAcceso: number,
    updateControlaDto: UpdateControlaDto,
  ): Promise<Controla> {
    const whereCondition = { idPersonaOpe, idReserva, idPaseAcceso };
    
    const result = await this.controlaRepository.update(
      whereCondition,
      updateControlaDto,
    );

    if (result.affected === 0) {
      throw new NotFoundException('Registro CONTROLA no encontrado para actualizar');
    }

    // Retorna el registro actualizado
    return this.findOne(idPersonaOpe, idReserva, idPaseAcceso);
  }

  async remove(idPersonaOpe: number, idReserva: number, idPaseAcceso: number): Promise<void> {
    const result = await this.controlaRepository.delete({ idPersonaOpe, idReserva, idPaseAcceso });
    if (result.affected === 0) {
      throw new NotFoundException("Registro CONTROLA no encontrado");
    }
  }
}
