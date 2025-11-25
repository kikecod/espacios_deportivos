import { Controller, Get, Post, Body, Param, Delete, UsePipes, ValidationPipe, ParseIntPipe, UseGuards, Put, Query } from '@nestjs/common';
import { FavoritoService } from './favorito.service';
import { CreateFavoritoDto } from './dto/create-favorito.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { TipoRol } from 'src/roles/rol.entity';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { UpdateFavoritoDto } from './dto/update-favorito.dto';
import { QueryFavoritosDto } from './dto/query-favoritos.dto';

interface ActiveUserPayload {
  idPersona: number;
  idUsuario: number;
  correo: string;
  usuario: string;
  roles: string[];
}

@Controller('favoritos')
export class FavoritoController {
  constructor(private readonly favoritoService: FavoritoService) { }

  // Agregar favorito del cliente autenticado
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.ADMIN, TipoRol.CONTROLADOR])
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(
    @ActiveUser() user: ActiveUserPayload,
    @Body() createFavoritoDto: CreateFavoritoDto,
  ) {
    // Mapear idCliente a partir del usuario autenticado
    return this.favoritoService.addForCliente(user.idPersona, createFavoritoDto.idSede);
  }

  // Obtener favoritos del cliente autenticado
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.ADMIN, TipoRol.CONTROLADOR])
  findMyFavorites(
    @ActiveUser() user: ActiveUserPayload,
    @Query() query: QueryFavoritosDto,
  ) {
    return this.favoritoService.findFilteredByCliente(user.idPersona, query);
  }

  // Eliminar un favorito por idSede para el cliente autenticado
  @Delete(':idSede')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.ADMIN, TipoRol.CONTROLADOR])
  remove(
    @ActiveUser() user: ActiveUserPayload,
    @Param('idSede', ParseIntPipe) idSede: number,
  ) {
    return this.favoritoService.remove(user.idPersona, idSede);
  }

  // Verificar si una sede es favorita del cliente autenticado
  @Get('verificar/:idSede')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.ADMIN, TipoRol.CONTROLADOR])
  checkIsFavorite(
    @ActiveUser() user: ActiveUserPayload,
    @Param('idSede', ParseIntPipe) idSede: number,
  ) {
    return this.favoritoService.check(user.idPersona, idSede);
  }

  // Actualizar metadata del favorito (etiquetas, notas, notificaciones)
  @Put(':idSede')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.ADMIN, TipoRol.CONTROLADOR])
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateMeta(
    @ActiveUser() user: ActiveUserPayload,
    @Param('idSede', ParseIntPipe) idSede: number,
    @Body() dto: UpdateFavoritoDto,
  ) {
    return this.favoritoService.updateMeta(user.idPersona, idSede, dto);
  }
}