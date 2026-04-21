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
import { CreateReleaseDto } from './dto/create-release.dto';
import { ListReleaseIssuesDto } from './dto/list-release-issues.dto';
import { ListReleasesDto } from './dto/list-releases.dto';
import { ReleasesService } from './releases.service';

@Controller('projects/:projectId/releases')
@UseGuards(JwtAuthGuard)
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @Post()
  async createRelease(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateReleaseDto,
  ) {
    return await this.releasesService.createRelease(projectId, req.user.id, dto);
  }

  @Get()
  async listReleases(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() dto: ListReleasesDto,
  ) {
    return await this.releasesService.listReleases(projectId, req.user.id, dto);
  }

  @Get(':releaseId')
  async getReleaseById(
    @Request() req: RequestWithUser,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('releaseId', ParseIntPipe) releaseId: number,
    @Query() dto: ListReleaseIssuesDto,
  ) {
    return await this.releasesService.getReleaseById(
      projectId,
      releaseId,
      req.user.id,
      dto,
    );
  }
}
