import { PartialType } from '@nestjs/swagger';
import { CreateParticipaDto } from './create-participa.dto';

export class UpdateParticipaDto extends PartialType(CreateParticipaDto) {}
