import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sede } from './entities/sede.entity';
import { Repository } from 'typeorm';
import { Duenio } from 'src/duenio/entities/duenio.entity';

@Injectable()
export class SedeService {

  constructor(
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
    @InjectRepository(Duenio)
    private readonly duenioRepository: Repository<Duenio>
  ) { }

  async create(createSedeDto: CreateSedeDto) {
    const duenio = await this.duenioRepository.findOneBy({ idPersonaD: createSedeDto.idPersonaD });
    if (!duenio) {
      throw new NotFoundException("Dueño no encontrado");
    }

    const sede = this.sedeRepository.create({
      ...createSedeDto,
      idPersonaD: duenio.idPersonaD
    });

    return await this.sedeRepository.save(sede);
  }

  async findAll() {
    return await this.sedeRepository.find();
  }

  async findOne(id: number) {
    const exists = await this.sedeRepository.exists({ where: { idSede: id } });
    if (!exists) {
      throw new NotFoundException("Sede no encontrada");
    }
    return await this.sedeRepository.findOneBy({ idSede: id })
  }

  async update(id: number, updateSedeDto: UpdateSedeDto) {
    const exists = await this.sedeRepository.exists({ where: { idSede: id } });
    if (!exists) {
      throw new NotFoundException("Sede no encontrada");
    }
    return await this.sedeRepository.update(id, updateSedeDto);
  }

  async remove(id: number) {
    return await this.sedeRepository.softDelete(id);
  }
}
