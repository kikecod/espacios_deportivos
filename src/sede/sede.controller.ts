import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseInterceptors, UploadedFile, Res, BadRequestException, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { SedeService } from './sede.service';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('sede')
export class SedeController {
  constructor(private readonly sedeService: SedeService) {}

  // ============================================
  // ENDPOINTS PÚBLICOS
  // ============================================
  
  /**
   * GET /sede/inicio
   * Obtener todas las sedes con información completa para la página de inicio
   * Público - No requiere autenticación
   */
  @Get('inicio')
  getSedesInicio() {
    return this.sedeService.getSedesInicio();
  }

  // ============================================
  // ENDPOINTS ADMINISTRATIVOS (CRUD básico)
  // ============================================
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Post()
  create(@Body() createSedeDto: CreateSedeDto) {
    return this.sedeService.create(createSedeDto);
  }

  
  @Get()
  findAll() {
    return this.sedeService.findAll();
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Get('duenio/:idPersonaD')
  findSedeByDuenio(@Param('idPersonaD', ParseIntPipe) idPersonaD: number) {
    return this.sedeService.findSedeByDuenio(idPersonaD);
  }
  

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSedeDto: UpdateSedeDto) {
    return this.sedeService.update(id, updateSedeDto);
  }z

  @Auth([TipoRol.ADMIN])
  @Patch('restore/:id')
  restore(@Param('id') id: string){
    return this.sedeService.restore(+id);
  }

  @Auth([TipoRol.ADMIN])
  @Patch(':id/verificar')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        verificada: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  verificarSede(@Param('id', ParseIntPipe) id: number, @Body() body: { verificada: boolean }) {
    return this.sedeService.updateVerificada(id, body.verificada);
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sedeService.remove(id);
  }

  // ============================================
  // ENDPOINTS PÚBLICOS (Sistema de búsqueda)
  // ============================================
  
  /**
   * GET /sedes/:id
   * Obtener detalle completo de una sede (sin canchas)
   * Público - No requiere autenticación
   */
  @Get(':id')
  findOneDetalle(@Param('id', ParseIntPipe) id: number) {
    return this.sedeService.findOneDetalle(id);
  }

  /**
   * GET /sedes/:id/canchas
   * Obtener todas las canchas de una sede
   * Público - No requiere autenticación
   */
  @Get(':id/canchas')
  findCanchasBySede(@Param('id', ParseIntPipe) id: number) {
    return this.sedeService.findCanchasBySede(id);
  }

  // ============================================
  // ENDPOINTS PARA LICENCIA DE FUNCIONAMIENTO
  // ============================================

  /**
   * POST /sede/:id/licencia
   * Subir PDF de licencia de funcionamiento
   * Requiere autenticación de ADMIN o DUENIO
   */
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Post(':id/licencia')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        licencia: {
          type: 'string',
          format: 'binary',
          description: 'Archivo PDF de la licencia de funcionamiento (máx. 5MB)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('licencia'))
  async uploadLicencia(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return this.sedeService.updateLicencia(id, file.filename);
  }

  /**
   * GET /sede/:id/licencia
   * Descargar PDF de licencia de funcionamiento
   * Público - No requiere autenticación
   */
  @Get(':id/licencia')
  async getLicencia(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const licenciaPath = await this.sedeService.getLicenciaPath(id);
    
    if (!licenciaPath) {
      throw new NotFoundException('Esta sede no tiene licencia de funcionamiento');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="licencia-sede-${id}.pdf"`);
    return res.sendFile(licenciaPath);
  }
}
