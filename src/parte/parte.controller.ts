import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParteService } from './parte.service';
import { CreateParteDto } from './dto/create-parte.dto';
import { UpdateParteDto } from './dto/update-parte.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';

@Auth([TipoRol.ADMIN, TipoRol.DUENIO])
@Controller('parte')
export class ParteController {
  constructor(private readonly parteService: ParteService) { }

  @Post()
  create(@Body() createParteDto: CreateParteDto) {
    return this.parteService.create(createParteDto);
  }

  @Get()
  findAll() {
    return this.parteService.findAll();
  }

  @Get(':idCancha/:idDisciplina')
  findOne(
    @Param('idCancha') idCancha: string,
    @Param('idDisciplina') idDisciplina: string,
  ) {
    return this.parteService.findOne(+idCancha, +idDisciplina);
  }

  @Patch(':idCancha/:idDisciplina')
  update(
    @Param('idCancha') idCancha: string,
    @Param('idDisciplina') idDisciplina: string,
    @Body() updateParteDto: UpdateParteDto,
  ) {
    return this.parteService.update(+idCancha, +idDisciplina, updateParteDto);
  }

  @Delete(':idCancha/:idDisciplina')
  remove(
    @Param('idCancha') idCancha: string,
    @Param('idDisciplina') idDisciplina: string,
  ) {
    return this.parteService.remove(+idCancha, +idDisciplina);
  }
}
