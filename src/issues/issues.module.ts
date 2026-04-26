import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProjectsModule } from 'src/projects/projects.module';
import { BacklogController } from './backlog.controller';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';
import { SummaryController } from './summary.controller';

@Module({
  imports: [ProjectsModule],
  controllers: [IssuesController, BacklogController, SummaryController],
  providers: [IssuesService, PrismaService],
  exports: [IssuesService],
})
export class IssuesModule {}
