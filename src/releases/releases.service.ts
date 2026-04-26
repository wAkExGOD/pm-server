import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProjectsService } from 'src/projects/projects.service';
import { ProjectRole } from 'src/projects/project-role.enum';
import { normalizeDateTimeInput } from 'src/utils';
import type { PrismaClient } from '../../generated/prisma/client.js';
import { CreateReleaseDto } from './dto/create-release.dto';
import { ListReleasesDto } from './dto/list-releases.dto';
import { ListReleaseIssuesDto } from './dto/list-release-issues.dto';

@Injectable()
export class ReleasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  private readonly releaseSelect = {
    id: true,
    projectId: true,
    initiatorId: true,
    name: true,
    description: true,
    startDate: true,
    releaseDate: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    initiator: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    _count: {
      select: {
        issues: true,
      },
    },
  } as const;

  private readonly releaseIssueSelect = {
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
  } as const;

  private get releaseDelegate(): PrismaClient['release'] {
    return (this.prisma as PrismaClient).release;
  }

  async createRelease(
    projectId: number,
    userId: number,
    dto: CreateReleaseDto,
  ) {
    const membership = await this.projectsService.ensureProjectAccess(
      projectId,
      userId,
    );

    if (
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison */
      membership.role !== ProjectRole.OWNER &&
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison */
      membership.role !== ProjectRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Only project owners and admins can create releases',
      );
    }

    const startDate = normalizeDateTimeInput(dto.startDate, 'Start date');
    const releaseDate = normalizeDateTimeInput(dto.releaseDate, 'Release date');

    if (releaseDate < startDate) {
      throw new BadRequestException(
        'Release date cannot be earlier than start date',
      );
    }

    const release = await this.releaseDelegate.create({
      data: {
        projectId,
        initiatorId: userId,
        name: dto.name,
        description: dto.description || null,
        startDate,
        releaseDate,
        status: dto.status,
      },
      select: this.releaseSelect,
    });

    return this.mapRelease(release);
  }

  async listReleases(projectId: number, userId: number, dto: ListReleasesDto) {
    await this.projectsService.ensureProjectAccess(projectId, userId);

    const items = await this.releaseDelegate.findMany({
      where: {
        projectId,
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.search
          ? {
              name: {
                contains: dto.search,
                mode: 'insensitive',
              },
            }
          : {}),
      },
      orderBy: [{ releaseDate: 'asc' }, { id: 'desc' }],
      select: this.releaseSelect,
    });

    return items.map((release) => this.mapRelease(release));
  }

  async getReleaseById(
    projectId: number,
    releaseId: number,
    userId: number,
    dto: ListReleaseIssuesDto,
  ) {
    await this.projectsService.ensureProjectAccess(projectId, userId);

    const release = await this.releaseDelegate.findFirst({
      where: {
        id: releaseId,
        projectId,
      },
      select: this.releaseSelect,
    });

    if (!release) {
      throw new NotFoundException('Release not found');
    }

    const issues = await this.prisma.issue.findMany({
      where: {
        projectId,
        releaseId,
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
      select: this.releaseIssueSelect,
    });

    return {
      ...this.mapRelease(release),
      issues,
    };
  }

  private mapRelease<
    T extends {
      description: string | null;
      _count: { issues: number };
    },
  >(release: T) {
    return {
      ...release,
      description: release.description ?? '',
      issueCount: release._count.issues,
    };
  }
}
