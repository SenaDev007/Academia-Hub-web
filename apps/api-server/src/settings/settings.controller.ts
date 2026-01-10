import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GeneralSettingsService } from './services/general-settings.service';
import { FeatureFlagsService } from './services/feature-flags.service';
import { SecuritySettingsService } from './services/security-settings.service';
import { OrionSettingsService } from './services/orion-settings.service';
import { AtlasSettingsService } from './services/atlas-settings.service';
import { OfflineSyncSettingsService } from './services/offline-sync-settings.service';
import { SettingsHistoryService } from './services/settings-history.service';

/**
 * Controller principal pour le Module Paramètres
 * Tous les endpoints sont protégés par JWT
 */
@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(
    private readonly generalSettingsService: GeneralSettingsService,
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly securitySettingsService: SecuritySettingsService,
    private readonly orionSettingsService: OrionSettingsService,
    private readonly atlasSettingsService: AtlasSettingsService,
    private readonly offlineSyncSettingsService: OfflineSyncSettingsService,
    private readonly settingsHistoryService: SettingsHistoryService,
  ) {}

  // ============================================================================
  // PARAMÈTRES GÉNÉRAUX & IDENTITÉ
  // ============================================================================

  @Get('general')
  async getGeneralSettings(@TenantId() tenantId: string) {
    return this.generalSettingsService.getSchoolSettings(tenantId);
  }

  @Put('general')
  async updateGeneralSettings(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() data: {
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
    @Request() req: any,
  ) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.generalSettingsService.updateSchoolSettings(
      tenantId,
      data,
      user.id,
      ipAddress,
      userAgent,
    );
  }

  // ============================================================================
  // FEATURE FLAGS
  // ============================================================================

  @Get('features')
  async getAllFeatures(@TenantId() tenantId: string) {
    return this.featureFlagsService.getAllFeatures(tenantId);
  }

  @Get('features/billing-impact')
  async getBillingImpact(@TenantId() tenantId: string) {
    return this.featureFlagsService.calculateBillingImpact(tenantId);
  }

  @Get('features/:featureCode')
  async getFeature(
    @TenantId() tenantId: string,
    @Param('featureCode') featureCode: string,
  ) {
    return this.featureFlagsService.getFeature(tenantId, featureCode);
  }

  @Get('features/:featureCode/check')
  async checkFeature(
    @TenantId() tenantId: string,
    @Param('featureCode') featureCode: string,
  ) {
    return this.featureFlagsService.isFeatureEnabled(tenantId, featureCode);
  }

  @Post('features/:featureCode/enable')
  async enableFeature(
    @TenantId() tenantId: string,
    @Param('featureCode') featureCode: string,
    @CurrentUser() user: any,
    @Body() body: { reason?: string },
    @Request() req: any,
  ) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.featureFlagsService.enableFeature(
      tenantId,
      featureCode,
      user.id,
      body.reason,
      ipAddress,
      userAgent,
    );
  }

  @Post('features/:featureCode/disable')
  async disableFeature(
    @TenantId() tenantId: string,
    @Param('featureCode') featureCode: string,
    @CurrentUser() user: any,
    @Body() body: { reason?: string },
    @Request() req: any,
  ) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.featureFlagsService.disableFeature(
      tenantId,
      featureCode,
      user.id,
      body.reason,
      ipAddress,
      userAgent,
    );
  }

  // ============================================================================
  // PARAMÈTRES DE SÉCURITÉ
  // ============================================================================

  @Get('security')
  async getSecuritySettings(@TenantId() tenantId: string) {
    return this.securitySettingsService.getSecuritySettings(tenantId);
  }

  @Put('security')
  async updateSecuritySettings(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() data: {
      passwordMinLength?: number;
      passwordRequireUppercase?: boolean;
      passwordRequireLowercase?: boolean;
      passwordRequireNumbers?: boolean;
      passwordRequireSpecial?: boolean;
      passwordExpirationDays?: number | null;
      sessionTimeoutMinutes?: number;
      maxLoginAttempts?: number;
      lockoutDurationMinutes?: number;
      twoFactorEnabled?: boolean;
      requireEmailVerification?: boolean;
      auditLogRetentionDays?: number;
      dataRetentionYears?: number;
      gdprCompliant?: boolean;
      allowInspectionAccess?: boolean;
    },
    @Request() req: any,
  ) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.securitySettingsService.updateSecuritySettings(
      tenantId,
      data,
      user.id,
      ipAddress,
      userAgent,
    );
  }

  // ============================================================================
  // PARAMÈTRES ORION (IA)
  // ============================================================================

  @Get('orion')
  async getOrionSettings(@TenantId() tenantId: string) {
    return this.orionSettingsService.getOrionSettings(tenantId);
  }

  @Put('orion')
  async updateOrionSettings(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() data: {
      isEnabled?: boolean;
      alertThresholdCritical?: number;
      alertThresholdWarning?: number;
      kpiCalculationFrequency?: string;
      autoGenerateInsights?: boolean;
      insightsFrequency?: string;
      visibleKPICategories?: string[];
      allowOrionExports?: boolean;
    },
    @Request() req: any,
  ) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.orionSettingsService.updateOrionSettings(
      tenantId,
      data,
      user.id,
      ipAddress,
      userAgent,
    );
  }

  // ============================================================================
  // PARAMÈTRES ATLAS (Chatbot IA)
  // ============================================================================

  @Get('atlas')
  async getAtlasSettings(@TenantId() tenantId: string) {
    return this.atlasSettingsService.getAtlasSettings(tenantId);
  }

  @Put('atlas')
  async updateAtlasSettings(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() data: {
      isEnabled?: boolean;
      scope?: string;
      allowedModules?: string[];
      allowHumanHandoff?: boolean;
      conversationHistoryDays?: number;
      maxConversationsPerDay?: number | null;
      language?: string;
    },
    @Request() req: any,
  ) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.atlasSettingsService.updateAtlasSettings(
      tenantId,
      data,
      user.id,
      ipAddress,
      userAgent,
    );
  }

  // ============================================================================
  // PARAMÈTRES SYNCHRONISATION OFFLINE
  // ============================================================================

  @Get('offline-sync')
  async getOfflineSyncSettings(@TenantId() tenantId: string) {
    return this.offlineSyncSettingsService.getOfflineSyncSettings(tenantId);
  }

  @Put('offline-sync')
  async updateOfflineSyncSettings(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() data: {
      isEnabled?: boolean;
      syncFrequencyMinutes?: number;
      conflictResolution?: string;
      autoSyncOnConnect?: boolean;
      maxOfflineDays?: number;
      allowOfflineModification?: boolean;
      syncOnBackground?: boolean;
    },
    @Request() req: any,
  ) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.offlineSyncSettingsService.updateOfflineSyncSettings(
      tenantId,
      data,
      user.id,
      ipAddress,
      userAgent,
    );
  }

  // ============================================================================
  // HISTORIQUE & AUDIT
  // ============================================================================

  @Get('history')
  async getHistory(
    @TenantId() tenantId: string,
    @Query('category') category?: string,
    @Query('key') key?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    const options = {
      category,
      key,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    return this.settingsHistoryService.getHistory(tenantId, options);
  }

  @Get('history/:key')
  async getHistoryByKey(
    @TenantId() tenantId: string,
    @Param('key') key: string,
  ) {
    return this.settingsHistoryService.getHistoryByKey(tenantId, key);
  }
}

