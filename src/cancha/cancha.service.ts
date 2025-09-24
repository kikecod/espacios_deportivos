import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCanchaDto } from './dto/create-cancha.dto';
import { UpdateCanchaDto } from './dto/update-cancha.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cancha } from './entities/cancha.entity';
import { Sede } from 'src/sede/entities/sede.entity';

@Injectable()
export class CanchaService {

  constructor(
    @InjectRepository(Cancha)
    private readonly canchaRepository: Repository<Cancha>,
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>
  ) { }

  async create(createCanchaDto: CreateCanchaDto): Promise<Cancha> {
    const sede = await this.sedeRepository.findOneBy({ idSede: createCanchaDto.idSede });
    if (!sede) {
      throw new NotFoundException('Sede no encontrada');
    }

    const cancha = this.canchaRepository.create({
      ...createCanchaDto,
      id_Sede: sede.idSede,
    });

    return this.canchaRepository.save(cancha);
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
