/**
 * ============================================================================
 * PEDAGOGY MODULE - MODULE 2
 * ============================================================================
 */

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { SubjectsPrismaService } from './subjects-prisma.service';
import { SubjectsPrismaController } from './subjects-prisma.controller';
import { TeachersPrismaService } from './teachers-prisma.service';
import { TeachersPrismaController } from './teachers-prisma.controller';
import { PedagogyPrismaService } from './pedagogy-prisma.service';
import { PedagogyPrismaController } from './pedagogy-prisma.controller';
import { TimetablesPrismaService } from './timetables-prisma.service';
import { TimetablesPrismaController } from './timetables-prisma.controller';
import { LessonPlansPrismaService } from './lesson-plans-prisma.service';
import { LessonPlansPrismaController } from './lesson-plans-prisma.controller';
import { DailyLogsPrismaService } from './daily-logs-prisma.service';
import { DailyLogsPrismaController } from './daily-logs-prisma.controller';
import { ClassDiariesPrismaService } from './class-diaries-prisma.service';
import { ClassDiariesPrismaController } from './class-diaries-prisma.controller';
import { RoomsPrismaService } from './rooms-prisma.service';
import { RoomsPrismaController } from './rooms-prisma.controller';
// Module 2 - Système de Workflow Pédagogique
import { PedagogicalDocumentService } from './services/pedagogical-document.service';
import { PedagogicalWorkflowService } from './services/pedagogical-workflow.service';
import { PedagogicalNotificationService } from './services/pedagogical-notification.service';
import { WeeklySemainierService } from './services/weekly-semainier.service';
import { PedagogyOrionService } from './services/pedagogy-orion.service';
import { PedagogicalTeacherController } from './controllers/pedagogical-teacher.controller';
import { PedagogicalDirectorController } from './controllers/pedagogical-director.controller';
import { PedagogyOrionController } from './controllers/pedagogy-orion.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [
    SubjectsPrismaController,
    TeachersPrismaController,
    PedagogyPrismaController,
    TimetablesPrismaController,
    LessonPlansPrismaController,
    DailyLogsPrismaController,
    ClassDiariesPrismaController,
    RoomsPrismaController,
    // Module 2 - Workflow Pédagogique
    PedagogicalTeacherController,
    PedagogicalDirectorController,
    PedagogyOrionController,
  ],
  providers: [
    SubjectsPrismaService,
    TeachersPrismaService,
    PedagogyPrismaService,
    TimetablesPrismaService,
    LessonPlansPrismaService,
    DailyLogsPrismaService,
    ClassDiariesPrismaService,
    RoomsPrismaService,
    // Module 2 - Workflow Pédagogique
    PedagogicalDocumentService,
    PedagogicalWorkflowService,
    PedagogicalNotificationService,
    WeeklySemainierService,
    PedagogyOrionService,
  ],
  exports: [
    SubjectsPrismaService,
    TeachersPrismaService,
    PedagogyPrismaService,
    TimetablesPrismaService,
    LessonPlansPrismaService,
    DailyLogsPrismaService,
    ClassDiariesPrismaService,
    RoomsPrismaService,
    // Module 2 - Workflow Pédagogique
    PedagogicalDocumentService,
    PedagogicalWorkflowService,
    PedagogicalNotificationService,
    WeeklySemainierService,
    PedagogyOrionService,
  ],
})
export class PedagogyModule {}

