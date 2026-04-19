import { MinLength, Length } from 'class-validator';

export class ChangePasswordDto {
  @Length(19, 19, { message: 'Invalid token' })
  token: string;

  @MinLength(6, { message: 'Password must be more than 6 characters' })
  password: string;
}
