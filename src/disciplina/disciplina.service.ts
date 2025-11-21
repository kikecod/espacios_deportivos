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
    if (typeof id !== 'number' || isNaN(id)) {
      throw new NotFoundException('ID de disciplina inválido');
    }
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

  async restore(id: number){
    const exists = await this.disciplinaRepository.exist({ where: { idDisciplina: id }, withDeleted: true });
    if (!exists) {
      throw new NotFoundException("Cancha no encontrada");
    }

    return await this.disciplinaRepository.restore(id);
  }

  async remove(id: number) {
    const exists = await this.disciplinaRepository.exists({where: {idDisciplina: id}});
    if(!exists){
      throw new NotFoundException("Disciplina no encontrada");
    }

    return await this.disciplinaRepository.softDelete(id);
  }

  async searchDisciplinasByName(query: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }
    const disciplinas = await this.disciplinaRepository
      .createQueryBuilder('disciplina')
      .select(['disciplina.idDisciplina', 'disciplina.nombre'])
      .where('disciplina.eliminadoEn IS NULL')
      .andWhere('disciplina.nombre ILIKE :query', { query: `%${query}%` })
      .orderBy('disciplina.nombre', 'ASC')
      .limit(10)
      .getMany();
    return disciplinas.map(d => ({
      idDisciplina: d.idDisciplina,
      nombre: d.nombre,
    }));
  }
}
