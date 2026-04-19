import { Transform } from 'class-transformer';
import { IsEmail, IsEnum } from 'class-validator';
import { ProjectRole } from '../project-role.enum';

export class AddProjectMemberDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail(undefined, { message: 'Invalid email' })
  email: string;

  @IsEnum(ProjectRole, { message: 'Invalid project role' })
  role: ProjectRole;
}
