import { PartialType } from '@nestjs/swagger';
import { CreateFotoDto } from './create-foto.dto';

export class UpdateFotoDto extends PartialType(CreateFotoDto) {}
