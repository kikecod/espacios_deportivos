import { PartialType } from '@nestjs/swagger';
import { CreateLibelulaDto } from './create-libelula.dto';

export class UpdateLibelulaDto extends PartialType(CreateLibelulaDto) {}
