import { Injectable } from '@nestjs/common';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { IsNull, Repository } from 'typeorm';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>
  ) { }

  create(createReservaDto: CreateReservaDto) {
    const reserva = this.reservaRepository.create(createReservaDto);
    //console.log(reserva);
    return this.reservaRepository.save(reserva);
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
