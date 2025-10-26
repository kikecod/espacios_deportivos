import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateDenunciaDto } from './create-denuncia.dto';

export class UpdateDenunciaDto extends PartialType(
  OmitType(CreateDenunciaDto, ['id_cliente', 'id_cancha', 'id_sede']),
) {}
