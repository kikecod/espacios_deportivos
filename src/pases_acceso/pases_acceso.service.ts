import { Injectable } from '@nestjs/common';
import { CreatePasesAccesoDto } from './dto/create-pases_acceso.dto';
import { UpdatePasesAccesoDto } from './dto/update-pases_acceso.dto';

@Injectable()
export class PasesAccesoService {
  create(createPasesAccesoDto: CreatePasesAccesoDto) {
    return 'This action adds a new pasesAcceso';
  }

  findAll() {
    return `This action returns all pasesAcceso`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pasesAcceso`;
  }

  update(id: number, updatePasesAccesoDto: UpdatePasesAccesoDto) {
    return `This action updates a #${id} pasesAcceso`;
  }

  remove(id: number) {
    return `This action removes a #${id} pasesAcceso`;
  }
}
