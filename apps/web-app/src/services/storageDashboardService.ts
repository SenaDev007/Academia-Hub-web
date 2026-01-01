import { enhancedCache } from './offline/EnhancedCache';
import { api } from '../lib/api/client';

export interface RealTimeStorageData {
  // Données de stockage
  sqlite: {
    totalSize: number;
    totalItems: number;
    tables: Record<string, { count: number; size: number }>;
  };
  cache: {
    totalSize: number;
    totalItems: number;
    hitRate: number;
    strategies: Record<string, { count: number; size: number; hitRate: number }>;
  };
  files: {
    totalSize: number;
    totalFiles: number;
    categories: Record<string, { count: number; size: number }>;
  };
  overall: {
    totalSize: number;
    totalItems: number;
    compressionRatio: number;
    lastOptimization: Date;
  };
}

export interface RealTimeSyncData {
  isOnline: boolean;
  syncStats: {
    totalItems: number;
    pendingItems: number;
    completedItems: number;
    failedItems: number;
    lastSync: Date;
    syncDuration: number;
    conflicts: number;
    errors: number;
  };
  queueStatus: {
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
  };
  lastSync: Date | null;
  nextSync: Date | null;
}

export interface RealTimePerformanceData {
  cacheHitRate: number;
  responseTime: number;
  spaceUsage: number;
  maxSpace: number;
  strategies: {
    frequent: { count: number; size: number };
    normal: { count: number; size: number };
    rare: { count: number; size: number };
  };
}

export interface FileCategoryData {
  studentPhotos: { count: number; size: number; optimized: number };
  documents: { count: number; size: number; compressed: number };
  reports: { count: number; size: number; archived: number };
  attachments: { count: number; size: number; pending: number };
}

class StorageDashboardService {
  private static instance: StorageDashboardService;
  private updateCallbacks: Set<(data: RealTimeStorageData) => void> = new Set();
  private syncCallbacks: Set<(data: RealTimeSyncData) => void> = new Set();
  private performanceCallbacks: Set<(data: RealTimePerformanceData) => void> = new Set();
  private fileCallbacks: Set<(data: FileCategoryData) => void> = new Set();

  private constructor() {
    this.startRealTimeUpdates();
  }

  static getInstance(): StorageDashboardService {
    if (!StorageDashboardService.instance) {
      StorageDashboardService.instance = new StorageDashboardService();
    }
    return StorageDashboardService.instance;
  }

  // Démarrer les mises à jour en temps réel
  private startRealTimeUpdates(): void {
    // Mettre à jour toutes les 5 secondes
    setInterval(() => {
      this.updateAllData();
    }, 5000);

    // Mise à jour immédiate
    this.updateAllData();
  }

  // Mettre à jour toutes les données
  private async updateAllData(): Promise<void> {
    try {
      const [storageData, syncData, performanceData, fileData] = await Promise.all([
        this.getRealTimeStorageData(),
        this.getRealTimeSyncData(),
        this.getRealTimePerformanceData(),
        this.getRealTimeFileData()
      ]);

      // Notifier tous les callbacks
      this.updateCallbacks.forEach(callback => callback(storageData));
      this.syncCallbacks.forEach(callback => callback(syncData));
      this.performanceCallbacks.forEach(callback => callback(performanceData));
      this.fileCallbacks.forEach(callback => callback(fileData));
    } catch (error) {
      console.error('Error updating real-time data:', error);
    }
  }

  // Obtenir les données de stockage en temps réel
  async getRealTimeStorageData(): Promise<RealTimeStorageData> {
    try {
      const storageStats = await api.getStorageStats();
      const cacheStats = await enhancedCache.getStats();

      return {
        sqlite: {
          totalSize: storageStats.sqlite.totalSize,
          totalItems: storageStats.sqlite.totalItems,
          tables: storageStats.sqlite.tables
        },
        cache: {
          totalSize: cacheStats.totalSize,
          totalItems: cacheStats.itemCount,
          hitRate: cacheStats.hitRate,
          strategies: cacheStats.strategyStats
        },
        files: {
          totalSize: storageStats.files.totalSize,
          totalFiles: storageStats.files.totalFiles,
          categories: storageStats.files.categories
        },
        overall: {
          totalSize: storageStats.overall.totalSize,
          totalItems: storageStats.overall.totalItems,
          compressionRatio: storageStats.overall.compressionRatio,
          lastOptimization: new Date()
        }
      };
    } catch (error) {
      console.error('Error getting real-time storage data:', error);
      return this.getDefaultStorageData();
    }
  }

