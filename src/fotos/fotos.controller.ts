import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FotosService } from './fotos.service';
import { CreateFotoDto } from './dto/create-foto.dto';
import { UpdateFotoDto } from './dto/update-foto.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { TipoRol } from 'src/roles/entities/rol.entity';
import { CanchaOwnerGuard } from 'src/auth/guard/cancha-owner.guard';

@ApiTags('fotos')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fotos')
export class FotosController {
  constructor(private readonly fotosService: FotosService) { }

  @Roles(TipoRol.DUENIO, TipoRol.ADMIN)
  @UseGuards(CanchaOwnerGuard)
  @Post('upload/:id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() image: Express.Multer.File) {
    const url = `/uploads/${image.filename}`;
    const createFotoDto: CreateFotoDto = {
      urlFoto: url,
      idCancha: id,
    };
    return this.fotosService.create(createFotoDto);
  }


  @Get()
  findAll() {
    return this.fotosService.findAll();
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fotosService.findOne(+id);
  }

  @Get('cancha/:idCancha')
  findByCancha(@Param('idCancha') idCancha: string) {
    return this.fotosService.findByCancha(+idCancha);
  }

  @Roles(TipoRol.DUENIO, TipoRol.ADMIN)
  @UseGuards(CanchaOwnerGuard)
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() image: Express.Multer.File
  ) {
    const url = `/uploads/${image.filename}`;
    const updateFotoDto: UpdateFotoDto = {
      urlFoto: url,
    };
    return this.fotosService.update(id, updateFotoDto);
  }

  /*
  @Patch('restore/:id')
  restore(@Param('id') id: string) {
    return this.fotosService.restore(+id);
  }
  */

  @Roles(TipoRol.DUENIO, TipoRol.ADMIN)
  @UseGuards(CanchaOwnerGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fotosService.remove(id);
  }
}
