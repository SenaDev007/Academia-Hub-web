/**
 * Offline Sync Service
 * 
 * Service principal de synchronisation offline-first
 * 
 * PRINCIPE : Synchronisation automatique des événements de l'outbox
 * vers le serveur lorsque la connexion est disponible
 */

import { outboxService } from './outbox.service';
import { networkDetectionService } from './network-detection.service';
import { syncUp, syncDown } from '@/services/sync.service';
import type { OutboxEvent, SyncUpRequest, SyncUpResponse } from '@/types';

class OfflineSyncService {
  private isSyncing: boolean = false;
  private syncInterval: number | null = null;
  private syncInProgress: Promise<void> | null = null;

  constructor() {
    // Écouter les changements de connexion
    networkDetectionService.onConnectionChange((online) => {
      if (online) {
        // Lancer la synchronisation quand la connexion revient
        this.sync();
      }
    });

    // Synchronisation automatique périodique
    this.startAutoSync();
  }

  /**
   * Lance la synchronisation
   */
  async sync(): Promise<void> {
    if (this.isSyncing) {
      console.log('[Sync] Already syncing, skipping...');
      return;
    }

    if (!networkDetectionService.isConnected()) {
      console.log('[Sync] Offline, skipping sync...');
      return;
    }

    // Si une sync est déjà en cours, attendre
    if (this.syncInProgress) {
      await this.syncInProgress;
      return;
    }

    this.syncInProgress = this.performSync();
    await this.syncInProgress;
    this.syncInProgress = null;
  }

