import { IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @Length(10, 255)
  token: string;
}
