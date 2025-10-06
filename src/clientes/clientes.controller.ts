// src/clientes/clientes.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe,
  ParseIntPipe, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { SelfOrAdminGuard } from 'src/auth/guard/self-or-admin.guard';
import { TipoRol } from 'src/roles/entities/rol.entity';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';

@ApiTags('clientes')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  // ======= ADMIN =======
  @Roles(TipoRol.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateClienteDto) {
    return this.clientesService.create(dto);
  }

  @Roles(TipoRol.ADMIN)
  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  // ======= CLIENTE (dueño) o ADMIN =======

  @Get('me')
  me(@CurrentUser() user: { sub: number; roles?: string[] }) {
    console.log('user.roles:', user?.roles);

    return this.clientesService.findByUsuarioId(user.sub); // crea este método si no existe
  }

  @Roles(TipoRol.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  @Roles(TipoRol.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, dto);
  }

  @Roles(TipoRol.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.remove(id);
  }


  @UseGuards(SelfOrAdminGuard) // permite admin o dueño del :id
  @Patch('me/:id')
  updateMe(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClienteDto) {
    return this.clientesService.update(id, dto);
  }
}
