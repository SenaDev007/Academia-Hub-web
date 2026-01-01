/**
 * ============================================================================
 * COMPLIANCE SERVICE - CONFORMITÉ DONNÉES SCOLAIRES
 * ============================================================================
 */

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataConsent } from './entities/data-consent.entity';
import { DataExport } from './entities/data-export.entity';
import { StudentsService } from '../students/students.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ComplianceService {
  constructor(
    @InjectRepository(DataConsent)
    private consentRepository: Repository<DataConsent>,
    @InjectRepository(DataExport)
    private exportRepository: Repository<DataExport>,
    private studentsService: StudentsService,
    private usersService: UsersService,
  ) {}

  /**
   * Enregistrer un consentement RGPD
   */
  async recordConsent(
    tenantId: string,
    userId: string,
    consentType: string,
    consented: boolean,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<DataConsent> {
    const consent = this.consentRepository.create({
      tenantId,
      userId,
      consentType,
      consented,
      ipAddress,
      userAgent,
      consentText: this.getConsentText(consentType),
    });

    return this.consentRepository.save(consent);
  }

  /**
   * Vérifier si un utilisateur a consenti
   */
  async hasConsent(
    tenantId: string,
    userId: string,
    consentType: string,
  ): Promise<boolean> {
    const consent = await this.consentRepository.findOne({
      where: {
        tenantId,
        userId,
        consentType,
        consented: true,
      },
      order: { createdAt: 'DESC' },
    });

    return !!consent;
  }

  /**
   * Exporter toutes les données d'un utilisateur (RGPD)
   */
  async exportUserData(
    tenantId: string,
    userId: string,
    exportType: string = 'full',
  ): Promise<DataExport> {
    // Vérifier que l'utilisateur existe et appartient au tenant
    const user = await this.usersService.findOne(userId);
    if (!user || user.tenantId !== tenantId) {
      throw new NotFoundException('User not found');
    }

    // Créer l'export
    const dataExport = this.exportRepository.create({
      tenantId,
      userId,
      exportType,
      status: 'pending',
    });

    const saved = await this.exportRepository.save(dataExport);

    // Traiter l'export de manière asynchrone
    this.processExport(saved.id, tenantId, userId, exportType);

    return saved;
  }

  /**
   * Supprimer toutes les données d'un utilisateur (droit à l'oubli - RGPD)
   */
  async deleteUserData(
    tenantId: string,
    userId: string,
  ): Promise<void> {
    // Vérifier que l'utilisateur existe et appartient au tenant
    const user = await this.usersService.findOne(userId);
    if (!user || user.tenantId !== tenantId) {
      throw new NotFoundException('User not found');
    }

    // Anonymiser les données (ne pas supprimer complètement pour l'audit)
    // TODO: Implémenter l'anonymisation complète selon les besoins

    // Supprimer les consentements
    await this.consentRepository.delete({ tenantId, userId });

    // Supprimer les exports
    await this.exportRepository.delete({ tenantId, userId });
  }

  private async processExport(
    exportId: string,
    tenantId: string,
    userId: string,
    exportType: string,
  ): Promise<void> {
    try {
      // Mettre à jour le statut
      await this.exportRepository.update(exportId, { status: 'processing' });

      // Collecter les données
      const user = await this.usersService.findOne(userId);
      const students = await this.studentsService.findByUserId(tenantId, userId);

      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
        },
        students: students.map((s) => ({
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          // ... autres champs selon exportType
        })),
        consents: await this.consentRepository.find({
          where: { tenantId, userId },
        }),
        exports: await this.exportRepository.find({
          where: { tenantId, userId },
        }),
      };

      // TODO: Générer le fichier d'export (JSON, CSV, etc.)
      const filePath = `/exports/${exportId}.json`;

      // Mettre à jour avec le chemin du fichier
      await this.exportRepository.update(exportId, {
        status: 'completed',
        filePath,
        metadata: { exportedAt: new Date(), recordCount: Object.keys(exportData).length },
      });
    } catch (error) {
      await this.exportRepository.update(exportId, {
        status: 'failed',
        metadata: { error: error.message },
      });
    }
  }

  private getConsentText(consentType: string): string {
    const texts: Record<string, string> = {
      data_processing:
        'J\'accepte que mes données personnelles soient traitées conformément à la politique de confidentialité.',
      marketing:
        'J\'accepte de recevoir des communications marketing de la part de l\'établissement.',
      analytics:
        'J\'accepte que mes données soient utilisées à des fins d\'analyse et d\'amélioration du service.',
    };
    return texts[consentType] || 'Consentement pour ' + consentType;
  }
}

