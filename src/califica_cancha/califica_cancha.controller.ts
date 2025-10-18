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

  @Get('cancha/:id_cancha')
  @ApiOperation({ summary: 'Obtiene todas las reseñas de una cancha específica' })
  @ApiParam({ name: 'id_cancha', type: Number, description: 'ID de la Cancha' })
  findByCancha(@Param('id_cancha', ParseIntPipe) id_cancha: number) {
    return this.calificaCanchaService.findByCancha(id_cancha);
  }

  @Get(':id_cliente/:id_cancha/:id_sede')
  @ApiOperation({ summary: 'Obtiene una calificación por su clave compuesta' })
  @ApiParam({ name: 'id_cliente', type: Number, description: 'ID del Cliente' })
  @ApiParam({ name: 'id_cancha', type: Number, description: 'ID de la Cancha' })
  @ApiParam({ name: 'id_sede', type: Number, description: 'ID de la Sede' })
  findOne(
    @Param('id_cliente', ParseIntPipe) id_cliente: number,
    @Param('id_cancha', ParseIntPipe) id_cancha: number,
    @Param('id_sede', ParseIntPipe) id_sede: number,
  ) {
    return this.calificaCanchaService.findOne(id_cliente, id_cancha, id_sede);
  }

  @Patch(':id_cliente/:id_cancha/:id_sede')
  @ApiOperation({ summary: 'Actualiza una calificación existente' })
  @ApiParam({ name: 'id_cliente', type: Number })
  @ApiParam({ name: 'id_cancha', type: Number })
  @ApiParam({ name: 'id_sede', type: Number })
  @ApiBody({ type: UpdateCalificaCanchaDto })
  update(
    @Param('id_cliente', ParseIntPipe) id_cliente: number,
    @Param('id_cancha', ParseIntPipe) id_cancha: number,
    @Param('id_sede', ParseIntPipe) id_sede: number,
    @Body() updateCalificaCanchaDto: UpdateCalificaCanchaDto,
  ) {
    return this.calificaCanchaService.update(
      id_cliente,
      id_cancha,
      id_sede,
      updateCalificaCanchaDto,
    );
  }

  @Delete(':id_cliente/:id_cancha/:id_sede')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content para eliminación exitosa
  @ApiOperation({ summary: 'Elimina una calificación por su clave compuesta' })
  @ApiParam({ name: 'id_cliente', type: Number })
  @ApiParam({ name: 'id_cancha', type: Number })
  @ApiParam({ name: 'id_sede', type: Number })
  remove(
    @Param('id_cliente', ParseIntPipe) id_cliente: number,
    @Param('id_cancha', ParseIntPipe) id_cancha: number,
    @Param('id_sede', ParseIntPipe) id_sede: number,
  ) {
    return this.calificaCanchaService.remove(id_cliente, id_cancha, id_sede);
  }
}
