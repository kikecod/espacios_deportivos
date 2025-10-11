import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, UseGuards, Query } from '@nestjs/common';
import { DenunciaService } from './denuncia.service';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { UpdateDenunciaDto } from './dto/update-denuncia.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { TipoRol } from 'src/roles/entities/rol.entity';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { ListQueryDto } from 'src/common/dto/list-query.dto';

@ApiTags('denuncia')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('denuncia')
export class DenunciaController {
  constructor(private readonly denunciaService: DenunciaService) {}

  @Roles(TipoRol.CLIENTE, TipoRol.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Crea una nueva denuncia' })
  @ApiResponse({ status: 201, description: 'Denuncia creada exitosamente.' })
  @ApiBody({ type: CreateDenunciaDto })
  create(@Body() createDenunciaDto: CreateDenunciaDto) {
    return this.denunciaService.create(createDenunciaDto);
  }

  @Roles(TipoRol.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Obtiene todas las denuncias' })
  findAll(@CurrentUser() user: { sub: number; roles: string[] }, @Query() query: ListQueryDto) {
    return this.denunciaService.findAllScopedPaged(user, query);
  }

  @Get(':idCliente/:idCancha/:idSede')
  @ApiOperation({ summary: 'Obtiene una denuncia por su clave compuesta' })
  @ApiParam({ name: 'idCliente', type: Number, description: 'ID del Cliente' })
  @ApiParam({ name: 'idCancha', type: Number, description: 'ID de la Cancha' })
  @ApiParam({ name: 'idSede', type: Number, description: 'ID de la Sede' })
  findOne(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Param('idCancha', ParseIntPipe) idCancha: number,
    @CurrentUser() user: { sub: number; roles: string[] },
  ) {
    return this.denunciaService.findOneScoped(idCliente, idCancha, user);
  }

  @Patch(':idCliente/:idCancha/:idSede')
  @ApiOperation({ summary: 'Actualiza una denuncia existente' })
  @ApiParam({ name: 'idCliente', type: Number })
  @ApiParam({ name: 'idCancha', type: Number })
  @ApiParam({ name: 'idSede', type: Number })
  @ApiBody({ type: UpdateDenunciaDto })
  update(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Param('idCancha', ParseIntPipe) idCancha: number,
    @Param('idSede', ParseIntPipe) idSede: number,
    @Body() updateDenunciaDto: UpdateDenunciaDto,
  ) {
    return this.denunciaService.update(
      idCliente,
      idCancha,
      updateDenunciaDto,
    );
  }

  @Delete(':idCliente/:idCancha/:idSede')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
  @ApiOperation({ summary: 'Elimina una denuncia por su clave compuesta' })
  @ApiParam({ name: 'idCliente', type: Number })
  @ApiParam({ name: 'idCancha', type: Number })
  remove(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Param('idCancha', ParseIntPipe) idCancha: number,
  ) {
    return this.denunciaService.remove(idCliente, idCancha);
  }
}
