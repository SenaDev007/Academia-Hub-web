/**
 * ============================================================================
 * STUDENTS ORION SERVICE - MODULE 1
 * ============================================================================
 * 
 * Service ORION pour alertes matricule et cartes scolaires
 * 
 * ============================================================================
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StudentIdentifierService } from './student-identifier.service';
import { StudentIdCardService } from './student-id-card.service';

@Injectable()
export class StudentsOrionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly identifierService: StudentIdentifierService,
    private readonly idCardService: StudentIdCardService,
  ) {}

  /**
   * Récupère les KPIs pour ORION (matricule et cartes)
   */
  async getStudentIdentificationKPIs(tenantId: string, academicYearId?: string) {
    const where: any = { tenantId };
    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    // Statistiques des matricules
    const matriculeStats = await this.identifierService.getMatriculeStats(tenantId, academicYearId);

    // Statistiques des cartes
    const idCardStats = await this.idCardService.getIdCardStats(tenantId, academicYearId);

    // Élèves actifs
    const students = await this.prisma.student.findMany({
      where: {
        ...where,
        status: 'ACTIVE',
      },
      include: {
        identifier: true,
      },
    });

    // Récupérer les cartes actives
    const activeCards = await this.prisma.studentIdCard.findMany({
      where: {
        tenantId,
        ...(academicYearId && { academicYearId }),
        isActive: true,
        isRevoked: false,
      },
      select: {
        studentId: true,
      },
    });

    const studentsWithActiveCards = new Set(activeCards.map((c) => c.studentId));

    const studentsWithoutMatricule = students.filter((s) => !s.identifier);
    const studentsWithTemporaryMatricule = students.filter(
      (s) => s.identifier?.isOfflineGenerated && !s.identifier.synchronizedAt,
    );
    const studentsWithoutIdCard = students.filter((s) => !studentsWithActiveCards.has(s.id));

    return {
      matricule: {
        ...matriculeStats,
        studentsWithoutMatricule: studentsWithoutMatricule.length,
        studentsWithTemporaryMatricule: studentsWithTemporaryMatricule.length,
        coverageRate:
          students.length > 0
            ? ((students.length - studentsWithoutMatricule.length) / students.length) * 100
            : 0,
      },
      idCard: {
        ...idCardStats,
        studentsWithoutIdCard: studentsWithoutIdCard.length,
        coverageRate:
          students.length > 0 ? ((students.length - studentsWithoutIdCard.length) / students.length) * 100 : 0,
      },
      alerts: await this.generateAlerts(tenantId, academicYearId),
    };
  }

  /**
   * Génère les alertes ORION pour matricule et cartes
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

    // Récupérer les cartes actives pour réutilisation
    const activeCards = await this.prisma.studentIdCard.findMany({
      where: {
        tenantId,
        ...(academicYearId && { academicYearId }),
        isActive: true,
        isRevoked: false,
      },
      select: {
        studentId: true,
      },
    });

    const studentsWithActiveCards = new Set(activeCards.map((c) => c.studentId));

    // 1. Élèves actifs sans matricule (CRITICAL)
    const studentsWithoutMatricule = await this.prisma.student.findMany({
      where: {
        ...where,
        status: 'ACTIVE',
        identifier: null,
      },
    });

    if (studentsWithoutMatricule.length > 0) {
      alerts.push({
        severity: 'CRITICAL',
        category: 'MISSING_MATRICULE',
        title: 'Élèves actifs sans matricule',
        description: `${studentsWithoutMatricule.length} élève(s) actif(s) sans matricule global unique`,
        recommendation:
          'Générer les matricules pour tous les élèves actifs. Le matricule est obligatoire pour les examens et la conformité institutionnelle.',
        count: studentsWithoutMatricule.length,
      });
    }

    // 2. Matricules temporaires non synchronisés (HIGH)
    const temporaryMatricules = await this.prisma.studentIdentifier.findMany({
      where: {
        tenantId,
        isOfflineGenerated: true,
        synchronizedAt: null,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            status: true,
          },
        },
      },
    });

    if (temporaryMatricules.length > 0) {
      alerts.push({
        severity: 'HIGH',
        category: 'UNSYNCHRONIZED_MATRICULE',
        title: 'Matricules temporaires non synchronisés',
        description: `${temporaryMatricules.length} matricule(s) temporaire(s) en attente de synchronisation`,
        recommendation:
          'Synchroniser les matricules temporaires avec les matricules définitifs. Ces élèves ont été créés en mode offline.',
        count: temporaryMatricules.length,
      });
    }

    // 3. Doublons bloqués (peut arriver en cas de collision, mais normalement bloqué par contrainte SQL)
    // Cette alerte serait loggée si une collision était détectée lors de la génération

    // 4. Cartes non générées pour élèves examinés (HIGH)
    const studentsWithExams = await this.prisma.student.findMany({
      where: {
        ...where,
        status: 'ACTIVE',
        examScores: {
          some: academicYearId ? { academicYearId } : {},
        },
      },
      select: {
        id: true,
      },
    });

    const studentsWithExamsIds = new Set(studentsWithExams.map((s) => s.id));
    const studentsWithExamsButNoCard = studentsWithExams.filter(
      (s) => !studentsWithActiveCards.has(s.id),
    );

    if (studentsWithExamsButNoCard.length > 0) {
      alerts.push({
        severity: 'HIGH',
        category: 'MISSING_ID_CARD_FOR_EXAM',
        title: 'Cartes non générées pour élèves examinés',
        description: `${studentsWithExamsButNoCard.length} élève(s) ayant passé des examens sans carte scolaire active`,
        recommendation:
          'Générer les cartes scolaires pour les élèves concernés. La carte est obligatoire pour les examens officiels.',
        count: studentsWithExamsButNoCard.length,
      });
    }

    // 5. Cartes expirées (MEDIUM)
    const expiredCards = await this.prisma.studentIdCard.findMany({
      where: {
        tenantId,
        ...(academicYearId && { academicYearId }),
        isActive: true,
        isRevoked: false,
        validUntil: {
          lt: new Date(),
        },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            status: true,
          },
        },
      },
    });

    if (expiredCards.length > 0) {
      alerts.push({
        severity: 'MEDIUM',
        category: 'EXPIRED_ID_CARDS',
        title: 'Cartes scolaires expirées',
        description: `${expiredCards.length} carte(s) scolaire(s) expirée(s) (fin d'année scolaire)`,
        recommendation:
          'Générer de nouvelles cartes pour l\'année scolaire en cours pour les élèves concernés.',
        count: expiredCards.length,
      });
    }

    // 6. Incohérence identité / classe (LOW)
    const studentsWithInconsistency = await this.prisma.student.findMany({
      where: {
        ...where,
        status: 'ACTIVE',
      },
      include: {
        identifier: true,
        studentEnrollments: {
          where: {
            ...(academicYearId && { academicYearId }),
            status: 'ACTIVE',
          },
          include: {
            class: true,
          },
        },
      },
    });

    // Détecter les incohérences (élève sans classe active mais avec carte, etc.)
    const inconsistencies = studentsWithInconsistency.filter((s) => {
      const hasActiveEnrollment = s.studentEnrollments.length > 0;
      const hasActiveCard = studentsWithActiveCards.has(s.id);
      // Si pas d'inscription active mais carte active → incohérence
      return !hasActiveEnrollment && hasActiveCard;
    });

    if (inconsistencies.length > 0) {
      alerts.push({
        severity: 'LOW',
        category: 'IDENTITY_INCONSISTENCY',
        title: 'Incohérences identité / classe',
        description: `${inconsistencies.length} élève(s) avec incohérence entre statut d'inscription et carte scolaire`,
        recommendation: 'Vérifier et corriger les incohérences dans les données des élèves.',
        count: inconsistencies.length,
      });
    }

    // 7. Cartes révoquées nombreuses (LOW)
    const revokedCards = await this.prisma.studentIdCard.findMany({
      where: {
        tenantId,
        ...(academicYearId && { academicYearId }),
        isRevoked: true,
      },
    });

    if (revokedCards.length > 10) {
      alerts.push({
        severity: 'LOW',
        category: 'HIGH_REVOCATION_RATE',
        title: 'Taux de révocation élevé',
        description: `${revokedCards.length} carte(s) scolaire(s) révoquée(s) (perdues, volées, etc.)`,
        recommendation:
          'Analyser les motifs de révocation et mettre en place des mesures préventives (laminage, protections, etc.).',
        count: revokedCards.length,
      });
    }

    return alerts.sort((a, b) => {
      const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }
}


