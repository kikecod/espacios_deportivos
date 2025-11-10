import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsPositive, IsString, MinLength, IsOptional, IsNumber, IsLatitude, IsLongitude, Length } from "class-validator";


export class CreateSedeDto {

    @ApiProperty()
    @IsInt()
    @IsPositive()
    idPersonaD: number;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    nombre: string;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    descripcion: string;

    // ============================================
    // UBICACIÓN GEOGRÁFICA (Universal)
    // ============================================
    @ApiProperty({ example: 'Bolivia', description: 'País donde se ubica la sede', required: false })
    @IsString()
    @IsOptional()
    @Length(2, 100)
    country?: string;

    @ApiProperty({ example: 'BO', description: 'Código ISO del país', required: false })
    @IsString()
    @IsOptional()
    @Length(2, 10)
    countryCode?: string;

    @ApiProperty({ example: 'La Paz', description: 'Departamento/Estado/Provincia', required: false })
    @IsString()
    @IsOptional()
    @Length(2, 100)
    stateProvince?: string;

    @ApiProperty({ example: 'La Paz', description: 'Ciudad o municipio', required: false })
    @IsString()
    @IsOptional()
    @Length(2, 100)
    city?: string;

    @ApiProperty({ example: 'San Miguel', description: 'Distrito/Zona/Barrio', required: false })
    @IsString()
    @IsOptional()
    @Length(2, 100)
    district?: string;

    @ApiProperty({ example: 'Av. Saavedra #2540 esq. Calle 18', description: 'Dirección completa', required: false })
    @IsString()
    @IsOptional()
    @Length(5, 200)
    addressLine?: string;

    @ApiProperty({ example: '00000', description: 'Código postal', required: false })
    @IsString()
    @IsOptional()
    @Length(3, 20)
    postalCode?: string;

    @ApiProperty({ example: -16.5124789, description: 'Latitud geográfica', required: false })
    @IsNumber()
    @IsLatitude()
    @IsOptional()
    latitude?: number;

    @ApiProperty({ example: -68.0897456, description: 'Longitud geográfica', required: false })
    @IsNumber()
    @IsLongitude()
    @IsOptional()
    longitude?: number;

    @ApiProperty({ example: 'America/La_Paz', description: 'Zona horaria', required: false })
    @IsString()
    @IsOptional()
    timezone?: string;

    // Campos legacy - mantener por compatibilidad (DEPRECADOS)
    @ApiProperty({ required: false, deprecated: true, description: 'Usar addressLine en su lugar' })
    @IsString()
    @IsOptional()
    @MinLength(5)
    direccion?: string;

    @ApiProperty({ required: false, deprecated: true, description: 'Usar latitude en su lugar' })
    @IsString()
    @IsOptional()
    @MinLength(5)
    latitud?: string;

    @ApiProperty({ required: false, deprecated: true, description: 'Usar longitude en su lugar' })
    @IsString()
    @IsOptional()
    @MinLength(5)
    longitud?: string;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    telefono: string;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    email: string;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    politicas: string;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    estado: string;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    NIT: string;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    LicenciaFuncionamiento: string;
}
