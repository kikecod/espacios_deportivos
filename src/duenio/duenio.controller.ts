import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DuenioService } from './duenio.service';
import { CreateDuenioDto } from './dto/create-duenio.dto';
import { UpdateDuenioDto } from './dto/update-duenio.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';

@Controller('duenio')
export class DuenioController {
  constructor(private readonly duenioService: DuenioService) {}

  @Post()
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE])
  create(@Body() createDuenioDto: CreateDuenioDto) {
    return this.duenioService.create(createDuenioDto);
  }

  @Get()
  @Auth([TipoRol.ADMIN])
  findAll() {
    return this.duenioService.findAll();
  }

  // Permite a un usuario autenticado obtener su propio registro de dueño (si existe)
  // No requiere rol DUENIO; si no existe el registro, el servicio responderá 404.
  @Get('self')
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.CONTROLADOR])
  findSelf(@ActiveUser() user: { id_persona: number }) {
    return this.duenioService.findOne(user.id_persona);
  }

  @Get(':id')
  @Auth([TipoRol.ADMIN])
  findOne(@Param('id') id: string) {
    return this.duenioService.findOne(+id);
  }

  @Patch(':id')
  @Auth([TipoRol.ADMIN])
  update(@Param('id') id: string, @Body() updateDuenioDto: UpdateDuenioDto) {
    return this.duenioService.update(+id, updateDuenioDto);
  }

  @Patch('restore/:id')
  @Auth([TipoRol.ADMIN])
  restore(@Param('id') id: string) {
    return this.duenioService.restore(+id);
  }

  @Delete(':id')
  @Auth([TipoRol.ADMIN])
  remove(@Param('id') id: string) {
    return this.duenioService.remove(+id);
  }
}
