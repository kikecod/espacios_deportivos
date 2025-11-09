import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Neo4jService } from './neo4j.service';

@ApiTags('Neo4j')
@Controller('neo4j')
export class Neo4jController {
  constructor(private readonly neo4jService: Neo4jService) {}

  @Get('health')
  @ApiOperation({ summary: 'Verificar estado de conexión con Neo4j' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de la conexión',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'connected' },
        message: { type: 'string', example: 'Neo4j está conectado y funcionando correctamente' }
      }
    }
  })
  async healthCheck() {
    return await this.neo4jService.healthCheck();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de la base de datos Neo4j' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas de la base de datos',
    schema: {
      type: 'object',
      properties: {
        totalNodes: { type: 'number', example: 150 },
        totalRelationships: { type: 'number', example: 320 },
        nodeLabels: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['PerfilUsuario', 'EspacioDeportivo']
        }
      }
    }
  })
  async getStats() {
    return await this.neo4jService.getStats();
  }
}

