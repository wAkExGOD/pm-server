import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProjectsService } from '../projects.service';
import { PROJECT_ROLES_KEY } from '../decorators/project-roles.decorator';
import { ProjectRole } from '../project-role.enum';
import { RequestWithUser } from 'src/types';

@Injectable()
export class ProjectRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly projectsService: ProjectsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ProjectRole[]>(
      PROJECT_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const projectId = Number(request.params.projectId);

    if (!Number.isInteger(projectId)) {
      throw new NotFoundException('Project not found');
    }

    const membership = await this.projectsService.getMembership(
      projectId,
      request.user.id,
    );

    if (!membership) {
      throw new ForbiddenException('You are not a member of this project');
    }

    if (!requiredRoles.includes(membership.role as ProjectRole)) {
      throw new ForbiddenException(
        'You do not have permission to manage this project',
      );
    }

    return true;
  }
}
