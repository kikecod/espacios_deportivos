import { Injectable } from '@nestjs/common';
import { CreateCanchaDto } from './dto/create-cancha.dto';
import { UpdateCanchaDto } from './dto/update-cancha.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cancha } from './entities/cancha.entity';

@Injectable()
export class CanchaService {

  constructor(
    @InjectRepository(Cancha)
    private readonly canchaRepository: Repository<Cancha>,
  ) {}

  async create(createCanchaDto: CreateCanchaDto) {
    const cancha = this.canchaRepository.create(createCanchaDto);
    return await this.canchaRepository.save(cancha);
  }

  async findAll() {
    return await this.canchaRepository.find();
  }

  async findOne(id: number) {
    return await this.canchaRepository.findOneBy({ idCancha: id });
  }

  async update(id: number, updateCanchaDto: UpdateCanchaDto) {
    return await this.canchaRepository.update(id, updateCanchaDto);
  }

  async remove(id: number) {
    return await this.canchaRepository.softDelete(id);
  }
}
