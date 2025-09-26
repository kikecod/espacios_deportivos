import { PartialType } from '@nestjs/swagger';
import { CreateCalificaCanchaDto } from './create-califica_cancha.dto';

export class UpdateCalificaCanchaDto extends PartialType(CreateCalificaCanchaDto) {}
