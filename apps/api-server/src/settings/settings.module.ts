import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { GeneralSettingsService } from './services/general-settings.service';
import { FeatureFlagsService } from './services/feature-flags.service';
import { SecuritySettingsService } from './services/security-settings.service';
import { OrionSettingsService } from './services/orion-settings.service';
import { AtlasSettingsService } from './services/atlas-settings.service';
import { OfflineSyncSettingsService } from './services/offline-sync-settings.service';
import { SettingsHistoryService } from './services/settings-history.service';
import { DatabaseModule } from '../database/database.module';

/**
 * Module Paramètres — Centre de contrôle stratégique d'Academia Hub
 * 
 * Ce module centralise toutes les configurations de l'application :
 * - Paramètres généraux & identité
 * - Feature flags (modules & fonctionnalités)
 * - Paramètres de sécurité & conformité
 * - Paramètres ORION (IA de pilotage)
 * - Paramètres ATLAS (Chatbot IA)
 * - Paramètres de synchronisation offline
 * - Historique & audit
 */
@Module({
  imports: [DatabaseModule],
  controllers: [SettingsController],
  providers: [
    GeneralSettingsService,
    FeatureFlagsService,
    SecuritySettingsService,
    OrionSettingsService,
    AtlasSettingsService,
    OfflineSyncSettingsService,
    SettingsHistoryService,
  ],
  exports: [
    GeneralSettingsService,
    FeatureFlagsService,
    SecuritySettingsService,
    OrionSettingsService,
    AtlasSettingsService,
    OfflineSyncSettingsService,
    SettingsHistoryService,
  ],
})
export class SettingsModule {}

