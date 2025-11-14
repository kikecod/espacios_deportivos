import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disciplina } from 'src/disciplina/entities/disciplina.entity';
import { Rol, TipoRol } from 'src/roles/rol.entity';
import { Persona } from 'src/personas/entities/personas.entity';
import { Usuario, EstadoUsuario } from 'src/usuarios/usuario.entity';
import { UsuarioRol } from 'src/usuario_rol/entities/usuario_rol.entity';
import { disciplinasSeed } from './seeds/disciplina.seed';
import { rolesSeed } from './seeds/rol.seed';
import { adminRootSeed } from './seeds/admin-root.seed';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectRepository(Disciplina)
    private disciplinaRepository: Repository<Disciplina>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    @InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(UsuarioRol)
    private usuarioRolRepository: Repository<UsuarioRol>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedDisciplinas();
    await this.seedAdminRoot();
  }

  private async seedRoles() {
    try {
      // Verificar si ya existen roles
      const count = await this.rolRepository.count();
      
      if (count > 0) {
        this.logger.log(`Ya existen ${count} roles en la base de datos. No se ejecutará el seed.`);
        return;
      }

      this.logger.log('Iniciando seed de roles...');

      // Crear roles
      const roles = this.rolRepository.create(rolesSeed);
      await this.rolRepository.save(roles);

      this.logger.log(`✅ Se crearon ${roles.length} roles exitosamente`);
    } catch (error) {
      this.logger.error('❌ Error al ejecutar seed de roles:', error.message);
    }
  }

  private async seedDisciplinas() {
    try {
      // Verificar si ya existen disciplinas
      const count = await this.disciplinaRepository.count();
      
      if (count > 0) {
        this.logger.log(`Ya existen ${count} disciplinas en la base de datos. No se ejecutará el seed.`);
        return;
      }

      this.logger.log('Iniciando seed de disciplinas...');

      // Crear disciplinas
      const disciplinas = this.disciplinaRepository.create(disciplinasSeed);
      await this.disciplinaRepository.save(disciplinas);

      this.logger.log(`✅ Se crearon ${disciplinas.length} disciplinas exitosamente`);
    } catch (error) {
      this.logger.error('❌ Error al ejecutar seed de disciplinas:', error.message);
    }
  }

  private async seedAdminRoot() {
    try {
      // Verificar si ya existe el usuario admin
      const existingAdmin = await this.usuarioRepository.findOne({
        where: { usuario: 'admin' }
      });

      if (existingAdmin) {
        this.logger.log('El usuario admin root ya existe. No se ejecutará el seed.');
        return;
      }

      this.logger.log('Iniciando seed de usuario admin root...');

      // 1. Crear la Persona
      const persona = this.personaRepository.create(adminRootSeed.persona);
      const personaGuardada: Persona = await this.personaRepository.save(persona);
      this.logger.log(`✅ Persona creada con ID: ${personaGuardada.idPersona}`);

      // 2. Hashear la contraseña
      const saltRounds = 10;
      const hashContrasena = await bcrypt.hash(adminRootSeed.usuario.contrasena, saltRounds);

      // 3. Crear el Usuario
      const usuario = this.usuarioRepository.create({
        idPersona: personaGuardada.idPersona,
        usuario: adminRootSeed.usuario.usuario,
        correo: adminRootSeed.usuario.correo,
        correoVerificado: adminRootSeed.usuario.correoVerificado,
        hashContrasena: hashContrasena,
        estado: EstadoUsuario.ACTIVO,
      });
      const usuarioGuardado: Usuario = await this.usuarioRepository.save(usuario);
      this.logger.log(`✅ Usuario creado con ID: ${usuarioGuardado.idUsuario}`);

      // 4. Obtener el rol ADMIN
      const rolAdmin = await this.rolRepository.findOne({
        where: { rol: TipoRol.ADMIN }
      });

      if (!rolAdmin) {
        throw new Error('No se encontró el rol ADMIN. Ejecuta primero el seed de roles.');
      }

      // 5. Crear la relación UsuarioRol
      const usuarioRol = this.usuarioRolRepository.create({
        idUsuario: usuarioGuardado.idUsuario,
        idRol: rolAdmin.idRol,
      });
      await this.usuarioRolRepository.save(usuarioRol);
      this.logger.log(`✅ Rol ADMIN asignado al usuario`);

      this.logger.log('================================================');
      this.logger.log('✅ USUARIO ADMIN ROOT CREADO EXITOSAMENTE');
      this.logger.log('================================================');
      this.logger.log(`Usuario: ${adminRootSeed.usuario.usuario}`);
      this.logger.log(`Email: ${adminRootSeed.usuario.correo}`);
      this.logger.log(`Contraseña: ${adminRootSeed.usuario.contrasena}`);
      this.logger.log('================================================');
      this.logger.log('⚠️  IMPORTANTE: Cambia esta contraseña después del primer login');
      this.logger.log('================================================');

    } catch (error) {
      this.logger.error('❌ Error al ejecutar seed de admin root:', error.message);
      throw error;
    }
  }
}