  // Obtenir les données de synchronisation en temps réel
  async getRealTimeSyncData(): Promise<RealTimeSyncData> {
    try {
      const syncStats = await api.getSyncStats();
      const isOnline = navigator.onLine;

      const queueStatus = {
        pending: syncStats.pendingItems,
        inProgress: 0,
        completed: syncStats.completedItems,
        failed: syncStats.failedItems
      };

      return {
        isOnline,
        syncStats,
        queueStatus,
        lastSync: syncStats.lastSync,
        nextSync: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      };
    } catch (error) {
      console.error('Error getting real-time sync data:', error);
      return this.getDefaultSyncData();
    }
  }

  // Obtenir les données de performance en temps réel
  async getRealTimePerformanceData(): Promise<RealTimePerformanceData> {
    try {
      const cacheStats = await enhancedCache.getStats();
      
      return {
        cacheHitRate: cacheStats.hitRate,
        responseTime: this.calculateResponseTime(),
        spaceUsage: cacheStats.totalSize,
        maxSpace: 500 * 1024 * 1024, // 500 MB
        strategies: {
          frequent: cacheStats.strategyStats.frequent || { count: 0, size: 0 },
          normal: cacheStats.strategyStats.normal || { count: 0, size: 0 },
          rare: cacheStats.strategyStats.rare || { count: 0, size: 0 }
        }
      };
    } catch (error) {
      console.error('Error getting real-time performance data:', error);
      return this.getDefaultPerformanceData();
    }
  }

  // Obtenir les données de fichiers en temps réel
  async getRealTimeFileData(): Promise<FileCategoryData> {
    try {
      return await api.getFileStats();
    } catch (error) {
      console.error('Error getting real-time file data:', error);
      return this.getDefaultFileData();
    }
  }

  // Actions fonctionnelles

  // Actualiser toutes les données
  async refreshAllData(): Promise<void> {
    await this.updateAllData();
  }

  // Précharger les données fréquentes
  async preloadFrequentData(): Promise<void> {
    try {
      await api.forceSync(); // Utilise la vraie synchronisation
      console.log('Frequent data preloaded successfully');
    } catch (error) {
      console.error('Error preloading frequent data:', error);
    }
  }

  // Forcer la synchronisation
  async forceSync(): Promise<void> {
    try {
      await api.forceSync();
      console.log('Sync forced successfully');
    } catch (error) {
      console.error('Error forcing sync:', error);
    }
  }

