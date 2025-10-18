import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsDateString } from 'class-validator';

export class CreateTrabajaDto {
	@ApiProperty({ example: 1, description: 'ID de persona del Controlador (id_persona_ope)' })
	@IsInt()
	@IsPositive()
	id_persona_ope: number;

	@ApiProperty({ example: 1 })
	@IsInt()
	@IsPositive()
	id_sede: number;

	@ApiProperty({ example: '2025-01-01' })
	@IsDateString()
	fecha_inicio: string;
}
