import { PartialType } from '@nestjs/swagger';
import { CreateDuenioDto } from './create-duenio.dto';

export class UpdateDuenioDto extends PartialType(CreateDuenioDto) {}
