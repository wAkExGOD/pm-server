import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ReleaseStatus } from '../release.enums';

export class CreateReleaseDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(150)
  name: string;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value === null
        ? undefined
        : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  releaseDate: string;

  @IsOptional()
  @IsEnum(ReleaseStatus)
  status?: ReleaseStatus;
}
