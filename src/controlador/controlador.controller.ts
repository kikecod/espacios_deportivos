import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ControladorService } from './controlador.service';
import { CreateControladorDto } from './dto/create-controlador.dto';
import { UpdateControladorDto } from './dto/update-controlador.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Controlador } from './entities/controlador.entity';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { TipoRol } from 'src/roles/entities/rol.entity';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@ApiTags('controlador')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('controlador')
export class ControladorController {
  constructor(
    private readonly controladorService: ControladorService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @Roles(TipoRol.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Crea un Controlador (ADMIN)' })
  @ApiResponse({ status: 201, description: 'Controlador creado exitosamente.' })
  @ApiBody({ type: CreateControladorDto })
  create(@Body() createControladorDto: CreateControladorDto) {
    return this.controladorService.create(createControladorDto);
  }

  // Postulación a Controlador para el usuario autenticado
  @Post('me')
  async createForMe(@CurrentUser() user: { sub: number }) {
    const u = await this.usuariosService.findOne(user.sub);
    return this.controladorService.create({ idPersonaOpe: u.idPersona } as any);
  }

  @Get('me')
  async getMe(@CurrentUser() user: { sub: number }) {
    const u = await this.usuariosService.findOne(user.sub);
    return this.controladorService.findOne(u.idPersona);
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: { sub: number }, @Body() dto: UpdateControladorDto) {
    const u = await this.usuariosService.findOne(user.sub);
    return this.controladorService.update(u.idPersona, dto);
  }

  @Roles(TipoRol.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Obtiene todos los controladores (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista de controladores.', type: [Controlador] })
  findAll() {
    return this.controladorService.findAll();
  }

  @Roles(TipoRol.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un controlador por su ID (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Controlador encontrado.', type: Controlador })
  @ApiResponse({ status: 404, description: 'Controlador no encontrado.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del Controlador' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.controladorService.findOne(id);
  }

  @Roles(TipoRol.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza un controlador (ADMIN)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del Controlador' })
  @ApiBody({ type: UpdateControladorDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateControladorDto: UpdateControladorDto) {
    return this.controladorService.update(id, updateControladorDto);
  }

  @Roles(TipoRol.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina un controlador (ADMIN)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del Controlador' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.controladorService.remove(id);
  }
}
