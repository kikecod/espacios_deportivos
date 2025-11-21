import { IsArray, IsBoolean, IsEmail, IsNumber, IsOptional, IsString, isValidationOptions, ValidateNested } from "class-validator";
import { LineaDetalleDeudaDto } from "./linea-detalle-deuda.dto";
import { Type } from "class-transformer";
import { LineaMetadatoDto } from "./linea-metadato-dto";

export class RegistrarDeudaDto {

    @IsOptional()
    @IsNumber()
    idReserva?: number;

    @IsEmail()
    email_cliente: string;

    @IsString()
    identificador_deuda: string;
    
    @IsOptional()
    @IsString()
    fecha_vencimiento?: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    
    @IsOptional()
    @IsString()
    numero_documento?: string;

    @IsOptional()
    @IsString()
    complemento_documento?: string;

    @IsOptional()
    @IsString()
    codigo_tipo_documento?: string;

    @IsOptional()
    @IsBoolean()
    emite_factura?: boolean;

    @IsOptional()
    @IsString()
    tipo_factura?: string;

    @IsOptional()
    @IsString()
    nombre_cliente?: string;

    @IsOptional()
    @IsString()
    apellido_cliente?: string;

    @IsOptional()
    @IsString()
    codigo_cliente?: string;

    @IsOptional()
    @IsString()
    razon_social?: string;

    @IsOptional()
    @IsString()
    moneda?: string; // "BOB" o "USD"

    @IsOptional()
    @IsNumber()
    moneda_tipo_cambio?: number;

    @IsOptional()
    @IsNumber()
    valor_envio?: number;

    @IsOptional()
    @IsString()
    descripcion_envio?: string;

    @IsOptional()
    @IsNumber()
    descuento_global?: number;

    @IsOptional()
    @IsString()
    codigo_punto_venta?: string;

    @IsOptional()
    @IsString()
    codigo_documento_sector?: string;


    @IsArray()
    @ValidateNested({ each: true})
    @Type (() => LineaDetalleDeudaDto)
    lineas_detalle_deuda: LineaDetalleDeudaDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true})
    @Type (() => LineaMetadatoDto)
    lineas_metadatos?: LineaMetadatoDto[];

}   