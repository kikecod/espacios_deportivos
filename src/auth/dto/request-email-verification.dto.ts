import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class RequestEmailVerificationDto {
  @ApiProperty()
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsEmail()
  correo: string;
}
