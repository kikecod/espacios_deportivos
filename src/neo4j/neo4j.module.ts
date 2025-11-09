import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Neo4jService } from './neo4j.service';
import { Neo4jController } from './neo4j.controller';
import neo4jConfig from './config/neoj4.config';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(neo4jConfig),
  ],
  controllers: [Neo4jController],
  providers: [Neo4jService],
  exports: [Neo4jService],
})
export class Neo4jModule {}

