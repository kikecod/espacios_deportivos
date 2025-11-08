import { IsBoolean, IsOptional, IsArray, IsString } from 'class-validator';

export class UpdateFavoritoDto {
	@IsOptional()
	@IsBoolean()
	notificacionesActivas?: boolean;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	etiquetas?: string[];

	@IsOptional()
	@IsString()
	notas?: string;
}
