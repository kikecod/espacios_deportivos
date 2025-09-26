import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDisciplinaDto } from './dto/create-disciplina.dto';
import { UpdateDisciplinaDto } from './dto/update-disciplina.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Disciplina } from './entities/disciplina.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DisciplinaService {

  constructor(
    @InjectRepository(Disciplina)
    private readonly disciplinaRepository: Repository<Disciplina>
  ){}

  async create(createDisciplinaDto: CreateDisciplinaDto) {
    const disciplina = this.disciplinaRepository.create(createDisciplinaDto);
    return await this.disciplinaRepository.save(disciplina);
  }

  async findAll() {
    return await this.disciplinaRepository.find();
  }

  async findOne(id: number) {
    const exists = await this.disciplinaRepository.exists({where: {idDisciplina: id}});
    if(!exists){
      throw new NotFoundException("Disciplina no encontrada");
    }

    return await this.disciplinaRepository.findOneBy({idDisciplina: id});
  }

  async update(id: number, updateDisciplinaDto: UpdateDisciplinaDto) {
    const exists = await this.disciplinaRepository.exists({where: {idDisciplina: id}});
    if(!exists){
      throw new NotFoundException("Disciplina no encontrada");
    }

    return await this.disciplinaRepository.update(id, updateDisciplinaDto);
  }

  async remove(id: number) {
    const exists = await this.disciplinaRepository.exists({where: {idDisciplina: id}});
    if(!exists){
      throw new NotFoundException("Disciplina no encontrada");
    }

    return await this.disciplinaRepository.softDelete(id);
  }
}
