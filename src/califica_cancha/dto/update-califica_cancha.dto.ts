import { PartialType } from '@nestjs/swagger';
import { OmitType } from '@nestjs/swagger';
import { CreateCalificaCanchaDto } from './create-califica_cancha.dto';

export class UpdateCalificaCanchaDto extends PartialType(
    OmitType(CreateCalificaCanchaDto, ['idCliente', 'idCancha', 'idSede']),
) {}