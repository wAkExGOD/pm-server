import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProjectsService } from 'src/projects/projects.service';
import { normalizeDateTimeInput } from 'src/utils';
import { ListReleaseIssuesDto } from 'src/releases/dto/list-release-issues.dto';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';

@Injectable()
export class SprintsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async createSprint(projectId: number, userId: number, dto: CreateSprintDto) {
    await this.projectsService.ensureProjectAccess(projectId, userId);

    const sprintDates = this.validateSprintDates(dto.startDate, dto.endDate);

    if (dto.isActive) {
      await this.deactivateProjectSprints(projectId);
    }

    return await this.prisma.sprint.create({
      data: {
        projectId,
        name: dto.name,
        startDate: sprintDates.startDate,
        endDate: sprintDates.endDate,
        goal: dto.goal || null,
        isActive: dto.isActive ?? false,
      },
    });
  }

  async listProjectSprints(projectId: number, userId: number) {
    await this.projectsService.ensureProjectAccess(projectId, userId);

    return await this.prisma.sprint.findMany({
      where: { projectId },
      orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }],
    });
  }

  async getActiveSprint(projectId: number, userId: number) {
    await this.projectsService.ensureProjectAccess(projectId, userId);

    return await this.prisma.sprint.findFirst({
      where: { projectId, isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getSprintById(
    projectId: number,
    sprintId: number,
    userId: number,
    dto: ListReleaseIssuesDto,
  ) {
    await this.projectsService.ensureProjectAccess(projectId, userId);

    const sprint = await this.prisma.sprint.findFirst({
      where: {
        id: sprintId,
        projectId,
      },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    const issues = await this.prisma.issue.findMany({
      where: {
        projectId,
        sprintId,
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.assigneeId ? { assigneeId: dto.assigneeId } : {}),
        ...(dto.search
          ? {
              title: {
                contains: dto.search,
                mode: 'insensitive',
              },
            }
          : {}),
      },
      orderBy:
        dto.sortBy === 'status'
          ? [{ status: dto.order ?? 'asc' }, { updatedAt: 'desc' }]
          : [{ updatedAt: dto.order ?? 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        projectId: true,
        title: true,
        description: true,
        type: true,
        priority: true,
        status: true,
        storyPoints: true,
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
            avatarUrl: true,
          },
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
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
      },
    });

    return {
      ...sprint,
      issues,
    };
  }

  async updateSprint(
    projectId: number,
    sprintId: number,
    userId: number,
    dto: UpdateSprintDto,
  ) {
    await this.projectsService.ensureProjectAccess(projectId, userId);

    const existingSprint = await this.prisma.sprint.findFirst({
      where: { id: sprintId, projectId },
    });

    if (!existingSprint) {
      throw new NotFoundException('Sprint not found');
    }

    const sprintDates =
      dto.startDate || dto.endDate
        ? this.validateSprintDates(
            dto.startDate ?? existingSprint.startDate.toISOString(),
            dto.endDate ?? existingSprint.endDate.toISOString(),
          )
        : undefined;

    if (dto.isActive === true) {
      await this.deactivateProjectSprints(projectId, sprintId);
    }

    if (dto.isActive === false && !existingSprint.isActive) {
      throw new BadRequestException('Sprint is already inactive');
    }

    return await this.prisma.sprint.update({
      where: { id: sprintId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.goal !== undefined ? { goal: dto.goal || null } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(sprintDates?.startDate ? { startDate: sprintDates.startDate } : {}),
        ...(sprintDates?.endDate ? { endDate: sprintDates.endDate } : {}),
      },
    });
  }

  private validateSprintDates(startDate: string, endDate: string) {
    const parsedStartDate = normalizeDateTimeInput(startDate, 'Sprint start date');
    const parsedEndDate = normalizeDateTimeInput(endDate, 'Sprint end date');

    if (parsedEndDate < parsedStartDate) {
      throw new BadRequestException(
        'Sprint end date cannot be before start date',
      );
    }

    return {
      startDate: parsedStartDate,
      endDate: parsedEndDate,
    };
  }

  private async deactivateProjectSprints(
    projectId: number,
    excludeSprintId?: number,
  ) {
    await this.prisma.sprint.updateMany({
      where: {
        projectId,
        isActive: true,
        ...(excludeSprintId ? { NOT: { id: excludeSprintId } } : {}),
      },
      data: { isActive: false },
    });
  }
}
