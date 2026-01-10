import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';
import { StudentsRepository } from './students.repository';
import { DatabaseModule } from '../database/database.module';
import { StudentsPrismaService } from './students-prisma.service';
import { StudentsPrismaController } from './students-prisma.controller';
import { GuardiansPrismaService } from './guardians-prisma.service';
import { GuardiansPrismaController } from './guardians-prisma.controller';
import { AttendancePrismaService } from './attendance-prisma.service';
import { AttendancePrismaController } from './attendance-prisma.controller';
import { DisciplinePrismaService } from './discipline-prisma.service';
import { DisciplinePrismaController } from './discipline-prisma.controller';
import { DocumentsPrismaService } from './documents-prisma.service';
import { DocumentsPrismaController, GeneratedDocumentsController } from './documents-prisma.controller';
import { TransfersPrismaService } from './transfers-prisma.service';
import { TransfersPrismaController } from './transfers-prisma.controller';
// Module 1 - Matricule Global & Cartes Scolaires
import { StudentIdentifierService } from './services/student-identifier.service';
import { StudentIdCardService } from './services/student-id-card.service';
import { StudentsOrionService } from './services/students-orion.service';
import { StudentIdentifierController } from './controllers/student-identifier.controller';
import { StudentIdCardController } from './controllers/student-id-card.controller';
import { StudentsOrionController } from './controllers/students-orion.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    DatabaseModule, // Pour PrismaService
  ],
  controllers: [
    StudentsController,
    StudentsPrismaController,
    GuardiansPrismaController,
    AttendancePrismaController,
    DisciplinePrismaController,
    DocumentsPrismaController,
    GeneratedDocumentsController,
    TransfersPrismaController,
    // Module 1 - Matricule Global & Cartes Scolaires
    StudentIdentifierController,
    StudentIdCardController,
    StudentsOrionController,
  ],
  providers: [
    StudentsService,
    StudentsRepository,
    StudentsPrismaService,
    GuardiansPrismaService,
    AttendancePrismaService,
    DisciplinePrismaService,
    DocumentsPrismaService,
    TransfersPrismaService,
    // Module 1 - Matricule Global & Cartes Scolaires
    StudentIdentifierService,
    StudentIdCardService,
    StudentsOrionService,
  ],
  exports: [
    StudentsService,
    StudentsPrismaService,
    GuardiansPrismaService,
    AttendancePrismaService,
    DisciplinePrismaService,
    DocumentsPrismaService,
    TransfersPrismaService,
    // Module 1 - Matricule Global & Cartes Scolaires
    StudentIdentifierService,
    StudentIdCardService,
    StudentsOrionService,
  ],
})
export class StudentsModule {}

