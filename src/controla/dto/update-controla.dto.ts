import { PartialType } from '@nestjs/swagger';
import { CreateControlaDto } from './create-controla.dto';

export class UpdateControlaDto extends PartialType(CreateControlaDto) {}
