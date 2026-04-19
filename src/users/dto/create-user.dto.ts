import { IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail(undefined, { message: 'Invalid email' })
  email: string;

  @MinLength(6, { message: 'Password must be more than 6 characters' })
  password: string;
}
