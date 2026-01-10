/**
 * ============================================================================
 * HR MODULE - MODULE 5
 * ============================================================================
 */

import { Module } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { StaffPrismaService } from './staff-prisma.service';
import { ContractsPrismaService } from './contracts-prisma.service';
import { AttendancePrismaService } from './attendance-prisma.service';
import { EvaluationsPrismaService } from './evaluations-prisma.service';
import { PayrollPrismaService } from './payroll-prisma.service';
import { CNSSPrismaService } from './cnss-prisma.service';
import { TaxService } from './services/tax.service';
import { PayrollTaxService } from './services/payroll-tax.service';
import { PayrollPdfService } from './services/payroll-pdf.service';
import { HROrionService } from './services/hr-orion.service';
import { StaffPrismaController } from './staff-prisma.controller';
import { ContractsPrismaController } from './contracts-prisma.controller';
import { AttendancePrismaController } from './attendance-prisma.controller';
import { EvaluationsPrismaController } from './evaluations-prisma.controller';
import { PayrollPrismaController } from './payroll-prisma.controller';
import { CNSSPrismaController } from './cnss-prisma.controller';

@Module({
  providers: [
    PrismaService,
    StaffPrismaService,
    ContractsPrismaService,
    AttendancePrismaService,
    EvaluationsPrismaService,
    PayrollPrismaService,
    CNSSPrismaService,
    TaxService,
    PayrollTaxService,
    PayrollPdfService,
    HROrionService,
  ],
  controllers: [
    StaffPrismaController,
    ContractsPrismaController,
    AttendancePrismaController,
    EvaluationsPrismaController,
    PayrollPrismaController,
    CNSSPrismaController,
  ],
  exports: [
    StaffPrismaService,
    ContractsPrismaService,
    AttendancePrismaService,
    EvaluationsPrismaService,
    PayrollPrismaService,
    CNSSPrismaService,
    TaxService,
    PayrollTaxService,
    PayrollPdfService,
    HROrionService,
  ],
})
export class HRModule {}

