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
      relations: ['cliente', 'cancha', 'sede'],
    });
  }

  async findOne(idCliente: number, idCancha: number, idSede: number): Promise<Denuncia> {
    const record = await this.denunciaRepository.findOne({
      where: { idCliente, idCancha, idSede },
      relations: ['cliente', 'cancha', 'sede'],
    });
    if (!record) throw new NotFoundException("Denuncia no encontrada");
    return record;
  }

  async update(
    idCliente: number,
    idCancha: number,
    idSede: number,
    updateDenunciaDto: UpdateDenunciaDto,
  ): Promise<Denuncia> {
    // 1. Ejecutar la actualización con la clave compuesta y la nueva data
    const result = await this.denunciaRepository.update(
      { idCliente, idCancha, idSede },
      {
        ...updateDenunciaDto,
        actualizadoEn: new Date(), // Asegurar que se actualiza la marca de tiempo
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException(`Denuncia con IDs ${idCliente}/${idCancha}/${idSede} no encontrada para actualizar`);
    }

    // 2. Devolver el registro actualizado
    return this.findOne(idCliente, idCancha, idSede);
  }

  async remove(idCliente: number, idCancha: number, idSede: number): Promise<void> {
    const result = await this.denunciaRepository.delete({ idCliente, idCancha, idSede });
    if (result.affected === 0) {
      throw new NotFoundException("Denuncia no encontrada para eliminar");
    }
  }
}
