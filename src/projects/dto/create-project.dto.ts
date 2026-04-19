import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateProjectDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Project name is required' })
  @MaxLength(80, { message: 'Project name must be at most 80 characters' })
  name: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Length(2, 10, { message: 'Project key must be between 2 and 10 characters' })
  @Matches(/^[A-Z][A-Z0-9]*$/, {
    message: 'Project key must start with a letter and contain only A-Z or 0-9',
  })
  key: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value === null ? undefined : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description must be at most 500 characters' })
  description?: string;
}
