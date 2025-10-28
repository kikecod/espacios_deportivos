import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';

@Controller('personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPersonaDto: CreatePersonaDto) {
    return this.personasService.create(createPersonaDto);
  }

  @Get()
  @Auth([TipoRol.ADMIN])
  findAll(@Query('nombre') nombre?: string, @Query('genero') genero?: string) {
    if (nombre) {
      return this.personasService.findByNombre(nombre);
    }
    if (genero) {
      return this.personasService.findByGenero(genero);
    }
    return this.personasService.findAll();
  }

  // Permite a cualquier usuario autenticado obtener SU propia persona
  // sin requerir rol ADMIN. Útil para armar el perfil desde el frontend
  // sin depender del endpoint /auth/profile.
  @Get('self')
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.CONTROLADOR])
  findSelf(@ActiveUser() user: { id_persona: number }) {
    return this.personasService.findOne(user.id_persona);
  }

  @Get('count')
  @Auth([TipoRol.ADMIN])
  count() {
    return this.personasService.count();
  }

  @Get('documento/:documento_numero')
  @Auth([TipoRol.ADMIN])
  findByDocumento(@Param('documento_numero') documento_numero: string) {
    return this.personasService.findByDocumento(documento_numero);
  }

  @Get(':id')
  @Auth([TipoRol.ADMIN])
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.findOne(id);
  }

  @Patch(':id')
  @Auth([TipoRol.ADMIN])
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePersonaDto: UpdatePersonaDto,
  ) {
    return this.personasService.update(id, updatePersonaDto);
  }

  @Delete(':id')
  @Auth([TipoRol.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.remove(id);
  }
}
