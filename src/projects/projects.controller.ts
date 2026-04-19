import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { type RequestWithUser } from 'src/types';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { ProjectRoles } from './decorators/project-roles.decorator';
import { ProjectRole } from './project-role.enum';
import { ProjectRoleGuard } from './guards/project-role.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async createProject(
    @Request() req: RequestWithUser,
    @Body() dto: CreateProjectDto,
  ) {
    return await this.projectsService.createProject(req.user.id, dto);
  }

  @Get()
  async listProjects(@Request() req: RequestWithUser) {
    return await this.projectsService.listProjectsForUser(req.user.id);
  }

  @Get(':projectId')
  async getProject(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return await this.projectsService.getProjectById(projectId, req.user.id);
  }

  @Patch(':projectId')
  @UseGuards(ProjectRoleGuard)
  @ProjectRoles(ProjectRole.OWNER, ProjectRole.ADMIN)
  async updateProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: UpdateProjectDto,
  ) {
    return await this.projectsService.updateProject(projectId, dto);
  }

  @Post(':projectId/members/add-by-email')
  @UseGuards(ProjectRoleGuard)
  @ProjectRoles(ProjectRole.OWNER, ProjectRole.ADMIN)
  async addMemberByEmail(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: AddProjectMemberDto,
  ) {
    await this.projectsService.ensureProjectExists(projectId);
    return await this.projectsService.addMemberByEmail(projectId, dto);
  }

  @Get(':projectId/members')
  async getMembers(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return await this.projectsService.listMembers(projectId, req.user.id);
  }
}
