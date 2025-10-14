import { Injectable } from '@nestjs/common';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { Repository } from 'typeorm';
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
  findByCancha(canchaId: number) {
    return this.reservaRepository.find({
      where: { cancha: { idCancha: canchaId } }
    });
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
