import { Module } from '@nestjs/common';
import { SedeService } from './sede.service';
import { SedeController } from './sede.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sede } from './entities/sede.entity';
import { Duenio } from 'src/duenio/entities/duenio.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sede, Duenio, Cancha]),
    S3Module,
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos PDF'), false);
        }
      },
    }),
  ],
  controllers: [SedeController],
  providers: [SedeService],
  exports: [TypeOrmModule, SedeService],
})
export class SedeModule { }
