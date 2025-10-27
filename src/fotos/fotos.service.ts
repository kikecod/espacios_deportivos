import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFotoDto } from './dto/create-foto.dto';
import { UpdateFotoDto } from './dto/update-foto.dto';
import { In, Repository } from 'typeorm';
import { Foto } from './entities/foto.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Cancha } from 'src/cancha/entities/cancha.entity';

@Injectable()
export class FotosService {
  constructor(
    @InjectRepository(Foto)
    private readonly fotoRepository: Repository<Foto>,
    @InjectRepository(Cancha)
    private readonly canchaRepository: Repository<Cancha>,
  ) {}

  async create(createFotoDto: CreateFotoDto) {
    const cancha = await this.canchaRepository.findOneBy({
      id_cancha: createFotoDto.id_cancha,
    });
    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }

    const foto = this.fotoRepository.create({
      url_foto: createFotoDto.url_foto,
      id_cancha: createFotoDto.id_cancha,
    });

    return await this.fotoRepository.save(foto);
  }

  async findAll() {
    return await this.fotoRepository.find();
  }

  async findOne(id: number) {
    const foto = await this.fotoRepository.findOne({
      where: { id_foto: id },
      relations: ['cancha'],
    });

    if (!foto) {
      throw new NotFoundException(`Foto con ID ${id} no encontrada`);
    }

    return foto;
  }

  async findByCancha(id_cancha: number) {
    const fotos = await this.fotoRepository.find({
      where: { id_cancha: id_cancha },
      relations: ['cancha'],
    });

    // Cuando no hay fotos, devolvemos lista vacía en lugar de 404 para
    // simplificar el manejo en el cliente (estado "sin fotos" no es un error).
    return fotos;
  }

  async update(id: number, updateFotoDto: UpdateFotoDto) {
    const foto = await this.fotoRepository.findOneBy({ id_foto: id });
    if (!foto) {
      throw new NotFoundException('Foto no encontrada');
    }

    // Solo actualiza la url de la foto
    if (updateFotoDto.url_foto) {
      foto.url_foto = updateFotoDto.url_foto;
    }

    return await this.fotoRepository.save(foto);
  }

  /*
  async restore(id: number){
    const exists = await this.fotoRepository.exist({ where: { id_cancha: id }, withDeleted: true });
    if (!exists) {
      throw new NotFoundException("Cancha no encontrada");
    }

    return await this.fotoRepository.restore(id);
  }
  */

  async remove(id: number) {
    const foto = await this.fotoRepository.findOneBy({ id_foto: id });
    if (!foto) {
      throw new NotFoundException('Foto no encontrada');
    }
    await this.fotoRepository.remove(foto);
    return { message: `Foto eliminada permanentemente` };
  }
}
