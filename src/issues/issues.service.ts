import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProjectsService } from 'src/projects/projects.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { ListIssuesDto } from './dto/list-issues.dto';
import { ProjectRole } from 'src/projects/project-role.enum';
import type { PrismaClient } from '../../generated/prisma/client.js';

@Injectable()
export class IssuesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  private readonly issueSelect = {
    id: true,
    projectId: true,
    title: true,
    description: true,
    type: true,
    priority: true,
    status: true,
    assigneeId: true,
    reporterId: true,
    sprintId: true,
    createdAt: true,
    updatedAt: true,
    assignee: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    reporter: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    sprint: {
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    },
  } as const;

  private get issueDelegate(): PrismaClient['issue'] {
    return (this.prisma as PrismaClient).issue;
  }

  async createIssue(projectId: number, userId: number, dto: CreateIssueDto) {
    await this.projectsService.ensureProjectAccess(projectId, userId);
    await this.validateIssueRelations(projectId, dto.assigneeId, dto.sprintId);

    return await this.issueDelegate.create({
      data: {
        projectId,
        title: dto.title,
        description: dto.description || null,
        type: dto.type,
        priority: dto.priority,
        status: dto.status,
        assigneeId: dto.assigneeId,
        reporterId: userId,
        sprintId: dto.sprintId,
      },
      select: this.issueSelect,
    });
  }

  async listIssues(projectId: number, userId: number, dto: ListIssuesDto) {
    await this.projectsService.ensureProjectAccess(projectId, userId);

    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 10;
    const where: Parameters<PrismaClient['issue']['findMany']>[0]['where'] = {
      projectId,
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.priority ? { priority: dto.priority } : {}),
      ...(dto.type ? { type: dto.type } : {}),
      ...(dto.assigneeId ? { assigneeId: dto.assigneeId } : {}),
      ...(dto.reporterId ? { reporterId: dto.reporterId } : {}),
      ...(dto.sprintId === null ? { sprintId: null } : {}),
      ...(typeof dto.sprintId === 'number' ? { sprintId: dto.sprintId } : {}),
      ...(dto.search
        ? {
            OR: [
              {
                title: {
                  contains: dto.search,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: dto.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.issueDelegate.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        select: this.issueSelect,
      }),
      this.issueDelegate.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getIssueById(projectId: number, issueId: number, userId: number) {
    await this.projectsService.ensureProjectAccess(projectId, userId);

    const issue = await this.issueDelegate.findFirst({
      where: { id: issueId, projectId },
      select: this.issueSelect,
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    return issue;
  }

  async updateIssue(
    projectId: number,
    issueId: number,
    userId: number,
    dto: UpdateIssueDto,
  ) {
    const membership = await this.projectsService.ensureProjectAccess(
      projectId,
      userId,
    );
    const existingIssue = await this.issueDelegate.findFirst({
      where: { id: issueId, projectId },
      select: {
        id: true,
        reporterId: true,
      },
    });

    if (!existingIssue) {
      throw new NotFoundException('Issue not found');
    }

    this.ensureCanManageIssue(
      membership.role,
      existingIssue.reporterId,
      userId,
    );
    await this.validateIssueRelations(projectId, dto.assigneeId, dto.sprintId);

    return await this.issueDelegate.update({
      where: { id: issueId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description || null }
          : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.assigneeId !== undefined ? { assigneeId: dto.assigneeId } : {}),
        ...(dto.sprintId !== undefined ? { sprintId: dto.sprintId } : {}),
      },
      select: this.issueSelect,
    });
  }

  async deleteIssue(projectId: number, issueId: number, userId: number) {
    const membership = await this.projectsService.ensureProjectAccess(
      projectId,
      userId,
    );
    const existingIssue = await this.issueDelegate.findFirst({
      where: { id: issueId, projectId },
      select: {
        id: true,
        reporterId: true,
      },
    });

    if (!existingIssue) {
      throw new NotFoundException('Issue not found');
    }

    this.ensureCanManageIssue(
      membership.role,
      existingIssue.reporterId,
      userId,
    );

    await this.issueDelegate.delete({
      where: { id: issueId },
    });

    return { success: true };
  }

  private async validateIssueRelations(
    projectId: number,
    assigneeId?: number,
    sprintId?: number,
  ) {
    if (assigneeId !== undefined) {
      const membership = await this.projectsService.getMembership(
        projectId,
        assigneeId,
      );

      if (!membership) {
        throw new BadRequestException('Assignee must be a project member');
      }
    }

    if (sprintId !== undefined) {
      const sprint = await this.prisma.sprint.findFirst({
        where: {
          id: sprintId,
          projectId,
        },
        select: { id: true },
      });

      if (!sprint) {
        throw new BadRequestException('Sprint was not found in this project');
      }
    }
  }

  private ensureCanManageIssue(
    role: string,
    reporterId: number,
    currentUserId: number,
  ) {
    if (
      (role as ProjectRole) !== ProjectRole.OWNER &&
      (role as ProjectRole) !== ProjectRole.ADMIN &&
      reporterId !== currentUserId
    ) {
      throw new ForbiddenException(
        'You do not have permission to modify this issue',
      );
    }
  }
}
