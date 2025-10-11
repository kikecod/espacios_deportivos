import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { DueniosService } from './duenios.service';
import { CreateDuenioDto } from './dto/create-duenio.dto';
import { UpdateDuenioDto } from './dto/update-duenio.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { TipoRol } from 'src/roles/entities/rol.entity';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@ApiTags('duenios')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('duenios')
export class DueniosController {
  constructor(
    private readonly dueniosService: DueniosService,
    private readonly usuariosService: UsuariosService,
  ) {}

  // Admin puede crear para otras personas (backoffice)
  @Roles(TipoRol.ADMIN)
  @Post()
  create(@Body() createDuenioDto: CreateDuenioDto) {
    return this.dueniosService.create(createDuenioDto);
  }

  // Usuario autenticado postula a Duenio para su propia Persona
  @Post('me')
  async createForMe(@CurrentUser() user: { sub: number }) {
    const u = await this.usuariosService.findOne(user.sub);
    return this.dueniosService.create({ idPersona: u.idPersona } as any);
  }

  // Perfil Duenio actual
  @Get('me')
  async getMe(@CurrentUser() user: { sub: number }) {
    const u = await this.usuariosService.findOne(user.sub);
    return this.dueniosService.findOne(u.idPersona);
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: { sub: number }, @Body() dto: UpdateDuenioDto) {
    const u = await this.usuariosService.findOne(user.sub);
    return this.dueniosService.update(u.idPersona, dto);
  }

  @Roles(TipoRol.ADMIN)
  @Get()
  findAll() {
    return this.dueniosService.findAll();
  }

  @Roles(TipoRol.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dueniosService.findOne(id);
  }

  @Roles(TipoRol.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDuenioDto: UpdateDuenioDto) {
    return this.dueniosService.update(id, updateDuenioDto);
  }

  @Roles(TipoRol.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dueniosService.remove(id);
  }
}
