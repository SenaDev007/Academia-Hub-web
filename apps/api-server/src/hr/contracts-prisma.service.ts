/**
 * ============================================================================
 * CONTRACTS PRISMA SERVICE - MODULE 5
 * ============================================================================
 * 
 * Service pour la gestion des contrats de travail
 * 
 * ============================================================================
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ContractsPrismaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée un contrat de travail
   */
  async createContract(data: {
    tenantId: string;
    academicYearId?: string;
    schoolLevelId?: string;
    staffId: string;
    templateId?: string;
    contractType: string;
    startDate: Date;
    endDate?: Date;
    baseSalary: number;
    paymentMode?: string;
    terms?: any;
    signedAt?: Date;
    signedBy?: string;
  }) {
    // Vérifier qu'il n'y a pas déjà un contrat actif pour ce personnel
    const activeContract = await this.prisma.contract.findFirst({
      where: {
        staffId: data.staffId,
        status: 'ACTIVE',
      },
    });

    if (activeContract) {
      // Désactiver l'ancien contrat
      await this.prisma.contract.update({
        where: { id: activeContract.id },
        data: { status: 'EXPIRED' },
      });
    }

    return this.prisma.contract.create({
      data: {
        ...data,
        paymentMode: data.paymentMode || 'BANK',
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Récupère tous les contrats
   */
  async findAllContracts(tenantId: string, filters?: {
    staffId?: string;
    contractType?: string;
    status?: string;
  }) {
    const where: any = { tenantId };
    
    if (filters?.staffId) {
      where.staffId = filters.staffId;
    }
    if (filters?.contractType) {
      where.contractType = filters.contractType;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.contract.findMany({
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
        template: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Récupère un contrat par ID
   */
  async findContractById(id: string, tenantId: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, tenantId },
      include: {
        staff: true,
        template: true,
      },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return contract;
  }

  /**
   * Met à jour un contrat
   */
  async updateContract(id: string, tenantId: string, data: any) {
    const contract = await this.findContractById(id, tenantId);

    return this.prisma.contract.update({
      where: { id },
      data,
    });
  }

  /**
   * Termine un contrat
   */
  async terminateContract(id: string, tenantId: string, reason: string) {
    const contract = await this.findContractById(id, tenantId);

    return this.prisma.contract.update({
      where: { id },
      data: {
        status: 'TERMINATED',
        terminatedAt: new Date(),
        terminationReason: reason,
      },
    });
  }

  /**
   * Récupère le contrat actif d'un membre du personnel
   */
  async findActiveContract(staffId: string, tenantId: string) {
    return this.prisma.contract.findFirst({
      where: {
        staffId,
        tenantId,
        status: 'ACTIVE',
      },
      include: {
        template: true,
      },
    });
  }
}

