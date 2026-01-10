/**
 * ============================================================================
 * EXAMS GRADES MODULE - MODULE 3
 * ============================================================================
 */

import { Module } from '@nestjs/common';
import { ExamsPrismaService } from './exams-prisma.service';
import { ExamScoresPrismaService } from './exam-scores-prisma.service';
import { ReportCardsPrismaService } from './report-cards-prisma.service';
import { HonorRollsPrismaService } from './honor-rolls-prisma.service';
import { CouncilDecisionsPrismaService } from './council-decisions-prisma.service';
import { ExamsPrismaController } from './exams-prisma.controller';
import { ExamScoresPrismaController } from './exam-scores-prisma.controller';
import { ReportCardsPrismaController } from './report-cards-prisma.controller';
import { HonorRollsPrismaController } from './honor-rolls-prisma.controller';
import { CouncilDecisionsPrismaController } from './council-decisions-prisma.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [
    ExamsPrismaController,
    ExamScoresPrismaController,
    ReportCardsPrismaController,
    HonorRollsPrismaController,
    CouncilDecisionsPrismaController,
  ],
  providers: [
    ExamsPrismaService,
    ExamScoresPrismaService,
    ReportCardsPrismaService,
    HonorRollsPrismaService,
    CouncilDecisionsPrismaService,
  ],
  exports: [
    ExamsPrismaService,
    ExamScoresPrismaService,
    ReportCardsPrismaService,
    HonorRollsPrismaService,
    CouncilDecisionsPrismaService,
  ],
})
export class ExamsGradesModule {}

