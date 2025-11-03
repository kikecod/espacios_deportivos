import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe, 
  HttpCode, 
  HttpStatus, 
  UseGuards, 
  Req,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { CalificaCanchaService } from './califica_cancha.service';
import { CreateCalificaCanchaDto } from './dto/create-califica_cancha.dto';
import { UpdateCalificaCanchaDto } from './dto/update-califica_cancha.dto';
import { 
  ApiBody, 
  ApiOperation, 
  ApiParam, 
  ApiResponse, 
  ApiTags, 
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/guard/auth.guard';

@ApiTags('Reseñas de Canchas')
@Controller('califica-cancha')
export class CalificaCanchaController {
  constructor(private readonly calificaCanchaService: CalificaCanchaService) {}

  // ==========================================
  // CREAR RESEÑA ⭐
  // ==========================================
  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Crear una reseña de cancha',
    description: 'Requiere tener una reserva completada dentro de los últimos 14 días. Una reseña por cancha.'
  })
  @ApiResponse({ status: 201, description: 'Reseña creada exitosamente' })
  @ApiResponse({ status: 400, description: 'No cumple condiciones para reseñar' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiBody({ type: CreateCalificaCanchaDto })
  create(@Body() createDto: CreateCalificaCanchaDto, @Req() request: any) {
    const idUsuario = request.user.idUsuario;
    return this.calificaCanchaService.create(idUsuario, createDto);
  }

  // ==========================================
  // VALIDAR PERMISO PARA RESEÑAR ⭐
  // ==========================================
  @Get('validar/:idReserva')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Verificar si puede reseñar una reserva',
    description: 'Retorna si el cliente puede dejar una reseña y cuántos días le quedan'
  })
  @ApiParam({ name: 'idReserva', type: Number, description: 'ID de la reserva' })
  @ApiResponse({ status: 200, description: 'Validación exitosa' })
  validarPermiso(
    @Param('idReserva', ParseIntPipe) idReserva: number, 
    @Req() request: any
  ) {
    const idUsuario = request.user.idUsuario;
    return this.calificaCanchaService.canUserReviewFromUsuario(idUsuario, idReserva);
  }

  // ==========================================
  // OBTENER RESEÑAS DE UNA CANCHA (público)
  // ==========================================
  @Get('cancha/:idCancha')
  @ApiOperation({ 
    summary: 'Obtener todas las reseñas de una cancha',
    description: 'Endpoint público con paginación y ordenamiento'
  })
  @ApiParam({ name: 'idCancha', type: Number, description: 'ID de la cancha' })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    example: 1,
    description: 'Número de página'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    example: 10,
    description: 'Resultados por página'
  })
  @ApiQuery({ 
    name: 'ordenar', 
    required: false, 
    enum: ['recientes', 'mejores', 'peores'],
    example: 'recientes',
    description: 'Orden de las reseñas'
  })
  @ApiResponse({ status: 200, description: 'Lista de reseñas con rating y distribución' })
  findByCancha(
    @Param('idCancha', ParseIntPipe) idCancha: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('ordenar', new DefaultValuePipe('recientes')) ordenar: string,
  ) {
    return this.calificaCanchaService.findByCancha(idCancha, page, limit, ordenar);
  }

  // ==========================================
  // MIS RESEÑAS
  // ==========================================
  @Get('mis-resenas')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Obtener todas mis reseñas',
    description: 'Lista de todas las reseñas que he dejado'
  })
  @ApiResponse({ status: 200, description: 'Lista de mis reseñas' })
  findMisResenas(@Req() request: any) {
    const idUsuario = request.user.idUsuario;
    return this.calificaCanchaService.findByClienteFromUsuario(idUsuario);
  }

  // ==========================================
  // RESERVAS PENDIENTES DE RESEÑAR
  // ==========================================
  @Get('pendientes')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Obtener mis reservas que puedo reseñar',
    description: 'Lista de reservas completadas en los últimos 14 días sin reseña'
  })
  @ApiResponse({ status: 200, description: 'Lista de reservas pendientes de reseñar' })
  findPendientes(@Req() request: any) {
    const idUsuario = request.user.idUsuario;
    return this.calificaCanchaService.getMisReservasPendientesFromUsuario(idUsuario);
  }

  // ==========================================
  // OBTENER UNA RESEÑA ESPECÍFICA
  // ==========================================
  @Get(':idCliente/:idCancha')
  @ApiOperation({ 
    summary: 'Obtener una reseña específica',
    description: 'Obtiene una reseña por su clave compuesta'
  })
  @ApiParam({ name: 'idCliente', type: Number })
  @ApiParam({ name: 'idCancha', type: Number })
  @ApiResponse({ status: 200, description: 'Reseña encontrada' })
  @ApiResponse({ status: 404, description: 'Reseña no encontrada' })
  findOne(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Param('idCancha', ParseIntPipe) idCancha: number,
  ) {
    return this.calificaCanchaService.findOne(idCliente, idCancha);
  }

  // ==========================================
  // ACTUALIZAR RESEÑA
  // ==========================================
  @Patch(':idCancha')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Actualizar mi reseña',
    description: 'Actualiza una reseña propia (solo dentro de los 7 días posteriores a su creación)'
  })
  @ApiParam({ name: 'idCancha', type: Number })
  @ApiBody({ type: UpdateCalificaCanchaDto })
  @ApiResponse({ status: 200, description: 'Reseña actualizada' })
  @ApiResponse({ status: 400, description: 'No se puede editar (pasó el tiempo límite)' })
  @ApiResponse({ status: 404, description: 'Reseña no encontrada' })
  update(
    @Param('idCancha', ParseIntPipe) idCancha: number,
    @Body() updateDto: UpdateCalificaCanchaDto,
    @Req() request: any,
  ) {
    const idUsuario = request.user.idUsuario;
    return this.calificaCanchaService.updateFromUsuario(idUsuario, idCancha, updateDto);
  }

  // ==========================================
  // ELIMINAR RESEÑA
  // ==========================================
  @Delete(':idCancha')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Eliminar mi reseña',
    description: 'Elimina una reseña propia (soft delete)'
  })
  @ApiParam({ name: 'idCancha', type: Number })
  @ApiResponse({ status: 204, description: 'Reseña eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Reseña no encontrada' })
  remove(
    @Param('idCancha', ParseIntPipe) idCancha: number,
    @Req() request: any,
  ) {
    const idUsuario = request.user.idUsuario;
    return this.calificaCanchaService.removeFromUsuario(idUsuario, idCancha);
  }
}
