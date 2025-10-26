import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateSedeDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  id_persona_d: number;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  nombre: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  descripcion: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  direccion: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  latitud: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  longitud: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  telefono: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  politicas: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  estado: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  NIT: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  licencia_funcionamiento: string;
}
