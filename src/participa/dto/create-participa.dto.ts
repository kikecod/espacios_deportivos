import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateParticipaDto {
  @ApiProperty()
  @IsInt()
  id_reserva: number;

  @ApiProperty()
  @IsInt()
  id_cliente: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  confirmado?: boolean = false;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  check_in_en?: string;
}
