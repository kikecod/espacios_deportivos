import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { PersonasService } from '../personas/personas.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RolesService } from '../roles/roles.service';
import { DataSource, Repository } from 'typeorm';
import { UsuarioRol } from '../usuario_rol/entities/usuario_rol.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Seed idempotente de admin.
 * - Garantiza correo válido y contraseña >= 6
 * - Actualiza usuario existente (busca por usuario 'admin' o por admin@admin)
 * - Crea persona/usuario/rol si no existen
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const personas = app.get(PersonasService);
  const usuarios = app.get(UsuariosService);
  const roles = app.get(RolesService);
  const urRepo = app.get<Repository<UsuarioRol>>(getRepositoryToken(UsuarioRol));
  const dataSource = app.get(DataSource);
  const configService = app.get(ConfigService);

  // Garantizar que las tablas existan en entornos no productivos
  const nodeEnv = configService.get<string>('NODE_ENV') ?? process.env.NODE_ENV;
  if (nodeEnv !== 'production') {
    await dataSource.synchronize();
  }

  const desiredEmail = 'admin@example.com';
  const desiredPassword = 'Admin123'; // cumple MinLength(6)
  const username = 'admin';

  try {
    // 1) Si ya existe usuario con desiredEmail -> actualizamos contraseña y rol
    try {
      const found = await usuarios.findByCorreo(desiredEmail);
      console.log('Admin con email deseado ya existe. Asegurando rol y contraseña.');
      await usuarios.update(found.idUsuario, { nuevaContrasena: desiredPassword } as any);

      // asegurar rol ADMIN
      const withRoles = await usuarios.findByCorreoWithRoles(desiredEmail);
      let adminRole = (await roles.findAll()).find((r) => r.rol === 'ADMIN');
      if (!adminRole) adminRole = await roles.create({ rol: 'ADMIN', activo: true } as any);

      const hasAdmin = withRoles.usuarioRoles?.some((ur) => ur.rol.rol === 'ADMIN');
      if (!hasAdmin) {
        await urRepo.save(urRepo.create({ idUsuario: withRoles.idUsuario, idRol: adminRole.idRol }));
      }

      console.log('Admin actualizado con correo:', desiredEmail);
      return process.exit(0);
    } catch (err) {
      // no existe con desiredEmail -> seguimos
    }

  // 2) Buscar usuario existente con username 'admin' o el email antiguo 'admin@admin'
  let existing: any = null;
    try {
      existing = await usuarios.findByCorreo('admin@admin');
    } catch (e) {
      // ignore
    }

    if (!existing) {
      try {
        // intentar por usuario 'admin' recorriendo todos y buscando usuario field
        const all = await usuarios.findAll();
        existing = all.find((u) => u.usuario === username);
      } catch (e) {
        existing = null;
      }
    }

    if (existing) {
      // actualizar correo y contraseña
      await usuarios.update(existing.idUsuario, { correo: desiredEmail, nuevaContrasena: desiredPassword } as any);

      // asegurar rol ADMIN
      const withRoles = await usuarios.findByIdWithRoles(existing.idUsuario);
      let adminRole = (await roles.findAll()).find((r) => r.rol === 'ADMIN');
      if (!adminRole) adminRole = await roles.create({ rol: 'ADMIN', activo: true } as any);

      const hasAdmin = withRoles.usuarioRoles?.some((ur) => ur.rol.rol === 'ADMIN');
      if (!hasAdmin) {
        await urRepo.save(urRepo.create({ idUsuario: withRoles.idUsuario, idRol: adminRole.idRol }));
      }

      console.log('Admin existente actualizado a correo:', desiredEmail);
      return process.exit(0);
    }

    // 3) Si no existe, crear persona + usuario + rol
    const persona = await personas.create({
      nombres: 'Admin',
      paterno: 'Admin',
      materno: 'Admin',
      telefono: '0000000000',
      // Debe ser string ISO para pasar @IsDateString del DTO
      fechaNacimiento: '1990-01-01',
      genero: 'MASCULINO',
    } as any);

    const usuario = await usuarios.create({
      idPersona: persona.idPersona,
      usuario: username,
      correo: desiredEmail,
      contrasena: desiredPassword,
      correoVerificado: true,
    } as any);

    let adminRole = (await roles.findAll()).find((r) => r.rol === 'ADMIN');
    if (!adminRole) adminRole = await roles.create({ rol: 'ADMIN', activo: true } as any);

    await urRepo.save(urRepo.create({ idUsuario: usuario.idUsuario, idRol: adminRole.idRol }));

    console.log('Admin seed creado con correo:', desiredEmail);
    process.exit(0);
  } catch (error) {
    console.error('Error al crear/admin actualizar seed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  bootstrap();
}
