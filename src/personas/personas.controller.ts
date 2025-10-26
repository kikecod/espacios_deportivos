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