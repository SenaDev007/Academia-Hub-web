/**
 * ============================================================================
 * FINANCE MODULE - MODULE 4
 * ============================================================================
 */

import { Module } from '@nestjs/common';
import { FeesPrismaService } from './fees-prisma.service';
import { PaymentsPrismaService } from './payments-prisma.service';
import { ExpensesPrismaService } from './expenses-prisma.service';
import { CollectionPrismaService } from './collection-prisma.service';
import { TreasuryPrismaService } from './treasury-prisma.service';
import { FeesPrismaController } from './fees-prisma.controller';
import { PaymentsPrismaController } from './payments-prisma.controller';
import { ExpensesPrismaController } from './expenses-prisma.controller';
import { CollectionPrismaController } from './collection-prisma.controller';
import { TreasuryPrismaController } from './treasury-prisma.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [
    FeesPrismaController,
    PaymentsPrismaController,
    ExpensesPrismaController,
    CollectionPrismaController,
    TreasuryPrismaController,
  ],
  providers: [
    FeesPrismaService,
    PaymentsPrismaService,
    ExpensesPrismaService,
    CollectionPrismaService,
    TreasuryPrismaService,
  ],
  exports: [
    FeesPrismaService,
    PaymentsPrismaService,
    ExpensesPrismaService,
    CollectionPrismaService,
    TreasuryPrismaService,
  ],
})
export class FinanceModule {}

