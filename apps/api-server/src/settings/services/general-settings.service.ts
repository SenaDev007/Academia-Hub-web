import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SettingsHistoryService } from './settings-history.service';

/**
 * Service pour la gestion des paramètres généraux de l'école
 * (identité, locale, etc.)
 */
@Injectable()
export class GeneralSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly historyService: SettingsHistoryService,
  ) {}

  /**
   * Récupère les paramètres de l'école pour un tenant
   */
  async getSchoolSettings(tenantId: string) {
    let settings = await this.prisma.schoolSettings.findUnique({
      where: { tenantId },
    });

    // Si aucun paramètre n'existe, créer les paramètres par défaut
    if (!settings) {
      settings = await this.prisma.schoolSettings.create({
        data: {
          tenantId,
          schoolName: 'Nom de l\'établissement',
          timezone: 'Africa/Porto-Novo',
          defaultLanguage: 'FR',
          currency: 'XOF',
          currencySymbol: 'FCFA',
        },
      });
    }

    return settings;
  }

  /**
   * Met à jour les paramètres de l'école
   * - Enregistre l'historique
   * - Intègre avec ORION pour alertes
   */
  async updateSchoolSettings(
    tenantId: string,
    data: {
      schoolName?: string;
      logoUrl?: string;
      sealUrl?: string;
      signatureUrl?: string;
      timezone?: string;
      defaultLanguage?: string;
      currency?: string;
      currencySymbol?: string;
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
    },
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const existing = await this.getSchoolSettings(tenantId);

    // Enregistrer l'historique des changements
    const changes: Record<string, { old: any; new: any }> = {};
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && existing[key] !== data[key]) {
        changes[key] = { old: existing[key], new: data[key] };
      }
    });

    if (Object.keys(changes).length === 0) {
      return existing;
    }

    // Mettre à jour les paramètres
    const updated = await this.prisma.schoolSettings.update({
      where: { tenantId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    // Enregistrer l'historique
    await this.historyService.logSettingChange(
      tenantId,
      null, // Pas de TenantSetting ID pour SchoolSettings
      'school_settings',
      'general',
      changes,
      userId,
      ipAddress,
      userAgent,
    );

    // Intégrer avec ORION pour détecter les changements sensibles
    await this.checkOrionAlerts(tenantId, changes);

    return updated;
  }

  /**
   * Vérifie si des changements nécessitent une alerte ORION
   */
  private async checkOrionAlerts(
    tenantId: string,
    changes: Record<string, { old: any; new: any }>,
  ) {
    // Changements sensibles qui nécessitent une alerte
    const sensitiveFields = ['defaultLanguage', 'timezone', 'currency'];

    for (const field of sensitiveFields) {
      if (changes[field]) {
        // TODO: Intégrer avec OrionAlertsService pour créer une alerte
        // await this.orionAlertsService.createAlert({
        //   tenantId,
        //   alertType: 'OPERATIONAL',
        //   severity: 'WARNING',
        //   title: `Paramètre sensible modifié: ${field}`,
        //   description: `Le paramètre ${field} a été modifié de ${changes[field].old} à ${changes[field].new}`,
        // });
      }
    }
  }
}

