import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ParticipaService } from './participa.service';
import { CreateParticipaDto } from './dto/create-participa.dto';
import { UpdateParticipaDto } from './dto/update-participa.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { TipoRol } from 'src/roles/entities/rol.entity';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { ListQueryDto } from 'src/common/dto/list-query.dto';

@ApiTags('participa')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('participa')
export class ParticipaController {
  constructor(private readonly participaService: ParticipaService) {}

  @Roles(TipoRol.CLIENTE, TipoRol.ADMIN)
  @Post()
  create(@Body() dto: CreateParticipaDto) {
    return this.participaService.create(dto);
  }

  @Get()
  findAll(@CurrentUser() user: { sub: number; roles: string[] }, @Query() query: ListQueryDto) {
    return this.participaService.findAllScopedPaged(user, query);
  }

  @Get(':idReserva/:idCliente')
  findOne(
    @Param('idReserva', ParseIntPipe) idReserva: number,
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @CurrentUser() user: { sub: number; roles: string[] },
  ) {
    return this.participaService.findOneScoped(idReserva, idCliente, user);
  }

  @Roles(TipoRol.CLIENTE, TipoRol.ADMIN)
  @Patch(':idReserva/:idCliente')
  update(
    @Param('idReserva', ParseIntPipe) idReserva: number,
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Body() dto: UpdateParticipaDto,
  ) {
    return this.participaService.update(idReserva, idCliente, dto);
  }

  @Roles(TipoRol.CLIENTE, TipoRol.ADMIN)
  @Delete(':idReserva/:idCliente')
  remove(
    @Param('idReserva', ParseIntPipe) idReserva: number,
    @Param('idCliente', ParseIntPipe) idCliente: number,
  ) {
    return this.participaService.remove(idReserva, idCliente);
  }
}
