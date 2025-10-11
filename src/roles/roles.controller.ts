import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { TipoRol } from './entities/rol.entity';

@ApiTags('roles')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Roles(TipoRol.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRolDto: CreateRolDto) {
    return await this.rolesService.create(createRolDto);
  }

  @Roles(TipoRol.ADMIN)
  @Get()
  async findAll() {
    return await this.rolesService.findAll();
  }

  @Roles(TipoRol.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Roles(TipoRol.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRolDto: UpdateRolDto,
  ) {
    return await this.rolesService.update(id, updateRolDto);
  }

  @Roles(TipoRol.ADMIN)
  @Patch('restore/:id')
  restore(@Param('id', ParseIntPipe) id: number){
    return this.rolesService.restore(id);
  }

  @Roles(TipoRol.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}

