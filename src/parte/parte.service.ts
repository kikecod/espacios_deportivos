import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateParteDto } from './dto/create-parte.dto';
import { UpdateParteDto } from './dto/update-parte.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Parte } from './entities/parte.entity';
import { Repository } from 'typeorm';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Disciplina } from 'src/disciplina/entities/disciplina.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ParteService {

  constructor(
    @InjectRepository(Parte)
    private readonly parteRepository: Repository<Parte>,
    @InjectRepository(Cancha)
    private readonly canchaRepository: Repository<Cancha>,
    @InjectRepository(Disciplina)
    private readonly disciplinaRepository: Repository<Disciplina>,
    private readonly eventEmitter: EventEmitter2
  ) { }

  async create(createParteDto: CreateParteDto) {
    const cancha = await this.canchaRepository.findOneBy({ idCancha: createParteDto.idCancha });
    const disciplina = await this.disciplinaRepository.findOneBy({ idDisciplina: createParteDto.idDisciplina });
    if (!cancha) {
      throw new NotFoundException("Cancha no encontrada");
    }
    if (!disciplina) {
      throw new NotFoundException("Disciplina no encontrada");
    }

    const parte = this.parteRepository.create({
      ...createParteDto,
      idCancha: cancha.idCancha,
      idDisciplina: disciplina.idDisciplina
    });

    const resultado = await this.parteRepository.save(parte);

    // Emitir evento para sincronizar disciplinas en Neo4j
    this.eventEmitter.emit('parte.creada', {
      idCancha: resultado.idCancha,
      idDisciplina: resultado.idDisciplina
    });

    return resultado;
  }

  async findAll() {
    return await this.parteRepository.find();
  }

  async findOne(idC: number, idD: number) {
    const existsCancha = await this.parteRepository.exist({ where: { idCancha: idC } });
    const existsDisciplina = await this.parteRepository.exist({ where: { idDisciplina: idD } });
    if (!existsCancha) {
      throw new NotFoundException("Cancha no encontrada");
    }
    if (!existsDisciplina) {
      throw new NotFoundException("Disciplina no encontrada");
    }

    return await this.parteRepository.findOne({
      where: { idCancha: idC, idDisciplina: idD }
    });
  }

  async update(idC: number, idD: number, updateParteDto: UpdateParteDto) {
    const existsCancha = await this.parteRepository.exist({ where: { idCancha: idC } });
    const existsDisciplina = await this.parteRepository.exist({ where: { idDisciplina: idD } });
    if (!existsCancha) {
      throw new NotFoundException("Cancha no encontrada");
    }
    if (!existsDisciplina) {
      throw new NotFoundException("Disciplina no encontrada");
    }

    const resultado = await this.parteRepository.update({ idCancha: idC, idDisciplina: idD }, updateParteDto);

    // Emitir evento para sincronizar disciplinas en Neo4j
    this.eventEmitter.emit('parte.actualizada', {
      idCancha: idC,
      idDisciplina: idD
    });

    return resultado;
  }

  async remove(idC: number, idD: number): Promise<void> {
    const parte = await this.parteRepository.findOne({ where: { idCancha: idC, idDisciplina: idD } });
    if (!parte) {
      throw new NotFoundException("Relación no encontrada");
    }
    await this.parteRepository.delete({ idCancha: idC, idDisciplina: idD });

    // Emitir evento para sincronizar disciplinas en Neo4j
    this.eventEmitter.emit('parte.eliminada', {
      idCancha: idC,
      idDisciplina: idD
    });
  }
}
