import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Neo4jSeedService } from './seed/neo4j-seed.service';

@ApiTags('Sync')
@Controller('sync')
export class SyncController {
  constructor(private readonly seedService: Neo4jSeedService) {}

  @Post('seed')
  @ApiOperation({ 
    summary: 'Ejecutar migración completa de PostgreSQL a Neo4j',
    description: '⚠️ ADVERTENCIA: Este endpoint limpiará todos los datos de Neo4j y realizará una migración completa. Usar solo una vez o para re-seed.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Migración completada',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        stats: {
          type: 'object',
          properties: {
            usuariosMigrados: { type: 'number' },
            canchasMigradas: { type: 'number' },
            relacionesReservo: { type: 'number' },
            relacionesCalificacion: { type: 'number' },
            tiempoTotal: { type: 'number' }
          }
        },
        errors: { 
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  })
  async ejecutarSeed() {
    return await this.seedService.ejecutarMigracionCompleta();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de Neo4j' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas de la base de datos Neo4j'
  })
  async obtenerEstadisticas() {
    return await this.seedService.obtenerEstadisticas();
  }
}
