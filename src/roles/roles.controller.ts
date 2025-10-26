import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from './rol.entity';

@Auth([TipoRol.ADMIN])
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRolDto: CreateRolDto) {
    return await this.rolesService.create(createRolDto);
  }

  @Auth([TipoRol.ADMIN])
  @Get()
  async findAll() {
    return await this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.rolesService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRolDto: UpdateRolDto,
  ) {
    return await this.rolesService.update(id, updateRolDto);
  }

  @Patch('restore/:id')
  restore(@Param('id') id: string) {
    return this.rolesService.restore(+id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number) {
    return this.rolesService.remove(+id);
  }
}
