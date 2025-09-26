import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsBoolean, IsDateString } from "class-validator";

export class CreateParticipaDto {
  @ApiProperty()
  @IsInt()
  idReserva: number;

  @ApiProperty()
  @IsInt()
  idCliente: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  confirmado?: boolean = false;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  checkInEn?: string;
}