import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FotosService } from './fotos.service';
import { CreateFotoDto } from './dto/create-foto.dto';
import { UpdateFotoDto } from './dto/update-foto.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';
import { S3Service } from 'src/s3/s3.service';

@Auth([TipoRol.ADMIN, TipoRol.DUENIO])
@Controller('fotos')
export class FotosController {
  constructor(
    private readonly fotosService: FotosService,
    private readonly s3Service: S3Service,
  ) { }


  @Post('upload/cancha/:id')
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
  async uploadCanchaPhoto(
    @Param('id') id: number,
    @UploadedFile() image: Express.Multer.File
  ){
    const url = await this.s3Service.uploadFile(image, 'canchas', id);
    
    const createFotoDto: CreateFotoDto = {
      tipo : 'cancha',
      idCancha : id,
      urlFoto : url,
    };
    return this.fotosService.create(createFotoDto);
  }
  @Post('upload/sede/:id')
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
  async uploadSedePhoto(
    @Param('id') id: number,
    @UploadedFile() image: Express.Multer.File
  ) {
    // 1. Subir archivo a S3
    const url = await this.s3Service.uploadFile(image, 'sedes', id);

    // 2. Guardar URL en base de datos
    const createFotoDto: CreateFotoDto = {
      tipo: 'sede',
      idSede: id,
      urlFoto: url,
    };

    return this.fotosService.create(createFotoDto);
  }

  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(
    @Param('id') id: number,
    @UploadedFile() image: Express.Multer.File) {
    const url = `/uploads/${image.filename}`;
    const createFotoDto: CreateFotoDto = {
      tipo: 'cancha', // Foto de cancha por defecto en este endpoint
      idCancha: id,
      urlFoto: url,
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
    // TODO: Actualizar para usar S3
    const url = `/uploads/${image.filename}`;
    const updateFotoDto: UpdateFotoDto = {
      urlFoto: url,
    };
    return this.fotosService.update(+id, updateFotoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fotosService.remove(+id);
  }
}
