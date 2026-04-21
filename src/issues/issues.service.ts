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
import { ListBacklogDto } from './dto/list-backlog.dto';
import { IssueStatus } from './issue.enums';

@Injectable()
export class IssuesService {
  private readonly boardStatuses: IssueStatus[] = [
    IssueStatus.TODO,
    IssueStatus.IN_PROGRESS,
    IssueStatus.CODE_REVIEW,
    IssueStatus.DONE,
  ];

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
    releaseId: true,
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
    release: {
      select: {
        id: true,
        name: true,
        status: true,
        releaseDate: true,
      },
    },
  } as const;

  private get issueDelegate(): PrismaClient['issue'] {
    return (this.prisma as PrismaClient).issue;
  }

  async createIssue(projectId: number, userId: number, dto: CreateIssueDto) {
    await this.projectsService.ensureProjectAccess(projectId, userId);
    await this.validateIssueRelations(
      projectId,
      dto.assigneeId,
      dto.sprintId,
      dto.releaseId,
    );

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
        releaseId: dto.releaseId,
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
      ...(dto.releaseId === null ? { releaseId: null } : {}),
      ...(typeof dto.releaseId === 'number' ? { releaseId: dto.releaseId } : {}),
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

  async listBacklog(projectId: number, userId: number, dto: ListBacklogDto) {
    await this.projectsService.ensureProjectAccess(projectId, userId);

    const activeSprint = await this.prisma.sprint.findFirst({
      where: {
        projectId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
      },
    });

    const where: Parameters<PrismaClient['issue']['findMany']>[0]['where'] = {
      projectId,
      AND: [
        {
          OR: [{ sprintId: null }, { sprint: { isActive: false } }],
        },
        ...(dto.search
          ? [
              {
                OR: [
                  {
                    title: {
                      contains: dto.search.trim(),
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    description: {
                      contains: dto.search.trim(),
                      mode: 'insensitive' as const,
                    },
                  },
                ],
              },
            ]
          : []),
      ],
    };

    const orderBy: Parameters<PrismaClient['issue']['findMany']>[0]['orderBy'] =
      dto.sortBy === 'createdAt'
        ? [{ createdAt: dto.order ?? 'desc' }, { id: 'desc' as const }]
        : [
            {
              priority: dto.order === 'asc' ? 'asc' : 'desc',
            },
            { createdAt: 'desc' as const },
          ];

    const items = await this.issueDelegate.findMany({
      where,
      orderBy,
      select: this.issueSelect,
    });

    return {
      activeSprint,
      items,
    };
  }

  async listBoard(projectId: number, userId: number) {
    await this.projectsService.ensureProjectAccess(projectId, userId);

    const items = await this.issueDelegate.findMany({
      where: { projectId },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      select: this.issueSelect,
    });

    return {
      columns: this.boardStatuses.map((status) => ({
        status,
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison */
        items: items.filter((issue) => issue.status === status),
      })),
    };
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
    await this.validateIssueRelations(
      projectId,
      dto.assigneeId,
      dto.sprintId,
      dto.releaseId,
    );

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
        ...(dto.releaseId !== undefined ? { releaseId: dto.releaseId } : {}),
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

  async moveIssueToSprint(
    projectId: number,
    issueId: number,
    userId: number,
    sprintId?: number,
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
    await this.validateIssueRelations(projectId, undefined, sprintId);

    return await this.issueDelegate.update({
      where: { id: issueId },
      data: {
        sprintId: sprintId ?? null,
      },
      select: this.issueSelect,
    });
  }

  private async validateIssueRelations(
    projectId: number,
    assigneeId?: number,
    sprintId?: number,
    releaseId?: number,
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

    if (releaseId !== undefined) {
      const release = await this.prisma.release.findFirst({
        where: {
          id: releaseId,
          projectId,
        },
        select: { id: true },
      });

      if (!release) {
        throw new BadRequestException('Release was not found in this project');
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
