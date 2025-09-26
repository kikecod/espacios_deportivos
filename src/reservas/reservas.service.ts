import { Injectable } from '@nestjs/common';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>
  ){}

  create (createReservaDto: CreateReservaDto){
    const reserva = this.reservaRepository.create(createReservaDto);
    //console.log(reserva);
    return this.reservaRepository.save(reserva);
  }

  findAll(){
    return this.reservaRepository.find();
  }

  findOne(id: number){
    return this.reservaRepository.findOneBy({ idReserva: id });
  }

  update(id: number, updateReservaDto: UpdateReservaDto){
    return this.reservaRepository.update(id, updateReservaDto);
  }

  remove(id: number){
    return this.reservaRepository.delete(id);
  }
}