  /**
   * Effectue la synchronisation
   */
  private async performSync(): Promise<void> {
    this.isSyncing = true;

    try {
      // Récupérer le tenantId (depuis auth ou session)
      const tenantId = await this.getTenantId();
      if (!tenantId) {
        console.warn('[Sync] No tenant ID available');
        return;
      }

      // Récupérer les événements en attente
      const pendingEvents = await outboxService.getPendingEvents(tenantId);
      
      if (pendingEvents.length === 0) {
        console.log('[Sync] No pending events');
        return;
      }

      console.log(`[Sync] Syncing ${pendingEvents.length} events...`);

      // Marquer comme "SYNCING"
      for (const event of pendingEvents) {
        await outboxService.markAsSyncing(event.id);
      }

      // Préparer la requête de synchronisation
      // Convertir les événements au format attendu par l'API
      const syncRequest: SyncUpRequest = {
        clientId: await this.getClientId(),
        events: pendingEvents.map(e => ({
          id: e.id,
          tenantId: e.tenantId,
          entityType: e.entityType,
          entityId: e.entityId,
          operation: e.operation,
          payload: typeof e.payload === 'string' ? JSON.parse(e.payload) : e.payload,
          localVersion: e.localVersion,
          createdAt: e.createdAt,
          lastAttemptAt: e.lastAttemptAt,
          attemptCount: e.attemptCount,
          status: e.status,
          errorMessage: e.errorMessage,
        })),
        lastSyncTimestamp: await this.getLastSyncTimestamp(tenantId),
      };

      // Envoyer au serveur
      const response = await syncUp(syncRequest);

      // Traiter la réponse
      await this.handleSyncResponse(response, pendingEvents, tenantId);

      console.log(`[Sync] Sync completed: ${response.syncedEvents.length} synced, ${response.conflicts.length} conflicts, ${response.errors.length} errors`);

    } catch (error: any) {
      console.error('[Sync] Sync error:', error);
      // Marquer les événements comme FAILED
      await this.handleSyncError(error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Traite la réponse de synchronisation
   */
  private async handleSyncResponse(
    response: SyncUpResponse,
    events: OutboxEvent[],
    tenantId: string
  ): Promise<void> {
    // Marquer les événements synchronisés (acknowledged)
    for (const acknowledged of response.acknowledged) {
      await outboxService.markAsSynced(acknowledged.outboxEventId);
      
      // Mettre à jour l'entité locale (marquer comme synced)
      const event = events.find(e => e.id === acknowledged.outboxEventId);
      if (event) {
        // Si l'ID a changé (création), mettre à jour l'ID local
        if (acknowledged.entityId !== event.entityId) {
          await this.updateEntityId(event.entityType, event.entityId, acknowledged.entityId);
        }
        await this.markEntityAsSynced(event.entityType, acknowledged.entityId);
      }
    }

    // Traiter les conflits
    for (const conflict of response.conflicts) {
      await this.resolveConflict(conflict, pendingEvents);
    }

    // Traiter les événements rejetés
    for (const rejected of response.rejected || []) {
      await outboxService.markAsFailed(rejected.outboxEventId, rejected.reason);
    }

    // Mettre à jour le timestamp de dernière sync
    await this.updateLastSyncTimestamp(tenantId, response.syncTimestamp);
  }

  /**
   * Marque une entité comme synchronisée
   */
  private async markEntityAsSynced(
    entityType: string,
    entityId: string
  ): Promise<void> {
    // Mettre à jour dans la base locale
    const storeName = `${entityType.toLowerCase()}s`;
    const entities = await this.getLocalDb().query(storeName);
    const entity = entities.find((e: any) => e.id === entityId);
    
    if (entity) {
      entity._isDirty = false;
      entity._lastSync = new Date().toISOString();
      await this.getLocalDb().execute(storeName, 'put', entity);
    }
  }

  /**
   * Met à jour l'ID d'une entité (cas de création avec ID serveur)
   */
  private async updateEntityId(
    entityType: string,
    oldId: string,
    newId: string
  ): Promise<void> {
    const storeName = `${entityType.toLowerCase()}s`;
    const entities = await this.getLocalDb().query(storeName);
    const entity = entities.find((e: any) => e.id === oldId);
    
    if (entity) {
      // Supprimer l'ancienne entité
      await this.getLocalDb().execute(storeName, 'delete', oldId);
      
      // Ajouter avec le nouvel ID
      const updated = { ...entity, id: newId };
      await this.getLocalDb().execute(storeName, 'add', updated);
    }
  }

  /**
   * Résout un conflit
   */
  private async resolveConflict(conflict: any, events: OutboxEvent[]): Promise<void> {
    // Stratégie : Le serveur a toujours raison (source de vérité)
    // Mettre à jour la version locale avec la version serveur
    
    const storeName = `${conflict.entityType.toLowerCase()}s`;
    const event = events.find((e: any) => e.id === conflict.outboxEventId);
    
    if (event && conflict.serverData) {
      // Fusionner avec la version serveur
      const updated = {
        ...conflict.serverData,
        _version: conflict.serverData.serverVersion || conflict.serverData._version || 1,
        _isDirty: false,
        _lastSync: new Date().toISOString(),
      };
      
      await this.getLocalDb().execute(storeName, 'put', updated);
      
      // Marquer l'événement comme résolu
      await outboxService.markAsSynced(conflict.outboxEventId);
      
      // Notifier l'utilisateur (via event ou callback)
      this.notifyConflict(conflict);
    }
  }

  /**
   * Gère une erreur de synchronisation
   */
  private async handleSyncError(error: any): Promise<void> {
    console.error('[Sync] Error:', error);
    // Les événements seront marqués comme FAILED par le service outbox
    // selon la stratégie de retry
  }

  /**
   * Notifie un conflit
   */
  private notifyConflict(conflict: any): void {
    // Émettre un événement personnalisé pour l'UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sync-conflict', {
        detail: conflict
      }));
    }
  }

  /**
   * Démarre la synchronisation automatique
   */
  private startAutoSync(): void {
    // Sync toutes les 5 minutes si online
    if (typeof window !== 'undefined') {
      this.syncInterval = window.setInterval(async () => {
        if (networkDetectionService.isConnected() && !this.isSyncing) {
          await this.sync();
        }
      }, 5 * 60 * 1000); // 5 minutes
    }
  }

  /**
   * Récupère le tenantId
   */
  private async getTenantId(): Promise<string | null> {
    // À implémenter selon votre système d'auth
    // Exemple : depuis session, localStorage, etc.
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('session');
      if (session) {
        try {
          const parsed = JSON.parse(session);
          return parsed.tenantId || null;
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Récupère le clientId
   */
  private async getClientId(): Promise<string> {
    // Générer ou récupérer un ID client unique
    if (typeof window !== 'undefined') {
      let clientId = localStorage.getItem('client_id');
      if (!clientId) {
        clientId = this.generateUUID();
        localStorage.setItem('client_id', clientId);
      }
      return clientId;
    }
    return this.generateUUID();
  }

  /**
   * Récupère le timestamp de dernière sync
   */
  private async getLastSyncTimestamp(tenantId: string): Promise<string | undefined> {
    const syncStates = await this.getLocalDb().query('sync_state');
    const state = syncStates.find((s: any) => s.tenantId === tenantId);
    return state?.lastSyncTimestamp;
  }

  /**
   * Met à jour le timestamp de dernière sync
   */
  private async updateLastSyncTimestamp(tenantId: string, timestamp: string): Promise<void> {
    const syncStates = await this.getLocalDb().query('sync_state');
    const state = syncStates.find((s: any) => s.tenantId === tenantId);
    
    if (state) {
      await this.getLocalDb().execute('sync_state', 'put', {
        ...state,
        lastSyncTimestamp: timestamp,
        lastSyncSuccess: true,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await this.getLocalDb().execute('sync_state', 'add', {
        tenantId,
        lastSyncTimestamp: timestamp,
        lastSyncSuccess: true,
        pendingEventsCount: 0,
        conflictCount: 0,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  /**
   * Récupère l'instance LocalDb
   */
  private getLocalDb() {
    // Import dynamique pour éviter les problèmes de circular dependency
    const { localDb } = require('./local-db.service');
    return localDb;
  }

  /**
   * Génère un UUID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Nettoie les ressources
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

// Instance singleton
export const offlineSyncService = new OfflineSyncService();

