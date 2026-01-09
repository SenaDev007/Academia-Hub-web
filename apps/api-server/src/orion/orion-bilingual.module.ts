import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BilingualAnalysisService } from './services/bilingual-analysis.service';
import { OrionBilingualController } from './orion-bilingual.controller';
import { OrionAlertsController } from './orion-alerts.controller';
import { OrionAlertsService } from './services/orion-alerts.service';
import { Exam } from '../exams/entities/exam.entity';
import { Grade } from '../grades/entities/grade.entity';
import { Class } from '../classes/entities/class.entity';
import { StudentAcademicTrack } from '../academic-tracks/entities/student-academic-track.entity';
import { AcademicTrack } from '../academic-tracks/entities/academic-track.entity';
import { TenantFeaturesModule } from '../tenant-features/tenant-features.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exam, Grade, Class, StudentAcademicTrack, AcademicTrack]),
    TenantFeaturesModule,
    DatabaseModule, // Pour Prisma (ORION Alerts utilise Prisma)
  ],
  controllers: [OrionBilingualController, OrionAlertsController],
  providers: [BilingualAnalysisService, OrionAlertsService],
  exports: [BilingualAnalysisService, OrionAlertsService],
})
export class OrionBilingualModule {}

