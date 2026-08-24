import { IsEmail, IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Введіть коректний email' })
  email!: string;

  @IsString()
  @MinLength(2, { message: "Ім'я повинно мати мінімум 2 символи" })
  @MaxLength(50, { message: "Ім'я не може перевищувати 50 символів" })
  firstName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Прізвище не може перевищувати 50 символів' })
  lastName?: string;

  @IsString()
  @MinLength(8, { message: 'Пароль повинен мати мінімум 8 символів' })
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Пароль повинен містити велику літеру та цифру',
  })
  password!: string;
}
