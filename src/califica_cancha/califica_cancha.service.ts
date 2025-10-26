import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCalificaCanchaDto } from './dto/create-califica_cancha.dto';
import { UpdateCalificaCanchaDto } from './dto/update-califica_cancha.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CalificaCancha } from './entities/califica_cancha.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CalificaCanchaService {
  constructor(
    @InjectRepository(CalificaCancha)
    private calificaCanchaRepository: Repository<CalificaCancha>,
  ) {}

  create(createCalificaCanchaDto: CreateCalificaCanchaDto) {
    const calificaCancha = this.calificaCanchaRepository.create(
      createCalificaCanchaDto,
    );
    return this.calificaCanchaRepository.save(calificaCancha);
  }

  async findAll(): Promise<CalificaCancha[]> {
    return this.calificaCanchaRepository.find({
      relations: ['cliente', 'cancha', 'cancha.sede'],
    });
  }

  async findByCancha(id_cancha: number) {
    const calificaciones = await this.calificaCanchaRepository.find({
      where: { id_cancha },
      relations: ['cliente', 'cliente.persona'],
    });

    // Transformar al formato esperado por el frontend (reseñas)
    return calificaciones.map((calif) => {
      const persona = calif.cliente?.persona;
      const nombreCompleto = persona
        ? `${persona.nombres} ${persona.paterno}`.trim()
        : 'Usuario Anónimo';

      return {
        idResena: `${calif.id_cliente}-${calif.id_cancha}-${calif.id_sede}`,
        id_usuario: calif.id_cliente,
        calificacion: calif.puntaje,
        comentario: calif.comentario,
        fecha: calif.creada_en,
        usuario: {
          nombre: nombreCompleto,
          avatar: persona?.url_foto || '/uploads/avatar_default.jpg',
        },
      };
    });
  }

  async findOne(
    id_cliente: number,
    id_cancha: number,
    id_sede: number,
  ): Promise<CalificaCancha> {
    const record = await this.calificaCanchaRepository.findOne({
      where: { id_cliente, id_cancha, id_sede },
      relations: ['cliente', 'cancha'],
    });
    if (!record) throw new NotFoundException('Calificación no encontrada');
    return record;
  }

  async update(
    id_cliente: number,
    id_cancha: number,
    id_sede: number,
    updateCalificaCanchaDto: UpdateCalificaCanchaDto,
  ): Promise<CalificaCancha> {
    const result = await this.calificaCanchaRepository.update(
      { id_cliente, id_cancha, id_sede },
      updateCalificaCanchaDto,
    );

    if (result.affected === 0) {
      throw new NotFoundException(
        `Calificación con IDs ${id_cliente}/${id_cancha}/${id_sede} no encontrada para actualizar`,
      );
    }

    // Devuelve el registro actualizado
    return this.findOne(id_cliente, id_cancha, id_sede);
  }

  async remove(
    id_cliente: number,
    id_cancha: number,
    id_sede: number,
  ): Promise<void> {
    const result = await this.calificaCanchaRepository.delete({
      id_cliente,
      id_cancha,
      id_sede,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Calificación no encontrada');
    }
  }
}
