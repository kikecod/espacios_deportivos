import { Injectable } from '@nestjs/common';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sede } from './entities/sede.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SedeService {

  constructor(
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
  ) {}

  async create(createSedeDto: CreateSedeDto) {
    const sede = this.sedeRepository.create(createSedeDto);
    return await this.sedeRepository.save(sede);
  }

  async findAll() {
    return await this.sedeRepository.find();
  }

  async findOne(id: number) {
    return await this.sedeRepository.findOneBy({ idSede: id });
  }

  async update(id: number, updateSedeDto: UpdateSedeDto) {
    return await this.sedeRepository.update(id, updateSedeDto);
  }

  async remove(id: number) {
    return await this.sedeRepository.softDelete(id);
  }
}
