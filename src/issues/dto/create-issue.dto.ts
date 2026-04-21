import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { IssuePriority, IssueStatus, IssueType } from '../issue.enums';

export class CreateIssueDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(150, { message: 'Title must be at most 150 characters' })
  title: string;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value === null
        ? undefined
        : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description must be at most 2000 characters' })
  description?: string;

  @IsEnum(IssueType, { message: 'Invalid issue type' })
  type: IssueType;

  @IsEnum(IssuePriority, { message: 'Invalid priority' })
  priority: IssuePriority;

  @IsOptional()
  @IsEnum(IssueStatus, { message: 'Invalid issue status' })
  status?: IssueStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  assigneeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sprintId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  releaseId?: number;
}
