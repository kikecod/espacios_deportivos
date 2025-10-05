import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { CalificaCanchaService } from './califica_cancha.service';
import { CreateCalificaCanchaDto } from './dto/create-califica_cancha.dto';
import { UpdateCalificaCanchaDto } from './dto/update-califica_cancha.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Calificaciones de Canchas')
@Controller('califica-cancha')
export class CalificaCanchaController {
  constructor(private readonly calificaCanchaService: CalificaCanchaService) {}

  @Post()
  @ApiOperation({ summary: 'Crea una nueva calificación' })
  @ApiResponse({ status: 201, description: 'Calificación creada exitosamente.' })
  @ApiBody({ type: CreateCalificaCanchaDto })
  create(@Body() createCalificaCanchaDto: CreateCalificaCanchaDto) {
    return this.calificaCanchaService.create(createCalificaCanchaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene todas las calificaciones' })
  findAll() {
    return this.calificaCanchaService.findAll();
  }

  @Get(':idCliente/:idCancha')
  @ApiOperation({ summary: 'Obtiene una calificación por su clave compuesta' })
  @ApiParam({ name: 'idCliente', type: Number, description: 'ID del Cliente' })
  @ApiParam({ name: 'idCancha', type: Number, description: 'ID de la Cancha' })
  findOne(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Param('idCancha', ParseIntPipe) idCancha: number,
  ) {
    return this.calificaCanchaService.findOne(idCliente, idCancha);
  }

  @Patch(':idCliente/:idCancha')
  @ApiOperation({ summary: 'Actualiza una calificación existente' })
  @ApiParam({ name: 'idCliente', type: Number })
  @ApiParam({ name: 'idCancha', type: Number })
  @ApiBody({ type: UpdateCalificaCanchaDto })
  update(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Param('idCancha', ParseIntPipe) idCancha: number,
    @Body() updateCalificaCanchaDto: UpdateCalificaCanchaDto,
  ) {
    return this.calificaCanchaService.update(
      idCliente,
      idCancha,
      updateCalificaCanchaDto,
    );
  }

  @Delete(':idCliente/:idCancha')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content para eliminación exitosa
  @ApiOperation({ summary: 'Elimina una calificación por su clave compuesta' })
  @ApiParam({ name: 'idCliente', type: Number })
  @ApiParam({ name: 'idCancha', type: Number })
  @ApiParam({ name: 'idSede', type: Number })
  remove(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Param('idCancha', ParseIntPipe) idCancha: number,
  ) {
    return this.calificaCanchaService.remove(idCliente, idCancha);
  }
}
