import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { Exam } from './entities/exam.entity';
import { ExamsRepository } from './exams.repository';
import { AcademicTracksModule } from '../academic-tracks/academic-tracks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exam]),
    AcademicTracksModule,
  ],
  controllers: [ExamsController],
  providers: [ExamsService, ExamsRepository],
  exports: [ExamsService],
})
export class ExamsModule {}

