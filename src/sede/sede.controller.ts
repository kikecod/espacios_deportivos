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
  constructor(private readonly sedeService: SedeService) { }

  // ============================================
  // ENDPOINTS PÚBLICOS Y ADMINISTRATIVOS
  // Orden importante: rutas específicas ANTES que :id genérico
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

  /**
   * GET /sede/:id/canchas
   * Obtener todas las canchas de una sede
   * Público - No requiere autenticación
   */
  @Get(':id/canchas')
  findCanchasBySede(@Param('id', ParseIntPipe) id: number) {
    return this.sedeService.findCanchasBySede(id);
  }

  /**
   * GET /sede/:id/estadisticas
   * Obtener estadísticas de una sede específica
   */
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Get(':id/estadisticas')
  getEstadisticas(@Param('id', ParseIntPipe) id: number) {
    return this.sedeService.getEstadisticasSede(id);
  }

  /**
   * GET /sede/:id
   * Obtener detalle completo de una sede
   * Público - No requiere autenticación
   * DEBE estar DESPUÉS de todas las rutas específicas (:id/canchas, :id/estadisticas, etc)
   */
  @Get(':id')
  findOneDetalle(@Param('id', ParseIntPipe) id: number) {
    return this.sedeService.findOneDetalle(id);
  }

  // ============================================
  // ENDPOINTS ADMINISTRATIVOS (CRUD básico)
  // ============================================
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Post()
  @UseInterceptors(FileInterceptor('licencia'))
  create(
    @Body() createSedeDto: CreateSedeDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.sedeService.create(createSedeDto, file);
  }


  /**
   * GET /sede
   * Obtener listado de sedes con filtros y paginación (para admin panel)
   * Requiere autenticación como ADMIN o DUENIO
   */
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Get()
  findAll(
    @Query('buscar') buscar?: string,
    @Query('ciudad') ciudad?: string,
    @Query('estado') estado?: string,
    @Query('verificada') verificada?: string,
    @Query('activa') activa?: string,
    @Query('idDuenio') idDuenio?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('ordenarPor') ordenarPor?: string,
    @Query('ordenDireccion') ordenDireccion?: 'asc' | 'desc',
  ) {
    return this.sedeService.findAllWithFilters({
      buscar,
      ciudad,
      estado,
      verificada: verificada !== undefined ? verificada === 'true' : undefined,
      activa: activa !== undefined ? activa === 'true' : undefined,
      idDuenio: idDuenio ? parseInt(idDuenio) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 12,
      ordenarPor,
      ordenDireccion: ordenDireccion || 'desc',
    });
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Get('duenio/:idPersonaD')
  findSedeByDuenio(@Param('idPersonaD', ParseIntPipe) idPersonaD: number) {
    return this.sedeService.findSedeByDuenio(idPersonaD);
  }

  /**
   * GET /sede/admin/:id
   * Obtener detalle de sede para panel de administración
   */
  @Get('admin/:id')
  findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.sedeService.findOneAdmin(id);
  }

  /**
   * PATCH /sede/:id
   * Actualizar sede - Requiere ADMIN o DUENIO
   */
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSedeDto: UpdateSedeDto) {
    return this.sedeService.update(id, updateSedeDto);
  }

  // ----- INICIO DE SECCIÓN FUSIONADA -----

  /**
   * PATCH /sede/:id/verificar
   * Verificar o denegar una sede (solo admin)
   * Este método reemplaza al 'verificar' simple.
   */
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

  /**
   * PATCH /sede/:id/rechazar
   * Rechazar verificación de una sede (solo admin)
   * Este método fue agregado por la rama 'dev'.
   */
  @Auth([TipoRol.ADMIN])
  @Patch(':id/rechazar')
  rechazarVerificacion(@Param('id', ParseIntPipe) id: number, @Body('motivo') motivo: string) {
    return this.sedeService.rechazarVerificacion(id, motivo);
  }

  // ----- FIN DE SECCIÓN FUSIONADA -----

  /**
   * PATCH /sede/:id/activar
   * Activar una sede
   */
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Patch(':id/activar')
  activar(@Param('id', ParseIntPipe) id: number) {
    return this.sedeService.activar(id);
  }

  /**
   * PATCH /sede/:id/desactivar
   * Desactivar una sede
   */
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Patch(':id/desactivar')
  desactivar(
    @Param('id', ParseIntPipe) id: number,
    @Body('motivo') motivo: string,
    @Body('temporal') temporal?: boolean,
  ) {
    return this.sedeService.desactivar(id, motivo, temporal);
  }

  /**
   * PATCH /sede/:id/reactivar
   * Reactivar una sede desactivada
   */
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Patch(':id/reactivar')
  reactivar(@Param('id', ParseIntPipe) id: number) {
    return this.sedeService.reactivar(id);
  }

  @Auth([TipoRol.ADMIN])
  @Patch('restore/:id')
  restore(@Param('id') id: string) {
    return this.sedeService.restore(+id);
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sedeService.remove(id);
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
    s) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return this.sedeService.updateLicencia(id, file);
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
    const licenciaUrl = await this.sedeService.getLicenciaUrl(id);

    if (!licenciaUrl) {
      throw new NotFoundException('Esta sede no tiene licencia de funcionamiento');
    }

    return res.redirect(licenciaUrl);
  }
}