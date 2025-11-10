import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateFavoritoDto {
  @IsInt()
  @IsNotEmpty()
  idCancha: number;
}