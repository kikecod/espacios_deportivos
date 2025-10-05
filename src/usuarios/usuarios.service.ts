import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PersonasService } from '../personas/personas.service';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    private personasService: PersonasService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    try {
      // Verificar si la persona existe
      await this.personasService.findOne(createUsuarioDto.idPersona);

      // Verificar si ya existe un usuario con ese correo
      const existeUsuario = await this.usuariosRepository.findOne({
        where: { correo: createUsuarioDto.correo }
      });

      if (existeUsuario) {
        throw new ConflictException(
          `Ya existe un usuario con el correo ${createUsuarioDto.correo}`
        );
      }

      // Verificar si ya existe un usuario para esa persona
      const existeUsuarioPersona = await this.usuariosRepository.findOne({
        where: { idPersona: createUsuarioDto.idPersona }
      });

      if (existeUsuarioPersona) {
        throw new ConflictException(
          `Ya existe un usuario para la persona con ID ${createUsuarioDto.idPersona}`
        );
      }

      // Hash de la contraseña
      const saltRounds = 10;
      const hashContrasena = await bcrypt.hash(createUsuarioDto.contrasena, saltRounds);

      // Crear usuario
      const usuario = this.usuariosRepository.create({
        ...createUsuarioDto,
        hashContrasena,
      });

      return await this.usuariosRepository.save(usuario);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al crear el usuario');
    }
  }

  async findAll() {
    const usuario = await this.usuariosRepository.find({
      relations: ['roles', 'roles.rol']
    });

    return usuario.map(usuario => ({
      ...usuario,
      roles: Array.isArray(usuario.roles)
        ? usuario.roles.map(ur => ur.rol.rol)
        : usuario.roles
          ? [usuario.roles.rol.rol]
          : []
    }))
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { idUsuario: id },
      relations: ['persona']
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return usuario;
  }

  async findByCorreoLogin(correo: string): Promise<Usuario | null> {
    return await this.usuariosRepository.findOne({
        where: { correo },
        select: ['idUsuario', 'correo', 'hashContrasena'],
    });
}

  async findByCorreo(correo: string): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { correo },
      select: ['idUsuario', 'correo', 'idPersona'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con correo ${correo} no encontrado`);
    }

    return usuario;
  }

  async findByPersonaId(idPersona: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { idPersona },
      relations: ['persona']
    });

    if (!usuario) {
      throw new NotFoundException(`No existe usuario para la persona con ID ${idPersona}`);
    }

    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);

    try {
      // Si se proporciona nueva contraseña, hashearla
      if (updateUsuarioDto.nuevaContrasena) {
        const saltRounds = 10;
        const hashContrasena = await bcrypt.hash(updateUsuarioDto.nuevaContrasena, saltRounds);
        updateUsuarioDto = { ...updateUsuarioDto, hashContrasena } as any;
        delete updateUsuarioDto.nuevaContrasena;
      }

      // Verificar si el nuevo correo ya existe (si se está actualizando)
      if (updateUsuarioDto.correo && updateUsuarioDto.correo !== usuario.correo) {
        const existeCorreo = await this.usuariosRepository.findOne({
          where: { correo: updateUsuarioDto.correo }
        });

        if (existeCorreo) {
          throw new ConflictException(
            `Ya existe un usuario con el correo ${updateUsuarioDto.correo}`
          );
        }
      }

      await this.usuariosRepository.update(id, updateUsuarioDto);
      return this.findOne(id);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar el usuario');
    }
  }

  async remove(id: number): Promise<void> {
    const usuario = await this.findOne(id);
    await this.usuariosRepository.remove(usuario);
  }

  async actualizarUltimoAcceso(id: number): Promise<void> {
    await this.usuariosRepository.update(id, {
      ultimoAccesoEn: new Date()
    });
  }

  async verificarContrasena(correo: string, contrasena: string): Promise<boolean> {
    const usuario = await this.usuariosRepository.findOne({
      where: { correo },
      select: ['idUsuario', 'correo', 'hashContrasena'] // Incluir campos necesarios para la verificación
    });

    if (!usuario) {
      return false;
    }

    return await bcrypt.compare(contrasena, usuario.hashContrasena);
  }

  async count(): Promise<number> {
    return await this.usuariosRepository.count();
  }
}