import { IsString } from "class-validator";


export class CreateClienteDto {

    @IsString()
    apodo?: string;

    @IsString()
    nivel?: number;
    
    @IsString()
    observaciones?: string;



}
