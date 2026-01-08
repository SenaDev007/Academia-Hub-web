import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TenantFeaturesRepository } from './tenant-features.repository';
import { TenantFeature, FeatureCode, FeatureStatus } from './entities/tenant-feature.entity';
import { CreateTenantFeatureDto } from './dto/create-tenant-feature.dto';
import { UpdateTenantFeatureDto } from './dto/update-tenant-feature.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AcademicTracksService } from '../academic-tracks/academic-tracks.service';
import { AcademicTracksRepository } from '../academic-tracks/academic-tracks.repository';
import { AcademicTrackCode } from '../academic-tracks/entities/academic-track.entity';

/**
 * Pricing rules pour les features
 * TODO: Déplacer dans un service de pricing dédié
 */
const FEATURE_PRICING: Record<FeatureCode, { monthly: number; annual: number }> = {
  [FeatureCode.BILINGUAL_TRACK]: {
    monthly: 15000, // 15 000 FCFA/mois supplément
    annual: 150000, // 150 000 FCFA/an supplément
  },
};

@Injectable()
export class TenantFeaturesService {
  constructor(
    private readonly repository: TenantFeaturesRepository,
    private readonly auditLogsService: AuditLogsService,
    private readonly academicTracksService: AcademicTracksService,
    private readonly academicTracksRepository: AcademicTracksRepository,
  ) {}

  /**
   * Vérifie si une feature est activée pour un tenant
   */
  async isFeatureEnabled(featureCode: FeatureCode, tenantId: string): Promise<boolean> {
    return this.repository.isEnabled(featureCode, tenantId);
  }

  /**
   * Active une feature pour un tenant
   * - Valide les prérequis
   * - Calcule l'impact pricing
   * - Crée l'entrée si elle n'existe pas
   * - Journalise l'action
   */
  async enableFeature(
    featureCode: FeatureCode,
    tenantId: string,
    userId: string,
    reason?: string,
  ): Promise<{ feature: TenantFeature; pricingImpact: { monthly: number; annual: number } }> {
    // Vérifier si déjà activée
    const existing = await this.repository.findByCode(featureCode, tenantId);
    if (existing?.status === FeatureStatus.ENABLED) {
      throw new BadRequestException(`Feature ${featureCode} is already enabled`);
    }

    // Valider les prérequis selon la feature
    await this.validateFeaturePrerequisites(featureCode, tenantId);

    // Calculer l'impact pricing
    const pricingImpact = FEATURE_PRICING[featureCode] || { monthly: 0, annual: 0 };

    // Créer ou mettre à jour la feature
    let feature: TenantFeature;
    if (existing) {
      feature = await this.repository.update(existing.id, tenantId, {
        status: FeatureStatus.ENABLED,
        reason,
        updatedBy: userId,
      });
    } else {
      feature = await this.repository.create({
        featureCode,
        tenantId,
        status: FeatureStatus.ENABLED,
        enabledBy: userId,
        reason,
      });
    }

    // Actions spécifiques selon la feature
    await this.onFeatureEnabled(featureCode, tenantId, userId);

    // Journaliser l'action
    await this.auditLogsService.create(
      {
        action: 'FEATURE_ENABLED',
        resource: 'tenant_feature',
        resourceId: feature.id,
        changes: {
          featureCode,
          status: FeatureStatus.ENABLED,
          pricingImpact,
          reason,
        },
      },
      tenantId,
      userId,
    );

    return { feature, pricingImpact };
  }

  /**
   * Désactive une feature pour un tenant
   * - Vérifie les dépendances
   * - Calcule l'impact pricing
   * - Journalise l'action
   */
  async disableFeature(
    featureCode: FeatureCode,
    tenantId: string,
    userId: string,
    reason?: string,
  ): Promise<{ feature: TenantFeature; pricingImpact: { monthly: number; annual: number } }> {
    const feature = await this.repository.findByCode(featureCode, tenantId);
    if (!feature || feature.status !== FeatureStatus.ENABLED) {
      throw new NotFoundException(`Feature ${featureCode} is not enabled`);
    }

    // Vérifier les dépendances avant désactivation
    await this.validateFeatureDependencies(featureCode, tenantId);

    // Calculer l'impact pricing (négatif = réduction)
    const pricingImpact = FEATURE_PRICING[featureCode] || { monthly: 0, annual: 0 };

    // Mettre à jour la feature
    const updated = await this.repository.update(feature.id, tenantId, {
      status: FeatureStatus.DISABLED,
      reason,
      updatedBy: userId,
    });

    // Actions spécifiques selon la feature
    await this.onFeatureDisabled(featureCode, tenantId, userId);

    // Journaliser l'action
    await this.auditLogsService.create(
      {
        action: 'FEATURE_DISABLED',
        resource: 'tenant_feature',
        resourceId: updated.id,
        changes: {
          featureCode,
          status: FeatureStatus.DISABLED,
          pricingImpact: {
            monthly: -pricingImpact.monthly,
            annual: -pricingImpact.annual,
          },
          reason,
        },
      },
      tenantId,
      userId,
    );

    return { feature: updated, pricingImpact };
  }

