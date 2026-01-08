import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { Grade } from './entities/grade.entity';
import { GradesRepository } from './grades.repository';
import { AcademicTracksModule } from '../academic-tracks/academic-tracks.module';
import { ExamsModule } from '../exams/exams.module';
import { SubjectsModule } from '../subjects/subjects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grade]),
    AcademicTracksModule,
    ExamsModule,
    SubjectsModule,
  ],
  controllers: [GradesController],
  providers: [GradesService, GradesRepository],
  exports: [GradesService],
})
export class GradesModule {}

