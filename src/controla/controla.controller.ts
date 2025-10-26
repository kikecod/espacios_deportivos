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
import { ControlaService } from './controla.service';
import { CreateControlaDto } from './dto/create-controla.dto';
import { UpdateControlaDto } from './dto/update-controla.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Controla } from './entities/controla.entity';

@ApiTags('controla')
@Controller('controla')
export class ControlaController {
  constructor(private readonly controlaService: ControlaService) {}

  @Post()
  @ApiOperation({ summary: 'Crea relacion controla' })
  @ApiResponse({
    status: 201,
    description: 'Relacion controla creada exitosamente.',
  })
  @ApiBody({ type: CreateControlaDto })
  create(@Body() createControlaDto: CreateControlaDto) {
    return this.controlaService.create(createControlaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene todas las relaciones controla' })
  @ApiResponse({
    status: 200,
    description: 'Lista de relaciones controla.',
    type: [Controla],
  })
  findAll() {
    return this.controlaService.findAll();
  }

  @Get(':id_persona_ope/:id_reserva/:id_pase_acceso')
  @ApiOperation({
    summary: 'Obtiene una relacion controla por su clave compuesta',
  })
  @ApiParam({
    name: 'id_persona_ope',
    type: Number,
    description: 'ID de la Persona Operativa',
  })
  @ApiParam({
    name: 'id_reserva',
    type: Number,
    description: 'ID de la Reserva',
  })
  @ApiParam({
    name: 'id_pase_acceso',
    type: Number,
    description: 'ID del Pase de Acceso',
  })
  findOne(
    @Param('id_persona_ope', ParseIntPipe) id_persona_ope: number,
    @Param('id_reserva', ParseIntPipe) id_reserva: number,
    @Param('id_pase_acceso', ParseIntPipe) id_pase_acceso: number,
  ) {
    return this.controlaService.findOne(
      id_persona_ope,
      id_reserva,
      id_pase_acceso,
    );
  }

  @Patch(':id_persona_ope/:id_reserva/:id_pase_acceso')
  @ApiOperation({ summary: 'Actualiza una relacion controla existente' })
  @ApiParam({
    name: 'id_persona_ope',
    type: Number,
    description: 'ID de la Persona Operativa',
  })
  @ApiParam({
    name: 'id_reserva',
    type: Number,
    description: 'ID de la Reserva',
  })
  @ApiParam({
    name: 'id_pase_acceso',
    type: Number,
    description: 'ID del Pase de Acceso',
  })
  @ApiBody({ type: UpdateControlaDto })
  update(
    @Param('id_persona_ope', ParseIntPipe) id_persona_ope: number,
    @Param('id_reserva', ParseIntPipe) id_reserva: number,
    @Param('id_pase_acceso', ParseIntPipe) id_pase_acceso: number,
    @Body() updateControlaDto: UpdateControlaDto,
  ) {
    return this.controlaService.update(
      id_persona_ope,
      id_reserva,
      id_pase_acceso,
      updateControlaDto,
    );
  }

  @Delete(':id_persona_ope/:id_reserva/:id_pase_acceso')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
  @ApiOperation({
    summary: 'Elimina una relacion controla por su clave compuesta',
  })
  @ApiParam({ name: 'id_persona_ope', type: Number })
  @ApiParam({ name: 'id_reserva', type: Number })
  @ApiParam({ name: 'id_pase_acceso', type: Number })
  remove(
    @Param('id_persona_ope', ParseIntPipe) id_persona_ope: number,
    @Param('id_reserva', ParseIntPipe) id_reserva: number,
    @Param('id_pase_acceso', ParseIntPipe) id_pase_acceso: number,
  ) {
    return this.controlaService.remove(
      id_persona_ope,
      id_reserva,
      id_pase_acceso,
    );
  }
}
