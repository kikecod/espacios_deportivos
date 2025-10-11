import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { TransaccionesService } from './transacciones.service';
import { CreateTransaccioneDto } from './dto/create-transaccione.dto';
import { UpdateTransaccioneDto } from './dto/update-transaccione.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { ListQueryDto } from 'src/common/dto/list-query.dto';

@ApiTags('transacciones')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transacciones')
export class TransaccionesController {
  constructor(private readonly transaccionesService: TransaccionesService) {}

  @Post()
  create(@Body() createTransaccioneDto: CreateTransaccioneDto) {
    return this.transaccionesService.create(createTransaccioneDto);
  }

  @Get()
  findAll(@CurrentUser() user: { sub: number; roles: string[] }, @Query() query: ListQueryDto) {
    return this.transaccionesService.findAllScopedPaged(user, query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { sub: number; roles: string[] }) {
    return this.transaccionesService.findOneScoped(id, user);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTransaccioneDto: UpdateTransaccioneDto) {
    return this.transaccionesService.update(id, updateTransaccioneDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.transaccionesService.remove(id);
  }
}
