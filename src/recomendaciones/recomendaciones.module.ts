import { Module } from '@nestjs/common';
import { RecomendacionesService } from './recomendaciones.service';
import { RecomendacionesController } from './recomendaciones.controller';
import { Neo4jModule } from 'src/neo4j/neo4j.module';

@Module({
  imports: [Neo4jModule],
  controllers: [RecomendacionesController],
  providers: [RecomendacionesService],
  exports: [RecomendacionesService],
})
export class RecomendacionesModule {}
