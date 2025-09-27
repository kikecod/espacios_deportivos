import { Injectable } from '@nestjs/common';
import { CreatePaseAccesoDto } from './dto/create-pase_acceso.dto';
import { UpdatePaseAccesoDto } from './dto/update-pase_acceso.dto';

@Injectable()
export class PaseAccesoService {
  create(createPaseAccesoDto: CreatePaseAccesoDto) {
    return 'This action adds a new paseAcceso';
  }

  findAll() {
    return `This action returns all paseAcceso`;
  }

  findOne(id: number) {
    return `This action returns a #${id} paseAcceso`;
  }

  update(id: number, updatePaseAccesoDto: UpdatePaseAccesoDto) {
    return `This action updates a #${id} paseAcceso`;
  }

  remove(id: number) {
    return `This action removes a #${id} paseAcceso`;
  }
}
