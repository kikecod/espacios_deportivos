import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, Not, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';
import { Persona } from '../personas/entities/personas.entity';
import { UsuarioRol } from '../usuario_rol/entities/usuario_rol.entity';
import { Rol, TipoRol } from '../roles/rol.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Duenio } from '../duenio/entities/duenio.entity';
import { Controlador } from '../controlador/entities/controlador.entity';
import { FiltrosUsuariosDto } from './dto/filtros-usuarios.dto';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto';
import { ActualizarUsuarioAdminDto } from './dto/actualizar-usuario-admin.dto';


@Injectable()
export class AdminUsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    @InjectRepository(Persona)
    private personasRepository: Repository<Persona>,
    @InjectRepository(UsuarioRol)
    private usuarioRolRepository: Repository<UsuarioRol>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(Duenio)
    private duenioRepository: Repository<Duenio>,
    @InjectRepository(Controlador)
    private controladorRepository: Repository<Controlador>,
  ) {}

  /**
   * Lista usuarios con filtros y paginación
   */
  async listarUsuarios(filtros: FiltrosUsuariosDto) {
    const {
      rol,
      estado,
      buscar,
      page = 1,
      limit = 20,
    } = filtros;

    const queryBuilder = this.usuariosRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .leftJoinAndSelect('usuario.roles', 'usuarioRol')
      .leftJoinAndSelect('usuarioRol.rol', 'rol')
      .orderBy('usuario.creadoEn', 'DESC');

    // Filtro por rol
    if (rol) {
      queryBuilder.andWhere('rol.rol = :rol', { rol });
    }

    // Filtro por estado
    if (estado) {
      queryBuilder.andWhere('usuario.estado = :estado', { estado });
    } else {
      // Por defecto mostrar todos, incluso ELIMINADO
    }

    // Búsqueda por nombre, correo, usuario o CI
    if (buscar) {
      queryBuilder.andWhere(
        '(persona.nombre ILIKE :buscar OR persona.apellidoPaterno ILIKE :buscar OR persona.apellidoMaterno ILIKE :buscar OR usuario.correo ILIKE :buscar OR usuario.usuario ILIKE :buscar OR persona.ci ILIKE :buscar)',
        { buscar: `%${buscar}%` },
      );
    }

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [usuarios, total] = await queryBuilder.getManyAndCount();

    // Mapear usuarios para retornar formato limpio
    const usuariosMapeados = usuarios.map((usuario) => {
      const { hashContrasena, ...usuarioSinHash } = usuario;
      const rawAvatar = usuario.avatarPath || (usuario.persona as any)?.urlFoto || null;
      const avatarPath =
        rawAvatar && typeof rawAvatar === 'string'
          ? rawAvatar.startsWith('http')
            ? rawAvatar
            : `http://localhost:3000${rawAvatar.startsWith('/') ? rawAvatar : '/' + rawAvatar}`
          : null;

      return {
        ...usuarioSinHash,
        persona: {
          idPersona: usuario.persona.idPersona,
          nombre: usuario.persona.nombres,
          apellidoPaterno: usuario.persona.paterno,
          apellidoMaterno: usuario.persona.materno,
          ci: usuario.persona.documentoNumero,
          telefono: usuario.persona.telefono,
          direccion: usuario.persona.direccion,
          fechaNacimiento: usuario.persona.fechaNacimiento,
          genero: usuario.persona.genero,
        },
        avatarPath,
        nombreCompleto: `${usuario.persona.nombres} ${usuario.persona.paterno} ${usuario.persona.materno || ''}`.trim(),
        roles: usuario.roles?.map((ur) => ur.rol.rol) || [],
      };
    });

    return {
      usuarios: usuariosMapeados,
      total,
      paginas: Math.ceil(total / limit),
      paginaActual: page,
    };
  }

  /**
   * Obtiene detalle completo de un usuario
   */
  async obtenerUsuarioDetalle(id: number) {
    const usuario = await this.usuariosRepository.findOne({
      where: { idUsuario: id },
      relations: ['persona', 'roles', 'roles.rol'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Obtener información adicional según roles
    const rolesArray = usuario.roles?.map((ur) => ur.rol.rol) || [];
    let cliente: Cliente | null = null;
    let duenio: any = null;
    let controlador: any = null;

    if (rolesArray.includes(TipoRol.CLIENTE)) {
      cliente = await this.clienteRepository.findOne({
        where: { idCliente: usuario.idPersona },
      });
    }

    if (rolesArray.includes(TipoRol.DUENIO)) {
      duenio = await this.duenioRepository.findOne({
        where: { idPersonaD: usuario.idPersona },
      });
    }

    if (rolesArray.includes(TipoRol.CONTROLADOR)) {
      controlador = await this.controladorRepository.findOne({
        where: { idPersonaOpe: usuario.idPersona },
      });
    }

    // Obtener estadísticas
    const estadisticas = await this.obtenerEstadisticas(id);

    const { hashContrasena, ...usuarioSinHash } = usuario;

    const rawAvatar = usuario.avatarPath || (usuario.persona as any)?.urlFoto || null;
    const avatarPath =
      rawAvatar && typeof rawAvatar === 'string'
        ? rawAvatar.startsWith('http')
          ? rawAvatar
          : `http://localhost:3000${rawAvatar.startsWith('/') ? rawAvatar : '/' + rawAvatar}`
        : null;

    return {
      ...usuarioSinHash,
      persona: {
        idPersona: usuario.persona.idPersona,
        nombre: usuario.persona.nombres,
        apellidoPaterno: usuario.persona.paterno,
        apellidoMaterno: usuario.persona.materno,
        ci: usuario.persona.documentoNumero,
        telefono: usuario.persona.telefono,
        direccion: usuario.persona.direccion,
        fechaNacimiento: usuario.persona.fechaNacimiento,
        genero: usuario.persona.genero,
      },
      avatarPath,
      nombreCompleto: `${usuario.persona.nombres} ${usuario.persona.paterno} ${usuario.persona.materno || ''}`.trim(),
      roles: rolesArray,
      cliente,
      duenio,
      controlador,
      estadisticas,
    };
  }

  /**
   * Crea un nuevo usuario con persona y roles
   */
  async crearUsuario(dto: CrearUsuarioAdminDto) {
    // Verificar si existe usuario con ese correo
    const existeCorreo = await this.usuariosRepository.findOne({
      where: { correo: dto.correo },
    });

    if (existeCorreo) {
      throw new ConflictException(
        `Ya existe un usuario con el correo ${dto.correo}`,
      );
    }

    // Crear persona
    const persona = this.personasRepository.create({
      nombres: dto.persona.nombre,
      paterno: dto.persona.apellidoPaterno,
      materno: dto.persona.apellidoMaterno || '',
      telefono: dto.persona.telefono || '',
      documentoNumero: dto.persona.ci,
      // Campos requeridos con valores por defecto
      fechaNacimiento: new Date('1990-01-01'),
      genero: 'OTRO' as any,
    });

    const personaGuardada = await this.personasRepository.save(persona);

    // Generar contraseña por defecto si no se proporciona
    const contrasena = dto.contrasena || this.generarContrasenaAleatoria();
    const hashContrasena = await bcrypt.hash(contrasena, 10);

    // Crear usuario
    const usuario = this.usuariosRepository.create({
      idPersona: personaGuardada.idPersona,
      usuario: dto.usuario,
      correo: dto.correo,
      hashContrasena,
      estado: (dto.estado || 'ACTIVO') as any,
      avatarPath: dto.avatarPath,
      ultimoCambioContrasenaEn: new Date(),
    });

    const usuarioGuardado = await this.usuariosRepository.save(usuario);

    // Asignar roles
    if (dto.roles && dto.roles.length > 0) {
      await this.asignarRoles(usuarioGuardado.idUsuario!, dto.roles);
    }

    // Crear entradas en tablas específicas según rol
    for (const rol of dto.roles || []) {
      if (rol === TipoRol.CLIENTE) {
        await this.clienteRepository.save({
          idCliente: personaGuardada.idPersona,
          apodo: dto.cliente?.apodo || null,
          nivel: dto.cliente?.nivel ?? 0,
          observaciones: dto.cliente?.observaciones || null,
        });
      }
      if (rol === TipoRol.DUENIO) {
        await this.duenioRepository.save({
          idPersonaD: personaGuardada.idPersona,
          verificado: dto.duenio?.verificado ?? false,
          imagenCI: dto.duenio?.imagenCI || '',
          imagenFacial: dto.duenio?.imagenFacial || '',
        } as any);
      }
      if (rol === TipoRol.CONTROLADOR) {
        await this.controladorRepository.save({
          idPersonaOpe: personaGuardada.idPersona,
          codigoEmpleado: dto.controlador?.codigoEmpleado || `EMP${personaGuardada.idPersona}`,
          turno: dto.controlador?.turno || '',
          activo: dto.controlador?.activo ?? true,
        } as any);
      }
    }

    const detalle = await this.obtenerUsuarioDetalle(usuarioGuardado.idUsuario!);

    // Devolver detalle de usuario + contrase\u00f1a temporal (solo si se gener\u00f3 autom\u00e1ticamente)
    return {
      ...detalle,
      contrasenaTemporal: dto.contrasena ? undefined : contrasena,
    };
  }

  /**
   * Actualiza usuario, persona y roles
   */
  async actualizarUsuario(id: number, dto: ActualizarUsuarioAdminDto) {
    const usuario = await this.usuariosRepository.findOne({
      where: { idUsuario: id },
      relations: ['persona'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Actualizar persona
    if (dto.persona) {
      const updateData: any = {};
      if (dto.persona.nombre) updateData.nombres = dto.persona.nombre;
      if (dto.persona.apellidoPaterno) updateData.paterno = dto.persona.apellidoPaterno;
      if (dto.persona.apellidoMaterno) updateData.materno = dto.persona.apellidoMaterno;
      if (dto.persona.telefono) updateData.telefono = dto.persona.telefono;
      if (dto.persona.ci) updateData.documentoNumero = dto.persona.ci;
      
      if (Object.keys(updateData).length > 0) {
        await this.personasRepository.update(usuario.idPersona, updateData);
      }
    }

    // Actualizar usuario
    const datosActualizar: any = {};
    if (dto.usuario) datosActualizar.usuario = dto.usuario;
    if (dto.correo) datosActualizar.correo = dto.correo;
    if (dto.estado) datosActualizar.estado = dto.estado;
    if (dto.avatarPath) datosActualizar.avatarPath = dto.avatarPath;

    if (Object.keys(datosActualizar).length > 0) {
      await this.usuariosRepository.update(id, datosActualizar);
    }

    // Actualizar roles si se proporcionan
    if (dto.roles) {
      await this.modificarRoles(id, dto.roles);
    }

    // Actualizar datos de cliente si se proporcionan y el usuario tiene el rol
    if (dto.cliente) {
      const cliente = await this.clienteRepository.findOne({
        where: { idCliente: usuario.idPersona },
      });
      if (cliente) {
        const updateData: any = {};
        if (dto.cliente.apodo !== undefined) updateData.apodo = dto.cliente.apodo;
        if (dto.cliente.nivel !== undefined) updateData.nivel = dto.cliente.nivel;
        if (dto.cliente.observaciones !== undefined) updateData.observaciones = dto.cliente.observaciones;
        
        if (Object.keys(updateData).length > 0) {
          await this.clienteRepository.update(usuario.idPersona, updateData);
        }
      }
    }

    // Actualizar datos de dueño si se proporcionan
    if (dto.duenio) {
      const duenio = await this.duenioRepository.findOne({
        where: { idPersonaD: usuario.idPersona },
      });
      if (duenio) {
        const updateData: any = {};
        if (dto.duenio.verificado !== undefined) updateData.verificado = dto.duenio.verificado;
        if (dto.duenio.imagenCI !== undefined) updateData.imagenCI = dto.duenio.imagenCI;
        if (dto.duenio.imagenFacial !== undefined) updateData.imagenFacial = dto.duenio.imagenFacial;
        
        if (Object.keys(updateData).length > 0) {
          await this.duenioRepository.update({ idPersonaD: usuario.idPersona }, updateData);
        }
      }
    }

    // Actualizar datos de controlador si se proporcionan
    if (dto.controlador) {
      const controlador = await this.controladorRepository.findOne({
        where: { idPersonaOpe: usuario.idPersona },
      });
      if (controlador) {
        const updateData: any = {};
        if (dto.controlador.codigoEmpleado !== undefined) updateData.codigoEmpleado = dto.controlador.codigoEmpleado;
        if (dto.controlador.turno !== undefined) updateData.turno = dto.controlador.turno;
        if (dto.controlador.activo !== undefined) updateData.activo = dto.controlador.activo;
        
        if (Object.keys(updateData).length > 0) {
          await this.controladorRepository.update({ idPersonaOpe: usuario.idPersona }, updateData);
        }
      }
    }

    return await this.obtenerUsuarioDetalle(id);
  }

  /**
   * Modifica los roles de un usuario
   */
  async modificarRoles(idUsuario: number, nuevosRoles: TipoRol[]) {
    const usuario = await this.usuariosRepository.findOne({
      where: { idUsuario },
      relations: ['persona', 'roles', 'roles.rol'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${idUsuario} no encontrado`);
    }

    const rolesActuales = usuario.roles?.map((ur) => ur.rol.rol) || [];

    // Roles a agregar
    const rolesAgregar = nuevosRoles.filter(
      (r) => !rolesActuales.includes(r),
    );

    // Roles a quitar
    const rolesQuitar = rolesActuales.filter((r) => !nuevosRoles.includes(r));

    // Agregar nuevos roles
    for (const rol of rolesAgregar) {
      await this.asignarRol(idUsuario, rol);

      // Crear entrada en tabla específica
      if (rol === TipoRol.CLIENTE) {
        const existeCliente = await this.clienteRepository.findOne({
          where: { idCliente: usuario.idPersona },
        });
        if (!existeCliente) {
          await this.clienteRepository.save({
            idCliente: usuario.idPersona,
            apodo: null,
            nivel: 0,
            observaciones: null,
          });
        }
      }
      if (rol === TipoRol.DUENIO) {
        const existeDuenio = await this.duenioRepository.findOne({
          where: { idPersonaD: usuario.idPersona },
        });
        if (!existeDuenio) {
          await this.duenioRepository.save({
            idPersonaD: usuario.idPersona,
            verificado: false,
            imagenCI: '',
            imagenFacial: '',
          } as any);
        }
      }
      if (rol === TipoRol.CONTROLADOR) {
        const existeControlador = await this.controladorRepository.findOne({
          where: { idPersonaOpe: usuario.idPersona },
        });
        if (!existeControlador) {
          await this.controladorRepository.save({
            idPersonaOpe: usuario.idPersona,
            codigoEmpleado: `EMP${usuario.idPersona}`,
            turno: '',
            activo: true,
          } as any);
        }
      }
    }

    // Quitar roles
    for (const rol of rolesQuitar) {
      await this.quitarRol(idUsuario, rol);
      // Nota: No eliminamos de las tablas específicas por integridad referencial
    }

    return {
      mensaje: 'Roles actualizados correctamente',
      rolesAnteriores: rolesActuales,
      rolesNuevos: nuevosRoles,
    };
  }

  /**
   * Asigna un rol a un usuario
   */
  private async asignarRol(idUsuario: number, rol: TipoRol) {
    const rolEntity = await this.rolRepository.findOne({
      where: { rol },
    });

    if (!rolEntity) {
      throw new NotFoundException(`Rol ${rol} no encontrado`);
    }

    // Verificar si ya tiene el rol
    const existeRol = await this.usuarioRolRepository.findOne({
      where: { idUsuario, idRol: rolEntity.idRol },
    });

    if (!existeRol) {
      await this.usuarioRolRepository.save({
        idUsuario,
        idRol: rolEntity.idRol,
        activo: true,
      });
    }
  }

  /**
   * Asigna múltiples roles a un usuario
   */
  private async asignarRoles(idUsuario: number, roles: TipoRol[]) {
    for (const rol of roles) {
      await this.asignarRol(idUsuario, rol);
    }
  }

  /**
   * Quita un rol de un usuario
   */
  private async quitarRol(idUsuario: number, rol: TipoRol) {
    const rolEntity = await this.rolRepository.findOne({
      where: { rol },
    });

    if (!rolEntity) {
      return;
    }

    await this.usuarioRolRepository.delete({
      idUsuario,
      idRol: rolEntity.idRol,
    });
  }

  /**
   * Cambia el estado de un usuario
   */
  async cambiarEstado(id: number, estado: string, motivo?: string) {
    const usuario = await this.usuariosRepository.findOne({
      where: { idUsuario: id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.usuariosRepository.update(id, { estado: estado as any });

    return {
      mensaje: `Estado cambiado a ${estado}`,
      motivo,
    };
  }

  /**
   * Da de baja lógica a un usuario
   */
  async darDeBaja(id: number, motivo?: string) {
    const usuario = await this.usuariosRepository.findOne({
      where: { idUsuario: id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.usuariosRepository.update(id, {
      estado: 'ELIMINADO' as any,
    });

    return {
      mensaje: 'Usuario dado de baja correctamente',
      motivo,
    };
  }

  /**
   * Reactiva un usuario dado de baja
   */
  async reactivarUsuario(id: number, motivo?: string) {
    const usuario = await this.usuariosRepository.findOne({
      where: { idUsuario: id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.usuariosRepository.update(id, {
      estado: 'ACTIVO' as any,
    });

    return {
      mensaje: 'Usuario reactivado correctamente',
      motivo,
    };
  }

  /**
   * Obtiene estadísticas de un usuario
   */
  async obtenerEstadisticas(idUsuario: number) {
    // Aquí deberías hacer queries reales a las tablas correspondientes
    // Por ahora retorno valores por defecto
    return {
      totalReservas: 0,
      reservasCanceladas: 0,
      sedesCreadas: 0,
      canchasActivas: 0,
      resenasRecibidas: 0,
      promedioCalificacion: 0,
      reportesRecibidos: 0,
    };
  }

  /**
   * Genera una contraseña aleatoria
   */
  private generarContrasenaAleatoria(): string {
    return Math.random().toString(36).slice(-8);
  }

  /**
   * Actualiza el avatar de un usuario
   */
  async actualizarAvatar(id: number, file: Express.Multer.File) {
    const usuario = await this.usuariosRepository.findOne({
      where: { idUsuario: id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    if (!file) {
      throw new BadRequestException('No se proporcionó un archivo');
    }

    // Construir la ruta pública del avatar
    const avatarPath = `/uploads/avatars/${file.filename}`;

    // Actualizar usuario
    await this.usuariosRepository.update(id, { avatarPath });

    return {
      mensaje: 'Avatar actualizado correctamente',
      avatar: avatarPath,
    };
  }

  /**
   * Elimina el avatar de un usuario
   */
  async eliminarAvatar(id: number) {
    const usuario = await this.usuariosRepository.findOne({
      where: { idUsuario: id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.usuariosRepository.update(id, { avatarPath: null });

    return {
      mensaje: 'Avatar eliminado correctamente',
    };
  }

  async cambiarContrasenaAdmin(id: number, nuevaContrasena: string) {
    const usuario = await this.usuariosRepository.findOne({
      where: { idUsuario: id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    if (!nuevaContrasena || nuevaContrasena.trim().length < 6) {
      throw new BadRequestException('La contrasena debe tener al menos 6 caracteres');
    }

    const hashContrasena = await bcrypt.hash(nuevaContrasena, 10);

    await this.usuariosRepository.update(id, {
      hashContrasena,
      ultimoCambioContrasenaEn: new Date(),
    });

    return {
      mensaje: 'Contrasena actualizada correctamente',
    };
  }
}
