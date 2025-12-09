import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsBoolean, IsDateString, IsEmail, IsString, MaxLength, IsIn } from "class-validator";
import type { TipoAsistente } from "../entities/participa.entity";

export class CreateParticipaDto {
  @ApiProperty()
  @IsInt()
  idReserva: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  idCliente?: number;

  @ApiPropertyOptional({ description: 'Correo para invitaci\u00f3n y b\u00fasqueda de usuario' })
  @IsOptional()
  @IsEmail()
  correo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombres?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  paterno?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  materno?: string;

  @ApiPropertyOptional({ enum: ['invitado_registrado', 'invitado_no_registrado', 'desconocido', 'titular'] })
  @IsOptional()
  @IsIn(['invitado_registrado', 'invitado_no_registrado', 'desconocido', 'titular'])
  tipoAsistente?: TipoAsistente;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  confirmado?: boolean = false;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  checkInEn?: string;
}
