import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProjectsModule } from 'src/projects/projects.module';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './releases.service';

@Module({
  imports: [ProjectsModule],
  controllers: [ReleasesController],
  providers: [ReleasesService, PrismaService],
  exports: [ReleasesService],
})
export class ReleasesModule {}
