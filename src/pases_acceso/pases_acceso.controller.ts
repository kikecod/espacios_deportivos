import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query } from '@nestjs/common';
import { PasesAccesoService } from './pases_acceso.service';
import { CreatePasesAccesoDto } from './dto/create-pases_acceso.dto';
import { UpdatePasesAccesoDto } from './dto/update-pases_acceso.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ValidarQRDto } from './dto/validar-qr.dto';
import type { Response } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';
import { QRResponseDto } from './dto/qr-response.dto';
import { ResultadoValidacionDto } from './dto/resultado-validacion.dto';

@ApiTags('Pases de Acceso (QR)')
@Controller('pases-acceso')
export class PasesAccesoController {
  constructor(private readonly pasesAccesoService: PasesAccesoService) {}

  // ========== ENDPOINTS PRINCIPALES ==========

  @Get('reserva/:idReserva')
  @Auth([TipoRol.CLIENTE, TipoRol.ADMIN, TipoRol.CONTROLADOR])
  @ApiOperation({ summary: 'Obtener pase de acceso por ID de reserva' })
  @ApiResponse({ status: 200, description: 'Pase encontrado' })
  @ApiResponse({ status: 404, description: 'Pase no encontrado' })
  async obtenerPasePorReserva(@Param('idReserva') idReserva: string) {
    return this.pasesAccesoService.findByReserva(+idReserva);
  }

  @Get(':id/qr')
  @Auth([TipoRol.CLIENTE, TipoRol.ADMIN])
  @ApiOperation({ summary: 'Generar y descargar imagen QR (PNG)' })
  @ApiQuery({ 
    name: 'styled', 
    required: false, 
    type: String,
    description: 'Si es "true", genera QR estilizado con branding. Por defecto: false (QR básico)' 
  })
  @ApiResponse({ status: 200, description: 'Imagen QR generada', type: 'image/png' })
  @ApiResponse({ status: 404, description: 'Pase no encontrado' })
  async generarQR(
    @Param('id') id: string,
    @Query('styled') styled: string,
    @Res() res: Response
  ) {
    // Si styled=true, generar QR estilizado con canvas
    const shouldStyle = styled === 'true';
    
    const qrBuffer = shouldStyle 
      ? await this.pasesAccesoService.generarQREstilizado(+id)
      : await this.pasesAccesoService.generarImagenQR(+id);
    
    res.type('image/png').send(qrBuffer);
  }

  @Get(':id/qr-base64')
  @Auth([TipoRol.CLIENTE, TipoRol.ADMIN])
  @ApiOperation({ summary: 'Obtener QR en formato base64 (para apps móviles)' })
  @ApiResponse({ status: 200, description: 'QR en base64', type: QRResponseDto })
  @ApiResponse({ status: 404, description: 'Pase no encontrado' })
  async generarQRBase64(@Param('id') id: string): Promise<QRResponseDto> {
    const qrBuffer = await this.pasesAccesoService.generarImagenQR(+id);
    return {
      qr: qrBuffer.toString('base64'),
      formato: 'base64',
      tipo: 'image/png'
    };
  }

  @Post('validar')
  @Auth([TipoRol.CONTROLADOR, TipoRol.ADMIN])
  @ApiOperation({ summary: 'Validar código QR escaneado' })
  @ApiResponse({ status: 200, description: 'Validación procesada', type: ResultadoValidacionDto })
  async validarQR(@Body() dto: ValidarQRDto): Promise<ResultadoValidacionDto> {
    return this.pasesAccesoService.validarQR(dto);
  }

  @Get('activos')
  @Auth([TipoRol.CONTROLADOR, TipoRol.ADMIN])
  @ApiOperation({ summary: 'Listar todos los pases activos (Dashboard controlador)' })
  @ApiResponse({ status: 200, description: 'Lista de pases activos' })
  async obtenerPasesActivos() {
    return this.pasesAccesoService.findActivos();
  }

  @Get(':id/historial')
  @Auth([TipoRol.ADMIN, TipoRol.CONTROLADOR])
  @ApiOperation({ summary: 'Obtener historial de validaciones de un pase' })
  @ApiResponse({ status: 200, description: 'Historial de validaciones' })
  async obtenerHistorial(@Param('id') id: string) {
    return this.pasesAccesoService.obtenerHistorialValidaciones(+id);
  }

  // ========== CRUD BÁSICO ==========

  @Post()
  @Auth([TipoRol.ADMIN])
  @ApiOperation({ summary: 'Crear pase manualmente (uso administrativo)' })
  create(@Body() createPasesAccesoDto: CreatePasesAccesoDto) {
    return this.pasesAccesoService.create(createPasesAccesoDto);
  }

  @Get()
  @Auth([TipoRol.ADMIN])
  @ApiOperation({ summary: 'Listar todos los pases' })
  findAll() {
    return this.pasesAccesoService.findAll();
  }

  @Get(':id')
  @Auth([TipoRol.CLIENTE, TipoRol.ADMIN, TipoRol.CONTROLADOR])
  @ApiOperation({ summary: 'Obtener un pase por ID' })
  findOne(@Param('id') id: string) {
    return this.pasesAccesoService.findOne(+id);
  }

  @Patch(':id')
  @Auth([TipoRol.ADMIN])
  @ApiOperation({ summary: 'Actualizar pase (uso administrativo)' })
  update(@Param('id') id: string, @Body() updatePasesAccesoDto: UpdatePasesAccesoDto) {
    return this.pasesAccesoService.update(+id, updatePasesAccesoDto);
  }

  @Delete(':id')
  @Auth([TipoRol.ADMIN])
  @ApiOperation({ summary: 'Eliminar pase (uso administrativo)' })
  remove(@Param('id') id: string) {
    return this.pasesAccesoService.remove(+id);
  }
}
