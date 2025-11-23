import { Module } from '@nestjs/common';
import { FotosService } from './fotos.service';
import { FotosController } from './fotos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Foto } from './entities/foto.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Sede } from 'src/sede/entities/sede.entity';
import { memoryStorage } from 'multer';
import { MulterModule } from '@nestjs/platform-express';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Foto, Cancha, Sede]),
    S3Module,
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype === 'image/jpeg' ||
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpg'
        ) {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten imágenes JPG, JPEG y PNG'), false);
        }
      },
    }),
  ],
  controllers: [FotosController],
  providers: [FotosService],
})
export class FotosModule { }
