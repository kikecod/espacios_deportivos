// create-duenio.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsBoolean, IsDateString, IsString, ValidateNested } from 'class-validator';
import { CreatePersonaDto } from 'src/personas/dto/create-persona.dto';

export class CreateDuenioDto {
  @ApiProperty({ type: CreatePersonaDto })
  @ValidateNested()
  @Type(() => CreatePersonaDto)
  persona: CreatePersonaDto;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  verificado?: boolean = false;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  verificadoEn?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imagenCi?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imgfacial?: string;
}
