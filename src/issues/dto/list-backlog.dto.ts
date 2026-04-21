import { IsIn, IsOptional, IsString } from 'class-validator';

export class ListBacklogDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['priority', 'createdAt'])
  sortBy?: 'priority' | 'createdAt' = 'priority';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}
