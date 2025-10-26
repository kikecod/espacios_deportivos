import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateControladorDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  id_persona_ope: number;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  id_sede: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  codigo_empleado: string;

  @ApiProperty()
  @IsBoolean()
  activo: boolean;

  @ApiProperty()
  @IsString()
  turno: string;
}
