import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ConfirmPasswordResetDto {
  @ApiProperty()
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(20)
  @MaxLength(256)
  token: string;

  @ApiProperty()
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  nuevaContrasena: string;
}
