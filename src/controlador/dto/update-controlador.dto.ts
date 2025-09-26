import { PartialType } from '@nestjs/swagger';
import { CreateControladorDto } from './create-controlador.dto';

export class UpdateControladorDto extends PartialType(CreateControladorDto) {}
