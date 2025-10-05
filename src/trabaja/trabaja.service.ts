import { Injectable } from '@nestjs/common';
import { CreateTrabajaDto } from './dto/create-trabaja.dto';
import { UpdateTrabajaDto } from './dto/update-trabaja.dto';

@Injectable()
export class TrabajaService {
  create(createTrabajaDto: CreateTrabajaDto) {
    return 'This action adds a new trabaja';
  }

  findAll() {
    return `This action returns all trabaja`;
  }

  findOne(id: number) {
    return `This action returns a #${id} trabaja`;
  }

  update(id: number, updateTrabajaDto: UpdateTrabajaDto) {
    return `This action updates a #${id} trabaja`;
  }

  remove(id: number) {
    return `This action removes a #${id} trabaja`;
  }
}
