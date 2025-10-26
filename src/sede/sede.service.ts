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

  async create(createSedeDto: CreateSedeDto): Promise<Sede>{
    const duenio = await this.duenioRepository.findOneBy({ id_persona_d: createSedeDto.id_persona_d });
    if (!duenio) {
      throw new NotFoundException("Dueño no encontrado");
    }

    const sede = this.sedeRepository.create({
      ...createSedeDto,
      id_persona_d: duenio.id_persona_d
    });

    return await this.sedeRepository.save(sede);
  }

  async findAll() {
    return await this.sedeRepository.find();
  }

  async findOne(id: number) {
    const exists = await this.sedeRepository.exists({ where: { id_sede: id } });
    if (!exists) {
      throw new NotFoundException("Sede no encontrada");
    }
    return await this.sedeRepository.findOneBy({ id_sede: id })
  }

  async update(id: number, updateSedeDto: UpdateSedeDto) {
    const exists = await this.sedeRepository.exists({ where: { id_sede: id } });
    if (!exists) {
      throw new NotFoundException("Sede no encontrada");
    }
    return await this.sedeRepository.update(id, updateSedeDto);
  }

  async restore(id: number){
    const exists = await this.sedeRepository.exist({ where: { id_sede: id }, withDeleted: true });
    if (!exists) {
      throw new NotFoundException("Cancha no encontrada");
    }

    return await this.sedeRepository.restore(id);
  }

  async remove(id: number) {
    const exists = await this.sedeRepository.exists({ where: { id_sede: id } });
    if (!exists) {
      throw new NotFoundException("Sede no encontrada");
    }
    return await this.sedeRepository.softDelete(id);
  }
}
