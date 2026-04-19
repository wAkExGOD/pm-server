import { Module } from '@nestjs/common';
import { ProjectsModule } from 'src/projects/projects.module';
import { PrismaService } from 'src/prisma.service';
import { SprintsController } from './sprints.controller';
import { SprintsService } from './sprints.service';

@Module({
  imports: [ProjectsModule],
  controllers: [SprintsController],
  providers: [SprintsService, PrismaService],
  exports: [SprintsService],
})
export class SprintsModule {}
