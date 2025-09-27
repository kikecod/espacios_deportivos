import { PartialType } from '@nestjs/swagger';
import { CreatePasesAccesoDto } from './create-pases_acceso.dto';

export class UpdatePasesAccesoDto extends PartialType(CreatePasesAccesoDto) {}
