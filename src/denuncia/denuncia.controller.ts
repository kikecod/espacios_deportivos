import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { DenunciaService } from './denuncia.service';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { UpdateDenunciaDto } from './dto/update-denuncia.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('denuncia')
export class DenunciaController {
  constructor(private readonly denunciaService: DenunciaService) {}

  @Post()
  @ApiOperation({ summary: 'Crea una nueva denuncia' })
  @ApiResponse({ status: 201, description: 'Denuncia creada exitosamente.' })
  @ApiBody({ type: CreateDenunciaDto })
  create(@Body() createDenunciaDto: CreateDenunciaDto) {
    return this.denunciaService.create(createDenunciaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene todas las denuncias' })
  findAll() {
    return this.denunciaService.findAll();
  }

  @Get(':idCliente/:idCancha/:idSede')
  @ApiOperation({ summary: 'Obtiene una denuncia por su clave compuesta' })
  @ApiParam({ name: 'idCliente', type: Number, description: 'ID del Cliente' })
  @ApiParam({ name: 'idCancha', type: Number, description: 'ID de la Cancha' })
  @ApiParam({ name: 'idSede', type: Number, description: 'ID de la Sede' })
  findOne(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Param('idCancha', ParseIntPipe) idCancha: number,
    @Param('idSede', ParseIntPipe) idSede: number,
  ) {
    return this.denunciaService.findOne(idCliente, idCancha, idSede);
  }

  @Patch(':idCliente/:idCancha/:idSede')
  @ApiOperation({ summary: 'Actualiza una denuncia existente' })
  @ApiParam({ name: 'idCliente', type: Number })
  @ApiParam({ name: 'idCancha', type: Number })
  @ApiParam({ name: 'idSede', type: Number })
  @ApiBody({ type: UpdateDenunciaDto })
  update(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Param('idCancha', ParseIntPipe) idCancha: number,
    @Param('idSede', ParseIntPipe) idSede: number,
    @Body() updateDenunciaDto: UpdateDenunciaDto,
  ) {
    return this.denunciaService.update(
      idCliente,
      idCancha,
      idSede,
      updateDenunciaDto,
    );
  }

  @Delete(':idCliente/:idCancha/:idSede')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
  @ApiOperation({ summary: 'Elimina una denuncia por su clave compuesta' })
  @ApiParam({ name: 'idCliente', type: Number })
  @ApiParam({ name: 'idCancha', type: Number })
  @ApiParam({ name: 'idSede', type: Number })
  remove(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Param('idCancha', ParseIntPipe) idCancha: number,
    @Param('idSede', ParseIntPipe) idSede: number,
  ) {
    return this.denunciaService.remove(idCliente, idCancha, idSede);
  }
}
