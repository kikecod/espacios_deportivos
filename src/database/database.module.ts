import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseSeederService } from './database-seeder.service';
import { Disciplina } from 'src/disciplina/entities/disciplina.entity';
import { Rol } from 'src/roles/rol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Disciplina, Rol])],
  providers: [DatabaseSeederService],
  exports: [DatabaseSeederService],
})
export class DatabaseModule {}
