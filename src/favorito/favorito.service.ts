import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateFavoritoDto } from './dto/update-favorito.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFavoritoDto } from './dto/create-favorito.dto';
import { QueryFavoritosDto } from './dto/query-favoritos.dto';
import { Favorito } from './entities/favorito.entity';
import { ClientesService } from 'src/clientes/clientes.service';

@Injectable()
export class FavoritoService {
  constructor(
    @InjectRepository(Favorito)
    private readonly favoritoRepository: Repository<Favorito>,
    private readonly clientesService: ClientesService,
  ) { }

  async create(createFavoritoDto: CreateFavoritoDto): Promise<Favorito> {
    const favorito = this.favoritoRepository.create(createFavoritoDto);
    return this.favoritoRepository.save(favorito);
  }

  async addForCliente(idCliente: number, idSede: number): Promise<{ success: boolean; data: Favorito }> {
    // Asegurar que exista un registro de Cliente para este idPersona
    try {
      await this.clientesService.findOne(idCliente);
    } catch {
      await this.clientesService.create({ idCliente });
    }
    // Verificar duplicado
    const existing = await this.favoritoRepository.findOne({ where: { idCliente, idSede } });
    if (existing) {
      throw new ConflictException('Ya es favorito');
    }
    const favorito = this.favoritoRepository.create({ idCliente, idSede });
    const saved = await this.favoritoRepository.save(favorito);
    return { success: true, data: saved };
  }

  async findAllByCliente(idCliente: number): Promise<Favorito[]> {
    return this.favoritoRepository.find({
      where: { idCliente },
      relations: ['sede', 'sede.fotos', 'sede.canchas'],
    });
  }

  async findFilteredByCliente(idCliente: number, query: QueryFavoritosDto): Promise<Favorito[]> {
    const qb = this.favoritoRepository.createQueryBuilder('f')
      .innerJoinAndSelect('f.sede', 's')
      .leftJoinAndSelect('s.fotos', 'ft')
      .leftJoinAndSelect('s.canchas', 'c')
      .where('f.idCliente = :idCliente', { idCliente });

    // Filtro por rating de sede
    switch (query.orden) {
      case 'rating':
        qb.orderBy('s.ratingFinal', 'DESC');
        break;
      case 'reciente':
      default:
        qb.orderBy('f.creadoEn', 'DESC');
        break;
    }

    // Evitar duplicados
    qb.distinct(true);
    return qb.getMany();
  }

  async remove(idCliente: number, idSede: number): Promise<void> {
    const result = await this.favoritoRepository.delete({
      idCliente,
      idSede,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Favorito not found');
    }
  }

  async check(idCliente: number, idSede: number): Promise<{ success: boolean; data: { esFavorito: boolean } }> {
    const favorito = await this.favoritoRepository.findOne({ where: { idCliente, idSede } });
    return { success: true, data: { esFavorito: !!favorito } };
  }

  async updateMeta(idCliente: number, idSede: number, dto: UpdateFavoritoDto) {
    const favorito = await this.favoritoRepository.findOne({ where: { idCliente, idSede } });
    if (!favorito) throw new NotFoundException('Favorito not found');
    Object.assign(favorito, dto);
    const saved = await this.favoritoRepository.save(favorito);
    return { success: true, data: saved };
  }
}