import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Введіть коректний email' })
  email!: string;

  @IsString()
  password!: string;
}
