import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ValidateNested, IsOptional, IsString, MaxLength, IsInt, Min, IsNumber, IsPositive } from "class-validator";
import { CreatePersonaDto } from "src/personas/dto/create-persona.dto";

export class CreateClienteDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsPositive()
  id_cliente: number;

  @ApiProperty({ required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apodo?: string;

  @ApiProperty({ required: false, default: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  nivel?: number = 1;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
