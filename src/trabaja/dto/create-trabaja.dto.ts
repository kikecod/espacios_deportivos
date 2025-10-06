import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsDateString } from 'class-validator';

export class CreateTrabajaDto {
	@ApiProperty({ example: 1 })
	@IsInt()
	@IsPositive()
	idUsuario: number;

	@ApiProperty({ example: 1 })
	@IsInt()
	@IsPositive()
	idSede: number;

	@ApiProperty({ example: '2025-01-01' })
	@IsDateString()
	fechaInicio: string;
}
