import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ControlaService } from './controla.service';
import { CreateControlaDto } from './dto/create-controla.dto';
import { UpdateControlaDto } from './dto/update-controla.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controla } from './entities/controla.entity';

@ApiTags('controla')
@Controller('controla')
export class ControlaController {
  constructor(private readonly controlaService: ControlaService) {}

  @Post()
  @ApiOperation({ summary: 'Crea relacion controla' })
  @ApiResponse({ status: 201, description: 'Relacion controla creada exitosamente.' })
  @ApiBody({ type: CreateControlaDto })
  create(@Body() createControlaDto: CreateControlaDto) {
    return this.controlaService.create(createControlaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene todas las relaciones controla' })
  @ApiResponse({ status: 200, description: 'Lista de relaciones controla.', type: [Controla] })
  findAll() {
    return this.controlaService.findAll();
  }

  @Get(':idPersonaOpe/:idReserva/:idPaseAcceso')
  @ApiOperation({ summary: 'Obtiene una relacion controla por su clave compuesta' })
  @ApiParam({ name: 'idPersonaOpe', type: Number, description: 'ID de la Persona Operativa' })
  @ApiParam({ name: 'idReserva', type: Number, description: 'ID de la Reserva' })
  @ApiParam({ name: 'idPaseAcceso', type: Number, description: 'ID del Pase de Acceso' })
  findOne(
    @Param('idPersonaOpe', ParseIntPipe) idPersonaOpe: number,
    @Param('idReserva', ParseIntPipe) idReserva: number,
    @Param('idPaseAcceso', ParseIntPipe) idPaseAcceso: number,
  ) {
    return this.controlaService.findOne(idPersonaOpe, idReserva, idPaseAcceso);
  }

  @Patch(':idPersonaOpe/:idReserva/:idPaseAcceso')
  @ApiOperation({ summary: 'Actualiza una relacion controla existente' })
  @ApiParam({ name: 'idPersonaOpe', type: Number, description: 'ID de la Persona Operativa' })
  @ApiParam({ name: 'idReserva', type: Number, description: 'ID de la Reserva' })
  @ApiParam({ name: 'idPaseAcceso', type: Number, description: 'ID del Pase de Acceso' })
  @ApiBody({ type: UpdateControlaDto })
  update(
    @Param('idPersonaOpe', ParseIntPipe) idPersonaOpe: number,
    @Param('idReserva', ParseIntPipe) idReserva: number,
    @Param('idPaseAcceso', ParseIntPipe) idPaseAcceso: number,
    @Body() updateControlaDto: UpdateControlaDto,
  ) {
    return this.controlaService.update(
      idPersonaOpe,
      idReserva,
      idPaseAcceso,
      updateControlaDto,
    );
  }

  @Delete(':idPersonaOpe/:idReserva/:idPaseAcceso')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
  @ApiOperation({ summary: 'Elimina una relacion controla por su clave compuesta' })
  @ApiParam({ name: 'idPersonaOpe', type: Number })
  @ApiParam({ name: 'idReserva', type: Number })
  @ApiParam({ name: 'idPaseAcceso', type: Number })
  remove(
    @Param('idPersonaOpe', ParseIntPipe) idPersonaOpe: number,
    @Param('idReserva', ParseIntPipe) idReserva: number,
    @Param('idPaseAcceso', ParseIntPipe) idPaseAcceso: number,
  ) {
    return this.controlaService.remove(idPersonaOpe, idReserva, idPaseAcceso);
  }
}
