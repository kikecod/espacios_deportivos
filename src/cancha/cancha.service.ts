import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCanchaDto } from './dto/create-cancha.dto';
import { UpdateCanchaDto } from './dto/update-cancha.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cancha } from './entities/cancha.entity';
import { Sede } from 'src/sede/entities/sede.entity';

@Injectable()
export class CanchaService {

  constructor(
    @InjectRepository(Cancha)
    private readonly canchaRepository: Repository<Cancha>,
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>
  ) { }

  async create(createCanchaDto: CreateCanchaDto): Promise<Cancha> {
    const sede = await this.sedeRepository.findOneBy({ id_sede: createCanchaDto.id_sede });
    if (!sede) {
      throw new NotFoundException('Sede no encontrada');
    }

    const cancha = this.canchaRepository.create({
      ...createCanchaDto,
      id_sede: sede.id_sede,
    });

    return this.canchaRepository.save(cancha);
  }

  async findAll() {
    return await this.canchaRepository.find();
  }

  async findOne(id: number) {
    const cancha = await this.canchaRepository.findOne({
      where: { id_cancha: id },
      relations: ['sede', 'fotos'],
    });
    
    if (!cancha) {
      throw new NotFoundException("Cancha no encontrada");
    }

    // Transformar al formato esperado por el frontend
    return {
  id_cancha: cancha.id_cancha,
  id_sede: cancha.id_sede,
      nombre: cancha.nombre,
      superficie: cancha.superficie,
      cubierta: cancha.cubierta,
      aforoMax: cancha.aforoMax,
      dimensiones: cancha.dimensiones,
      reglas_uso: cancha.reglas_uso,
      iluminacion: cancha.iluminacion,
      estado: cancha.estado,
      precio: cancha.precio.toString(),
      creado_en: cancha.creado_en,
      actualizado_en: cancha.actualizado_en,
      eliminado_en: cancha.eliminado_en,
      fotos: cancha.fotos?.map(foto => ({
        id_foto: foto.id_foto,
        id_cancha: foto.id_cancha,
        url_foto: foto.url_foto,
      })) || [],
      sede: cancha.sede ? {
        id_sede: cancha.sede.id_sede,
        nombre: cancha.sede.nombre,
        direccion: cancha.sede.direccion,
        ciudad: cancha.sede.latitud || 'N/A', // Temporal: usar latitud como ciudad
        telefono: cancha.sede.telefono,
        email: cancha.sede.email,
        horarioApertura: '06:00', // Valor por defecto
        horarioCierre: '23:00', // Valor por defecto
        descripcion: cancha.sede.descripcion,
      } : null,
    };
  }

  async update(id: number, updateCanchaDto: UpdateCanchaDto) {
    const exists = await this.canchaRepository.exist({ where: { id_cancha: id } });
    if (!exists) {
      throw new NotFoundException("Cancha no encontrada");
    }

    return await this.canchaRepository.update(id, updateCanchaDto);
  }

  async restore(id: number){
    const exists = await this.canchaRepository.exist({ where: { id_cancha: id }, withDeleted: true });
    if (!exists) {
      throw new NotFoundException("Cancha no encontrada");
    }

    return await this.canchaRepository.restore(id);
  }

  async remove(id: number) {
    const exists = await this.canchaRepository.exist({ where: { id_cancha: id } });
    if (!exists) {
      throw new NotFoundException("Cancha no encontrada");
    }
    return await this.canchaRepository.softDelete(id);
  }
}
