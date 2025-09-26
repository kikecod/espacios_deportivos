import { Injectable } from '@nestjs/common';
import { CreateControladorDto } from './dto/create-controlador.dto';
import { UpdateControladorDto } from './dto/update-controlador.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Controlador } from './entities/controlador.entity';

@Injectable()
export class ControladorService {
  constructor(
    @InjectRepository(Controlador) 
    private controladorRepository: Repository<Controlador>,
  ) {}

  create(createControladorDto: CreateControladorDto) {
    const controlador = this.controladorRepository.create(createControladorDto);
    return this.controladorRepository.save(controlador);
  }

  findAll() {
    return this.controladorRepository.find();
  }

  findOne(id: number) {
    return this.controladorRepository.findOneBy({idPersonaOpe: id});
  }

  update(id: number, updateControladorDto: UpdateControladorDto) {
    return this.controladorRepository.update({idPersonaOpe: id}, updateControladorDto);
  }

  remove(id: number) {
    return this.controladorRepository.delete({idPersonaOpe: id});
  }
}
