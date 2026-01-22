/**
 * ============================================================================
 * PAYROLL PRISMA SERVICE - MODULE 5
 * ============================================================================
 * 
 * Service pour la gestion de la paie
 * 
 * ============================================================================
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PayrollPrismaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée une paie
   */
  async createPayroll(data: {
    tenantId: string;
    academicYearId: string;
    schoolLevelId?: string;
    month: string;
    startDate: Date;
    endDate: Date;
    notes?: string;
  }) {
    // Vérifier l'unicité de la paie pour ce mois
    const existing = await this.prisma.payroll.findUnique({
      where: {
        tenantId_academicYearId_month: {
          tenantId: data.tenantId,
          academicYearId: data.academicYearId,
          month: data.month,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(`Payroll for month ${data.month} already exists`);
    }

    return this.prisma.payroll.create({
      data: {
        ...data,
        status: 'DRAFT',
        totalAmount: 0,
      },
    });
  }

  /**
   * Récupère toutes les paies
   */
  async findAllPayrolls(tenantId: string, filters?: {
    academicYearId?: string;
    status?: string;
  }) {
    const where: any = { tenantId };
    
    if (filters?.academicYearId) {
      where.academicYearId = filters.academicYearId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.payroll.findMany({
      where,
      include: {
        items: {
          include: {
            staff: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeNumber: true,
              },
            },
          },
        },
      },
      orderBy: { month: 'desc' },
    });
  }

  /**
   * Récupère une paie par ID
   */
  async findPayrollById(id: string, tenantId: string) {
    const payroll = await this.prisma.payroll.findFirst({
      where: { id, tenantId },
      include: {
        items: {
          include: {
            staff: true,
            salarySlip: true,
          },
        },
      },
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${id} not found`);
    }

    return payroll;
  }

  /**
   * Ajoute un élément de paie
   */
  async addPayrollItem(data: {
    tenantId: string;
    academicYearId: string;
    schoolLevelId?: string;
    payrollId: string;
    staffId: string;
    baseSalary: number;
    overtimeAmount?: number;
    bonuses?: number;
    deductions?: number;
  }) {
    const payroll = await this.findPayrollById(data.payrollId, data.tenantId);

    if (payroll.status !== 'DRAFT') {
      throw new BadRequestException('Cannot add items to a non-draft payroll');
    }

    // Récupérer le contrat actif du personnel
    const contract = await this.prisma.contract.findFirst({
      where: {
        staffId: data.staffId,
        status: 'ACTIVE',
      },
    });

    if (!contract) {
      throw new BadRequestException(`No active contract found for staff ${data.staffId}`);
    }

    // Calculer le salaire net
    const baseSalary = data.baseSalary || Number(contract.baseSalary);
    const overtimeAmount = data.overtimeAmount || 0;
    const bonuses = data.bonuses || 0;
    const deductions = data.deductions || 0;
    const netSalary = baseSalary + overtimeAmount + bonuses - deductions;

    const grossSalary = baseSalary + overtimeAmount + bonuses;
    const totalDeductions = deductions; // ou calculer depuis cnssEmployee + irppAmount + otherDeductions
    // Retirer deductions et tenantId de data s'ils existent (gérés séparément)
    const { deductions: _, tenantId: __, ...restData } = data as any;
    const item = await this.prisma.payrollItem.create({
      data: {
        ...restData,
        baseSalary,
        overtimeAmount,
        bonuses,
        grossSalary,
        otherDeductions: deductions,
        totalDeductions,
        netSalary,
      },
    });

    // Mettre à jour le total de la paie
    await this.updatePayrollTotal(data.payrollId);

    return item;
  }

  /**
   * Met à jour le total d'une paie
   */
  async updatePayrollTotal(payrollId: string) {
    const items = await this.prisma.payrollItem.findMany({
      where: { payrollId },
    });

    const totalAmount = items.reduce((sum, item) => {
      return sum + Number(item.netSalary);
    }, 0);

    return this.prisma.payroll.update({
      where: { id: payrollId },
      data: { totalAmount },
    });
  }

  /**
   * Valide une paie
   */
  async validatePayroll(id: string, tenantId: string, processedBy: string) {
    const payroll = await this.findPayrollById(id, tenantId);

    if (payroll.status !== 'DRAFT') {
      throw new BadRequestException('Only draft payrolls can be validated');
    }

    if (payroll.items.length === 0) {
      throw new BadRequestException('Cannot validate payroll with no items');
    }

    return this.prisma.payroll.update({
      where: { id },
      data: {
        status: 'VALIDATED',
        processedBy,
        processedAt: new Date(),
      },
    });
  }

  /**
   * Marque une paie comme payée
   */
  async markPayrollAsPaid(id: string, tenantId: string) {
    const payroll = await this.findPayrollById(id, tenantId);

    if (payroll.status !== 'VALIDATED') {
      throw new BadRequestException('Only validated payrolls can be marked as paid');
    }

    return this.prisma.payroll.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });
  }

  /**
   * Génère un bulletin de salaire
   */
  async generateSalarySlip(payrollItemId: string, tenantId: string, issuedBy: string) {
    const payrollItem = await this.prisma.payrollItem.findFirst({
      where: {
        id: payrollItemId,
        tenantId,
      },
      include: {
        staff: true,
        payroll: true,
      },
    });

    if (!payrollItem) {
      throw new NotFoundException(`Payroll item with ID ${payrollItemId} not found`);
    }

    // Générer un numéro de reçu unique
    const receiptNumber = `SLIP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // SalarySlip - utiliser UncheckedCreateInput avec tenantId directement
    const salarySlipData: any = {
      tenantId,
      payrollItemId,
      receiptNumber,
      issuedAt: new Date(),
    };
    if (issuedBy) {
      salarySlipData.issuedBy = issuedBy;
    }
    return this.prisma.salarySlip.create({
      data: salarySlipData,
    });
  }

  /**
   * Récupère les statistiques de paie
   */
  async getPayrollStatistics(tenantId: string, academicYearId: string) {
    const payrolls = await this.prisma.payroll.findMany({
      where: {
        tenantId,
        academicYearId,
        status: 'PAID',
      },
      include: {
        items: true,
      },
    });

    const totalPayrolls = payrolls.length;
    const totalAmount = payrolls.reduce((sum, p) => sum + Number(p.totalAmount), 0);
    const totalStaff = new Set(payrolls.flatMap(p => p.items.map(i => i.staffId))).size;

    return {
      totalPayrolls,
      totalAmount,
      totalStaff,
      averagePayroll: totalPayrolls > 0 ? totalAmount / totalPayrolls : 0,
    };
  }
}

