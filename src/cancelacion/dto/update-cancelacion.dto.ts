import { PartialType } from '@nestjs/swagger';
import { CreateCancelacionDto } from './create-cancelacion.dto';

export class UpdateCancelacionDto extends PartialType(CreateCancelacionDto) {}
