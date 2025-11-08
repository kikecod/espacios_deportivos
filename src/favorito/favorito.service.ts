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
  ) {}

  async create(createFavoritoDto: CreateFavoritoDto): Promise<Favorito> {
    const favorito = this.favoritoRepository.create(createFavoritoDto);
    return this.favoritoRepository.save(favorito);
  }

  async addForCliente(idCliente: number, idCancha: number): Promise<{success: boolean; data: Favorito}> {
    // Asegurar que exista un registro de Cliente para este idPersona
    try {
      await this.clientesService.findOne(idCliente);
    } catch {
      await this.clientesService.create({ idCliente });
    }
    // Verificar duplicado
    const existing = await this.favoritoRepository.findOne({ where: { idCliente, idCancha } });
    if (existing) {
      throw new ConflictException('Ya es favorito');
    }
    const favorito = this.favoritoRepository.create({ idCliente, idCancha });
    const saved = await this.favoritoRepository.save(favorito);
    return { success: true, data: saved };
  }

  async findAllByCliente(idCliente: number): Promise<Favorito[]> {
    return this.favoritoRepository.find({
      where: { idCliente },
      relations: ['cancha'],
    });
  }

  async findFilteredByCliente(idCliente: number, query: QueryFavoritosDto): Promise<Favorito[]> {
    const qb = this.favoritoRepository.createQueryBuilder('f')
      .innerJoinAndSelect('f.cancha','c')
      .leftJoin('c.parte','p')
      .leftJoin('p.disciplina','d')
      .where('f.idCliente = :idCliente',{ idCliente });

    if (query.precioMin !== undefined) {
      qb.andWhere('c.precio >= :pmin',{ pmin: query.precioMin });
    }
    if (query.precioMax !== undefined) {
      qb.andWhere('c.precio <= :pmax',{ pmax: query.precioMax });
    }
    // Filtro por disciplinas (ids). Acepta disciplinas=1&disciplinas=2 ó una cadena separada por comas
    const rawDisc = (query as any).disciplinas as undefined | string | string[] | number[];
    let discIds: number[] = [];
    if (rawDisc) {
      if (Array.isArray(rawDisc)) {
        discIds = (rawDisc as any[]).flatMap((v) => `${v}`.split(',')).map((x) => parseInt(`${x}`,10)).filter((n) => !isNaN(n));
      } else if (typeof rawDisc === 'string') {
        discIds = rawDisc.split(',').map((x) => parseInt(x,10)).filter((n) => !isNaN(n));
      }
    }
    if (discIds.length > 0) {
      if (query.match === 'all') {
        // AND semantics usando subquery para evitar groupBy en la selección principal
        const sub = qb.subQuery()
          .select('p2.idCancha')
          .from('parte', 'p2')
          .where('p2.idDisciplina IN (:...discIds)')
          .groupBy('p2.idCancha')
          .having('COUNT(DISTINCT p2.idDisciplina) = :total')
          .getQuery();
        qb.andWhere(`c.idCancha IN ${sub}`, { discIds, total: discIds.length });
      } else {
        // OR semantics (default)
        qb.andWhere('p.idDisciplina IN (:...discIds)', { discIds });
      }
    }
    // Compat superficial (depreciado)
    if (query.superficie) {
      qb.andWhere('LOWER(c.superficie) LIKE :sup',{ sup: `%${query.superficie.toLowerCase()}%` });
    }

    switch (query.orden) {
      case 'rating':
        qb.orderBy('c.ratingPromedio','DESC');
        break;
      case 'precio-asc':
        qb.orderBy('c.precio','ASC');
        break;
      case 'precio-desc':
        qb.orderBy('c.precio','DESC');
        break;
      case 'reciente':
      default:
        qb.orderBy('f.creadoEn','DESC');
        break;
    }

    // Evitar duplicados por join con parte (si se aplicó groupBy ya no hace falta pero no perjudica)
    qb.distinct(true);
    return qb.getMany();
  }

  async remove(idCliente: number, idCancha: number): Promise<void> {
    const result = await this.favoritoRepository.delete({
      idCliente,
      idCancha,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Favorito not found');
    }
  }

  async check(idCliente: number, idCancha: number): Promise<{success: boolean; data: { esFavorito: boolean }}> {
    const favorito = await this.favoritoRepository.findOne({ where: { idCliente, idCancha } });
    return { success: true, data: { esFavorito: !!favorito } };
  }

  async updateMeta(idCliente: number, idCancha: number, dto: UpdateFavoritoDto) {
    const favorito = await this.favoritoRepository.findOne({ where: { idCliente, idCancha } });
    if (!favorito) throw new NotFoundException('Favorito not found');
    Object.assign(favorito, dto);
    const saved = await this.favoritoRepository.save(favorito);
    return { success: true, data: saved };
  }
}