/**
 * ============================================================================
 * PAYROLL TAX SERVICE - MODULE 5
 * ============================================================================
 * 
 * Service pour intégrer la fiscalité dans le calcul de la paie
 * 
 * ============================================================================
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TaxService } from './tax.service';
import { CNSSPrismaService } from '../cnss-prisma.service';

@Injectable()
export class PayrollTaxService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly taxService: TaxService,
    private readonly cnssService: CNSSPrismaService,
  ) {}

  /**
   * Calcule la paie complète avec CNSS et IRPP
   * Règle métier : ❌ Paie validée sans calcul fiscal → BLOCAGE
   */
  async calculatePayrollItem(
    tenantId: string,
    academicYearId: string,
    payrollItemId: string,
    countryCode: string = 'BJ', // Par défaut Bénin, peut être configuré par tenant
  ) {
    const payrollItem = await this.prisma.payrollItem.findFirst({
      where: { id: payrollItemId, tenantId },
      include: {
        staff: true,
        payroll: true,
      },
    });

    if (!payrollItem) {
      throw new NotFoundException(`Payroll item with ID ${payrollItemId} not found`);
    }

    // Récupérer les informations CNSS de l'employé
    const employeeCNSS = await this.prisma.employeeCNSS.findFirst({
      where: { staffId: payrollItem.staffId, tenantId },
    });

    if (!employeeCNSS?.isActive) {
      throw new BadRequestException(
        `Employee ${payrollItem.staffId} does not have active CNSS registration`,
      );
    }

    // 1. Calculer le brut total
    const baseSalary = Number(payrollItem.baseSalary);
    const overtimeAmount = Number(payrollItem.overtimeAmount);
    const bonuses = Number(payrollItem.bonuses);
    const grossSalary = baseSalary + overtimeAmount + bonuses;

    // 2. Calculer la CNSS (part employé)
    const cnssRate = await this.cnssService.findActiveCNSSRate(countryCode);
    if (!cnssRate) {
      throw new NotFoundException(`No active CNSS rate found for country ${countryCode}`);
    }

    const cnssEmployeeShare = Math.min(
      (grossSalary * Number(cnssRate.employeeRate)) / 100,
      cnssRate.salaryCeiling 
        ? (Number(cnssRate.salaryCeiling) * Number(cnssRate.employeeRate)) / 100 
        : (grossSalary * Number(cnssRate.employeeRate)) / 100,
    );
    const cnssEmployerShare = Math.min(
      (grossSalary * Number(cnssRate.employerRate)) / 100,
      cnssRate.salaryCeiling 
        ? (Number(cnssRate.salaryCeiling) * Number(cnssRate.employerRate)) / 100 
        : (grossSalary * Number(cnssRate.employerRate)) / 100,
    );

    // 3. Calculer le net imposable (brut - CNSS employé)
    const taxableAmount = grossSalary - cnssEmployeeShare;

    // 4. Calculer l'IRPP
    const irppCalculation = await this.taxService.calculateIRPP(
      countryCode,
      taxableAmount,
      payrollItem.payroll.startDate,
    );

    // 5. Autres retenues (déjà dans deductions)
    const otherDeductions = Number(payrollItem.deductions || 0);

    // 6. Calculer le total des retenues
    const totalDeductions = cnssEmployeeShare + irppCalculation.amount + otherDeductions;

    // 7. Calculer le net à payer
    const netSalary = grossSalary - totalDeductions;

    // 8. Mettre à jour l'item de paie
    const updatedPayrollItem = await this.prisma.payrollItem.update({
      where: { id: payrollItemId },
      data: {
        grossSalary,
        cnssEmployee: cnssEmployeeShare,
        cnssEmployer: cnssEmployerShare,
        taxableAmount,
        irppAmount: irppCalculation.amount,
        otherDeductions,
        totalDeductions,
        netSalary,
        status: 'CALCULATED',
        calculatedAt: new Date(),
      },
    });

    // 9. Enregistrer la retenue fiscale IRPP
    await this.taxService.recordTaxWithholding(
      tenantId,
      academicYearId,
      payrollItemId,
      payrollItem.staffId,
      irppCalculation.taxRateId || null,
      'IRPP',
      taxableAmount,
      irppCalculation.amount,
      {
        breakdown: irppCalculation.breakdown,
        calculationMethod: 'PROGRESSIVE',
      },
    );

    return {
      ...updatedPayrollItem,
      irppBreakdown: irppCalculation.breakdown,
    };
  }

  /**
   * Valide un item de paie
   * Règle métier : ❌ Paie validée sans calcul fiscal → BLOCAGE
   */
  async validatePayrollItem(payrollItemId: string, tenantId: string, userId: string) {
    const payrollItem = await this.prisma.payrollItem.findFirst({
      where: { id: payrollItemId, tenantId },
      include: {
        taxWithholdings: true,
      },
    });

    if (!payrollItem) {
      throw new NotFoundException(`Payroll item with ID ${payrollItemId} not found`);
    }

    // Vérifier que le calcul fiscal a été effectué
    if (payrollItem.status !== 'CALCULATED') {
      throw new BadRequestException(
        `Payroll item must be calculated before validation. Current status: ${payrollItem.status}`,
      );
    }

    // Vérifier que les retenues fiscales sont présentes
    const hasIRPP = payrollItem.taxWithholdings.some((w) => w.taxType === 'IRPP');
    if (!hasIRPP && Number(payrollItem.taxableAmount) > 0) {
      throw new BadRequestException(
        'Cannot validate payroll item without IRPP calculation when taxable amount > 0',
      );
    }

    // Vérifier que la CNSS a été calculée
    if (Number(payrollItem.cnssEmployee) === 0 && Number(payrollItem.grossSalary) > 0) {
      throw new BadRequestException(
        'Cannot validate payroll item without CNSS calculation when gross salary > 0',
      );
    }

    // Mettre à jour le statut
    return this.prisma.payrollItem.update({
      where: { id: payrollItemId },
      data: {
        status: 'VALIDATED',
        validatedAt: new Date(),
      },
    });
  }

  /**
   * Valide une paie complète (tous les items)
   */
  async validatePayroll(payrollId: string, tenantId: string, userId: string) {
    const payroll = await this.prisma.payroll.findFirst({
      where: { id: payrollId, tenantId },
      include: {
        items: {
          include: {
            taxWithholdings: true,
          },
        },
      },
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${payrollId} not found`);
    }

    // Valider chaque item
    const validationResults = await Promise.allSettled(
      payroll.items.map((item) =>
        this.validatePayrollItem(item.id, tenantId, userId),
      ),
    );

    const failed = validationResults.filter((r) => r.status === 'rejected');
    if (failed.length > 0) {
      throw new BadRequestException(
        `${failed.length} payroll items failed validation: ${failed.map((f) => 
          f.status === 'rejected' ? f.reason.message : '',
        ).join(', ')}`,
      );
    }

    // Mettre à jour le total de la paie
    const totalAmount = payroll.items.reduce(
      (sum, item) => sum + Number(item.netSalary),
      0,
    );

    return this.prisma.payroll.update({
      where: { id: payrollId },
      data: {
        status: 'VALIDATED',
        totalAmount,
        processedBy: userId,
        processedAt: new Date(),
      },
    });
  }
}

