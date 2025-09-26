import { Module } from '@nestjs/common';
import { FotosService } from './fotos.service';
import { FotosController } from './fotos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Foto } from './entities/foto.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { diskStorage, MulterError } from 'multer';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([Foto, Cancha]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const extension = file.originalname.split('.').pop();
          const customName = `img_${Date.now()}.${extension}`;
          cb(null, customName);
        },
      }),
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
    })
  ],
  controllers: [FotosController],
  providers: [FotosService],
})
export class FotosModule { }
