import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Not, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { PersonasService } from 'src/personas/personas.service';
import { ClientesService } from 'src/clientes/clientes.service';
import { ControladorService } from 'src/controlador/controlador.service';
import { Usuario } from 'src/usuarios/usuario.entity';
import { Persona } from 'src/personas/entities/personas.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Controlador } from 'src/controlador/entities/controlador.entity';
import { UsuarioPreferencias } from './entities/usuario-preferencias.entity';
import { UsuarioEmailVerificacion } from './entities/usuario-email-verificacion.entity';
import { UsuarioAvatarLog } from './entities/usuario-avatar-log.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { UpdatePersonalInfoDto } from './dto/update-personal-info.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestEmailChangeDto } from './dto/request-email-change.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { TipoRol } from 'src/roles/rol.entity';
import { EstadoUsuario } from 'src/usuarios/usuario.entity';
import { randomBytes } from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';
import * as bcrypt from 'bcrypt';

interface ActiveUserPayload {
  correo: string;
  roles: string[];
  idPersona: number;
  idUsuario: number;
  usuario?: string;
}

export interface ExportDataResult {
  fileName: string;
  mimeType: string;
  base64: string;
}

@Injectable()
export class ProfileService {
  private readonly uploadRoot: string;
  private readonly avatarDir: string;
  private readonly shouldReturnEmailToken: boolean;
  private readonly emailVerificationTtlMs: number;

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly personasService: PersonasService,
    private readonly clientesService: ClientesService,
    private readonly controladorService: ControladorService,
    @InjectRepository(Persona) private readonly personasRepository: Repository<Persona>,
    @InjectRepository(Cliente) private readonly clientesRepository: Repository<Cliente>,
    @InjectRepository(Usuario) private readonly usuariosRepository: Repository<Usuario>,
    @InjectRepository(Controlador) private readonly controladorRepository: Repository<Controlador>,
    @InjectRepository(UsuarioPreferencias) private readonly preferenciasRepository: Repository<UsuarioPreferencias>,
    @InjectRepository(UsuarioEmailVerificacion) private readonly emailVerificacionRepository: Repository<UsuarioEmailVerificacion>,
    @InjectRepository(UsuarioAvatarLog) private readonly avatarLogRepository: Repository<UsuarioAvatarLog>,
    @InjectRepository(Reserva) private readonly reservasRepository: Repository<Reserva>,
    private readonly configService: ConfigService,
  ) {
    this.uploadRoot = path.join(process.cwd(), 'uploads');
    this.avatarDir = path.join(this.uploadRoot, 'avatars');
    this.shouldReturnEmailToken = (this.configService.get<string>('NODE_ENV') || 'development') !== 'production';
    const ttlMinutes = Number(this.configService.get<string>('PROFILE_EMAIL_TOKEN_TTL_MINUTES') ?? '30');
    this.emailVerificationTtlMs = ttlMinutes * 60 * 1000;
  }

  async getProfile(user: ActiveUserPayload) {
    const baseProfile = await this.usuariosService.findByCorreoWithFullProfile(user.correo);
    const preferencias = await this.getOrCreatePreferencias(baseProfile.usuario.idUsuario, true);
    return {
      ...baseProfile,
      preferencias,
    };
  }

  async updatePersonalInfo(user: ActiveUserPayload, dto: UpdatePersonalInfoDto) {
    if (!dto.persona && !dto.cliente && !dto.controlador) {
      throw new BadRequestException('No se enviaron datos para actualizar.');
    }

    if (dto.persona) {
      await this.personasService.update(user.idPersona, dto.persona);
    }

    if (dto.cliente) {
      if (!this.hasRole(user, TipoRol.CLIENTE)) {
        throw new UnauthorizedException('No tienes rol de cliente.');
      }
      const { idCliente, ...clientePayload } = dto.cliente as any;
      await this.clientesService.update(user.idPersona, clientePayload);
    }

    if (dto.controlador) {
      if (!this.hasRole(user, TipoRol.CONTROLADOR)) {
        throw new UnauthorizedException('No tienes rol de controlador.');
      }
      const controladorExists = await this.controladorRepository.findOne({
        where: { idPersonaOpe: user.idPersona },
      });
      if (!controladorExists) {
        throw new NotFoundException('No se encontró información de controlador asociada.');
      }
      const { idPersonaOpe, ...controladorPayload } = dto.controlador as any;
      await this.controladorService.update(user.idPersona, controladorPayload);
    }

    return this.getProfile(user);
  }

  async updatePreferences(user: ActiveUserPayload, dto: UpdatePreferencesDto) {
    const preferencias = await this.getOrCreatePreferencias(user.idUsuario, true);
    if (!preferencias) {
      throw new NotFoundException('No se pudieron cargar las preferencias del usuario.');
    }
    Object.assign(preferencias, dto);
    await this.preferenciasRepository.save(preferencias);
    return preferencias;
  }

  async updateAvatar(user: ActiveUserPayload, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Archivo de imagen requerido.');
    }

    await fs.promises.mkdir(this.avatarDir, { recursive: true });

    const rawFilePath = file.path;
    const finalFileName = `avatar_${user.idUsuario}_${Date.now()}.webp`;
    const finalPath = path.join(this.avatarDir, finalFileName);
    const publicPath = `/uploads/avatars/${finalFileName}`;

    try {
      await sharp(rawFilePath)
        .resize(512, 512, { fit: 'cover' })
        .toFormat('webp', { quality: 90 })
        .toFile(finalPath);
    } catch (error) {
      await this.safeUnlink(rawFilePath);
      throw new BadRequestException('No se pudo procesar la imagen de perfil.');
    }

    await this.safeUnlink(rawFilePath);

    const usuario = await this.usuariosRepository.findOne({
      where: { idUsuario: user.idUsuario },
      select: ['idUsuario', 'avatarPath'],
    });
    if (!usuario) {
      await this.safeUnlink(finalPath);
      throw new NotFoundException('Usuario no encontrado.');
    }

    const avatarAnterior = usuario.avatarPath ?? undefined;
    if (avatarAnterior) {
      await this.safeUnlink(this.resolveUploadPath(avatarAnterior));
    }

    await this.usuariosRepository.update(user.idUsuario, { avatarPath: publicPath });
    await this.avatarLogRepository.save({
      idUsuario: user.idUsuario,
      rutaAnterior: avatarAnterior,
      rutaNueva: publicPath,
      accion: 'UPLOAD',
    });

    return {
      message: 'Avatar actualizado correctamente.',
      avatar: publicPath,
    };
  }

  async removeAvatar(user: ActiveUserPayload) {
    const usuario = await this.usuariosRepository.findOne({
      where: { idUsuario: user.idUsuario },
      select: ['idUsuario', 'avatarPath'],
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (usuario.avatarPath) {
      await this.safeUnlink(this.resolveUploadPath(usuario.avatarPath));
      await this.avatarLogRepository.save({
        idUsuario: user.idUsuario,
        rutaAnterior: usuario.avatarPath ?? undefined,
        rutaNueva: '',
        accion: 'DELETE',
      });
    }

    await this.usuariosRepository.update(user.idUsuario, { avatarPath: null });

    return { message: 'Avatar eliminado.' };
  }

  async changePassword(user: ActiveUserPayload, dto: ChangePasswordDto) {
    const valid = await this.usuariosService.verificarContrasena(user.correo, dto.contrasenaActual);
    if (!valid) {
      throw new BadRequestException('La contraseña actual es incorrecta.');
    }

    await this.usuariosService.cambiarContrasena(user.idUsuario, user.idUsuario, dto.nuevaContrasena);
    return { message: 'Contraseña actualizada exitosamente.' };
  }

  async requestEmailChange(user: ActiveUserPayload, dto: RequestEmailChangeDto) {
    const normalizedNewEmail = dto.nuevoCorreo.trim().toLowerCase();
    const currentEmail = user.correo.toLowerCase();

    if (normalizedNewEmail === currentEmail) {
      throw new BadRequestException('El nuevo correo debe ser diferente al actual.');
    }

    const correoEnUso = await this.usuariosRepository.findOne({
      where: { correo: normalizedNewEmail },
    });
    if (correoEnUso) {
      throw new ConflictException('El correo ya está en uso por otra cuenta.');
    }

    const validPassword = await this.usuariosService.verificarContrasena(user.correo, dto.contrasenaActual);
    if (!validPassword) {
      throw new BadRequestException('La contraseña actual es incorrecta.');
    }

    await this.emailVerificacionRepository.delete({ idUsuario: user.idUsuario });

    const token = randomBytes(32).toString('hex');
    const expiraEn = new Date(Date.now() + this.emailVerificationTtlMs);

    const registro = this.emailVerificacionRepository.create({
      idUsuario: user.idUsuario,
      nuevoCorreo: normalizedNewEmail,
      token,
      expiraEn,
      utilizado: false,
    });

    await this.emailVerificacionRepository.save(registro);

    const response: Record<string, any> = {
      message: 'Solicitud de cambio de correo registrada. Revisa tu bandeja de entrada.',
    };

    if (this.shouldReturnEmailToken) {
      response.token = token;
    }

    return response;
  }

  async verifyEmailChange(dto: VerifyEmailDto) {
    const registro = await this.emailVerificacionRepository.findOne({
      where: { token: dto.token },
    });

    if (!registro) {
      throw new NotFoundException('Token de verificación inválido.');
    }

    if (registro.utilizado) {
      throw new BadRequestException('Este token ya fue utilizado.');
    }

    if (registro.expiraEn.getTime() < Date.now()) {
      throw new BadRequestException('El token de verificación ha expirado.');
    }

    await this.usuariosRepository.update(registro.idUsuario, {
      correo: registro.nuevoCorreo,
      correoVerificado: true,
    });

    await this.emailVerificacionRepository.update(registro.idVerificacion, {
      utilizado: true,
      confirmadoEn: new Date(),
    });

    return { message: 'Correo electrónico actualizado correctamente.' };
  }

  async exportData(user: ActiveUserPayload): Promise<ExportDataResult> {
    const perfil = await this.getProfile(user);
    const payload = {
      generadoEn: new Date().toISOString(),
      perfil,
    };

    const buffer = Buffer.from(JSON.stringify(payload, null, 2), 'utf-8');
    const fileName = `datos_usuario_${user.idUsuario}.json`;

    return {
      fileName,
      mimeType: 'application/json',
      base64: buffer.toString('base64'),
    };
  }

  async deactivateAccount(user: ActiveUserPayload, dto: DeactivateAccountDto) {
    await this.usuariosRepository.update(user.idUsuario, {
      estado: EstadoUsuario.DESACTIVADO,
    });

    return {
      message: 'Cuenta desactivada correctamente.',
      motivo: dto.motivo ?? null,
    };
  }

  async deleteAccount(user: ActiveUserPayload, dto: DeleteAccountDto) {
    const valid = await this.usuariosService.verificarContrasena(user.correo, dto.contrasenaActual);
    if (!valid) {
      throw new BadRequestException('La contraseña actual es incorrecta.');
    }

    const reservasPendientes = await this.reservasRepository.count({
      where: {
        idCliente: user.idPersona,
        eliminadoEn: IsNull(),
        iniciaEn: MoreThan(new Date()),
        estado: Not('Cancelado'),
      },
    });

    if (reservasPendientes > 0) {
      throw new BadRequestException('No puedes eliminar tu cuenta mientras tengas reservas activas o pendientes.');
    }

    const usuario = await this.usuariosRepository.findOne({
      where: { idUsuario: user.idUsuario },
      select: ['idUsuario', 'avatarPath', 'correo', 'usuario'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (usuario.avatarPath) {
      await this.safeUnlink(this.resolveUploadPath(usuario.avatarPath));
      await this.avatarLogRepository.save({
        idUsuario: user.idUsuario,
        rutaAnterior: usuario.avatarPath ?? undefined,
        rutaNueva: '',
        accion: 'DELETE',
      });
    }

    const anonymizedEmail = `eliminado+${user.idUsuario}_${Date.now()}@example.com`;
    const anonymizedUsername = `eliminado_${user.idUsuario}`;
    const randomPassword = randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(randomPassword, 10);

    await this.usuariosRepository.update(user.idUsuario, {
      estado: EstadoUsuario.ELIMINADO,
      correo: anonymizedEmail,
      usuario: anonymizedUsername,
      correoVerificado: false,
      hashContrasena: hash,
      avatarPath: null,
    });

    await this.personasRepository.update(user.idPersona, {
      nombres: 'Cuenta',
      paterno: 'Eliminada',
      materno: '',
      telefono: '',
      telefonoVerificado: false,
      urlFoto: null,
      bio: null,
      direccion: null,
      ciudad: null,
      pais: null,
      ocupacion: null,
      deportesFavoritos: [],
    });

    await this.preferenciasRepository.delete({ idUsuario: user.idUsuario });
    await this.emailVerificacionRepository.delete({ idUsuario: user.idUsuario });

    if (this.hasRole(user, TipoRol.CLIENTE)) {
      await this.clientesRepository.update({ idCliente: user.idPersona }, {
        apodo: null,
        observaciones: null,
        nivel: 1,
      });
    }

    return { message: 'Cuenta eliminada de manera permanente.' };
  }

  private async getOrCreatePreferencias(idUsuario: number, createIfMissing: boolean) {
    let preferencias = await this.preferenciasRepository.findOne({
      where: { idUsuario },
    });

    if (!preferencias && createIfMissing) {
      preferencias = this.preferenciasRepository.create({
        idUsuario,
        mostrarEmail: true,
        mostrarTelefono: false,
        perfilPublico: true,
        notificarReservas: true,
        notificarPromociones: true,
        notificarRecordatorios: true,
        idioma: 'es',
        zonaHoraria: 'America/La_Paz',
        modoOscuro: false,
      });
      preferencias = await this.preferenciasRepository.save(preferencias);
    }

    return preferencias;
  }

  private hasRole(user: ActiveUserPayload, role: TipoRol | string) {
    return Array.isArray(user.roles) && user.roles.includes(role);
  }

  private resolveUploadPath(relativePath?: string | null) {
    if (!relativePath) {
      return null;
    }
    const normalized = relativePath.startsWith('/')
      ? relativePath.slice(1)
      : relativePath;
    return path.join(this.uploadRoot, normalized);
  }

  private async safeUnlink(filePath?: string | null) {
    if (!filePath) return;
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      // Ignorar si el archivo no existe
    }
  }
}
