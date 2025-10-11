import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { CancelacionService } from './cancelacion.service';
import { CreateCancelacionDto } from './dto/create-cancelacion.dto';
import { UpdateCancelacionDto } from './dto/update-cancelacion.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { TipoRol } from 'src/roles/entities/rol.entity';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { ListQueryDto } from 'src/common/dto/list-query.dto';

@ApiTags('cancelaciones')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cancelaciones')
export class CancelacionController {
  constructor(private readonly cancelacionService: CancelacionService) {}

  @Roles(TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.ADMIN)
  @Post()
  create(@Body() dto: CreateCancelacionDto) {
    return this.cancelacionService.create(dto);
  }

  @Get()
  findAll(@CurrentUser() user: { sub: number; roles: string[] }, @Query() _query: ListQueryDto) {
    return this.cancelacionService.findAllScoped(user); // se puede paginar similar a reservas
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { sub: number; roles: string[] }) {
    return this.cancelacionService.findOneScoped(id, user);
  }

  @Roles(TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCancelacionDto) {
    return this.cancelacionService.update(id, dto);
  }

  @Roles(TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cancelacionService.remove(id);
  }
}
