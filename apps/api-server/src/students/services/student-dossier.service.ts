/**
 * ============================================================================
 * STUDENT DOSSIER SERVICE - DOSSIER SCOLAIRE NUMÉRIQUE ÉLÈVE
 * ============================================================================
 * 
 * Service pour gérer le dossier scolaire numérique complet de l'élève
 * Centralise toute la vie scolaire : parcours, résultats, discipline, documents
 * 
 * ============================================================================
 */

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class StudentDossierService {
  private readonly logger = new Logger(StudentDossierService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère le dossier scolaire complet d'un élève
   */
  async getStudentDossier(
    tenantId: string,
    studentId: string,
    academicYearId?: string,
  ): Promise<any> {
    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        tenantId,
      },
      include: {
        identifier: true,
        idCards: {
          where: academicYearId ? { academicYearId } : undefined,
          orderBy: { generatedAt: 'desc' },
          take: 1,
        },
        tenant: {
          include: {
            schools: {
              take: 1,
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Élève non trouvé');
    }

    // Récupérer les enregistrements académiques
    const academicRecords = await this.prisma.studentAcademicRecord.findMany({
      where: {
        studentId,
        ...(academicYearId && { academicYearId }),
      },
      include: {
        academicYear: true,
        class: true,
        schoolLevel: true,
      },
      orderBy: {
        academicYear: {
          startDate: 'desc',
        },
      },
    });

    // Récupérer les résumés disciplinaires
    const disciplinarySummaries = await this.prisma.studentDisciplinarySummary.findMany({
      where: {
        studentId,
        ...(academicYearId && { academicYearId }),
      },
      include: {
        academicYear: true,
      },
      orderBy: {
        academicYear: {
          startDate: 'desc',
        },
      },
    });

    // Récupérer les documents
    const documents = await this.prisma.studentDocument.findMany({
      where: {
        studentId,
        ...(academicYearId && { academicYearId }),
      },
      include: {
        academicYear: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Récupérer les bulletins
    const reportCards = await this.prisma.reportCard.findMany({
      where: {
        studentId,
        ...(academicYearId && { academicYearId }),
      },
      include: {
        academicYear: true,
        quarters: true,
      },
      orderBy: {
        academicYear: {
          startDate: 'desc',
        },
      },
    });

    // Récupérer les absences
    const absences = await this.prisma.absence.findMany({
      where: {
        studentId,
        ...(academicYearId && { academicYearId }),
      },
      include: {
        academicYear: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 50, // Limiter à 50 dernières
    });

    // Récupérer les incidents disciplinaires
    const disciplinaryActions = await this.prisma.disciplinaryAction.findMany({
      where: {
        studentId,
        ...(academicYearId && { academicYearId }),
      },
      include: {
        academicYear: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 50, // Limiter à 50 derniers
    });

    // Récupérer le profil tarifaire pour l'année scolaire
    let feeProfile = null;
    if (academicYearId) {
      feeProfile = await this.prisma.studentFeeProfile.findUnique({
        where: {
          studentId_academicYearId: {
            studentId,
            academicYearId,
          },
        },
        include: {
          feeRegime: {
            include: {
              rules: true,
            },
          },
          validator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    }

    return {
      identity: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        nationality: student.nationality,
        matricule: student.identifier?.globalMatricule || null,
        status: student.status,
        institution: student.tenant.schools?.[0]?.name || student.tenant.name,
      },
      academicRecords,
      disciplinarySummaries,
      documents,
      reportCards,
      recentAbsences: absences,
      recentDisciplinaryActions: disciplinaryActions,
      currentIdCard: student.idCards?.[0] || null,
      feeProfile,
    };
  }

  /**
   * Crée ou met à jour un enregistrement académique
   */
  async upsertAcademicRecord(
    tenantId: string,
    studentId: string,
    academicYearId: string,
    data: {
      classId?: string;
      schoolLevelId: string;
      level?: string;
      enrollmentStatus?: string;
      averageScore?: number;
      rank?: number;
      totalAbsences?: number;
      totalIncidents?: number;
      totalSanctions?: number;
      notes?: any;
    },
  ) {
    // Vérifier que l'élève existe
    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        tenantId,
      },
    });

    if (!student) {
      throw new NotFoundException('Élève non trouvé');
    }

    return this.prisma.studentAcademicRecord.upsert({
      where: {
        studentId_academicYearId: {
          studentId,
          academicYearId,
        },
      },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        studentId,
        academicYearId,
        schoolLevelId: data.schoolLevelId,
        classId: data.classId,
        level: data.level,
        enrollmentStatus: data.enrollmentStatus || 'ACTIVE',
        averageScore: data.averageScore ? data.averageScore : null,
        rank: data.rank || null,
        totalAbsences: data.totalAbsences || 0,
        totalIncidents: data.totalIncidents || 0,
        totalSanctions: data.totalSanctions || 0,
        notes: data.notes || null,
      },
    });
  }

  /**
   * Crée ou met à jour un résumé disciplinaire
   */
  async upsertDisciplinarySummary(
    tenantId: string,
    studentId: string,
    academicYearId: string,
    data: {
      absencesCount?: number;
      justifiedAbsences?: number;
      unjustifiedAbsences?: number;
      incidentsCount?: number;
      minorIncidents?: number;
      majorIncidents?: number;
      sanctionsCount?: number;
      warningsCount?: number;
      suspensionsCount?: number;
      expulsionsCount?: number;
      lastIncidentDate?: Date;
      lastSanctionDate?: Date;
      notes?: any;
    },
  ) {
    // Vérifier que l'élève existe
    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        tenantId,
      },
    });

    if (!student) {
      throw new NotFoundException('Élève non trouvé');
    }

    return this.prisma.studentDisciplinarySummary.upsert({
      where: {
        studentId_academicYearId: {
          studentId,
          academicYearId,
        },
      },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        studentId,
        academicYearId,
        absencesCount: data.absencesCount || 0,
        justifiedAbsences: data.justifiedAbsences || 0,
        unjustifiedAbsences: data.unjustifiedAbsences || 0,
        incidentsCount: data.incidentsCount || 0,
        minorIncidents: data.minorIncidents || 0,
        majorIncidents: data.majorIncidents || 0,
        sanctionsCount: data.sanctionsCount || 0,
        warningsCount: data.warningsCount || 0,
        suspensionsCount: data.suspensionsCount || 0,
        expulsionsCount: data.expulsionsCount || 0,
        lastIncidentDate: data.lastIncidentDate || null,
        lastSanctionDate: data.lastSanctionDate || null,
        notes: data.notes || null,
      },
    });
  }

  /**
   * Synchronise automatiquement les résumés disciplinaires à partir des données réelles
   */
  async syncDisciplinarySummary(
    tenantId: string,
    studentId: string,
    academicYearId: string,
  ) {
    // Compter les absences
    const absences = await this.prisma.absence.findMany({
      where: {
        studentId,
        academicYearId,
      },
    });

    const absencesCount = absences.length;
    const justifiedAbsences = absences.filter(a => a.isJustified).length;
    const unjustifiedAbsences = absencesCount - justifiedAbsences;

    // Compter les incidents et sanctions
    const disciplinaryActions = await this.prisma.disciplinaryAction.findMany({
      where: {
        studentId,
        academicYearId,
      },
    });

    const incidentsCount = disciplinaryActions.length;
    const minorIncidents = disciplinaryActions.filter(a => a.severity === 'MINOR').length;
    const majorIncidents = disciplinaryActions.filter(a => a.severity === 'MAJOR').length;

    const sanctionsCount = disciplinaryActions.filter(a => a.actionType !== 'WARNING').length;
    const warningsCount = disciplinaryActions.filter(a => a.actionType === 'WARNING').length;
    const suspensionsCount = disciplinaryActions.filter(a => a.actionType === 'SUSPENSION').length;
    const expulsionsCount = disciplinaryActions.filter(a => a.actionType === 'EXPULSION').length;

    const lastIncident = disciplinaryActions.length > 0
      ? disciplinaryActions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      : null;

    return this.upsertDisciplinarySummary(tenantId, studentId, academicYearId, {
      absencesCount,
      justifiedAbsences,
      unjustifiedAbsences,
      incidentsCount,
      minorIncidents,
      majorIncidents,
      sanctionsCount,
      warningsCount,
      suspensionsCount,
      expulsionsCount,
      lastIncidentDate: lastIncident?.date || null,
      lastSanctionDate: lastIncident?.date || null,
    });
  }
}

