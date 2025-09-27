import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ValidateNested, IsOptional, IsString, MaxLength, IsInt, Min } from "class-validator";
import { CreatePersonaDto } from "src/personas/dto/create-persona.dto";

export class CreateClienteDto {
  @ApiProperty({ type: CreatePersonaDto })
  @ValidateNested()
  @Type(() => CreatePersonaDto)
  persona: CreatePersonaDto;

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
