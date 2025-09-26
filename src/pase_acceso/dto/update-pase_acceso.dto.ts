import { PartialType } from '@nestjs/swagger';
import { CreatePaseAccesoDto } from './create-pase_acceso.dto';

export class UpdatePaseAccesoDto extends PartialType(CreatePaseAccesoDto) {}
