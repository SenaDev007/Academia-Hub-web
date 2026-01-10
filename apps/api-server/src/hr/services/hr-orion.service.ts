/**
 * ============================================================================
 * HR ORION SERVICE - MODULE 5
 * ============================================================================
 * 
 * Service ORION pour alertes fiscales et paie
 * 
 * ============================================================================
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TaxService } from './tax.service';
import { PayrollTaxService } from './payroll-tax.service';

@Injectable()
export class HROrionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly taxService: TaxService,
    private readonly payrollTaxService: PayrollTaxService,
  ) {}

  /**
   * Récupère les KPIs fiscaux et de paie pour ORION
   */
  async getPayrollAndTaxKPIs(tenantId: string, academicYearId?: string) {
    const where: any = { tenantId };
    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    // Statistiques de paie
    const payrolls = await this.prisma.payroll.findMany({
      where,
      include: {
        items: {
          include: {
            taxWithholdings: true,
          },
        },
      },
    });

    const totalPayrolls = payrolls.length;
    const validatedPayrolls = payrolls.filter((p) => p.status === 'VALIDATED').length;
    const paidPayrolls = payrolls.filter((p) => p.status === 'PAID').length;
    
    const totalGrossSalary = payrolls.reduce(
      (sum, p) =>
        sum +
        p.items.reduce((s, i) => s + Number(i.grossSalary || 0), 0),
      0,
    );
    
    const totalNetSalary = payrolls.reduce(
      (sum, p) =>
        sum +
        p.items.reduce((s, i) => s + Number(i.netSalary || 0), 0),
      0,
    );

    // Statistiques fiscales
    const taxStats = await this.taxService.getTaxStats(tenantId, academicYearId);

    // Calcul des ratios
    const averageTaxRate = taxStats.averageTaxRate;
    const totalDeductions = totalGrossSalary - totalNetSalary;
    const deductionRate = totalGrossSalary > 0 
      ? (totalDeductions / totalGrossSalary) * 100 
      : 0;

    // KPIs par sous-module
    return {
      payroll: {
        totalPayrolls,
        validatedPayrolls,
        paidPayrolls,
        totalGrossSalary,
        totalNetSalary,
        totalDeductions,
        deductionRate: Math.round(deductionRate * 100) / 100,
        validationRate: totalPayrolls > 0 
          ? (validatedPayrolls / totalPayrolls) * 100 
          : 0,
        paymentRate: validatedPayrolls > 0 
          ? (paidPayrolls / validatedPayrolls) * 100 
          : 0,
      },
      tax: {
        totalWithholdings: taxStats.totalWithholdings,
        totalTaxableAmount: taxStats.totalTaxableAmount,
        totalWithheldAmount: taxStats.totalWithheldAmount,
        averageTaxRate: Math.round(averageTaxRate * 100) / 100,
        byTaxType: taxStats.byTaxType,
      },
      alerts: await this.generateAlerts(tenantId, academicYearId),
    };
  }

  /**
   * Génère les alertes ORION pour la paie et la fiscalité
   */
  async generateAlerts(tenantId: string, academicYearId?: string) {
    const alerts: Array<{
      severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      category: string;
      title: string;
      description: string;
      recommendation?: string;
      count?: number;
    }> = [];

    const where: any = { tenantId };
    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    // 1. Paies validées sans calcul fiscal
    const payrolls = await this.prisma.payroll.findMany({
      where: {
        ...where,
        status: 'VALIDATED',
      },
      include: {
        items: {
          include: {
            taxWithholdings: true,
          },
        },
      },
    });

    const payrollsWithoutTax = payrolls.filter((p) => {
      const hasItemsWithoutTax = p.items.some(
        (item) =>
          Number(item.taxableAmount) > 0 &&
          !item.taxWithholdings.some((w) => w.taxType === 'IRPP'),
      );
      return hasItemsWithoutTax;
    });

    if (payrollsWithoutTax.length > 0) {
      alerts.push({
        severity: 'CRITICAL',
        category: 'PAYROLL_TAX',
        title: 'Paies validées sans calcul fiscal',
        description: `${payrollsWithoutTax.length} paie(s) validée(s) sans calcul IRPP alors que le montant imposable > 0`,
        recommendation:
          'Recalculer les paies avec les retenues fiscales avant validation',
        count: payrollsWithoutTax.length,
      });
    }

    // 2. Paies validées sans déclaration CNSS
    const payrollsWithoutCNSS = payrolls.filter((p) => {
      const hasItemsWithoutCNSS = p.items.some(
        (item) => Number(item.grossSalary) > 0 && Number(item.cnssEmployee) === 0,
      );
      return hasItemsWithoutCNSS;
    });

    if (payrollsWithoutCNSS.length > 0) {
      alerts.push({
        severity: 'CRITICAL',
        category: 'PAYROLL_CNSS',
        title: 'Paies validées sans déclaration CNSS',
        description: `${payrollsWithoutCNSS.length} paie(s) validée(s) sans calcul CNSS alors que le brut > 0`,
        recommendation:
          'Recalculer les paies avec les charges CNSS avant validation',
        count: payrollsWithoutCNSS.length,
      });
    }

    // 3. Retenue fiscale manquante
    const itemsWithTaxableAmount = await this.prisma.payrollItem.findMany({
      where: {
        ...where,
        taxableAmount: { gt: 0 },
      },
      include: {
        taxWithholdings: true,
      },
    });

    const itemsWithoutIRPP = itemsWithTaxableAmount.filter(
      (item) => !item.taxWithholdings.some((w) => w.taxType === 'IRPP'),
    );

    if (itemsWithoutIRPP.length > 0) {
      alerts.push({
        severity: 'HIGH',
        category: 'TAX_MISSING',
        title: 'Retenue fiscale manquante',
        description: `${itemsWithoutIRPP.length} item(s) de paie avec montant imposable > 0 sans retenue IRPP`,
        recommendation:
          'Calculer et enregistrer les retenues fiscales pour tous les items de paie',
        count: itemsWithoutIRPP.length,
      });
    }

    // 4. Masse salariale anormale
    const last3Months = payrolls.slice(0, 3);
    if (last3Months.length >= 2) {
      const averages = last3Months.map((p) =>
        p.items.reduce((sum, i) => sum + Number(i.netSalary || 0), 0),
      );
      const currentAverage = averages[0];
      const previousAverage = averages.slice(1).reduce((sum, avg) => sum + avg, 0) / (averages.length - 1);

      if (previousAverage > 0) {
        const variation = ((currentAverage - previousAverage) / previousAverage) * 100;
        if (Math.abs(variation) > 30) {
          alerts.push({
            severity: 'MEDIUM',
            category: 'PAYROLL_ANOMALY',
            title: 'Masse salariale anormale',
            description: `Variation de ${variation > 0 ? '+' : ''}${Math.round(variation * 100) / 100}% de la masse salariale par rapport aux mois précédents`,
            recommendation:
              'Vérifier les changements dans la structure salariale ou les effectifs',
            count: 1,
          });
        }
      }
    }

    // 5. Retards administratifs répétés
    const unpaidPayrolls = await this.prisma.payroll.findMany({
      where: {
        ...where,
        status: 'VALIDATED',
        paidAt: null,
      },
    });

    if (unpaidPayrolls.length > 2) {
      alerts.push({
        severity: 'MEDIUM',
        category: 'PAYROLL_DELAY',
        title: 'Retards administratifs répétés',
        description: `${unpaidPayrolls.length} paie(s) validée(s) mais non payées`,
        recommendation:
          'Planifier le paiement des paies validées pour respecter les délais légaux',
        count: unpaidPayrolls.length,
      });
    }

    // 6. Incohérence brut/net
    const itemsWithInconsistency = await this.prisma.payrollItem.findMany({
      where: {
        ...where,
      },
    });

    const inconsistentItems = itemsWithInconsistency.filter((item) => {
      const gross = Number(item.grossSalary || 0);
      const deductions = Number(item.totalDeductions || 0);
      const net = Number(item.netSalary || 0);
      const calculatedNet = gross - deductions;
      const diff = Math.abs(net - calculatedNet);
      return diff > 0.01; // Tolérance de 0.01 FCFA
    });

    if (inconsistentItems.length > 0) {
      alerts.push({
        severity: 'HIGH',
        category: 'PAYROLL_CALCULATION',
        title: 'Incohérence brut/net',
        description: `${inconsistentItems.length} item(s) de paie avec incohérence entre brut, retenues et net`,
        recommendation:
          'Recalculer les items de paie pour corriger les incohérences',
        count: inconsistentItems.length,
      });
    }

    // 7. Évolution anormale des charges fiscales
    const last6Months = payrolls.slice(0, 6);
    if (last6Months.length >= 3) {
      const taxAmounts = last6Months.map((p) =>
        p.items.reduce(
          (sum, i) =>
            sum +
            i.taxWithholdings.reduce((s, w) => s + Number(w.withheldAmount || 0), 0),
          0,
        ),
      );

      if (taxAmounts.length >= 2) {
        const currentTax = taxAmounts[0];
        const previousTax = taxAmounts.slice(1).reduce((sum, tax) => sum + tax, 0) / (taxAmounts.length - 1);

        if (previousTax > 0) {
          const taxVariation = ((currentTax - previousTax) / previousTax) * 100;
          if (Math.abs(taxVariation) > 25) {
            alerts.push({
              severity: 'LOW',
              category: 'TAX_VARIATION',
              title: 'Évolution anormale des charges fiscales',
              description: `Variation de ${taxVariation > 0 ? '+' : ''}${Math.round(taxVariation * 100) / 100}% des charges fiscales`,
              recommendation:
                'Vérifier les changements dans les barèmes fiscaux ou la structure salariale',
              count: 1,
            });
          }
        }
      }
    }

    return alerts.sort((a, b) => {
      const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }
}

