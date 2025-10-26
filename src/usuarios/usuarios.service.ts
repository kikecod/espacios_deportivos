import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PersonasService } from '../personas/personas.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

type UsuarioProfileRaw = {
  persona_paterno: string;
  persona_materno: string;
  persona_nombres: string;
  persona_documento_tipo: string | null;
  persona_documento_numero: string | null;
  persona_telefono: string;
  persona_fecha_nacimiento: Date | string | null;
  persona_genero: string;
  persona_url_foto: string | null;
  usuario_usuario: string;
  usuario_correo: string;
  usuario_hash_contrasena: string | null;
  cliente_apodo: string | null;
  cliente_nivel: number | null;
  cliente_observaciones: string | null;
  duenio_verificado: boolean | null;
  controlador_codigo_empleado: string | null;
  controlador_activo: boolean | null;
  controlador_turno: string | null;
};

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    private personasService: PersonasService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    try {
      await this.personasService.findOne(createUsuarioDto.id_persona);

      const existeUsuario = await this.usuariosRepository.findOne({
        where: { correo: createUsuarioDto.correo },
      });

      if (existeUsuario) {
        throw new ConflictException(
          `Ya existe un usuario con el correo ${createUsuarioDto.correo}`,
        );
      }

      const existeUsuarioPersona = await this.usuariosRepository.findOne({
        where: { id_persona: createUsuarioDto.id_persona },
      });

      if (existeUsuarioPersona) {
        throw new ConflictException(
          `Ya existe un usuario para la persona con ID ${createUsuarioDto.id_persona}`,
        );
      }

      const saltRounds = 10;
      const hash_contrasena = await bcrypt.hash(createUsuarioDto.contrasena, saltRounds);

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

  async findAll(pagination: PaginationQueryDto = new PaginationQueryDto()) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const search = pagination.search?.trim().toLowerCase();

    const queryBuilder = this.usuariosRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.roles', 'usuarioRol')
      .leftJoinAndSelect('usuarioRol.rol', 'rol')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('usuario.creado_en', 'DESC');

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(usuario.usuario) LIKE :search OR LOWER(usuario.correo) LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [usuarios, total] = await queryBuilder.getManyAndCount();

    return {
      data: usuarios.map((usuario) => ({
        ...usuario,
        roles: usuario.roles?.map((usuarioRol) => usuarioRol.rol.rol) ?? [],
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id_usuario: id },
      relations: ['persona'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return usuario;
  }

  async findByCorreoLogin(correo: string): Promise<Usuario | null> {
    return this.usuariosRepository.findOne({
      where: { correo },
      select: [
        'id_usuario',
        'correo',
        'hash_contrasena',
        'id_persona',
        'usuario',
        'correo_verificado',
      ],
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
      relations: ['persona'],
    });

    if (!usuario) {
      throw new NotFoundException(`No existe usuario para la persona con ID ${id_persona}`);
    }

    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);

    try {
      const { nuevaContrasena, ...rest } = updateUsuarioDto;
      const updatePayload: DeepPartial<Usuario> = { ...rest };

      if (nuevaContrasena) {
        const saltRounds = 10;
        updatePayload.hash_contrasena = await bcrypt.hash(nuevaContrasena, saltRounds);
      }

      if (rest.correo && rest.correo !== usuario.correo) {
        const existeCorreo = await this.usuariosRepository.findOne({
          where: { correo: rest.correo },
        });

        if (existeCorreo) {
          throw new ConflictException(
            `Ya existe un usuario con el correo ${rest.correo}`,
          );
        }
      }

      await this.usuariosRepository.update(id, updatePayload);
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
      ultimo_acceso_en: new Date(),
    });
  }

  async verificarContrasena(correo: string, contrasena: string): Promise<boolean> {
    const usuario = await this.usuariosRepository.findOne({
      where: { correo },
      select: ['id_usuario', 'correo', 'hash_contrasena'],
    });

    if (!usuario) {
      return false;
    }

    return bcrypt.compare(contrasena, usuario.hash_contrasena);
  }

  async count(): Promise<number> {
    return this.usuariosRepository.count();
  }

  async setCurrentRefreshToken(refreshToken: string, userId: number): Promise<void> {
    const hashRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usuariosRepository.update(userId, { hash_refresh_token: hashRefreshToken });
  }

  async clearRefreshToken(userId: number): Promise<void> {
    await this.usuariosRepository.update(userId, { hash_refresh_token: null });
  }

  async findProfileData(userId: number): Promise<UsuarioProfileRaw | null> {
    const qb = this.usuariosRepository
      .createQueryBuilder('usuario')
      .innerJoin('personas', 'persona', 'persona.id_persona = usuario.id_persona')
      .leftJoin('cliente', 'cliente', 'cliente.id_cliente = persona.id_persona')
      .leftJoin('duenio', 'duenio', 'duenio.id_persona_d = persona.id_persona')
      .leftJoin('controlador', 'controlador', 'controlador.id_persona_ope = persona.id_persona')
      .select('persona.paterno', 'persona_paterno')
      .addSelect('persona.materno', 'persona_materno')
      .addSelect('persona.nombres', 'persona_nombres')
      .addSelect('persona.documento_tipo', 'persona_documento_tipo')
      .addSelect('persona.documento_numero', 'persona_documento_numero')
      .addSelect('persona.telefono', 'persona_telefono')
      .addSelect('persona.fecha_nacimiento', 'persona_fecha_nacimiento')
      .addSelect('persona.genero', 'persona_genero')
      .addSelect('persona.url_foto', 'persona_url_foto')
      .addSelect('usuario.usuario', 'usuario_usuario')
      .addSelect('usuario.correo', 'usuario_correo')
      .addSelect('usuario.hash_contrasena', 'usuario_hash_contrasena')
      .addSelect('cliente.apodo', 'cliente_apodo')
      .addSelect('cliente.nivel', 'cliente_nivel')
      .addSelect('cliente.observaciones', 'cliente_observaciones')
      .addSelect('duenio.verificado', 'duenio_verificado')
      .addSelect('controlador.codigo_empleado', 'controlador_codigo_empleado')
      .addSelect('controlador.activo', 'controlador_activo')
      .addSelect('controlador.turno', 'controlador_turno')
      .where('usuario.id_usuario = :userId', { userId });

    return (await qb.getRawOne()) as UsuarioProfileRaw | null;
  }

  async findByIdWithRoles(userId: number): Promise<Usuario | null> {
    return this.usuariosRepository.findOne({
      where: { id_usuario: userId },
      select: [
        'id_usuario',
        'correo',
        'id_persona',
        'usuario',
        'hash_refresh_token',
        'correo_verificado',
      ],
      relations: ['roles', 'roles.rol'],
    });
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    const hash_contrasena = await bcrypt.hash(newPassword, 10);
    await this.usuariosRepository.update(userId, { hash_contrasena });
  }

  async markEmailVerified(userId: number): Promise<void> {
    await this.usuariosRepository.update(userId, { correo_verificado: true });
  }
}
