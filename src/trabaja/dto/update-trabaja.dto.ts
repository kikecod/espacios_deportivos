import { PartialType } from '@nestjs/swagger';
import { CreateTrabajaDto } from './create-trabaja.dto';

export class UpdateTrabajaDto extends PartialType(CreateTrabajaDto) {}
