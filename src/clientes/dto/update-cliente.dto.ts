import { PartialType } from '@nestjs/swagger';
import { CreateClienteDto } from './create-cliente.dto';
import { CreatePersonaDto } from 'src/personas/dto/create-persona.dto';

export class UpdateClienteDto extends PartialType(CreateClienteDto) {}
export class UpdatePersonaDto extends PartialType(CreatePersonaDto) {}
