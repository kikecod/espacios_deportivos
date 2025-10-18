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

@Controller('personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPersonaDto: CreatePersonaDto) {
    return this.personasService.create(createPersonaDto);
  }

  @Get()
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
  count() {
    return this.personasService.count();
  }

  @Get('documento/:documento_numero')
  findByDocumento(@Param('documento_numero') documento_numero: string) {
    return this.personasService.findByDocumento(documento_numero);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePersonaDto: UpdatePersonaDto,
  ) {
    return this.personasService.update(id, updatePersonaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.remove(id);
  }
}