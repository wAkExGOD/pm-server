import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class MoveIssueToSprintDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === 'null' || value === '') {
      return undefined;
    }

    return value;
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sprintId?: number;
}
