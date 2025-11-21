import { IsBoolean, IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class LineaDetalleDeudaDto {
    @IsString()
    concepto: string;

    @IsInt()
    cantidad: number;

    @IsNumber()
    costo_unitario: number;

    @IsOptional()
    @IsNumber()
    descuento_unitario?: number;

    @IsOptional()
    @IsString()
    actividad_economica?: string;
    
    @IsOptional()
    @IsString()
    descuento_detalle?: string;


    @IsOptional()
    @IsString()
    codigo_producto?: string;

    @IsOptional()
    @IsString()
    codigo_producto_sin?: string;

    @IsOptional()
    @IsString()
    numero_serie?: string;

    @IsOptional()
    @IsBoolean()
    ignora_factura?: boolean;

    @IsOptional()
    @IsString()
    factura_id_grupo?: string;

    @IsOptional()
    @IsString()
    unidad_medida?: string;

    @IsOptional()
    @IsString()
    numero_imei?: string;

}