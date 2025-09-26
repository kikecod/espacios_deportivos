import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { TipoRol } from '../rol.entity';

export class CreateRolDto {
  @ApiProperty()  
  @IsNumber()
  idUsuario: number;

  @ApiProperty({ enum: TipoRol })
  @IsEnum(TipoRol)
  rol: TipoRol;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}