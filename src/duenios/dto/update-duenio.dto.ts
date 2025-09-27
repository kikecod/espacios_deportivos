import { PartialType } from '@nestjs/swagger';
import { CreateDuenioDto } from './create-duenio.dto';
import { CreatePersonaDto } from 'src/personas/dto/create-persona.dto';

export class UpdateDuenioDto extends PartialType(CreateDuenioDto) {}
export class UpdatePersonaDto extends PartialType(CreatePersonaDto) {}