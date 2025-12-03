import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CreateTrabajaDto {
  @ApiProperty({ description: 'Identificador del controlador (idPersonaOpe)' })
  @IsInt()
  @IsPositive()
  idPersonaOpe: number;

  @ApiProperty({ description: 'Identificador de la sede' })
  @IsInt()
  @IsPositive()
  idSede: number;
}
