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
  UseGuards,
} from '@nestjs/common';
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { TipoRol } from 'src/roles/entities/rol.entity';
import { PersonaSelfOrAdminGuard } from 'src/auth/guard/persona-self-or-admin.guard';

@ApiTags('personas')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Roles(TipoRol.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPersonaDto: CreatePersonaDto) {
    return this.personasService.create(createPersonaDto);
  }

  @Roles(TipoRol.ADMIN)
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

  @Roles(TipoRol.ADMIN)
  @Get('count')
  count() {
    return this.personasService.count();
  }

  @Roles(TipoRol.ADMIN)
  @Get('documento/:documentoNumero')
  findByDocumento(@Param('documentoNumero') documentoNumero: string) {
    return this.personasService.findByDocumento(documentoNumero);
  }

  @UseGuards(PersonaSelfOrAdminGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.findOne(id);
  }

  @UseGuards(PersonaSelfOrAdminGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePersonaDto: UpdatePersonaDto,
  ) {
    return this.personasService.update(id, updatePersonaDto);
  }

  @UseGuards(PersonaSelfOrAdminGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.remove(id);
  }
}
