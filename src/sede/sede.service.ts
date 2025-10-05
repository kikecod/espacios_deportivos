import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sede } from './entities/sede.entity';
import { Repository } from 'typeorm';
import { Duenio } from 'src/duenios/entities/duenio.entity';

@Injectable()
export class SedeService {

  constructor(
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
    @InjectRepository(Duenio)
    private readonly duenioRepository: Repository<Duenio>
  ) { }

  async create(createSedeDto: CreateSedeDto): Promise<Sede>{
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

  async restore(id: number){
    const exists = await this.sedeRepository.exist({ where: { idSede: id }, withDeleted: true });
    if (!exists) {
      throw new NotFoundException("Cancha no encontrada");
    }

    return await this.sedeRepository.restore(id);
  }

  async remove(id: number) {
    const exists = await this.sedeRepository.exists({ where: { idSede: id } });
    if (!exists) {
      throw new NotFoundException("Sede no encontrada");
    }
    return await this.sedeRepository.softDelete(id);
  }
}
