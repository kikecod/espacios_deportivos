import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateSedeDto } from './create-sede.dto';

export class UpdateSedeDto extends PartialType(CreateSedeDto) {
    @ApiProperty({ required: false, description: 'Estado de verificación de la sede' })
    @IsBoolean()
    @IsOptional()
    verificada?: boolean;
}
