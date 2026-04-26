import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { UsersService } from 'src/users/users.service';
import { ProjectRole } from './project-role.enum';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  private projectSelect = {
    id: true,
    key: true,
    name: true,
    description: true,
    ownerId: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  async createProject(ownerId: number, dto: CreateProjectDto) {
    const existingProject = await this.prisma.project.findUnique({
      where: { key: dto.key },
      select: { id: true },
    });

    if (existingProject) {
      throw new BadRequestException('Project key already exists');
    }

    const project = await this.prisma.project.create({
      data: {
        key: dto.key,
        name: dto.name,
        description: dto.description,
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: ProjectRole.OWNER,
          },
        },
      },
      select: {
        ...this.projectSelect,
        members: {
          where: { userId: ownerId },
          select: {
            role: true,
          },
        },
      },
    });

    return {
      ...this.mapProject(project),
      currentUserRole: project.members[0]?.role ?? ProjectRole.OWNER,
    };
  }

  async listProjectsForUser(userId: number) {
    const memberships = await this.prisma.projectMember.findMany({
      where: { userId },
      orderBy: {
        project: {
          updatedAt: 'desc',
        },
      },
      select: {
        role: true,
        project: {
          select: {
            ...this.projectSelect,
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
    });

    return memberships.map(({ role, project }) => ({
      ...this.mapProject(project),
      currentUserRole: role,
      memberCount: project._count.members,
    }));
  }

  async getProjectById(projectId: number, userId: number) {
    const project = await this.ensureProjectAccess(projectId, userId);

    return {
      ...this.mapProject(project.project),
      currentUserRole: project.role,
      memberCount: project.project._count.members,
      owner: project.project.owner,
    };
  }

  async updateProject(projectId: number, dto: UpdateProjectDto) {
    if (dto.key) {
      const existingProject = await this.prisma.project.findFirst({
        where: {
          key: dto.key,
          NOT: { id: projectId },
        },
        select: { id: true },
      });

      if (existingProject) {
        throw new BadRequestException('Project key already exists');
      }
    }

    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.key !== undefined ? { key: dto.key } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description || null }
          : {}),
      },
      select: this.projectSelect,
    });

    return this.mapProject(updatedProject);
  }

  async addMemberByEmail(projectId: number, dto: AddProjectMemberDto) {
    const user = await this.usersService.findOneByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('User with this email was not found');
    }

    const existingMembership = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id,
        },
      },
    });

    if (existingMembership) {
      throw new BadRequestException('User is already a member of this project');
    }

    const membership = await this.prisma.projectMember.create({
      data: {
        projectId,
        userId: user.id,
        role: dto.role,
      },
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            verified: true,
          },
        },
      },
    });

    return membership;
  }

  async listMembers(projectId: number, userId: number) {
    await this.ensureProjectAccess(projectId, userId);

    const members = await this.prisma.projectMember.findMany({
      where: { projectId },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            verified: true,
          },
        },
      },
    });

    return members;
  }

  async getMembership(projectId: number, userId: number) {
    return await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  }

  async ensureProjectAccess(projectId: number, userId: number) {
    const membership = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      select: {
        role: true,
        project: {
          select: {
            ...this.projectSelect,
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
              },
            },
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return membership;
  }

  async ensureProjectExists(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }

  private mapProject<T extends { description: string | null }>(project: T) {
    return {
      ...project,
      description: project.description ?? '',
    };
  }
}
