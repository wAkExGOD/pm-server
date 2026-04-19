import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaService } from 'src/prisma.service';
import { UsersModule } from 'src/users/users.module';
import { ProjectRoleGuard } from './guards/project-role.guard';

@Module({
  imports: [UsersModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, PrismaService, ProjectRoleGuard],
  exports: [ProjectsService],
})
export class ProjectsModule {}
