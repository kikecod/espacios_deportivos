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
import { ControladorService } from './controlador.service';
import { CreateControladorDto } from './dto/create-controlador.dto';
import { UpdateControladorDto } from './dto/update-controlador.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Controlador } from './entities/controlador.entity';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';

@ApiTags('controlador')
@Controller('controlador')
export class ControladorController {
  constructor(private readonly controladorService: ControladorService) {}

  @Post()
  @ApiOperation({ summary: 'Crea una nueva Controlador' }) // ✨ Descripción de la operación
  @ApiResponse({ status: 201, description: 'Controlador creado exitosamente.' }) // ✨ Respuesta de éxito (incluyendo el tipo de respuesta)
  @ApiBody({ type: CreateControladorDto }) // ✨ Describe el cuerpo de la solicitud
  create(@Body() createControladorDto: CreateControladorDto) {
    return this.controladorService.create(createControladorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene todos los controladores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de controladores.',
    type: [Controlador],
  }) // ✨ Respuesta de lista
  findAll() {
    return this.controladorService.findAll();
  }

  // Devuelve el registro de controlador del usuario autenticado (si existe)
  @Get('self')
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.CONTROLADOR])
  findSelf(@ActiveUser() user: { id_persona: number }) {
    return this.controladorService.findOne(user.id_persona);
  }

  // Usamos ParseIntPipe para asegurar que el ID es un número
  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un controlador por su ID' })
  @ApiResponse({
    status: 200,
    description: 'Controlador encontrado.',
    type: Controlador,
  })
  @ApiResponse({ status: 404, description: 'Controlador no encontrado.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del Controlador' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.controladorService.findOne(id);
  }

  // Usamos ParseIntPipe para asegurar que el ID es un número
  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza un controlador existente' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del Controlador' })
  @ApiBody({ type: UpdateControladorDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateControladorDto: UpdateControladorDto,
  ) {
    // El servicio maneja la lógica de actualizar
    return this.controladorService.update(id, updateControladorDto);
  }

  // Usamos ParseIntPipe para asegurar que el ID es un número
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
  @ApiOperation({ summary: 'Elimina un controlador por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del Controlador' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.controladorService.remove(id);
  }
}
