import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disciplina } from 'src/disciplina/entities/disciplina.entity';
import { Rol } from 'src/roles/rol.entity';
import { disciplinasSeed } from './seeds/disciplina.seed';
import { rolesSeed } from './seeds/rol.seed';

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectRepository(Disciplina)
    private disciplinaRepository: Repository<Disciplina>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedDisciplinas();
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
}
