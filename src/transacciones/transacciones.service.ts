import { Injectable } from '@nestjs/common';
import { CreateTransaccioneDto } from './dto/create-transaccione.dto';
import { UpdateTransaccioneDto } from './dto/update-transaccione.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaccion } from './entities/transaccion.entity';
import { Repository } from 'typeorm';
import { paginate } from 'src/common/pagination/paginate.util';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { Reserva } from 'src/reservas/entities/reserva.entity';

@Injectable()
export class TransaccionesService {

  constructor(
    @InjectRepository(Transaccion)
    private transaccionRepository: Repository<Transaccion>,
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    private readonly usuariosService: UsuariosService,
  ){}

  create(createTransaccioneDto: CreateTransaccioneDto) {
    const transaccion = this.transaccionRepository.create(createTransaccioneDto);
    return this.transaccionRepository.save(transaccion);
  }

  findAll() {
    return this.transaccionRepository.find();
  }

  async findAllScoped(user: { sub: number; roles: string[] }) {
    if (user?.roles?.includes('ADMIN')) return this.findAll();
    const qb = this.transaccionRepository.createQueryBuilder('t');
    if (user?.roles?.includes('DUENIO')) {
      const u = await this.usuariosService.findOne(user.sub);
      return qb
        .innerJoin('t.reserva', 'r')
        .innerJoin('r.cancha', 'c')
        .innerJoin('c.sede', 's')
        .where('s.idPersonaD = :pid', { pid: u.idPersona })
        .getMany();
    }
    return qb
      .innerJoin('t.reserva', 'r')
      .innerJoin('r.cliente', 'cl')
      .innerJoin('cl.persona', 'p')
      .innerJoin('p.usuario', 'u')
      .where('u.idUsuario = :uid', { uid: user.sub })
      .getMany();
  }

  async findAllScopedPaged(user: { sub: number; roles: string[] }, dto: any) {
    const qb = this.transaccionRepository.createQueryBuilder('t');
    if (user?.roles?.includes('ADMIN')) {
      // pass
    } else if (user?.roles?.includes('DUENIO')) {
      const u = await this.usuariosService.findOne(user.sub);
      qb.innerJoin('t.reserva', 'r').innerJoin('r.cancha', 'c').innerJoin('c.sede', 's').where('s.idPersonaD = :pid', { pid: u.idPersona });
    } else {
      qb.innerJoin('t.reserva', 'r').innerJoin('r.cliente', 'cl').innerJoin('cl.persona', 'p').innerJoin('p.usuario', 'u').where('u.idUsuario = :uid', { uid: user.sub });
    }
    return paginate(qb, dto, ['t.creadoEn', 't.monto'], { field: 't.creadoEn', direction: 'DESC' });
  }

  findOne(id: number) {
    return this.transaccionRepository.findOneBy({ idTransaccion: id });
  }

  async findOneScoped(id: number, user: { sub: number; roles: string[] }) {
    if (user?.roles?.includes('ADMIN')) return this.findOne(id);
    const qb = this.transaccionRepository.createQueryBuilder('t').where('t.idTransaccion = :id', { id });
    if (user?.roles?.includes('DUENIO')) {
      const u = await this.usuariosService.findOne(user.sub);
      return qb
        .innerJoin('t.reserva', 'r')
        .innerJoin('r.cancha', 'c')
        .innerJoin('c.sede', 's')
        .andWhere('s.idPersonaD = :pid', { pid: u.idPersona })
        .getOne();
    }
    return qb
      .innerJoin('t.reserva', 'r')
      .innerJoin('r.cliente', 'cl')
      .innerJoin('cl.persona', 'p')
      .innerJoin('p.usuario', 'u')
      .andWhere('u.idUsuario = :uid', { uid: user.sub })
      .getOne();
  }

  update(id: number, updateTransaccioneDto: UpdateTransaccioneDto) {
    return this.transaccionRepository.update(id, updateTransaccioneDto)
  }

  remove(id: number) {
    return this.transaccionRepository.delete(id);
  }
}
