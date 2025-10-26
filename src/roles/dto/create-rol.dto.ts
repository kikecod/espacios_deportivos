import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { TipoRol } from '../rol.entity';

export class CreateRolDto {
  @ApiProperty({ enum: TipoRol })
  @IsEnum(TipoRol)
  rol: TipoRol;
}
