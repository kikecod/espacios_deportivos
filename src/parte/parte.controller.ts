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

  @Get(':id_cancha/:id_disciplina')
  findOne(
    @Param('id_cancha') id_cancha: string,
    @Param('id_disciplina') id_disciplina: string,
  ) {
    return this.parteService.findOne(+id_cancha, +id_disciplina);
  }

  @Patch(':id_cancha/:id_disciplina')
  update(
    @Param('id_cancha') id_cancha: string,
    @Param('id_disciplina') id_disciplina: string,
    @Body() updateParteDto: UpdateParteDto,
  ) {
    return this.parteService.update(+id_cancha, +id_disciplina, updateParteDto);
  }

  @Delete(':id_cancha/:id_disciplina')
  remove(
    @Param('id_cancha') id_cancha: string,
    @Param('id_disciplina') id_disciplina: string,
  ) {
    return this.parteService.remove(+id_cancha, +id_disciplina);
  }
}
