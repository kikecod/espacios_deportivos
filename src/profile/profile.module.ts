import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { Usuario } from 'src/usuarios/usuario.entity';
import { Persona } from 'src/personas/entities/personas.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Controlador } from 'src/controlador/entities/controlador.entity';
import { UsuarioPreferencias } from './entities/usuario-preferencias.entity';
import { UsuarioEmailVerificacion } from './entities/usuario-email-verificacion.entity';
import { UsuarioAvatarLog } from './entities/usuario-avatar-log.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { PersonasModule } from 'src/personas/personas.module';
import { ClientesModule } from 'src/clientes/clientes.module';
import { ControladorModule } from 'src/controlador/controlador.module';

const avatarUploadDir = path.join(process.cwd(), 'uploads', 'avatars');
fs.mkdirSync(avatarUploadDir, { recursive: true });

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Persona,
      Cliente,
      Controlador,
      UsuarioPreferencias,
      UsuarioEmailVerificacion,
      UsuarioAvatarLog,
      Reserva,
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, avatarUploadDir),
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
          const ext = path.extname(file.originalname) || '.png';
          cb(null, `raw_${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 3 * 1024 * 1024, // 3MB
      },
      fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos de imagen'), false);
        }
      },
    }),
    UsuariosModule,
    PersonasModule,
    ClientesModule,
    ControladorModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
