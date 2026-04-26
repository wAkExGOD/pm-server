import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateIssueCommentDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Comment text is required' })
  @MaxLength(4000, { message: 'Comment text must be at most 4000 characters' })
  content: string;
}
