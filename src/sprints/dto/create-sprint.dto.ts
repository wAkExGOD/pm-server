import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSprintDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Sprint name is required' })
  @MaxLength(80, { message: 'Sprint name must be at most 80 characters' })
  name: string;

  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate: string;

  @IsDateString({}, { message: 'End date must be a valid date' })
  endDate: string;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value === null
        ? undefined
        : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'Goal must be at most 300 characters' })
  goal?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
