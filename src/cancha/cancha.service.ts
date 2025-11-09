import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCanchaDto } from './dto/create-cancha.dto';
import { UpdateCanchaDto } from './dto/update-cancha.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cancha } from './entities/cancha.entity';
import { Sede } from 'src/sede/entities/sede.entity';
import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CanchaService {

  constructor(
    @InjectRepository(Cancha)
    private readonly canchaRepository: Repository<Cancha>,
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
    private eventEmitter: EventEmitter2,
  ) { }

  async create(createCanchaDto: CreateCanchaDto): Promise<Cancha> {
    const sede = await this.sedeRepository.findOneBy({ idSede: createCanchaDto.idSede });
    if (!sede) {
      throw new NotFoundException('Sede no encontrada');
    }

    // Validar que horaApertura sea menor que horaCierre
    this.validarHorarios(createCanchaDto.horaApertura, createCanchaDto.horaCierre);

    const cancha = this.canchaRepository.create({
      ...createCanchaDto,
      id_Sede: sede.idSede,
    });

    const savedCancha = await this.canchaRepository.save(cancha);

    // Emitir evento para sincronización con Neo4j
    this.eventEmitter.emit('cancha.creada', { idCancha: savedCancha.idCancha });

    return savedCancha;
  }

  async findAll() {
    return await this.canchaRepository.find();
  }

  async findOne(id: number) {
    const cancha = await this.canchaRepository.findOne({
      where: { idCancha: id },
      relations: ['sede', 'fotos'],
    });
    
    if (!cancha) {
      throw new NotFoundException("Cancha no encontrada");
    }

    // Transformar al formato esperado por el frontend
    return {
      idCancha: cancha.idCancha,
      id_Sede: cancha.id_Sede,
      nombre: cancha.nombre,
      superficie: cancha.superficie,
      cubierta: cancha.cubierta,
      aforoMax: cancha.aforoMax,
      dimensiones: cancha.dimensiones,
      reglasUso: cancha.reglasUso,
      iluminacion: cancha.iluminacion,
      estado: cancha.estado,
      precio: cancha.precio.toString(),
      horaApertura: cancha.horaApertura,
      horaCierre: cancha.horaCierre,
      creadoEn: cancha.creadoEn,
      actualizadoEn: cancha.actualizadoEn,
      eliminadoEn: cancha.eliminadoEn,
      fotos: cancha.fotos?.map(foto => ({
        idFoto: foto.idFoto,
        idCancha: foto.idCancha,
        urlFoto: foto.urlFoto,
      })) || [],
      sede: cancha.sede ? {
        idSede: cancha.sede.idSede,
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
    const cancha = await this.canchaRepository.findOne({ where: { idCancha: id } });
    if (!cancha) {
      throw new NotFoundException("Cancha no encontrada");
    }

    // Si se actualizan horarios, validarlos
    if (updateCanchaDto.horaApertura || updateCanchaDto.horaCierre) {
      const nuevaApertura = updateCanchaDto.horaApertura || cancha.horaApertura;
      const nuevoCierre = updateCanchaDto.horaCierre || cancha.horaCierre;
      this.validarHorarios(nuevaApertura, nuevoCierre);
    }

    const resultado = await this.canchaRepository.update(id, updateCanchaDto);

    // Emitir evento para sincronización con Neo4j
    this.eventEmitter.emit('cancha.actualizada', { idCancha: id });

    return resultado;
  }

  async restore(id: number){
    const exists = await this.canchaRepository.exist({ where: { idCancha: id }, withDeleted: true });
    if (!exists) {
      throw new NotFoundException("Cancha no encontrada");
    }

    return await this.canchaRepository.restore(id);
  }

  async remove(id: number) {
    const exists = await this.canchaRepository.exist({ where: { idCancha: id } });
    if (!exists) {
      throw new NotFoundException("Cancha no encontrada");
    }
    
    const resultado = await this.canchaRepository.softDelete(id);

    // Emitir evento para sincronización con Neo4j
    this.eventEmitter.emit('cancha.eliminada', { idCancha: id });

    return resultado;
  }

  /**
   * Valida que la hora de apertura sea menor que la hora de cierre
   * @param horaApertura Hora en formato HH:mm o HH:mm:ss
   * @param horaCierre Hora en formato HH:mm o HH:mm:ss
   * @throws BadRequestException si los horarios son inválidos
   */
  private validarHorarios(horaApertura: string, horaCierre: string): void {
    // Normalizar a formato HH:mm:ss si viene como HH:mm
    const aperturaNormalizada = horaApertura.length === 5 ? `${horaApertura}:00` : horaApertura;
    const cierreNormalizado = horaCierre.length === 5 ? `${horaCierre}:00` : horaCierre;

    // Convertir a minutos para comparar
    const [aperturaHora, aperturaMinuto] = aperturaNormalizada.split(':').map(Number);
    const [cierreHora, cierreMinuto] = cierreNormalizado.split(':').map(Number);

    const aperturaEnMinutos = aperturaHora * 60 + aperturaMinuto;
    const cierreEnMinutos = cierreHora * 60 + cierreMinuto;

    if (aperturaEnMinutos >= cierreEnMinutos) {
      throw new BadRequestException({
        error: 'Horarios inválidos',
        message: 'La hora de apertura debe ser menor que la hora de cierre',
        detalles: {
          horaApertura: aperturaNormalizada,
          horaCierre: cierreNormalizado,
        }
      });
    }
  }
}
