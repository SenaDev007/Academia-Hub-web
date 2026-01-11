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
// Module 4 - Frais & Priorité de Paiement
import { PaymentAllocationService } from './payment-allocation.service';
import { FeeInstallmentService } from './fee-installment.service';
import { PaymentsPrismaEnhancedService } from './payments-prisma-enhanced.service';
import { PaymentAllocationController } from './payment-allocation.controller';
import { FeeInstallmentController } from './fee-installment.controller';
import { PaymentsEnhancedController } from './payments-enhanced.controller';
// Module 4 - Recouvrement & Reçus
import { CollectionCaseService } from './collection-case.service';
import { ReceiptGenerationService } from './receipt-generation.service';
import { ReceiptNotificationService } from './receipt-notification.service';
import { FinanceOrionService } from './finance-orion.service';
import { CollectionCaseController } from './collection-case.controller';
import { ReceiptGenerationController } from './receipt-generation.controller';
import { ReceiptNotificationController } from './receipt-notification.controller';
import { FinanceOrionController } from './finance-orion.controller';
import { PublicReceiptController } from './public-receipt.controller';
// Module 4 - Régimes tarifaires & Arriérés
import { FeeRegimeService } from './fee-regime.service';
import { StudentFeeProfileService } from './student-fee-profile.service';
import { StudentArrearService } from './student-arrear.service';
import { FeeRegimeController } from './fee-regime.controller';
import { StudentFeeProfileController } from './student-fee-profile.controller';
import { StudentArrearController } from './student-arrear.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [
    FeesPrismaController,
    PaymentsPrismaController,
    ExpensesPrismaController,
    CollectionPrismaController,
    TreasuryPrismaController,
    // Module 4 - Frais & Priorité de Paiement
    PaymentAllocationController,
    FeeInstallmentController,
    PaymentsEnhancedController,
    // Module 4 - Recouvrement & Reçus
    CollectionCaseController,
    ReceiptGenerationController,
    ReceiptNotificationController,
    FinanceOrionController,
    PublicReceiptController,
    // Module 4 - Régimes tarifaires & Arriérés
    FeeRegimeController,
    StudentFeeProfileController,
    StudentArrearController,
  ],
  providers: [
    FeesPrismaService,
    PaymentsPrismaService,
    ExpensesPrismaService,
    CollectionPrismaService,
    TreasuryPrismaService,
    // Module 4 - Frais & Priorité de Paiement
    PaymentAllocationService,
    FeeInstallmentService,
    PaymentsPrismaEnhancedService,
    // Module 4 - Recouvrement & Reçus
    CollectionCaseService,
    ReceiptGenerationService,
    ReceiptNotificationService,
    FinanceOrionService,
    // Module 4 - Régimes tarifaires & Arriérés
    FeeRegimeService,
    StudentFeeProfileService,
    StudentArrearService,
  ],
  exports: [
    FeesPrismaService,
    PaymentsPrismaService,
    ExpensesPrismaService,
    CollectionPrismaService,
    TreasuryPrismaService,
    // Module 4 - Frais & Priorité de Paiement
    PaymentAllocationService,
    FeeInstallmentService,
    PaymentsPrismaEnhancedService,
    // Module 4 - Recouvrement & Reçus
    CollectionCaseService,
    ReceiptGenerationService,
  ],
})
export class FinanceModule {}

