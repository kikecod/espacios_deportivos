import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  // Devuelve el registro de cliente del usuario autenticado (si existe)
  @Get('self')
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.CONTROLADOR])
  findSelf(@ActiveUser() user: { id_persona: number }) {
    return this.clientesService.findOne(user.id_persona);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, updateClienteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.remove(id);
  }
}
