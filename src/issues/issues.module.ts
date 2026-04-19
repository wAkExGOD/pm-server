import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProjectsModule } from 'src/projects/projects.module';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';

@Module({
  imports: [ProjectsModule],
  controllers: [IssuesController],
  providers: [IssuesService, PrismaService],
  exports: [IssuesService],
})
export class IssuesModule {}
