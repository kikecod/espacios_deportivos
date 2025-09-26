import { PartialType } from '@nestjs/swagger';
import { CreateTransaccioneDto } from './create-transaccione.dto';

export class UpdateTransaccioneDto extends PartialType(CreateTransaccioneDto) {}
