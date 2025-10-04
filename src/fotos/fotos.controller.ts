import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FotosService } from './fotos.service';
import { CreateFotoDto } from './dto/create-foto.dto';
import { UpdateFotoDto } from './dto/update-foto.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('fotos')
export class FotosController {
  constructor(private readonly fotosService: FotosService) { }

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
    @Param('id') id: number,
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
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File
  ) {
    const url = `/uploads/${image.filename}`;
    const updateFotoDto: UpdateFotoDto = {
      urlFoto: url,
    };
    return this.fotosService.update(+id, updateFotoDto);
  }

  /*
  @Patch('restore/:id')
  restore(@Param('id') id: string) {
    return this.fotosService.restore(+id);
  }
  */

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fotosService.remove(+id);
  }
}
