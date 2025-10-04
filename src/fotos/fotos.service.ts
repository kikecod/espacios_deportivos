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
    private readonly canchaRepository: Repository<Cancha>
  ) { }

  async create(createFotoDto: CreateFotoDto) {
    const cancha = await this.canchaRepository.findOneBy({ idCancha: createFotoDto.idCancha });
    if (!cancha) {
      throw new NotFoundException("Cancha no encontrada");
    }

    const foto = this.fotoRepository.create({
      urlFoto: createFotoDto.urlFoto,
      idCancha: createFotoDto.idCancha
    })


    return await this.fotoRepository.save(foto);
  }

  async findAll() {
    return await this.fotoRepository.find();
  }


  async findOne(id: number) {
    const foto = await this.fotoRepository.findOne({
      where: { idFoto: id },
      relations: ['cancha']
    });

    if (!foto) {
      throw new NotFoundException(`Foto con ID ${id} no encontrada`);
    }

    return foto;
  }

  async findByCancha(idCancha: number) {
    const fotos = await this.fotoRepository.find({
      where: { idCancha: idCancha },
      relations: ['cancha']
    });

    if (!fotos || fotos.length === 0) {
      throw new NotFoundException(`No se encontraron fotos para la cancha con ID ${idCancha}`);
    }

    return fotos;
  }


  async update(id: number, updateFotoDto: UpdateFotoDto) {
    const foto = await this.fotoRepository.findOneBy({ idFoto: id });
    if (!foto) {
      throw new NotFoundException('Foto no encontrada');
    }

    // Solo actualiza la url de la foto
    if (updateFotoDto.urlFoto) {
      foto.urlFoto = updateFotoDto.urlFoto;
    }

    return await this.fotoRepository.save(foto);
  }

  /*
  async restore(id: number){
    const exists = await this.fotoRepository.exist({ where: { idCancha: id }, withDeleted: true });
    if (!exists) {
      throw new NotFoundException("Cancha no encontrada");
    }

    return await this.fotoRepository.restore(id);
  }
  */

  async remove(id: number) {
    const foto = await this.fotoRepository.findOneBy({ idFoto: id });
    if (!foto) {
      throw new NotFoundException('Foto no encontrada');
    }
    await this.fotoRepository.remove(foto);
    return { message: `Foto eliminada permanentemente` };
  }
}
