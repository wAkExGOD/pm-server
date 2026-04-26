import {
  Body,
  Controller,
  Delete,
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
import { CreateIssueDto } from './dto/create-issue.dto';
import { CreateIssueCommentDto } from './dto/create-issue-comment.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { ListIssuesDto } from './dto/list-issues.dto';
import { IssuesService } from './issues.service';

@Controller('projects/:projectId/issues')
@UseGuards(JwtAuthGuard)
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post()
  async createIssue(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateIssueDto,
  ) {
    return await this.issuesService.createIssue(projectId, req.user.id, dto);
  }

  @Get()
  async listIssues(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() dto: ListIssuesDto,
  ) {
    return await this.issuesService.listIssues(projectId, req.user.id, dto);
  }

  @Get(':issueId')
  async getIssueById(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('issueId', ParseIntPipe) issueId: number,
  ) {
    return await this.issuesService.getIssueById(
      projectId,
      issueId,
      req.user.id,
    );
  }

  @Patch(':issueId')
  async updateIssue(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('issueId', ParseIntPipe) issueId: number,
    @Body() dto: UpdateIssueDto,
  ) {
    return await this.issuesService.updateIssue(
      projectId,
      issueId,
      req.user.id,
      dto,
    );
  }

  @Get(':issueId/comments')
  async listIssueComments(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('issueId', ParseIntPipe) issueId: number,
  ) {
    return await this.issuesService.listIssueComments(
      projectId,
      issueId,
      req.user.id,
    );
  }

  @Post(':issueId/comments')
  async createIssueComment(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('issueId', ParseIntPipe) issueId: number,
    @Body() dto: CreateIssueCommentDto,
  ) {
    return await this.issuesService.createIssueComment(
      projectId,
      issueId,
      req.user.id,
      dto,
    );
  }

  @Delete(':issueId/comments/:commentId')
  async deleteIssueComment(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('issueId', ParseIntPipe) issueId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return await this.issuesService.deleteIssueComment(
      projectId,
      issueId,
      commentId,
      req.user.id,
    );
  }

  @Delete(':issueId')
  async deleteIssue(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('issueId', ParseIntPipe) issueId: number,
  ) {
    return await this.issuesService.deleteIssue(
      projectId,
      issueId,
      req.user.id,
    );
  }
}
