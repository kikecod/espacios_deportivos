import { Injectable } from '@nestjs/common';
import { CreatePasesAccesoDto } from './dto/create-pases_acceso.dto';
import { UpdatePasesAccesoDto } from './dto/update-pases_acceso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasesAcceso } from './entities/pases_acceso.entity';

@Injectable()
export class PasesAccesoService {

  constructor(
    @InjectRepository(PasesAcceso)
    private pasesAccesoRepository: Repository<PasesAcceso>
  ){}

  create(createPasesAccesoDto: CreatePasesAccesoDto) {
    const paseAcceso = this.pasesAccesoRepository.create(createPasesAccesoDto);
    return this.pasesAccesoRepository.save(paseAcceso);
  }

  findAll() {
    return this.pasesAccesoRepository.find();
  }

  findOne(id: number) {
    return this.pasesAccesoRepository.findOneBy ({ id_pase_acceso: id });
  }

  update(id: number, updatePasesAccesoDto: UpdatePasesAccesoDto) {
    return this.pasesAccesoRepository.update(id, updatePasesAccesoDto);
  }

  remove(id: number) {
    return this.pasesAccesoRepository.delete(id);
  }
}
