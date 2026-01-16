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
import { AdministrativeSealsService } from './services/administrative-seals.service';
import { ElectronicSignaturesService } from './services/electronic-signatures.service';

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
    private readonly administrativeSealsService: AdministrativeSealsService,
    private readonly electronicSignaturesService: ElectronicSignaturesService,
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

  // ============================================================================
  // CACHETS ADMINISTRATIFS
  // ============================================================================

  @Get('administrative-seals')
  async getAllSeals(
    @TenantId() tenantId: string,
    @Query('schoolId') schoolId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('type') type?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.administrativeSealsService.getAllSeals(tenantId, {
      schoolId,
      academicYearId,
      type,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
  }

  @Get('administrative-seals/:id')
  async getSealById(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.administrativeSealsService.getSealById(tenantId, id);
  }

  @Post('administrative-seals')
  async createSeal(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() data: {
      schoolId: string;
      academicYearId: string;
      type: 'INSTITUTIONAL' | 'NOMINATIVE' | 'TRANSACTIONAL';
      label: string;
      role?: string;
      holderName?: string;
      holderTitle?: string;
      validFrom?: string;
      validTo?: string;
    },
  ) {
    return this.administrativeSealsService.createSeal(
      tenantId,
      {
        ...data,
        validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
        validTo: data.validTo ? new Date(data.validTo) : undefined,
      },
      user.id,
    );
  }

  @Put('administrative-seals/:id')
  async updateSeal(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() data: {
      label?: string;
      role?: string;
      holderName?: string;
      holderTitle?: string;
      isActive?: boolean;
      validFrom?: string;
      validTo?: string;
    },
  ) {
    return this.administrativeSealsService.updateSeal(
      tenantId,
      id,
      {
        ...data,
        validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
        validTo: data.validTo ? new Date(data.validTo) : undefined,
      },
      user.id,
    );
  }

  @Post('administrative-seals/:id/versions')
  async createSealVersion(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() data: {
      format: 'SVG' | 'PNG' | 'PDF';
      primaryColor?: string;
      secondaryColor?: string;
      shape: 'ROUND' | 'OVAL' | 'RECTANGULAR';
      logoUrl?: string;
      signatureUrl?: string;
      textLayout?: any;
      fontFamily?: string;
      fontWeight?: string;
      fontSize?: any;
      borderStyle?: string;
      borderThickness?: number;
      innerSymbols?: any;
      rotation?: number;
      opacity?: number;
    },
  ) {
    return this.administrativeSealsService.createSealVersion(tenantId, id, data, user.id);
  }

  @Post('administrative-seals/usage')
  async recordSealUsage(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() data: {
      sealVersionId: string;
      documentType: string;
      documentId: string;
      schoolId: string;
      academicYearId: string;
    },
  ) {
    return this.administrativeSealsService.recordSealUsage(tenantId, data, user.id);
  }

  @Get('administrative-seals/:id/usage')
  async getSealUsageHistory(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('documentType') documentType?: string,
  ) {
    return this.administrativeSealsService.getSealUsageHistory(tenantId, id, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      documentType,
    });
  }

  @Post('administrative-seals/:id/deactivate')
  async deactivateSeal(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.administrativeSealsService.deactivateSeal(tenantId, id, user.id);
  }

  @Post('administrative-seals/:id/activate')
  async activateSeal(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.administrativeSealsService.activateSeal(tenantId, id, user.id);
  }

  @Post('administrative-seals/check-expiring')
  async checkExpiringSeals(
    @TenantId() tenantId: string,
    @Query('days') days?: string,
  ) {
    return this.administrativeSealsService.checkExpiringSeals(
      tenantId,
      days ? parseInt(days, 10) : 30,
    );
  }

  // ============================================================================
  // SIGNATURES ÉLECTRONIQUES
  // ============================================================================

  @Get('electronic-signatures')
  async getUserSignatures(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.electronicSignaturesService.getUserSignatures(tenantId, user.id);
  }

  @Get('electronic-signatures/:id')
  async getSignatureById(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.electronicSignaturesService.getSignatureById(tenantId, id);
  }

  @Post('electronic-signatures')
  async createSignature(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() data: {
      role: string;
      signatureType: 'visual' | 'certified' | 'combined';
      signatureImageUrl?: string;
      expiresAt?: string;
    },
  ) {
    return this.electronicSignaturesService.createSignature(tenantId, user.id, {
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    });
  }

  @Post('electronic-signatures/sign-document')
  async signDocument(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() data: {
      documentType: string;
      documentId: string;
      signatureId: string;
      documentContent: any;
    },
  ) {
    return this.electronicSignaturesService.signDocument(tenantId, data, user.id);
  }

  @Get('electronic-signatures/verify/:token')
  async verifyDocument(@Param('token') token: string) {
    return this.electronicSignaturesService.verifyDocument(token);
  }

  @Post('electronic-signatures/:id/revoke')
  async revokeSignature(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.electronicSignaturesService.revokeSignature(tenantId, id, user.id);
  }

  @Get('electronic-signatures/documents/history')
  async getSignedDocumentsHistory(
    @TenantId() tenantId: string,
    @Query('signatureId') signatureId?: string,
    @Query('documentType') documentType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.electronicSignaturesService.getSignedDocumentsHistory(tenantId, {
      signatureId,
      documentType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }
}

