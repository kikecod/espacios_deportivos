import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from 'src/common/pagination/paginate.util';
import { Participa } from './entities/participa.entity';
import { CreateParticipaDto } from './dto/create-participa.dto';
import { UpdateParticipaDto } from './dto/update-participa.dto';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Injectable()
export class ParticipaService {
  constructor(
    @InjectRepository(Participa)
    private readonly participaRepo: Repository<Participa>,
    private readonly usuariosService: UsuariosService,
  ) {}

  async create(dto: CreateParticipaDto) {
    const participa = this.participaRepo.create(dto);
    return this.participaRepo.save(participa);
  }

  findAll() {
    return this.participaRepo.find({
      relations: ['reserva', 'cliente'],
    });
  }

  async findAllScoped(user: { sub: number; roles: string[] }) {
    if (user?.roles?.includes('ADMIN')) return this.findAll();
    const qb = this.participaRepo.createQueryBuilder('p');
    if (user?.roles?.includes('DUENIO')) {
      const u = await this.usuariosService.findOne(user.sub);
      return qb
        .innerJoin('p.reserva', 'r')
        .innerJoin('r.cancha', 'c')
        .innerJoin('c.sede', 's')
        .where('s.idPersonaD = :pid', { pid: u.idPersona })
        .getMany();
    }
    return qb
      .innerJoin('p.reserva', 'r')
      .innerJoin('r.cliente', 'cl')
      .innerJoin('cl.persona', 'per')
      .innerJoin('per.usuario', 'u')
      .where('u.idUsuario = :uid', { uid: user.sub })
      .getMany();
  }

  async findAllScopedPaged(user: { sub: number; roles: string[] }, dto: any) {
    const qb = this.participaRepo.createQueryBuilder('p');
    if (user?.roles?.includes('ADMIN')) {
      // pass
    } else if (user?.roles?.includes('DUENIO')) {
      const u = await this.usuariosService.findOne(user.sub);
      qb.innerJoin('p.reserva', 'r').innerJoin('r.cancha', 'c').innerJoin('c.sede', 's').where('s.idPersonaD = :pid', { pid: u.idPersona });
    } else {
      qb.innerJoin('p.reserva', 'r').innerJoin('r.cliente', 'cl').innerJoin('cl.persona', 'per').innerJoin('per.usuario', 'u').where('u.idUsuario = :uid', { uid: user.sub });
    }
    return paginate(qb, dto, ['p.idReserva'], { field: 'p.idReserva', direction: 'DESC' });
  }

  async findOne(idReserva: number, idCliente: number) {
    const participa = await this.participaRepo.findOne({
      where: { idReserva, idCliente },
      relations: ['reserva', 'cliente'],
    });

    if (!participa) {
      throw new NotFoundException(
        `Participa no encontrada (reserva #${idReserva}, cliente #${idCliente})`,
      );
    }

    return participa;
  }

  async findOneScoped(idReserva: number, idCliente: number, user: { sub: number; roles: string[] }) {
    if (user?.roles?.includes('ADMIN')) return this.findOne(idReserva, idCliente);
    const qb = this.participaRepo
      .createQueryBuilder('p')
      .where('p.idReserva = :idReserva AND p.idCliente = :idCliente', { idReserva, idCliente });
    if (user?.roles?.includes('DUENIO')) {
      const u = await this.usuariosService.findOne(user.sub);
      return qb
        .innerJoin('p.reserva', 'r')
        .innerJoin('r.cancha', 'c')
        .innerJoin('c.sede', 's')
        .andWhere('s.idPersonaD = :pid', { pid: u.idPersona })
        .getOne();
    }
    return qb
      .innerJoin('p.reserva', 'r')
      .innerJoin('r.cliente', 'cl')
      .innerJoin('cl.persona', 'per')
      .innerJoin('per.usuario', 'u')
      .andWhere('u.idUsuario = :uid', { uid: user.sub })
      .getOne();
  }

  async update(
    idReserva: number,
    idCliente: number,
    dto: UpdateParticipaDto,
  ) {
    const participa = await this.findOne(idReserva, idCliente);

    Object.assign(participa, dto);
    return this.participaRepo.save(participa);
  }

  async remove(idReserva: number, idCliente: number) {
    const participa = await this.findOne(idReserva, idCliente);
    await this.participaRepo.remove(participa);
    return { deleted: true };
  }
}