  /**
   * Récupère toutes les features d'un tenant
   */
  async findAll(tenantId: string): Promise<TenantFeature[]> {
    return this.repository.findAll(tenantId);
  }

  /**
   * Récupère une feature spécifique
   */
  async findOne(id: string, tenantId: string): Promise<TenantFeature> {
    const feature = await this.repository.findOne(id, tenantId);
    if (!feature) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }
    return feature;
  }

  /**
   * Récupère une feature par code
   */
  async findByCode(featureCode: FeatureCode, tenantId: string): Promise<TenantFeature | null> {
    return this.repository.findByCode(featureCode, tenantId);
  }

  /**
   * Calcule l'impact pricing total des features activées
   */
  async calculatePricingImpact(tenantId: string): Promise<{ monthly: number; annual: number }> {
    const features = await this.repository.findAll(tenantId);
    const enabledFeatures = features.filter(f => f.status === FeatureStatus.ENABLED);

    const impact = enabledFeatures.reduce(
      (acc, feature) => {
        const pricing = FEATURE_PRICING[feature.featureCode] || { monthly: 0, annual: 0 };
        return {
          monthly: acc.monthly + pricing.monthly,
          annual: acc.annual + pricing.annual,
        };
      },
      { monthly: 0, annual: 0 },
    );

    return impact;
  }

  /**
   * Valide les prérequis avant activation
   */
  private async validateFeaturePrerequisites(featureCode: FeatureCode, tenantId: string): Promise<void> {
    switch (featureCode) {
      case FeatureCode.BILINGUAL_TRACK:
        // Vérifier qu'au moins le track FR existe
        const defaultTrack = await this.academicTracksService.getDefaultTrack(tenantId);
        if (!defaultTrack) {
          throw new BadRequestException('Default academic track (FR) must exist before enabling bilingual feature');
        }
        break;
      default:
        // Pas de prérequis pour les autres features
        break;
    }
  }

  /**
   * Valide les dépendances avant désactivation
   */
  private async validateFeatureDependencies(featureCode: FeatureCode, tenantId: string): Promise<void> {
    switch (featureCode) {
      case FeatureCode.BILINGUAL_TRACK:
        // Vérifier s'il existe des données EN
        const enTrack = await this.academicTracksRepository.findByCode(AcademicTrackCode.EN, tenantId);
        if (enTrack) {
          // Vérifier s'il y a des classes, matières, examens, notes EN
          // TODO: Implémenter les vérifications de dépendances
          // Pour l'instant, on permet la désactivation mais on avertit
        }
        break;
      default:
        break;
    }
  }

  /**
   * Actions à effectuer lors de l'activation d'une feature
   */
  private async onFeatureEnabled(featureCode: FeatureCode, tenantId: string, userId: string): Promise<void> {
    switch (featureCode) {
      case FeatureCode.BILINGUAL_TRACK:
        // S'assurer que le track EN existe (créer si nécessaire)
        try {
          await this.academicTracksService.findByCode(AcademicTrackCode.EN, tenantId);
        } catch {
          // Le track EN n'existe pas, le créer
          await this.academicTracksService.create(
            {
              code: AcademicTrackCode.EN,
              name: 'Anglophone',
              description: 'Piste académique anglophone',
              order: 1,
              isActive: true,
              isDefault: false,
            },
            tenantId,
          );
        }
        break;
      default:
        break;
    }
  }

  /**
   * Actions à effectuer lors de la désactivation d'une feature
   */
  private async onFeatureDisabled(featureCode: FeatureCode, tenantId: string, userId: string): Promise<void> {
    switch (featureCode) {
      case FeatureCode.BILINGUAL_TRACK:
        // Ne PAS supprimer les données EN existantes
        // Juste désactiver l'option dans l'UI
        // Les données restent accessibles en lecture seule si nécessaire
        break;
      default:
        break;
    }
  }
}

