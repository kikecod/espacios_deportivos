import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CalificaCanchaService } from './califica_cancha.service';
import { CreateCalificaCanchaDto } from './dto/create-califica_cancha.dto';
import { UpdateCalificaCanchaDto } from './dto/update-califica_cancha.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { TipoRol } from 'src/roles/entities/rol.entity';

@ApiTags('Calificaciones de Canchas')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('califica-cancha')
export class CalificaCanchaController {
  constructor(private readonly calificaCanchaService: CalificaCanchaService) {}

  @Roles(TipoRol.CLIENTE, TipoRol.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Crea una nueva calificacion' })
  @ApiResponse({ status: 201, description: 'Calificacion creada exitosamente.' })
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
  @ApiOperation({ summary: 'Obtiene una calificacion por su clave compuesta' })
  @ApiParam({ name: 'idCliente', type: Number, description: 'ID del Cliente' })
  @ApiParam({ name: 'idCancha', type: Number, description: 'ID de la Cancha' })
  findOne(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Param('idCancha', ParseIntPipe) idCancha: number,
  ) {
    return this.calificaCanchaService.findOne(idCliente, idCancha);
  }

  @Roles(TipoRol.CLIENTE, TipoRol.ADMIN)
  @Patch(':idCliente/:idCancha')
  @ApiOperation({ summary: 'Actualiza una calificacion existente' })
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

  @Roles(TipoRol.CLIENTE, TipoRol.ADMIN)
  @Delete(':idCliente/:idCancha')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina una calificacion por su clave compuesta' })
  @ApiParam({ name: 'idCliente', type: Number })
  @ApiParam({ name: 'idCancha', type: Number })
  remove(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Param('idCancha', ParseIntPipe) idCancha: number,
  ) {
    return this.calificaCanchaService.remove(idCliente, idCancha);
  }
}

