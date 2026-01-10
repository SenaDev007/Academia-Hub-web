/**
 * ============================================================================
 * CNSS PRISMA SERVICE - MODULE 5
 * ============================================================================
 * 
 * Service pour la gestion CNSS et déclarations sociales
 * 
 * ============================================================================
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CNSSPrismaService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // EMPLOYEE CNSS
  // ============================================================================

  /**
   * Active CNSS pour un employé
   */
  async activateCNSS(data: {
    tenantId: string;
    staffId: string;
    cnssNumber?: string;
    affiliationDate?: Date;
  }) {
    // Vérifier qu'il n'y a pas déjà un CNSS actif
    const existing = await this.prisma.employeeCNSS.findUnique({
      where: { staffId: data.staffId },
    });

    if (existing) {
      throw new BadRequestException(`CNSS already activated for this staff member`);
    }

    // Vérifier que le personnel a un contrat actif de type CDI ou CDD
    const contract = await this.prisma.contract.findFirst({
      where: {
        staffId: data.staffId,
        status: 'ACTIVE',
      },
    });

    if (!contract) {
      throw new BadRequestException(`No active contract found for staff ${data.staffId}`);
    }

    if (contract.contractType === 'VACATION') {
      throw new BadRequestException('Vacation contracts are not eligible for CNSS');
    }

    return this.prisma.employeeCNSS.create({
      data: {
        ...data,
        isActive: true,
        affiliationDate: data.affiliationDate || new Date(),
      },
    });
  }

  /**
   * Désactive CNSS pour un employé
   */
  async deactivateCNSS(staffId: string, tenantId: string) {
    const employeeCNSS = await this.prisma.employeeCNSS.findFirst({
      where: {
        staffId,
        tenantId,
      },
    });

    if (!employeeCNSS) {
      throw new NotFoundException(`CNSS not found for staff ${staffId}`);
    }

    return this.prisma.employeeCNSS.update({
      where: { id: employeeCNSS.id },
      data: { isActive: false },
    });
  }

  /**
   * Récupère tous les employés CNSS
   */
  async findAllEmployeeCNSS(tenantId: string, filters?: {
    isActive?: boolean;
  }) {
    const where: any = { tenantId };
    
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return this.prisma.employeeCNSS.findMany({
      where,
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
    });
  }

  // ============================================================================
  // CNSS RATES
  // ============================================================================

  /**
   * Crée ou met à jour un taux CNSS
   */
  async setCNSSRate(data: {
    countryCode: string;
    employeeRate: number;
    employerRate: number;
    salaryCeiling?: number;
    effectiveFrom: Date;
  }) {
    // Vérifier qu'il n'y a pas déjà un taux pour cette date
    const existing = await this.prisma.cNSSRate.findFirst({
      where: {
        countryCode: data.countryCode,
        effectiveFrom: data.effectiveFrom,
      },
    });

    if (existing) {
      return this.prisma.cNSSRate.update({
        where: { id: existing.id },
        data,
      });
    }

    return this.prisma.cNSSRate.create({
      data,
    });
  }

  /**
   * Récupère le taux CNSS actuel
   */
  async getCurrentCNSSRate(countryCode: string) {
    const now = new Date();
    
    return this.prisma.cNSSRate.findFirst({
      where: {
        countryCode,
        effectiveFrom: { lte: now },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: now } },
        ],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  // ============================================================================
  // CNSS DECLARATIONS
  // ============================================================================

  /**
   * Crée une déclaration CNSS
   */
  async createCNSSDeclaration(data: {
    tenantId: string;
    academicYearId: string;
    month: string;
  }) {
    // Vérifier l'unicité
    const existing = await this.prisma.cNSSDeclaration.findUnique({
      where: {
        tenantId_academicYearId_month: {
          tenantId: data.tenantId,
          academicYearId: data.academicYearId,
          month: data.month,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(`CNSS declaration for month ${data.month} already exists`);
    }

    // Récupérer tous les employés CNSS actifs
    const employeesCNSS = await this.prisma.employeeCNSS.findMany({
      where: {
        tenantId: data.tenantId,
        isActive: true,
      },
      include: {
        staff: true,
      },
    });

    // Récupérer le taux CNSS actuel
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: data.tenantId },
      include: { country: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${data.tenantId} not found`);
    }

    const cnssRate = await this.getCurrentCNSSRate(tenant.country.code || 'BJ');

    if (!cnssRate) {
      throw new BadRequestException('No CNSS rate configured for this country');
    }

    // Récupérer les paies validées pour ce mois
    const payroll = await this.prisma.payroll.findFirst({
      where: {
        tenantId: data.tenantId,
        academicYearId: data.academicYearId,
        month: data.month,
        status: 'VALIDATED',
      },
      include: {
        items: {
          include: {
            staff: true,
          },
        },
      },
    });

    if (!payroll) {
      throw new BadRequestException(`No validated payroll found for month ${data.month}`);
    }

    // Créer la déclaration
    const declaration = await this.prisma.cNSSDeclaration.create({
      data: {
        ...data,
        status: 'DRAFT',
        totalAmount: 0,
      },
    });

    // Créer les lignes de déclaration
    let totalEmployeeShare = 0;
    let totalEmployerShare = 0;

    for (const item of payroll.items) {
      const employeeCNSS = employeesCNSS.find(e => e.staffId === item.staffId);
      
      if (employeeCNSS) {
        const grossSalary = Number(item.baseSalary) + Number(item.overtimeAmount) + Number(item.bonuses);
        const employeeShare = grossSalary * Number(cnssRate.employeeRate);
        const employerShare = grossSalary * Number(cnssRate.employerRate);

        await this.prisma.cNSSDeclarationLine.create({
          data: {
            cnssDeclarationId: declaration.id,
            employeeCNSSId: employeeCNSS.id,
            grossSalary,
            employeeShare,
            employerShare,
          },
        });

        totalEmployeeShare += employeeShare;
        totalEmployerShare += employerShare;
      }
    }

    // Mettre à jour la déclaration
    return this.prisma.cNSSDeclaration.update({
      where: { id: declaration.id },
      data: {
        totalEmployeeShare,
        totalEmployerShare,
        totalAmount: totalEmployeeShare + totalEmployerShare,
      },
      include: {
        lines: {
          include: {
            employeeCNSS: {
              include: {
                staff: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Récupère toutes les déclarations CNSS
   */
  async findAllCNSSDeclarations(tenantId: string, filters?: {
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

    return this.prisma.cNSSDeclaration.findMany({
      where,
      include: {
        lines: {
          include: {
            employeeCNSS: {
              include: {
                staff: true,
              },
            },
          },
        },
      },
      orderBy: { month: 'desc' },
    });
  }

  /**
   * Marque une déclaration comme déclarée
   */
  async markDeclarationAsDeclared(id: string, tenantId: string) {
    const declaration = await this.prisma.cNSSDeclaration.findFirst({
      where: { id, tenantId },
    });

    if (!declaration) {
      throw new NotFoundException(`CNSS declaration with ID ${id} not found`);
    }

    return this.prisma.cNSSDeclaration.update({
      where: { id },
      data: {
        status: 'DECLARED',
        declaredAt: new Date(),
      },
    });
  }

  /**
   * Marque une déclaration comme payée
   */
  async markDeclarationAsPaid(id: string, tenantId: string, paymentReference: string, paymentProofPath?: string) {
    const declaration = await this.prisma.cNSSDeclaration.findFirst({
      where: { id, tenantId },
    });

    if (!declaration) {
      throw new NotFoundException(`CNSS declaration with ID ${id} not found`);
    }

    if (declaration.status !== 'DECLARED') {
      throw new BadRequestException('Only declared declarations can be marked as paid');
    }

    return this.prisma.cNSSDeclaration.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paymentReference,
        paymentProofPath,
      },
    });
  }
}

