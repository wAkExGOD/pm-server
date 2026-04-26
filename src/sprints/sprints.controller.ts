import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { type RequestWithUser } from 'src/types';
import { ProjectRoles } from 'src/projects/decorators/project-roles.decorator';
import { ProjectRoleGuard } from 'src/projects/guards/project-role.guard';
import { ProjectRole } from 'src/projects/project-role.enum';
import { ListReleaseIssuesDto } from 'src/releases/dto/list-release-issues.dto';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { SprintsService } from './sprints.service';

@Controller('projects/:projectId/sprints')
@UseGuards(JwtAuthGuard)
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Post()
  @UseGuards(ProjectRoleGuard)
  @ProjectRoles(ProjectRole.OWNER, ProjectRole.ADMIN)
  async createSprint(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateSprintDto,
  ) {
    return await this.sprintsService.createSprint(projectId, req.user.id, dto);
  }

  @Patch(':sprintId')
  @UseGuards(ProjectRoleGuard)
  @ProjectRoles(ProjectRole.OWNER, ProjectRole.ADMIN)
  async updateSprint(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('sprintId', ParseIntPipe) sprintId: number,
    @Body() dto: UpdateSprintDto,
  ) {
    return await this.sprintsService.updateSprint(
      projectId,
      sprintId,
      req.user.id,
      dto,
    );
  }

  @Get()
  async listSprints(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return await this.sprintsService.listProjectSprints(projectId, req.user.id);
  }

  @Get('active')
  async getActiveSprint(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return await this.sprintsService.getActiveSprint(projectId, req.user.id);
  }

  @Get(':sprintId')
  async getSprintById(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('sprintId', ParseIntPipe) sprintId: number,
    @Query() dto: ListReleaseIssuesDto,
  ) {
    return await this.sprintsService.getSprintById(
      projectId,
      sprintId,
      req.user.id,
      dto,
    );
  }
}
