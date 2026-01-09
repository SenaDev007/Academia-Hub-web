/**
 * ============================================================================
 * ORION ALERTS SERVICE
 * ============================================================================
 * 
 * Service pour générer des alertes ORION basées sur :
 * - QHSE+ (incidents critiques, risques élevés)
 * - KPI Objectives (écarts objectif vs réel)
 * - Automatisation (règles déclenchées)
 * 
 * PRINCIPE : ORION est READ-ONLY, il observe et alerte uniquement
 * ============================================================================
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export enum OrionAlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export enum OrionAlertType {
  PEDAGOGICAL = 'PEDAGOGICAL',
  FINANCIAL = 'FINANCIAL',
  QHSE = 'QHSE',
  RH = 'RH',
  OPERATIONAL = 'OPERATIONAL',
  STRATEGIC = 'STRATEGIC',
}

@Injectable()
export class OrionAlertsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Génère des alertes basées sur les incidents QHSE critiques
   */
  async generateQhsAlerts(tenantId: string, academicYearId?: string): Promise<any[]> {
    const where: any = {
      tenantId,
      gravity: 'CRITIQUE',
      status: { in: ['OUVERT', 'EN_COURS'] },
    };

    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    const criticalIncidents = await this.prisma.qhsIncident.findMany({
      where,
      include: {
        academicYear: { select: { label: true } },
        schoolLevel: { select: { code: true, label: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Vérifier les incidents critiques répétés
    const repeatedIncidents = await this.prisma.qhsIncident.groupBy({
      by: ['type', 'category'],
      where: {
        tenantId,
        gravity: 'CRITIQUE',
        ...(academicYearId && { academicYearId }),
      },
      _count: true,
      having: {
        _count: {
          type: { gt: 2 }, // Plus de 2 incidents du même type
        },
      },
    });

    const alerts: any[] = [];

    // Alerte pour incidents critiques ouverts
    if (criticalIncidents.length > 0) {
      alerts.push({
        type: OrionAlertType.QHSE,
        severity: OrionAlertSeverity.CRITICAL,
        title: `${criticalIncidents.length} incident(s) critique(s) en cours`,
        description: `Des incidents critiques nécessitent une attention immédiate.`,
        recommendation: 'Examiner et traiter les incidents critiques dans le module QHSE.',
        metadata: {
          source: 'QHSE_INCIDENTS',
          count: criticalIncidents.length,
          incidents: criticalIncidents.map((i) => ({
            id: i.id,
            title: i.title,
            type: i.type,
            createdAt: i.createdAt,
          })),
        },
      });
    }

    // Alerte pour incidents répétés
    if (repeatedIncidents.length > 0) {
      alerts.push({
        type: OrionAlertType.QHSE,
        severity: OrionAlertSeverity.WARNING,
        title: 'Incidents critiques répétés détectés',
        description: `Plusieurs incidents critiques du même type ont été signalés. Analyse de tendance recommandée.`,
        recommendation: 'Analyser les causes racines et mettre en place des actions préventives.',
        metadata: {
          source: 'QHSE_REPEATED_INCIDENTS',
          patterns: repeatedIncidents,
        },
      });
    }

    return alerts;
  }

  /**
   * Génère des alertes basées sur les risques QHSE élevés
   */
  async generateRiskAlerts(tenantId: string, academicYearId?: string): Promise<any[]> {
    const where: any = {
      tenantId,
      level: { in: ['ELEVE', 'CRITIQUE'] },
      status: { in: ['ACTIF', 'EN_SURVEILLANCE'] },
    };

    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    const highRisks = await this.prisma.qhsRiskRegister.findMany({
      where,
      include: {
        academicYear: { select: { label: true } },
        schoolLevel: { select: { code: true, label: true } },
      },
      orderBy: { level: 'desc' },
    });

    const alerts: any[] = [];

    if (highRisks.length > 0) {
      alerts.push({
        type: OrionAlertType.QHSE,
        severity: OrionAlertSeverity.WARNING,
        title: `${highRisks.length} risque(s) élevé(s) non mitigé(s)`,
        description: `Des risques élevés ou critiques nécessitent une attention.`,
        recommendation: 'Examiner le registre des risques et mettre en place des mesures de mitigation.',
        metadata: {
          source: 'QHSE_RISK_REGISTER',
          count: highRisks.length,
          risks: highRisks.map((r) => ({
            id: r.id,
            code: r.code,
            title: r.title,
            level: r.level,
            probability: r.probability,
            impact: r.impact,
          })),
        },
      });
    }

    return alerts;
  }

  /**
   * Génère des alertes basées sur les écarts KPI (objectif vs réel)
   */
  async generateKpiAlerts(tenantId: string, academicYearId?: string): Promise<any[]> {
    // Récupérer les objectifs avec leurs valeurs réelles
    const objectives = await this.prisma.kpiObjective.findMany({
      where: {
        tenantId,
        ...(academicYearId && { academicYearId }),
        status: { in: ['ACTIVE', 'AT_RISK', 'OFF_TRACK'] },
      },
      include: {
        kpi: {
          select: {
            id: true,
            name: true,
            code: true,
            category: true,
            unit: true,
          },
        },
        academicYear: { select: { label: true } },
      },
    });

    const alerts: any[] = [];

    for (const objective of objectives) {
      // Récupérer la dernière snapshot pour ce KPI
      const latestSnapshot = await this.prisma.kpiSnapshot.findFirst({
        where: {
          tenantId,
          kpiId: objective.kpiId,
          academicYearId: objective.academicYearId,
          schoolLevelId: objective.schoolLevelId || null,
        },
        orderBy: { calculatedAt: 'desc' },
      });

      if (!latestSnapshot) continue;

      const actualValue = latestSnapshot.value;
      const gap = actualValue - objective.targetValue;
      const percentageGap =
        objective.targetValue !== 0 ? (gap / objective.targetValue) * 100 : 0;

      // Alerte si écart significatif (> 10% ou hors limites acceptables)
      const isOffTrack =
        (objective.minAcceptable && actualValue < objective.minAcceptable) ||
        (objective.maxAcceptable && actualValue > objective.maxAcceptable) ||
        Math.abs(percentageGap) > 10;

      if (isOffTrack) {
        alerts.push({
          type: this.getKpiAlertType(objective.kpi.category),
          severity:
            Math.abs(percentageGap) > 20
              ? OrionAlertSeverity.CRITICAL
              : OrionAlertSeverity.WARNING,
          title: `Écart détecté : ${objective.kpi.name}`,
          description: `L'objectif de ${objective.targetValue} ${objective.kpi.unit || ''} n'est pas atteint. Valeur actuelle : ${actualValue} ${objective.kpi.unit || ''} (écart : ${percentageGap.toFixed(1)}%)`,
          recommendation: 'Analyser les causes de l\'écart et ajuster les actions si nécessaire.',
          metadata: {
            source: 'KPI_OBJECTIVES',
            objectiveId: objective.id,
            kpiId: objective.kpiId,
            kpiCode: objective.kpi.code,
            targetValue: objective.targetValue,
            actualValue,
            gap,
            percentageGap: parseFloat(percentageGap.toFixed(2)),
            period: objective.period,
          },
        });
      }
    }

    return alerts;
  }

  /**
   * Génère toutes les alertes ORION pour un tenant
   */
  async generateAllAlerts(tenantId: string, academicYearId?: string): Promise<any[]> {
    const [qhsAlerts, riskAlerts, kpiAlerts] = await Promise.all([
      this.generateQhsAlerts(tenantId, academicYearId),
      this.generateRiskAlerts(tenantId, academicYearId),
      this.generateKpiAlerts(tenantId, academicYearId),
    ]);

    const allAlerts = [...qhsAlerts, ...riskAlerts, ...kpiAlerts];

    // Sauvegarder les alertes dans la table orion_alerts
    if (allAlerts.length > 0) {
      await Promise.all(
        allAlerts.map((alert) =>
          this.prisma.orionAlert.create({
            data: {
              tenantId,
              academicYearId: academicYearId || null,
              alertType: alert.type,
              severity: alert.severity,
              title: alert.title,
              description: alert.description,
              recommendation: alert.recommendation,
              status: 'ACTIVE',
              metadata: alert.metadata,
            },
          }),
        ),
      );
    }

    return allAlerts;
  }

  /**
   * Récupère les alertes ORION actives pour un tenant
   */
  async getActiveAlerts(tenantId: string, academicYearId?: string): Promise<any[]> {
    const where: any = {
      tenantId,
      status: 'ACTIVE',
    };

    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    return this.prisma.orionAlert.findMany({
      where,
      orderBy: [
        { severity: 'desc' }, // CRITICAL en premier
        { createdAt: 'desc' },
      ],
      take: 50,
    });
  }

  /**
   * Marque une alerte comme résolue
   */
  async acknowledgeAlert(
    alertId: string,
    tenantId: string,
    userId: string,
  ): Promise<void> {
    await this.prisma.orionAlert.updateMany({
      where: {
        id: alertId,
        tenantId,
      },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedAt: new Date(),
        acknowledgedBy: userId,
      },
    });
  }

  /**
   * Convertit la catégorie KPI en type d'alerte ORION
   */
  private getKpiAlertType(category: string | null): OrionAlertType {
    if (!category) return OrionAlertType.OPERATIONAL;

    const categoryUpper = category.toUpperCase();
    if (categoryUpper.includes('PEDAGOGICAL') || categoryUpper.includes('PEDAGOGIE')) {
      return OrionAlertType.PEDAGOGICAL;
    }
    if (categoryUpper.includes('FINANCIAL') || categoryUpper.includes('FINANCE')) {
      return OrionAlertType.FINANCIAL;
    }
    if (categoryUpper.includes('RH') || categoryUpper.includes('HR')) {
      return OrionAlertType.RH;
    }
    return OrionAlertType.OPERATIONAL;
  }
}

