/**
 * ============================================================================
 * FINANCES MODULE - MODULE FINANCIER
 * ============================================================================
 * 
 * Module pour les opérations financières avec :
 * - Endpoints séparés par module
 * - Services de calcul par niveau
 * - Isolation stricte par tenant + school_level
 * 
 * ============================================================================
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../../payments/entities/payment.entity';
import { Expense } from '../../expenses/entities/expense.entity';
import { FinancesCalculationService } from './services/finances-calculation.service';
import { FinancesController } from './finances.controller';
import { CalculationService } from '../../common/services/calculation.service';
import { PaymentsModule } from '../../payments/payments.module';
import { ExpensesModule } from '../../expenses/expenses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Expense]),
    PaymentsModule,
    ExpensesModule,
  ],
  controllers: [FinancesController],
  providers: [
    FinancesCalculationService,
    CalculationService,
  ],
  exports: [FinancesCalculationService],
})
export class FinancesModule {}

