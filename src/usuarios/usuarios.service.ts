import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';
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
      await this.personasService.findOne(createUsuarioDto.id_persona);

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
        where: { id_persona: createUsuarioDto.id_persona }
      });

      if (existeUsuarioPersona) {
        throw new ConflictException(
          `Ya existe un usuario para la persona con ID ${createUsuarioDto.id_persona}`
        );
      }

      // Hash de la contraseña
      const saltRounds = 10;
      const hash_contrasena = await bcrypt.hash(createUsuarioDto.contrasena, saltRounds);

      // Crear usuario
      const usuario = this.usuariosRepository.create({
        ...createUsuarioDto,
        hash_contrasena,
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
      roles: usuario.roles?.map(ur => ur.rol.rol) ?? []
    }))
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id_usuario: id },
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
        select: ['id_usuario', 'correo', 'hash_contrasena', 'id_persona', 'usuario'],
        relations: ['roles', 'roles.rol'],
    });
}

  async findByCorreo(correo: string): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { correo },
      select: ['id_usuario', 'correo', 'id_persona'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con correo ${correo} no encontrado`);
    }

    return usuario;
  }

  async findByPersonaId(id_persona: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id_persona },
      relations: ['persona']
    });

    if (!usuario) {
      throw new NotFoundException(`No existe usuario para la persona con ID ${id_persona}`);
    }

    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);

    try {
      // Si se proporciona nueva contraseña, hashearla
      if (updateUsuarioDto.nuevaContrasena) {
        const saltRounds = 10;
        const hash_contrasena = await bcrypt.hash(updateUsuarioDto.nuevaContrasena, saltRounds);
        updateUsuarioDto = { ...updateUsuarioDto, hash_contrasena } as any;
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
      select: ['id_usuario', 'correo', 'hash_contrasena'] // Incluir campos necesarios para la verificación
    });

    if (!usuario) {
      return false;
    }

    return await bcrypt.compare(contrasena, usuario.hash_contrasena);
  }

  async count(): Promise<number> {
    return await this.usuariosRepository.count();
  }
}