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
} from '@nestjs/common';
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

  @Get(':id_cliente/:id_cancha/:id_sede')
  @ApiOperation({ summary: 'Obtiene una denuncia por su clave compuesta' })
  @ApiParam({ name: 'id_cliente', type: Number, description: 'ID del Cliente' })
  @ApiParam({ name: 'id_cancha', type: Number, description: 'ID de la Cancha' })
  @ApiParam({ name: 'id_sede', type: Number, description: 'ID de la Sede' })
  findOne(
    @Param('id_cliente', ParseIntPipe) id_cliente: number,
    @Param('id_cancha', ParseIntPipe) id_cancha: number,
    @Param('id_sede', ParseIntPipe) id_sede: number,
  ) {
    return this.denunciaService.findOne(id_cliente, id_cancha, id_sede);
  }

  @Patch(':id_cliente/:id_cancha/:id_sede')
  @ApiOperation({ summary: 'Actualiza una denuncia existente' })
  @ApiParam({ name: 'id_cliente', type: Number })
  @ApiParam({ name: 'id_cancha', type: Number })
  @ApiParam({ name: 'id_sede', type: Number })
  @ApiBody({ type: UpdateDenunciaDto })
  update(
    @Param('id_cliente', ParseIntPipe) id_cliente: number,
    @Param('id_cancha', ParseIntPipe) id_cancha: number,
    @Param('id_sede', ParseIntPipe) id_sede: number,
    @Body() updateDenunciaDto: UpdateDenunciaDto,
  ) {
    return this.denunciaService.update(
      id_cliente,
      id_cancha,
      id_sede,
      updateDenunciaDto,
    );
  }

  @Delete(':id_cliente/:id_cancha/:id_sede')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
  @ApiOperation({ summary: 'Elimina una denuncia por su clave compuesta' })
  @ApiParam({ name: 'id_cliente', type: Number })
  @ApiParam({ name: 'id_cancha', type: Number })
  @ApiParam({ name: 'id_sede', type: Number })
  remove(
    @Param('id_cliente', ParseIntPipe) id_cliente: number,
    @Param('id_cancha', ParseIntPipe) id_cancha: number,
    @Param('id_sede', ParseIntPipe) id_sede: number,
  ) {
    return this.denunciaService.remove(id_cliente, id_cancha, id_sede);
  }
}
