import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail(undefined, { message: 'Invalid email' })
  email: string;
}
