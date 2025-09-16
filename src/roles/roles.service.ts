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
      // Verificar si el usuario existe
      await this.usuariosService.findOne(createRolDto.idUsuario);

      // Verificar si ya existe un rol activo del mismo tipo para el usuario
      const rolExistente = await this.rolesRepository.findOne({
        where: {
          idUsuario: createRolDto.idUsuario,
          rol: createRolDto.rol,
          activo: true
        }
      });

      if (rolExistente) {
        throw new ConflictException(
          `El usuario ya tiene asignado el rol ${createRolDto.rol}`
        );
      }

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
    return await this.rolesRepository.find({
      relations: ['usuario', 'usuario.persona'],
      order: { asignadoEn: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Rol> {
    const rol = await this.rolesRepository.findOne({
      where: { idRol: id },
      relations: ['usuario', 'usuario.persona']
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return rol;
  }

  async findByUsuario(idUsuario: number): Promise<Rol[]> {
    // Verificar si el usuario existe
    await this.usuariosService.findOne(idUsuario);

    return await this.rolesRepository.find({
      where: { idUsuario },
      relations: ['usuario', 'usuario.persona'],
      order: { asignadoEn: 'DESC' }
    });
  }

  async findActiveByUsuario(idUsuario: number): Promise<Rol[]> {
    // Verificar si el usuario existe
    await this.usuariosService.findOne(idUsuario);

    return await this.rolesRepository.find({
      where: { 
        idUsuario,
        activo: true 
      },
      relations: ['usuario', 'usuario.persona'],
      order: { asignadoEn: 'DESC' }
    });
  }

  async update(id: number, updateRolDto: UpdateRolDto): Promise<Rol> {
    const rol = await this.findOne(id);

    try {
      await this.rolesRepository.update(id, updateRolDto);
      return this.findOne(id);
    } catch (error) {
      throw new BadRequestException('Error al actualizar el rol');
    }
  }

  async remove(id: number): Promise<void> {
    const rol = await this.findOne(id);
    await this.rolesRepository.remove(rol);
  }

  async revocarRol(id: number): Promise<Rol> {
    const rol = await this.findOne(id);

    if (!rol.activo) {
      throw new BadRequestException('El rol ya está inactivo');
    }

    await this.rolesRepository.update(id, {
      activo: false,
      revocadoEn: new Date()
    });

    return this.findOne(id);
  }

  async activarRol(id: number): Promise<Rol> {
    const rol = await this.findOne(id);

    if (rol.activo) {
      throw new BadRequestException('El rol ya está activo');
    }

    // Verificar si ya existe un rol activo del mismo tipo para el usuario
    const rolExistente = await this.rolesRepository.findOne({
      where: {
        idUsuario: rol.idUsuario,
        rol: rol.rol,
        activo: true,
        idRol: Not(id) // Excluir el rol actual
      }
    });

    if (rolExistente) {
      throw new ConflictException(
        `El usuario ya tiene asignado el rol ${rol.rol}`
      );
    }

    await this.rolesRepository.update(id, {
      activo: true,
      revocadoEn: undefined
    });

    return this.findOne(id);
  }

  async count(): Promise<number> {
    return await this.rolesRepository.count();
  }

  async countActive(): Promise<number> {
    return await this.rolesRepository.count({
      where: { activo: true }
    });
  }
}