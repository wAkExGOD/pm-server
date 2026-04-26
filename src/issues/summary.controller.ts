import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { type RequestWithUser } from 'src/types';
import { IssuesService } from './issues.service';

@Controller('projects/:projectId/summary')
@UseGuards(JwtAuthGuard)
export class SummaryController {
  constructor(private readonly issuesService: IssuesService) {}

  @Get()
  async getSummary(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return await this.issuesService.getProjectSummary(projectId, req.user.id);
  }
}
