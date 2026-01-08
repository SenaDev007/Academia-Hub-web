export interface SyncItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  lastAttempt: Date;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
  retryAfter?: Date;
}

export interface SyncConfig {
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number; // en millisecondes
  maxRetries: number;
  retryDelay: number; // en millisecondes
  batchSize: number;
  conflictResolution: 'local' | 'remote' | 'manual';
  entities: string[];
}

export interface SyncStats {
  totalItems: number;
  pendingItems: number;
  completedItems: number;
  failedItems: number;
  lastSync: Date;
  syncDuration: number;
  conflicts: number;
  errors: number;
}

export interface ConflictResolution {
  entityId: string;
  entityType: string;
  localVersion: any;
  remoteVersion: any;
  resolution: 'local' | 'remote' | 'manual';
  resolvedBy?: string;
  resolvedAt?: Date;
}

class HybridSyncService {
  private static instance: HybridSyncService;
  private syncQueue: Map<string, SyncItem> = new Map();
  private config: SyncConfig;
  private isOnline: boolean = false;
  private syncInProgress: boolean = false;
  private lastSync: Date | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      enabled: true,
      autoSync: true,
      syncInterval: 5 * 60 * 1000, // 5 minutes
      maxRetries: 3,
      retryDelay: 30 * 1000, // 30 secondes
      batchSize: 50,
      conflictResolution: 'local',
      entities: ['students', 'classes', 'teachers', 'exams', 'grades', 'documents']
    };

    this.initializeSync();
  }

  static getInstance(): HybridSyncService {
    if (!HybridSyncService.instance) {
      HybridSyncService.instance = new HybridSyncService();
    }
    return HybridSyncService.instance;
  }

  private initializeSync(): void {
    // Démarrer la synchronisation automatique si activée
    if (this.config.autoSync) {
      this.startAutoSync();
    }

    // Vérifier la connectivité réseau
    this.checkNetworkStatus();
  }

  // Ajouter un élément à la queue de synchronisation
  async addToSyncQueue(
    type: 'create' | 'update' | 'delete',
    entity: string,
    data: any,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<string> {
    try {
    const syncItem: SyncItem = {
        id: `${entity}:${type}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`,
      type,
      entity,
      data,
      priority,
        createdAt: new Date(),
        lastAttempt: new Date(),
        attempts: 0,
        maxAttempts: this.config.maxRetries,
      status: 'pending'
    };

      this.syncQueue.set(syncItem.id, syncItem);
    
      console.log(`Added to sync queue: ${type} ${entity}`, syncItem.id);
    
      // Déclencher la synchronisation si en ligne
      if (this.isOnline && !this.syncInProgress) {
      this.processSyncQueue();
    }

      return syncItem.id;
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  }

  // Traiter la queue de synchronisation
  private async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    try {
      this.syncInProgress = true;
      const startTime = Date.now();

      // Trier par priorité et date de création
      const sortedItems = Array.from(this.syncQueue.values())
        .filter(item => item.status === 'pending' || 
                       (item.status === 'failed' && item.attempts < item.maxAttempts))
        .sort((a, b) => {
          // Priorité d'abord
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }
          // Puis par date de création
          return a.createdAt.getTime() - b.createdAt.getTime();
        });

      // Traiter par lots
      const batches = this.chunkArray(sortedItems, this.config.batchSize);
      
      for (const batch of batches) {
        await this.processBatch(batch);
      }

      this.lastSync = new Date();
      const duration = Date.now() - startTime;
      
      console.log(`Sync completed in ${duration}ms. Processed ${sortedItems.length} items.`);
      
    } catch (error) {
      console.error('Error processing sync queue:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Traiter un lot d'éléments
  private async processBatch(items: SyncItem[]): Promise<void> {
    try {
    const promises = items.map(item => this.processSyncItem(item));
    await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error processing batch:', error);
    }
  }

  // Traiter un élément de synchronisation
  private async processSyncItem(item: SyncItem): Promise<void> {
    try {
      // Marquer comme en cours
      item.status = 'in_progress';
      item.lastAttempt = new Date();
      item.attempts++;

      // Vérifier si on peut retenter
      if (item.attempts > item.maxAttempts) {
        item.status = 'failed';
        item.error = 'Max retries exceeded';
      return;
    }

      // Vérifier le délai de retry
      if (item.retryAfter && new Date() < item.retryAfter) {
        item.status = 'pending';
        return;
      }

      // Effectuer la synchronisation selon le type
      let success = false;
      
      switch (item.type) {
        case 'create':
          success = await this.syncCreate(item);
          break;
        case 'update':
          success = await this.syncUpdate(item);
          break;
        case 'delete':
          success = await this.syncDelete(item);
          break;
      }

      if (success) {
      item.status = 'completed';
      this.syncQueue.delete(item.id);
      } else {
        item.status = 'failed';
        item.error = 'Sync operation failed';
        
        // Programmer le retry
        const retryDelay = Math.min(
          this.config.retryDelay * Math.pow(2, item.attempts - 1),
          5 * 60 * 1000 // Max 5 minutes
        );
        item.retryAfter = new Date(Date.now() + retryDelay);
      }

    } catch (error) {
      console.error(`Error processing sync item ${item.id}:`, error);
      item.status = 'failed';
      item.error = error instanceof Error ? error.message : 'Unknown error';
      
      // Programmer le retry
      const retryDelay = Math.min(
        this.config.retryDelay * Math.pow(2, item.attempts - 1),
        5 * 60 * 1000
      );
      item.retryAfter = new Date(Date.now() + retryDelay);
    }
  }

  // Synchroniser une création
  private async syncCreate(item: SyncItem): Promise<boolean> {
    try {
      // Simuler l'appel API
      console.log(`Syncing create: ${item.entity}`, item.data);
      
      // Ici, vous appelleriez votre API réelle
      // const response = await apiService.create(item.entity, item.data);
      
      // Pour l'instant, simuler un succès
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return true;
    } catch (error) {
      console.error(`Error syncing create for ${item.entity}:`, error);
      return false;
    }
  }

  // Synchroniser une mise à jour
  private async syncUpdate(item: SyncItem): Promise<boolean> {
    try {
      console.log(`Syncing update: ${item.entity}`, item.data);
      
      // Ici, vous appelleriez votre API réelle
      // const response = await apiService.update(item.entity, item.data.id, item.data);
      
      // Pour l'instant, simuler un succès
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return true;
    } catch (error) {
      console.error(`Error syncing update for ${item.entity}:`, error);
      return false;
    }
  }

  // Synchroniser une suppression
  private async syncDelete(item: SyncItem): Promise<boolean> {
    try {
      console.log(`Syncing delete: ${item.entity}`, item.data);
      
      // Ici, vous appelleriez votre API réelle
      // const response = await apiService.delete(item.entity, item.data.id);
      
      // Pour l'instant, simuler un succès
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return true;
    } catch (error) {
      console.error(`Error syncing delete for ${item.entity}:`, error);
      return false;
    }
  }

  // Démarrer la synchronisation automatique
  startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.config.autoSync) {
      this.processSyncQueue();
      }
    }, this.config.syncInterval);
    
    console.log('Auto-sync started');
  }

  // Arrêter la synchronisation automatique
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log('Auto-sync stopped');
  }

  // Forcer la synchronisation
  async forceSync(): Promise<void> {
    console.log('Force sync requested');
    await this.processSyncQueue();
  }

  // Vérifier le statut de la connectivité réseau
  private async checkNetworkStatus(): Promise<void> {
    try {
      // Vérifier la connectivité
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      this.isOnline = true;
      console.log('Network status: Online');
      
      // Déclencher la synchronisation si il y a des éléments en attente
      if (this.syncQueue.size > 0 && !this.syncInProgress) {
        this.processSyncQueue();
      }
    } catch (error) {
      this.isOnline = false;
      console.log('Network status: Offline');
    }

    // Vérifier à nouveau dans 30 secondes
    setTimeout(() => this.checkNetworkStatus(), 30000);
  }

  // Obtenir les statistiques de synchronisation
  getSyncStats(): SyncStats {
    const items = Array.from(this.syncQueue.values());
    
    return {
      totalItems: items.length,
      pendingItems: items.filter(item => item.status === 'pending').length,
      completedItems: 0, // Les éléments complétés sont supprimés de la queue
      failedItems: items.filter(item => item.status === 'failed').length,
      lastSync: this.lastSync || new Date(0),
      syncDuration: 0, // À implémenter
      conflicts: 0, // À implémenter
      errors: items.filter(item => item.error).length
    };
  }

  // Obtenir la configuration
  getConfig(): SyncConfig {
    return { ...this.config };
  }

  // Mettre à jour la configuration
  updateConfig(newConfig: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Redémarrer la synchronisation automatique si nécessaire
    if (this.config.autoSync) {
      this.startAutoSync();
    } else {
      this.stopAutoSync();
    }
  }

  // Obtenir la queue de synchronisation
  getSyncQueue(): SyncItem[] {
    return Array.from(this.syncQueue.values());
  }

  // Vider la queue de synchronisation
  clearSyncQueue(): void {
    this.syncQueue.clear();
    console.log('Sync queue cleared');
  }

  // Obtenir le statut en ligne
  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Résoudre un conflit
  async resolveConflict(conflict: ConflictResolution): Promise<boolean> {
    try {
      console.log('Resolving conflict:', conflict);
      
      // Ici, vous implémenteriez la logique de résolution de conflit
      // selon la stratégie configurée
      
      return true;
    } catch (error) {
      console.error('Error resolving conflict:', error);
      return false;
    }
  }

  // Méthodes utilitaires
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Nettoyer les éléments anciens
  cleanup(): void {
    const now = new Date();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 jours
    
    for (const [id, item] of this.syncQueue.entries()) {
      if (now.getTime() - item.createdAt.getTime() > maxAge) {
        this.syncQueue.delete(id);
      }
    }
    
    console.log('Sync queue cleaned up');
  }
}

export const hybridSyncService = HybridSyncService.getInstance();