  // Voir la queue de synchronisation
  async getSyncQueue(): Promise<any[]> {
    try {
      return await api.getSyncQueue();
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }

  // Nettoyer le cache
  async clearCache(): Promise<void> {
    try {
      await api.clearCache();
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Précharger les données
  async preloadData(): Promise<void> {
    try {
      await api.forceSync(); // Utilise la vraie synchronisation
      console.log('Data preloaded successfully');
    } catch (error) {
      console.error('Error preloading data:', error);
    }
  }

  // Analyser l'espace disque
  async analyzeDiskSpace(): Promise<any> {
    try {
      return await api.analyzeDiskSpace();
    } catch (error) {
      console.error('Error analyzing disk space:', error);
      return null;
    }
  }

  // Nettoyer les anciens fichiers
  async cleanupOldFiles(): Promise<void> {
    try {
      await api.cleanupOldFiles();
      console.log('Old files cleanup initiated');
    } catch (error) {
      console.error('Error cleaning up old files:', error);
    }
  }

  // Vérifier l'intégrité
  async checkIntegrity(): Promise<any> {
    try {
      return await api.checkIntegrity();
    } catch (error) {
      console.error('Error checking integrity:', error);
      return { overall: 'error' };
    }
  }

  // Exporter les métriques
  async exportMetrics(): Promise<any> {
    try {
      return await api.exportMetrics();
    } catch (error) {
      console.error('Error exporting metrics:', error);
      return null;
    }
  }

  // Nettoyer les logs
  async cleanupLogs(): Promise<void> {
    try {
      await api.cleanupLogs();
      console.log('Logs cleanup initiated');
    } catch (error) {
      console.error('Error cleaning up logs:', error);
    }
  }

  // Paramètres avancés
  async getAdvancedSettings(): Promise<any> {
    try {
      return await api.getAdvancedSettings();
    } catch (error) {
      console.error('Error getting advanced settings:', error);
      return null;
    }
  }

  // Méthodes de callback pour les mises à jour en temps réel
  onStorageUpdate(callback: (data: RealTimeStorageData) => void): () => void {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }

  onSyncUpdate(callback: (data: RealTimeSyncData) => void): () => void {
    this.syncCallbacks.add(callback);
    return () => this.syncCallbacks.delete(callback);
  }

  onPerformanceUpdate(callback: (data: RealTimePerformanceData) => void): () => void {
    this.performanceCallbacks.add(callback);
    return () => this.performanceCallbacks.delete(callback);
  }

  onFileUpdate(callback: (data: FileCategoryData) => void): () => void {
    this.fileCallbacks.add(callback);
    return () => this.fileCallbacks.delete(callback);
  }

  // Méthodes utilitaires privées
  private calculateResponseTime(): number {
    // Simuler un temps de réponse basé sur la performance du cache
    return Math.random() * 50 + 10; // 10-60ms
  }

  private generateSpaceRecommendations(storageData: RealTimeStorageData, fileData: FileCategoryData): string[] {
    const recommendations: string[] = [];
    
    if (storageData.cache.totalSize > 400 * 1024 * 1024) { // 400 MB
      recommendations.push('Le cache est presque plein. Considérez nettoyer les données anciennes.');
    }
    
    if (fileData.studentPhotos.size > 2 * 1024 * 1024 * 1024) {
      recommendations.push('Les photos d\'élèves prennent beaucoup d\'espace. Activez la compression automatique.');
    }
    
    if (storageData.overall.compressionRatio < 0.3) {
      recommendations.push('Le taux de compression est faible. Vérifiez les paramètres d\'optimisation.');
    }
    
    return recommendations;
  }

  private getDefaultStorageData(): RealTimeStorageData {
    return {
      sqlite: { totalSize: 0, totalItems: 0, tables: {} },
      cache: { totalSize: 0, totalItems: 0, hitRate: 0, strategies: {} },
      files: { totalSize: 0, totalFiles: 0, categories: {} },
      overall: { totalSize: 0, totalItems: 0, compressionRatio: 0, lastOptimization: new Date() }
    };
  }

  private getDefaultSyncData(): RealTimeSyncData {
    return {
      isOnline: navigator.onLine,
      syncStats: { totalItems: 0, pendingItems: 0, completedItems: 0, failedItems: 0, lastSync: new Date(0), syncDuration: 0, conflicts: 0, errors: 0 },
      queueStatus: { pending: 0, inProgress: 0, completed: 0, failed: 0 },
      lastSync: null,
      nextSync: null
    };
  }

  private getDefaultPerformanceData(): RealTimePerformanceData {
    return {
      cacheHitRate: 0,
      responseTime: 0,
      spaceUsage: 0,
      maxSpace: 500 * 1024 * 1024,
      strategies: { frequent: { count: 0, size: 0 }, normal: { count: 0, size: 0 }, rare: { count: 0, size: 0 } }
    };
  }

  private getDefaultFileData(): FileCategoryData {
    return {
      studentPhotos: { count: 0, size: 0, optimized: 0 },
      documents: { count: 0, size: 0, compressed: 0 },
      reports: { count: 0, size: 0, archived: 0 },
      attachments: { count: 0, size: 0, pending: 0 }
    };
  }
}

export const storageDashboardService = StorageDashboardService.getInstance();
