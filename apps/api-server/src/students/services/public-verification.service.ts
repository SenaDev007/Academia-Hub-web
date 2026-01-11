/**
 * ============================================================================
 * PUBLIC VERIFICATION SERVICE - QR CODE DE VÉRIFICATION PUBLIQUE
 * ============================================================================
 * 
 * Service pour générer et valider les tokens de vérification publique
 * Permet de vérifier l'identité d'un élève sans exposer de données sensibles
 * 
 * ============================================================================
 */

import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PublicVerificationService {
  private readonly logger = new Logger(PublicVerificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Génère un token de vérification publique pour un élève
   * Le token est signé et non devinable
   */
  async generateVerificationToken(
    tenantId: string,
    studentId: string,
    academicYearId: string,
  ): Promise<{ token: string; tokenHash: string; expiresAt: Date }> {
    // Vérifier que l'élève existe et est actif
    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        tenantId,
        status: 'ACTIVE',
      },
      include: {
        identifier: true,
        academicYear: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Élève non trouvé ou inactif');
    }

    if (!student.identifier) {
      throw new BadRequestException('L\'élève doit avoir un matricule pour générer un token de vérification');
    }

    // Vérifier si un token actif existe déjà pour cette année
    const existingToken = await this.prisma.publicVerificationToken.findFirst({
      where: {
        tenantId,
        entityId: studentId,
        academicYearId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingToken) {
      // Retourner le token existant
      return {
        token: existingToken.token,
        tokenHash: existingToken.tokenHash,
        expiresAt: existingToken.expiresAt,
      };
    }

    // Calculer la date d'expiration (fin année scolaire + 1 mois)
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id: academicYearId },
    });

    if (!academicYear) {
      throw new NotFoundException('Année scolaire non trouvée');
    }

    const expiresAt = new Date(academicYear.endDate);
    expiresAt.setMonth(expiresAt.getMonth() + 1); // +1 mois après la fin de l'année

    // Générer un token sécurisé
    const token = this.generateSecureToken(studentId, tenantId, academicYearId);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Créer le token en base
    const verificationToken = await this.prisma.publicVerificationToken.create({
      data: {
        tenantId,
        entityType: 'STUDENT',
        entityId: studentId,
        tokenHash,
        token, // Stocké temporairement pour la génération du QR Code
        academicYearId,
        expiresAt,
        isActive: true,
      },
    });

    this.logger.log(`Token de vérification généré pour l'élève ${studentId}`);

    return {
      token: verificationToken.token,
      tokenHash: verificationToken.tokenHash,
      expiresAt: verificationToken.expiresAt,
    };
  }

  /**
   * Valide un token de vérification et retourne les données minimales de l'élève
   */
  async verifyToken(token: string): Promise<{
    student: {
      id: string;
      firstName: string;
      lastName: string;
      dateOfBirth?: Date;
      gender?: string;
      photo?: string;
      matricule: string;
      class?: string;
      level?: string;
      academicYear: string;
      status: string;
      institution: string;
    };
    isValid: boolean;
    isExpired: boolean;
  }> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const verificationToken = await this.prisma.publicVerificationToken.findUnique({
      where: { tokenHash },
      include: {
        student: {
          include: {
            identifier: true,
            tenant: {
              include: {
                schools: {
                  take: 1,
                },
              },
            },
            studentEnrollments: {
              where: {
                status: 'ACTIVE',
              },
              include: {
                class: true,
                schoolLevel: true,
              },
              take: 1,
            },
            academicYear: true,
          },
        },
      },
    });

    if (!verificationToken) {
      return {
        student: null as any,
        isValid: false,
        isExpired: false,
      };
    }

    const isExpired = verificationToken.expiresAt < new Date();
    const isActive = verificationToken.isActive && !isExpired;

    if (!isActive) {
      return {
        student: null as any,
        isValid: false,
        isExpired,
      };
    }

    // Incrémenter le compteur de vérifications
    await this.prisma.publicVerificationToken.update({
      where: { id: verificationToken.id },
      data: {
        verificationCount: {
          increment: 1,
        },
        lastVerifiedAt: new Date(),
      },
    });

    const student = verificationToken.student;
    const enrollment = student.studentEnrollments?.[0];
    const institution = student.tenant.schools?.[0]?.name || student.tenant.name;

    return {
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        dateOfBirth: student.dateOfBirth || undefined,
        gender: student.gender || undefined,
        photo: undefined, // À implémenter si stockage de photos
        matricule: student.identifier?.globalMatricule || 'N/A',
        class: enrollment?.class?.name || undefined,
        level: enrollment?.schoolLevel?.label || undefined,
        academicYear: student.academicYear.name,
        status: student.status,
        institution,
      },
      isValid: true,
      isExpired: false,
    };
  }

  /**
   * Génère un token sécurisé non devinable
   */
  private generateSecureToken(studentId: string, tenantId: string, academicYearId: string): string {
    const randomBytes = crypto.randomBytes(32).toString('hex');
    const timestamp = Date.now().toString();
    const payload = `${studentId}-${tenantId}-${academicYearId}-${timestamp}-${randomBytes}`;
    
    // Signer avec HMAC SHA256
    const secret = process.env.VERIFICATION_SECRET || 'academia-hub-verification-secret';
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    
    // Format final : base64url pour URL-safe
    const token = Buffer.from(`${payload}:${signature}`).toString('base64url');
    
    return token;
  }

  /**
   * Renouvelle un token pour une nouvelle année scolaire
   */
  async renewTokenForNewYear(
    tenantId: string,
    studentId: string,
    oldAcademicYearId: string,
    newAcademicYearId: string,
  ): Promise<{ token: string; tokenHash: string; expiresAt: Date }> {
    // Désactiver l'ancien token
    await this.prisma.publicVerificationToken.updateMany({
      where: {
        tenantId,
        entityId: studentId,
        academicYearId: oldAcademicYearId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Générer un nouveau token
    return this.generateVerificationToken(tenantId, studentId, newAcademicYearId);
  }

  /**
   * Récupère les statistiques de vérification
   */
  async getVerificationStats(tenantId: string, academicYearId?: string) {
    const where: any = { tenantId };
    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    const tokens = await this.prisma.publicVerificationToken.findMany({
      where,
      include: {
        student: true,
      },
    });

    return {
      total: tokens.length,
      active: tokens.filter(t => t.isActive && t.expiresAt > new Date()).length,
      expired: tokens.filter(t => t.expiresAt <= new Date()).length,
      totalVerifications: tokens.reduce((sum, t) => sum + t.verificationCount, 0),
      byAcademicYear: tokens.reduce((acc, t) => {
        const year = t.academicYearId;
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

