import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { UpdateDenunciaDto } from './dto/update-denuncia.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Denuncia } from './entities/denuncia.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DenunciaService {

  constructor(
    @InjectRepository(Denuncia)
    private denunciaRepository: Repository<Denuncia>,
  ) {}

  create(createDenunciaDto: CreateDenunciaDto) {
    const denuncia = this.denunciaRepository.create(createDenunciaDto);
    return this.denunciaRepository.save(denuncia);
  }

  async findAll(): Promise<Denuncia[]> {
    return this.denunciaRepository.find({
      relations: ['cliente', 'cancha'],
    });
  }

  async findOne(idCliente: number, idCancha: number, idSede: number): Promise<Denuncia> {
    const record = await this.denunciaRepository.findOne({
      where: { idCliente, idCancha, idSede },
      relations: ['cliente', 'cancha'],
    });
    if (!record) throw new NotFoundException("Denuncia no encontrada");
    return record;
  }

  async update(
    idCliente: number,
    idCancha: number,
    idSede: number,
    partial: Partial<Denuncia>,
  ): Promise<Denuncia> {
    const denuncia = await this.findOne(idCliente, idCancha, idSede);
    Object.assign(denuncia, partial);
    return this.denunciaRepository.save(denuncia);
  }

  async remove(idCliente: number, idCancha: number, idSede: number): Promise<void> {
    const result = await this.denunciaRepository.delete({ idCliente, idCancha, idSede });
    if (result.affected === 0) {
      throw new NotFoundException("Denuncia no encontrada");
    }
  }
}
