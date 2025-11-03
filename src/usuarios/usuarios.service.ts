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
        ultimoCambioContrasenaEn: new Date(),
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
        select: ['idUsuario', 'correo', 'hashContrasena', 'idPersona', 'usuario'],
        relations: ['roles', 'roles.rol'],
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

  async findByCorreoWithFullProfile(correo: string) {
    const usuario = await this.usuariosRepository.findOne({
      where: { correo },
      relations: ['persona', 'roles', 'roles.rol'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con correo ${correo} no encontrado`);
    }

    // Buscar información adicional según los roles
    let cliente: any = null;
    let duenio: any = null;
    let controlador: any = null;

    // Verificar si es cliente
    const rolesArray = usuario.roles?.map(ur => ur.rol.rol) ?? [];
    
    if (rolesArray.includes('CLIENTE' as any)) {
      try {
        const clienteRepo = this.usuariosRepository.manager.getRepository('Cliente');
        cliente = await clienteRepo.findOne({
          where: { idCliente: usuario.idPersona }
        });
      } catch (error) {
        // Cliente no encontrado, dejar como null
      }
    }

    // Verificar si es dueño
    if (rolesArray.includes('DUENIO' as any)) {
      try {
        const duenioRepo = this.usuariosRepository.manager.getRepository('Duenio');
        duenio = await duenioRepo.findOne({
          where: { idDuenio: usuario.idPersona }
        });
      } catch (error) {
        // Dueño no encontrado, dejar como null
      }
    }

    // Verificar si es controlador
    if (rolesArray.includes('CONTROLADOR' as any)) {
      try {
        const controladorRepo = this.usuariosRepository.manager.getRepository('Controlador');
        controlador = await controladorRepo.findOne({
          where: { idControlador: usuario.idPersona }
        });
      } catch (error) {
        // Controlador no encontrado, dejar como null
      }
    }

    return {
      persona: usuario.persona,
      usuario: {
        idUsuario: usuario.idUsuario,
        correo: usuario.correo,
        usuario: usuario.usuario,
        idPersona: usuario.idPersona,
        correoVerificado: usuario.correoVerificado,
        roles: rolesArray,
        estado: usuario.estado,
        avatar: usuario.avatarPath ?? usuario.persona?.urlFoto ?? null,
        avatarPath: usuario.avatarPath ?? null,
      },
      cliente,
      duenio,
      controlador
    };
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
        updateUsuarioDto = { ...updateUsuarioDto, hashContrasena, ultimoCambioContrasenaEn: new Date() } as any;
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

  async updateProfile(idUsuario: number, idUsuarioAuth: number, updateData: { correo?: string, usuario?: string }) {
    // Verificar que el usuario solo pueda actualizar su propio perfil
    if (idUsuario !== idUsuarioAuth) {
      throw new ConflictException('No tienes permiso para actualizar este perfil');
    }

    const usuario = await this.findOne(idUsuario);

    // Verificar si el nuevo correo ya existe
    if (updateData.correo && updateData.correo !== usuario.correo) {
      const existeCorreo = await this.usuariosRepository.findOne({
        where: { correo: updateData.correo }
      });

      if (existeCorreo) {
        throw new ConflictException(`Ya existe un usuario con el correo ${updateData.correo}`);
      }
    }

    // Verificar si el nuevo nombre de usuario ya existe
    if (updateData.usuario && updateData.usuario !== usuario.usuario) {
      const existeUsuario = await this.usuariosRepository.findOne({
        where: { usuario: updateData.usuario }
      });

      if (existeUsuario) {
        throw new ConflictException(`Ya existe un usuario con el nombre ${updateData.usuario}`);
      }
    }

    await this.usuariosRepository.update(idUsuario, updateData);
    const updatedUsuario = await this.findOne(idUsuario);

    return {
      message: 'Usuario actualizado exitosamente',
      usuario: {
        idUsuario: updatedUsuario.idUsuario,
        correo: updatedUsuario.correo,
        usuario: updatedUsuario.usuario
      }
    };
  }

  async cambiarContrasena(idUsuario: number, idUsuarioAuth: number, nuevaContrasena: string) {
    // Verificar que el usuario solo pueda cambiar su propia contraseña
    if (idUsuario !== idUsuarioAuth) {
      throw new ConflictException('No tienes permiso para cambiar esta contraseña');
    }

    // Hash de la nueva contraseña
    const saltRounds = 10;
    const hashContrasena = await bcrypt.hash(nuevaContrasena, saltRounds);

    await this.usuariosRepository.update(idUsuario, { hashContrasena, ultimoCambioContrasenaEn: new Date() });

    return {
      message: 'Contraseña actualizada exitosamente'
    };
  }
}
