import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BilingualAnalysisService } from './services/bilingual-analysis.service';
import { OrionBilingualController } from './orion-bilingual.controller';
import { Exam } from '../exams/entities/exam.entity';
import { Grade } from '../grades/entities/grade.entity';
import { Class } from '../classes/entities/class.entity';
import { StudentAcademicTrack } from '../academic-tracks/entities/student-academic-track.entity';
import { AcademicTrack } from '../academic-tracks/entities/academic-track.entity';
import { TenantFeaturesModule } from '../tenant-features/tenant-features.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exam, Grade, Class, StudentAcademicTrack, AcademicTrack]),
    TenantFeaturesModule,
  ],
  controllers: [OrionBilingualController],
  providers: [BilingualAnalysisService],
  exports: [BilingualAnalysisService],
})
export class OrionBilingualModule {}

