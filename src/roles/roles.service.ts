import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Rol } from './rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private rolesRepository: Repository<Rol>,
    private usuariosService: UsuariosService,
  ) {}

  async create(createRolDto: CreateRolDto): Promise<Rol> {
    try {
      const rol = this.rolesRepository.create(createRolDto);
      return await this.rolesRepository.save(rol);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al crear el rol');
    }
  }

  async findAll(): Promise<Rol[]> {
    return await this.rolesRepository.find();
  }

  async findOne(id: number) {
    const exists = await this.rolesRepository.exists({ where: { idRol: id } });
    if(!exists){
      throw new NotFoundException('Rol no encontrado');
    }

    return await this.rolesRepository.findOneBy({ idRol: id });
  }

  async update(id: number, updateRolDto: UpdateRolDto){
    const exists = await this.rolesRepository.exists({ where: { idRol: id } });
    if(!exists){
      throw new NotFoundException('Rol no encontrado');
    }

    return await this.rolesRepository.update(id, updateRolDto);
  }

  async restore(id: number){
    const exists = await this.rolesRepository.exist({ where: { idRol: id }, withDeleted: true });
    if (!exists) {
      throw new NotFoundException("Cancha no encontrada");
    }

    return await this.rolesRepository.restore(id);
  }

  async remove(id: number) {
    const exists = await this.rolesRepository.exist({ where: { idRol: id } });
    if (!exists) {
      throw new NotFoundException("Cancha no encontrada");
    }

    return await this.rolesRepository.softDelete(id);
  }
}