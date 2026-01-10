/**
 * ============================================================================
 * INCIDENTS PRISMA SERVICE - MODULE 7
 * ============================================================================
 * Gestion des incidents QHSE (HYGIENE | SECURITE | SANTE | DISCIPLINE | INFRA)
 * ============================================================================
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class IncidentsPrismaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer un incident
   */
  async createIncident(tenantId: string, data: {
    academicYearId: string;
    schoolLevelId?: string;
    studentId?: string;
    classId?: string;
    inspectionId?: string;
    incidentType: string;
    severity: string;
    description: string;
    occurredAt: Date;
    location?: string;
    reportedByUserId?: string;
  }) {
    return this.prisma.incident.create({
      data: {
        tenantId,
        ...data,
        status: 'OPEN',
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentCode: true } },
        class: { select: { id: true, name: true, code: true } },
        academicYear: { select: { id: true, label: true } },
        schoolLevel: { select: { id: true, code: true, label: true } },
        reportedBy: { select: { id: true, firstName: true, lastName: true } },
        attachments: true,
        actions: {
          include: {
            responsible: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  /**
   * Récupérer tous les incidents d'un tenant
   */
  async findAllIncidents(tenantId: string, filters?: {
    academicYearId?: string;
    schoolLevelId?: string;
    incidentType?: string;
    severity?: string;
    status?: string;
    studentId?: string;
    classId?: string;
  }) {
    return this.prisma.incident.findMany({
      where: {
        tenantId,
        ...filters,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentCode: true } },
        class: { select: { id: true, name: true, code: true } },
        academicYear: { select: { id: true, label: true } },
        schoolLevel: { select: { id: true, code: true, label: true } },
        reportedBy: { select: { id: true, firstName: true, lastName: true } },
        closedBy: { select: { id: true, firstName: true, lastName: true } },
        _count: {
          select: {
            attachments: true,
            actions: true,
          },
        },
      },
      orderBy: { occurredAt: 'desc' },
    });
  }

  /**
   * Récupérer un incident par ID
   */
  async findIncidentById(tenantId: string, id: string) {
    return this.prisma.incident.findFirst({
      where: { id, tenantId },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentCode: true } },
        class: { select: { id: true, name: true, code: true } },
        academicYear: { select: { id: true, label: true } },
        schoolLevel: { select: { id: true, code: true, label: true } },
        reportedBy: { select: { id: true, firstName: true, lastName: true } },
        closedBy: { select: { id: true, firstName: true, lastName: true } },
        attachments: true,
        actions: {
          include: {
            responsible: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { dueDate: 'asc' },
        },
      },
    });
  }

  /**
   * Mettre à jour un incident
   */
  async updateIncident(tenantId: string, id: string, data: {
    incidentType?: string;
    severity?: string;
    description?: string;
    location?: string;
    status?: string;
  }) {
    return this.prisma.incident.update({
      where: { id },
      data,
    });
  }

  /**
   * Fermer un incident
   */
  async closeIncident(tenantId: string, id: string, closedByUserId: string) {
    // Vérifier qu'il y a des actions documentées avant de fermer
    const incident = await this.prisma.incident.findFirst({
      where: { id, tenantId },
      include: {
        actions: true,
      },
    });

    if (!incident) {
      throw new Error('Incident not found');
    }

    if (incident.severity === 'CRITICAL' && incident.actions.length === 0) {
      throw new Error('Cannot close a CRITICAL incident without documented actions');
    }

    return this.prisma.incident.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedByUserId,
      },
    });
  }

  /**
   * Ajouter une pièce jointe à un incident
   */
  async addAttachment(tenantId: string, incidentId: string, data: {
    fileName: string;
    filePath: string;
    fileSize?: number;
    mimeType?: string;
    uploadedBy?: string;
  }) {
    // Vérifier que l'incident appartient au tenant
    const incident = await this.prisma.incident.findFirst({
      where: { id: incidentId, tenantId },
    });

    if (!incident) {
      throw new Error('Incident not found or does not belong to tenant');
    }

    return this.prisma.incidentAttachment.create({
      data: {
        incidentId,
        ...data,
      },
    });
  }

  /**
   * Ajouter une action corrective à un incident
   */
  async addAction(tenantId: string, incidentId: string, data: {
    actionDescription: string;
    responsibleUserId?: string;
    dueDate: Date;
    notes?: string;
  }) {
    // Vérifier que l'incident appartient au tenant
    const incident = await this.prisma.incident.findFirst({
      where: { id: incidentId, tenantId },
    });

    if (!incident) {
      throw new Error('Incident not found or does not belong to tenant');
    }

    return this.prisma.incidentAction.create({
      data: {
        incidentId,
        ...data,
        status: 'PENDING',
      },
      include: {
        responsible: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  /**
   * Marquer une action comme terminée
   */
  async completeAction(tenantId: string, incidentId: string, actionId: string) {
    return this.prisma.incidentAction.update({
      where: { id: actionId },
      data: {
        status: 'DONE',
        completedAt: new Date(),
      },
    });
  }

  /**
   * Supprimer un incident (seulement si OPEN et sans actions)
   */
  async deleteIncident(tenantId: string, id: string) {
    const incident = await this.prisma.incident.findFirst({
      where: { id, tenantId },
      include: {
        actions: true,
        attachments: true,
      },
    });

    if (!incident) {
      throw new Error('Incident not found');
    }

    if (incident.status !== 'OPEN') {
      throw new Error('Cannot delete an incident that has been processed');
    }

    if (incident.actions.length > 0) {
      throw new Error('Cannot delete an incident with actions');
    }

    return this.prisma.incident.delete({
      where: { id },
    });
  }
}

