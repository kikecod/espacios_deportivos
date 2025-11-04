import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { UpdatePersonaDto } from 'src/personas/dto/update-persona.dto';
import { UpdateClienteDto } from 'src/clientes/dto/update-cliente.dto';
import { UpdateControladorDto } from 'src/controlador/dto/update-controlador.dto';

export class UpdatePersonalInfoDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePersonaDto)
  persona?: UpdatePersonaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateClienteDto)
  cliente?: UpdateClienteDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateControladorDto)
  controlador?: UpdateControladorDto;
}
