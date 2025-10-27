import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateControlaDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  @IsNotEmpty()
  id_controlador: number;

  @ApiProperty({ example: 12 })
  @IsInt()
  @IsNotEmpty()
  id_pase_acceso: number;
}
