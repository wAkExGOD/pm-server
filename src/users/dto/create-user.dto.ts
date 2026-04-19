import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value?.trim() : value))
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(50, { message: 'Name must be at most 50 characters' })
  name: string;

  @IsEmail(undefined, { message: 'Invalid email' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value?.trim()?.toLowerCase() : value,
  )
  email: string;

  @MinLength(6, { message: 'Password must be more than 6 characters' })
  password: string;
}
