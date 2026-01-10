import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SettingsHistoryService } from './settings-history.service';

/**
 * Codes des features disponibles
 */
export enum FeatureCode {
  CANTINE = 'CANTINE',
  TRANSPORT = 'TRANSPORT',
  BIBLIOTHEQUE = 'BIBLIOTHEQUE',
  INFIRMERIE = 'INFIRMERIE',
  EDUCAST = 'EDUCAST',
  PATRONAT = 'PATRONAT',
  BILINGUAL_TRACK = 'BILINGUAL_TRACK',
}

/**
 * Service pour la gestion des feature flags
 */
@Injectable()
export class FeatureFlagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly historyService: SettingsHistoryService,
  ) {}

  /**
   * Récupère toutes les features d'un tenant
   */
  async getAllFeatures(tenantId: string) {
    return this.prisma.tenantFeature.findMany({
      where: { tenantId },
      orderBy: { featureCode: 'asc' },
    });
  }

  /**
   * Récupère une feature par code
   */
  async getFeature(tenantId: string, featureCode: string) {
    const feature = await this.prisma.tenantFeature.findUnique({
      where: {
        tenantId_featureCode: {
          tenantId,
          featureCode,
        },
      },
    });

    if (!feature) {
      // Retourner une feature par défaut si elle n'existe pas
      return {
        tenantId,
        featureCode,
        isEnabled: false,
        status: 'INACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return feature;
  }

  /**
   * Vérifie si une feature est activée
   */
  async isFeatureEnabled(tenantId: string, featureCode: string): Promise<boolean> {
    const feature = await this.getFeature(tenantId, featureCode);
    return feature.isEnabled && feature.status === 'ACTIVE';
  }

  /**
   * Active une feature
   */
  async enableFeature(
    tenantId: string,
    featureCode: string,
    userId: string,
    reason?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const existing = await this.prisma.tenantFeature.findUnique({
      where: {
        tenantId_featureCode: {
          tenantId,
          featureCode,
        },
      },
    });

    let feature;
    if (existing) {
      if (existing.status === 'ACTIVE') {
        throw new BadRequestException(`Feature ${featureCode} is already enabled`);
      }

      feature = await this.prisma.tenantFeature.update({
        where: {
          tenantId_featureCode: {
            tenantId,
            featureCode,
          },
        },
        data: {
          isEnabled: true,
          status: 'ACTIVE',
          enabledAt: new Date(),
          enabledBy: userId,
          updatedAt: new Date(),
        },
      });
    } else {
      feature = await this.prisma.tenantFeature.create({
        data: {
          tenantId,
          featureCode,
          isEnabled: true,
          status: 'ACTIVE',
          enabledAt: new Date(),
          enabledBy: userId,
        },
      });
    }

    // Enregistrer l'historique
    await this.historyService.logFeatureChange(
      tenantId,
      featureCode,
      'INACTIVE',
      'ACTIVE',
      userId,
      reason,
      ipAddress,
      userAgent,
    );

    return feature;
  }

  /**
   * Désactive une feature
   */
  async disableFeature(
    tenantId: string,
    featureCode: string,
    userId: string,
    reason?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const existing = await this.prisma.tenantFeature.findUnique({
      where: {
        tenantId_featureCode: {
          tenantId,
          featureCode,
        },
      },
    });

    if (!existing || existing.status !== 'ACTIVE') {
      throw new NotFoundException(`Feature ${featureCode} is not enabled`);
    }

    // Vérifier les dépendances avant désactivation
    await this.validateFeatureDependencies(tenantId, featureCode);

    const feature = await this.prisma.tenantFeature.update({
      where: {
        tenantId_featureCode: {
          tenantId,
          featureCode,
        },
      },
      data: {
        isEnabled: false,
        status: 'INACTIVE',
        disabledAt: new Date(),
        disabledBy: userId,
        updatedAt: new Date(),
      },
    });

    // Enregistrer l'historique
    await this.historyService.logFeatureChange(
      tenantId,
      featureCode,
      'ACTIVE',
      'INACTIVE',
      userId,
      reason,
      ipAddress,
      userAgent,
    );

    return feature;
  }

  /**
   * Calcule l'impact sur la facturation
   */
  async calculateBillingImpact(tenantId: string) {
    const features = await this.getAllFeatures(tenantId);
    const enabledFeatures = features.filter(
      (f) => f.isEnabled && f.status === 'ACTIVE',
    );

    // TODO: Récupérer les prix depuis une configuration de pricing
    const pricing: Record<string, { monthly: number; annual: number }> = {
      CANTINE: { monthly: 5000, annual: 50000 },
      TRANSPORT: { monthly: 3000, annual: 30000 },
      BIBLIOTHEQUE: { monthly: 2000, annual: 20000 },
      INFIRMERIE: { monthly: 1000, annual: 10000 },
      EDUCAST: { monthly: 8000, annual: 80000 },
      PATRONAT: { monthly: 10000, annual: 100000 },
      BILINGUAL_TRACK: { monthly: 15000, annual: 150000 },
    };

    const impact = enabledFeatures.reduce(
      (acc, feature) => {
        const price = pricing[feature.featureCode] || { monthly: 0, annual: 0 };
        return {
          monthly: acc.monthly + price.monthly,
          annual: acc.annual + price.annual,
        };
      },
      { monthly: 0, annual: 0 },
    );

    return impact;
  }

  /**
   * Valide les dépendances avant désactivation
   */
  private async validateFeatureDependencies(tenantId: string, featureCode: string) {
    // TODO: Implémenter la validation selon la feature
    // Exemple: BILINGUAL_TRACK ne peut pas être désactivé s'il y a des données EN
    switch (featureCode) {
      case FeatureCode.BILINGUAL_TRACK:
        // Vérifier s'il existe des données EN (étudiants, examens, notes, etc.)
        // Si oui, lever une exception
        break;
      default:
        break;
    }
  }
}

