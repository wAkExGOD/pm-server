import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { IssuePriority, IssueStatus, IssueType } from '../issue.enums';

export class ListIssuesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @IsOptional()
  @IsEnum(IssueStatus)
  status?: IssueStatus;

  @IsOptional()
  @IsEnum(IssuePriority)
  priority?: IssuePriority;

  @IsOptional()
  @IsEnum(IssueType)
  type?: IssueType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  assigneeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  reporterId?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'null') {
      return null;
    }
    return value === undefined ? undefined : Number(value);
  })
  sprintId?: number | null;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'null') {
      return null;
    }
    return value === undefined ? undefined : Number(value);
  })
  releaseId?: number | null;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  search?: string;
}
