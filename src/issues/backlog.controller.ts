import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { type RequestWithUser } from 'src/types';
import { IssuesService } from './issues.service';
import { ListBacklogDto } from './dto/list-backlog.dto';
import { MoveIssueToSprintDto } from './dto/move-issue-to-sprint.dto';

@Controller('projects/:projectId')
@UseGuards(JwtAuthGuard)
export class BacklogController {
  constructor(private readonly issuesService: IssuesService) {}

  @Get('backlog')
  async listBacklog(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() dto: ListBacklogDto,
  ) {
    return await this.issuesService.listBacklog(projectId, req.user.id, dto);
  }

  @Post('issues/:issueId/move-to-sprint')
  async moveIssueToSprint(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('issueId', ParseIntPipe) issueId: number,
    @Body() dto: MoveIssueToSprintDto,
  ) {
    return await this.issuesService.moveIssueToSprint(
      projectId,
      issueId,
      req.user.id,
      dto.sprintId,
    );
  }
}
