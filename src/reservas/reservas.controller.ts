import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { ListQueryDto } from 'src/common/dto/list-query.dto';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { TipoRol } from 'src/roles/entities/rol.entity';
import { ReservaOwnerOrAdminGuard } from 'src/auth/guard/reserva-owner.guard';
import { ReservaWriteGuard } from 'src/auth/guard/reserva-write.guard';

@ApiTags('reservas')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  @Roles(TipoRol.CLIENTE, TipoRol.ADMIN)
  @UseGuards(ReservaWriteGuard)
  create(@Body() createReservaDto: CreateReservaDto) {
    return this.reservasService.create(createReservaDto);
  }

  @Get()
  findAll(@CurrentUser() user: { sub: number; roles: string[] }, @Query() query: ListQueryDto) {
    return this.reservasService.findAllScopedPaged(user, query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { sub: number; roles: string[] }) {
    return this.reservasService.findOneScoped(id, user);
  }

  @Roles(TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.ADMIN)
  @UseGuards(ReservaWriteGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateReservaDto: UpdateReservaDto) {
    return this.reservasService.update(id, updateReservaDto);
  }

  @Roles(TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.ADMIN)
  @UseGuards(ReservaWriteGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.remove(id);
  }
}
