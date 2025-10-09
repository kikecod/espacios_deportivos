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
      await this.personasService.findOne(createUsuarioDto.idPersona);

      const existeUsuario = await this.usuariosRepository.findOne({ where: { correo: createUsuarioDto.correo } });
      if (existeUsuario) throw new ConflictException(`Ya existe un usuario con el correo ${createUsuarioDto.correo}`);

      const existeUsuarioPersona = await this.usuariosRepository.findOne({ where: { idPersona: createUsuarioDto.idPersona } });
      if (existeUsuarioPersona) throw new ConflictException(`Ya existe un usuario para la persona ${createUsuarioDto.idPersona}`);

      const saltRounds = 10;
      const hashContrasena = await bcrypt.hash(createUsuarioDto.contrasena, saltRounds);

      const usuario = this.usuariosRepository.create({
        idPersona: createUsuarioDto.idPersona,
        usuario: createUsuarioDto.usuario,
        correo: createUsuarioDto.correo,
        hashContrasena,
        correoVerificado: createUsuarioDto.correoVerificado ?? false,
        estado: createUsuarioDto.estado,
      });

      return await this.usuariosRepository.save(usuario);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) throw error;
      throw new BadRequestException('Error al crear el usuario');
    }
  }

  async findAll() {
    const usuarios = await this.usuariosRepository.find({
      relations: ['usuarioRoles', 'usuarioRoles.rol'], // <-- FIX
    });

    return usuarios.map((u) => ({
      ...u,
      // aplanamos roles a ['ADMIN','USER', ...]
      roles: Array.isArray(u.usuarioRoles)
        ? u.usuarioRoles.map((ur) => ur.rol.rol)
        : [],
    }));
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { idUsuario: id },
      relations: ['persona'],
    });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return usuario;
  }

  async findByIdWithRoles(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { idUsuario: id },
      relations: ['usuarioRoles', 'usuarioRoles.rol'],
    });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return usuario;
  }

  async findByCorreoLogin(correo: string): Promise<Usuario | null> {
    // Necesitamos hashContrasena => select manual + normalizar correo
    const email = correo.trim().toLowerCase();
    return this.usuariosRepository
      .createQueryBuilder('u')
      .addSelect('u.hashContrasena')
      .where('u.correo = :correo', { correo: email })
      .getOne();
  }


  async findByCorreo(correo: string): Promise<Usuario> {
    const email = correo.trim().toLowerCase();
    const usuario = await this.usuariosRepository.findOne({
      where: { correo: email },
      select: ['idUsuario', 'correo', 'idPersona'],
    });
    if (!usuario) throw new NotFoundException(`Usuario ${correo} no encontrado`);
    return usuario;
  }

  async findByCorreoWithRoles(correo: string): Promise<Usuario> {
    const email = correo.trim().toLowerCase();
    const usuario = await this.usuariosRepository.findOne({
      where: { correo: email },
      relations: ['usuarioRoles', 'usuarioRoles.rol'],
    });
    if (!usuario) throw new NotFoundException(`Usuario ${correo} no encontrado`);
    return usuario;
  }

  async findByPersonaId(idPersona: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { idPersona },
      relations: ['persona'],
    });
    if (!usuario) throw new NotFoundException(`No existe usuario para la persona ${idPersona}`);
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);

    try {
      if (updateUsuarioDto.nuevaContrasena) {
        const saltRounds = 10;
        const hashContrasena = await bcrypt.hash(updateUsuarioDto.nuevaContrasena, saltRounds);
        (updateUsuarioDto as any).hashContrasena = hashContrasena;
        delete (updateUsuarioDto as any).nuevaContrasena;
      }

      if (updateUsuarioDto.correo && updateUsuarioDto.correo !== usuario.correo) {
        const email = updateUsuarioDto.correo.trim().toLowerCase();
        const existeCorreo = await this.usuariosRepository.findOne({ where: { correo: email } });
        if (existeCorreo) throw new ConflictException(`Ya existe un usuario con el correo ${updateUsuarioDto.correo}`);
        (updateUsuarioDto as any).correo = email;
      }

      await this.usuariosRepository.update(id, updateUsuarioDto as any);
      return this.findOne(id);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new BadRequestException('Error al actualizar el usuario');
    }
  }

  async remove(id: number): Promise<void> {
    const usuario = await this.findOne(id);
    await this.usuariosRepository.remove(usuario);
  }

  async actualizarUltimoAcceso(id: number): Promise<void> {
    await this.usuariosRepository.update(id, { ultimoAccesoEn: new Date() });
  }

  async verificarContrasena(correo: string, contrasena: string): Promise<boolean> {
    const user = await this.findByCorreoLogin(correo);
    if (!user) return false;
    return bcrypt.compare(contrasena, user.hashContrasena);
  }

  // increment failed attempts and optionally lock account
  async registerFailedLoginAttempt(idUsuario: number, maxAttempts = 5, lockMinutes = 15) {
    const user = await this.findOne(idUsuario);
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= maxAttempts) {
      user.lockedUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
    }
    await this.usuariosRepository.save(user);
  }

  async resetFailedLoginAttempts(idUsuario: number) {
    const user = await this.findOne(idUsuario);
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined as any;
    await this.usuariosRepository.save(user);
  }

  async isLocked(idUsuario: number): Promise<boolean> {
    const u = await this.findOne(idUsuario);
    if (!u.lockedUntil) return false;
    return new Date(u.lockedUntil) > new Date();
  }

  async count(): Promise<number> {
    return this.usuariosRepository.count();
  }
}
