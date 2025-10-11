import { Injectable } from '@nestjs/common';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { Repository } from 'typeorm';
import { paginate } from 'src/common/pagination/paginate.util';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    private readonly usuariosService: UsuariosService,
  ){}

  create (createReservaDto: CreateReservaDto){
    const reserva = this.reservaRepository.create(createReservaDto);
    //console.log(reserva);
    return this.reservaRepository.save(reserva);
  }

  findAll(){
    return this.reservaRepository.find();
  }

  async findAllScoped(user: { sub: number; roles: string[] }) {
    if (user?.roles?.includes('ADMIN')) return this.findAll();
    const qb = this.reservaRepository.createQueryBuilder('r');
    if (user?.roles?.includes('DUENIO')) {
      const u = await this.usuariosService.findOne(user.sub);
      return qb
        .innerJoin('r.cancha', 'c')
        .innerJoin('c.sede', 's')
        .where('s.idPersonaD = :pid', { pid: u.idPersona })
        .getMany();
    }
    // CLIENTE: por usuario dueño de la persona del cliente de la reserva
    return qb
      .innerJoin('r.cliente', 'cl')
      .innerJoin('cl.persona', 'p')
      .innerJoin('p.usuario', 'u')
      .where('u.idUsuario = :uid', { uid: user.sub })
      .getMany();
  }

  async findAllScopedPaged(user: { sub: number; roles: string[] }, dto: any) {
    const qb = this.reservaRepository.createQueryBuilder('r');
    if (user?.roles?.includes('ADMIN')) {
      // pass
    } else if (user?.roles?.includes('DUENIO')) {
      const u = await this.usuariosService.findOne(user.sub);
      qb.innerJoin('r.cancha', 'c').innerJoin('c.sede', 's').where('s.idPersonaD = :pid', { pid: u.idPersona });
    } else {
      qb.innerJoin('r.cliente', 'cl').innerJoin('cl.persona', 'p').innerJoin('p.usuario', 'u').where('u.idUsuario = :uid', { uid: user.sub });
    }
    return paginate(qb, dto, ['r.creadoEn', 'r.iniciaEn', 'r.terminaEn'], { field: 'r.creadoEn', direction: 'DESC' });
  }

  findOne(id: number){
    return this.reservaRepository.findOneBy({ idReserva: id });
  }

  async findOneScoped(id: number, user: { sub: number; roles: string[] }) {
    if (user?.roles?.includes('ADMIN')) return this.findOne(id);
    const qb = this.reservaRepository.createQueryBuilder('r').where('r.idReserva = :id', { id });
    if (user?.roles?.includes('DUENIO')) {
      const u = await this.usuariosService.findOne(user.sub);
      return qb
        .innerJoin('r.cancha', 'c')
        .innerJoin('c.sede', 's')
        .andWhere('s.idPersonaD = :pid', { pid: u.idPersona })
        .getOne();
    }
    return qb
      .innerJoin('r.cliente', 'cl')
      .innerJoin('cl.persona', 'p')
      .innerJoin('p.usuario', 'u')
      .andWhere('u.idUsuario = :uid', { uid: user.sub })
      .getOne();
  }

  update(id: number, updateReservaDto: UpdateReservaDto){
    return this.reservaRepository.update(id, updateReservaDto);
  }

  remove(id: number){
    return this.reservaRepository.delete(id);
  }
}
