import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiPersonaService } from './api-persona.service';
import { CrearVerificacionDto } from './dto';

@ApiTags('API Persona - Verificación de Identidad')
@Controller('api-persona')
export class ApiPersonaController {
  constructor(private readonly apiPersonaService: ApiPersonaService) {}

  @Post('verificaciones')
  @ApiOperation({ summary: 'Crear una nueva verificación de identidad' })
  @ApiResponse({ status: 201, description: 'Verificación creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al crear verificación' })
  async crearVerificacion(@Body() dto: CrearVerificacionDto) {
    return await this.apiPersonaService.crearVerificacion(
      dto.referenceId,
      dto.metadata,
    );
  }

  @Get('verificaciones/:inquiryId')
  @ApiOperation({ summary: 'Obtener estado de una verificación' })
  @ApiResponse({ status: 200, description: 'Estado obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Verificación no encontrada' })
  async obtenerEstado(@Param('inquiryId') inquiryId: string) {
    return await this.apiPersonaService.obtenerEstadoVerificacion(inquiryId);
  }

  @Get('verificaciones/:inquiryId/aprobada')
  @ApiOperation({ summary: 'Verificar si la verificación está aprobada' })
  @ApiResponse({ status: 200, description: 'Estado de aprobación verificado' })
  async estaAprobada(@Param('inquiryId') inquiryId: string) {
    const aprobada = await this.apiPersonaService.estaAprobada(inquiryId);
    return { inquiryId, aprobada };
  }

  @Post('verificaciones/:inquiryId/session')
  @ApiOperation({ summary: 'Generar URL de sesión para completar verificación' })
  @ApiResponse({ status: 200, description: 'URL de sesión generada' })
  async generarSessionURL(@Param('inquiryId') inquiryId: string) {
    const sessionToken = await this.apiPersonaService.generarSessionURL(inquiryId);
    return { 
      inquiryId, 
      sessionToken,
      url: `https://withpersona.com/verify?inquiry-id=${inquiryId}&session-token=${sessionToken}`
    };
  }

  @Get('verificaciones/:inquiryId/documento')
  @ApiOperation({ summary: 'Obtener información del documento verificado' })
  @ApiResponse({ status: 200, description: 'Documento obtenido exitosamente' })
  async obtenerDocumento(@Param('inquiryId') inquiryId: string) {
    return await this.apiPersonaService.obtenerDocumentoVerificado(inquiryId);
  }
}
