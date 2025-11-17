import { IsString, IsOptional } from 'class-validator';

export class BajaUsuarioDto {
  @IsOptional()
  @IsString()
  motivo?: string;
}
