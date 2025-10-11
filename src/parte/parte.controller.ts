import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ParteService } from './parte.service';
import { CreateParteDto } from './dto/create-parte.dto';
import { UpdateParteDto } from './dto/update-parte.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { TipoRol } from 'src/roles/entities/rol.entity';
import { CanchaOwnerGuard } from 'src/auth/guard/cancha-owner.guard';

@ApiTags('parte')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('parte')
export class ParteController {
  constructor(private readonly parteService: ParteService) { }

  @Roles(TipoRol.DUENIO, TipoRol.ADMIN)
  @UseGuards(CanchaOwnerGuard)
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

  @Roles(TipoRol.DUENIO, TipoRol.ADMIN)
  @UseGuards(CanchaOwnerGuard)
  @Patch(':idCancha/:idDisciplina')
  update(
    @Param('idCancha') idCancha: string,
    @Param('idDisciplina') idDisciplina: string,
    @Body() updateParteDto: UpdateParteDto,
  ) {
    return this.parteService.update(+idCancha, +idDisciplina, updateParteDto);
  }

  @Roles(TipoRol.DUENIO, TipoRol.ADMIN)
  @UseGuards(CanchaOwnerGuard)
  @Delete(':idCancha/:idDisciplina')
  remove(
    @Param('idCancha') idCancha: string,
    @Param('idDisciplina') idDisciplina: string,
  ) {
    return this.parteService.remove(+idCancha, +idDisciplina);
  }
}
