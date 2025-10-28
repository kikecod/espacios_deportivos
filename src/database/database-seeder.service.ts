import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disciplina } from 'src/disciplina/entities/disciplina.entity';
import { disciplinasSeed } from './seeds/disciplina.seed';

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectRepository(Disciplina)
    private disciplinaRepository: Repository<Disciplina>,
  ) {}

  async onModuleInit() {
    await this.seedDisciplinas();
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
}
