import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { UpdateDenunciaDto } from './dto/update-denuncia.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Denuncia } from './entities/denuncia.entity';
import { Repository } from 'typeorm';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Injectable()
export class DenunciaService {

  constructor(
    @InjectRepository(Denuncia)
    private denunciaRepository: Repository<Denuncia>,
    private readonly usuariosService: UsuariosService,
  ) {}

  create(createDenunciaDto: CreateDenunciaDto) {
    const denuncia = this.denunciaRepository.create(createDenunciaDto);
    return this.denunciaRepository.save(denuncia);
  }

  async findAll(): Promise<Denuncia[]> {
    return this.denunciaRepository.find({ relations: ['cliente', 'cancha', 'sede'] });
  }

  async findAllScoped(user: { sub: number; roles: string[] }): Promise<Denuncia[]> {
    if (user?.roles?.includes('ADMIN')) return this.findAll();
    const qb = this.denunciaRepository.createQueryBuilder('d').leftJoinAndSelect('d.cliente', 'cl').leftJoinAndSelect('d.cancha', 'ca').leftJoinAndSelect('d.sede', 's');
    if (user?.roles?.includes('DUENIO')) {
      const u = await this.usuariosService.findOne(user.sub);
      return qb.where('s.idPersonaD = :pid', { pid: u.idPersona }).getMany();
    }
    return qb.innerJoin('cl.persona', 'p').innerJoin('p.usuario', 'u').where('u.idUsuario = :uid', { uid: user.sub }).getMany();
  }

  async findOne(idCliente: number, idCancha: number): Promise<Denuncia> {
    const record = await this.denunciaRepository.findOne({
      where: { idCliente, idCancha },
      relations: ['cliente', 'cancha', 'sede'],
    });
    if (!record) throw new NotFoundException("Denuncia no encontrada");
    return record;
  }

  async findOneScoped(idCliente: number, idCancha: number, user: { sub: number; roles: string[] }) {
    if (user?.roles?.includes('ADMIN')) return this.findOne(idCliente, idCancha);
    const qb = this.denunciaRepository.createQueryBuilder('d').where('d.idCliente = :idCliente AND d.idCancha = :idCancha', { idCliente, idCancha }).leftJoinAndSelect('d.cliente', 'cl').leftJoinAndSelect('d.cancha', 'ca').leftJoinAndSelect('d.sede', 's');
    if (user?.roles?.includes('DUENIO')) {
      const u = await this.usuariosService.findOne(user.sub);
      return qb.andWhere('s.idPersonaD = :pid', { pid: u.idPersona }).getOne();
    }
    return qb.innerJoin('cl.persona', 'p').innerJoin('p.usuario', 'u').andWhere('u.idUsuario = :uid', { uid: user.sub }).getOne();
  }

  async update(
    idCliente: number,
    idCancha: number,
    updateDenunciaDto: UpdateDenunciaDto,
  ): Promise<Denuncia> {
    // 1. Ejecutar la actualización con la clave compuesta y la nueva data
    const result = await this.denunciaRepository.update(
      { idCliente, idCancha },
      {
        ...updateDenunciaDto,
        actualizadoEn: new Date(), // Asegurar que se actualiza la marca de tiempo
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException(`Denuncia con IDs ${idCliente}/${idCancha} no encontrada para actualizar`);
    }

    // 2. Devolver el registro actualizado
    return this.findOne(idCliente, idCancha);
  }

  async remove(idCliente: number, idCancha: number): Promise<void> {
    const result = await this.denunciaRepository.delete({ idCliente, idCancha });
    if (result.affected === 0) {
      throw new NotFoundException("Denuncia no encontrada para eliminar");
    }
  }
}
