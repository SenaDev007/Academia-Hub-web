import { fileStorageService, FileMetadata } from './fileStorageService';
import { enhancedCache } from './offline/EnhancedCache';
import { imageOptimizationService } from './imageOptimizationService';

export interface StorageStrategy {
  type: 'immediate' | 'lazy' | 'background';
  priority: 'high' | 'medium' | 'low';
  cacheStrategy: 'frequent' | 'normal' | 'rare';
}

export interface StorageItem<T = any> {
  id: string;
  data: T;
  metadata: FileMetadata | null;
  cacheKey: string;
  strategy: StorageStrategy;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  size: number;
}

export interface StorageStats {
  sqlite: {
    totalItems: number;
    totalSize: number;
    tables: Record<string, { count: number; size: number }>;
  };
  cache: {
    totalItems: number;
    totalSize: number;
    hitRate: number;
    strategies: Record<string, { count: number; size: number; hitRate: number }>;
  };
  files: {
    totalFiles: number;
    totalSize: number;
    categories: Record<string, { count: number; size: number }>;
  };
  overall: {
    totalItems: number;
    totalSize: number;
    compressionRatio: number;
  };
}

class HybridStorageService {
  private static instance: HybridStorageService;
  private storageItems: Map<string, StorageItem> = new Map();
  private strategies: Map<string, StorageStrategy> = new Map();

  private constructor() {
    this.initializeStrategies();
  }

  static getInstance(): HybridStorageService {
    if (!HybridStorageService.instance) {
      HybridStorageService.instance = new HybridStorageService();
    }
    return HybridStorageService.instance;
  }

  private initializeStrategies(): void {
    // Stratégie pour les données critiques (étudiants, classes, etc.)
    this.strategies.set('critical', {
      type: 'immediate',
      priority: 'high',
      cacheStrategy: 'frequent'
    });

    // Stratégie pour les données importantes (examens, notes, etc.)
    this.strategies.set('important', {
      type: 'immediate',
      priority: 'medium',
      cacheStrategy: 'normal'
    });

    // Stratégie pour les données secondaires (historique, archives, etc.)
    this.strategies.set('secondary', {
      type: 'lazy',
      priority: 'low',
      cacheStrategy: 'rare'
    });

    // Stratégie pour les fichiers lourds
    this.strategies.set('heavy_files', {
      type: 'background',
      priority: 'low',
      cacheStrategy: 'rare'
    });
  }

  // Méthode principale pour stocker des données avec stratégie hybride
  async store<T>(
    key: string,
    data: T,
    strategyType: string = 'important',
    fileData?: { file: File | Buffer; metadata: Omit<FileMetadata, 'id' | 'storedName' | 'path' | 'uploadedAt' | 'isCompressed'> }
  ): Promise<StorageItem<T>> {
    try {
      const strategy = this.strategies.get(strategyType) || this.strategies.get('important')!;
      const cacheKey = this.generateCacheKey(key, strategyType);

      let fileMetadata: FileMetadata | null = null;

      // Si des données de fichier sont fournies, les stocker localement
      if (fileData) {
        fileMetadata = await fileStorageService.storeFile(
          fileData.file,
          fileData.metadata
        );
      }

      // Stocker dans le cache selon la stratégie
      await enhancedCache.set(
        cacheKey,
        data,
        strategy.cacheStrategy as 'frequent' | 'normal' | 'rare',
        [strategyType, 'data']
      );

      const storageItem: StorageItem<T> = {
        id: key,
        data,
        metadata: fileMetadata,
        cacheKey,
        strategy,
        createdAt: new Date(),
        lastAccessed: new Date(),
        accessCount: 1,
        size: this.calculateSize(data) + (fileMetadata?.size || 0)
      };

      this.storageItems.set(key, storageItem);

      return storageItem;
    } catch (error) {
      console.error('Error storing data with hybrid strategy:', error);
      throw error;
    }
  }

  // Méthode pour récupérer des données avec stratégie hybride
  async get<T>(key: string): Promise<T | null> {
    try {
      const storageItem = this.storageItems.get(key);
      if (!storageItem) {
        return null;
      }

      // Mettre à jour les statistiques d'accès
      storageItem.accessCount++;
      storageItem.lastAccessed = new Date();

      // Récupérer depuis le cache
      const data = await enhancedCache.get<T>(storageItem.cacheKey);
      
      if (data) {
        return data;
      }

      // Si pas dans le cache, essayer de récupérer depuis le stockage local
      if (storageItem.metadata) {
        const fileData = await fileStorageService.getFile(storageItem.metadata.id);
        if (fileData) {
          // Remettre en cache
          await enhancedCache.set(
            storageItem.cacheKey,
            storageItem.data,
            storageItem.strategy.cacheStrategy as 'frequent' | 'normal' | 'rare'
          );
          return storageItem.data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error retrieving data with hybrid strategy:', error);
      return null;
    }
  }

  // Méthode pour stocker des données d'étudiant avec optimisation
  async storeStudentData<T>(
    studentId: string,
    data: T,
    photoFile?: File
  ): Promise<StorageItem<T>> {
    try {
      let fileMetadata: FileMetadata | null = null;

      // Si une photo est fournie, l'optimiser et la stocker
      if (photoFile) {
        const photoBuffer = Buffer.from(await photoFile.arrayBuffer());
        const optimizedPhoto = await imageOptimizationService.optimizeStudentPhoto(
          photoBuffer,
          photoFile.type
        );

        fileMetadata = await fileStorageService.storeFile(
          optimizedPhoto,
          {
            originalName: photoFile.name,
            mimeType: photoFile.type,
            category: 'student_photo',
            uploadedBy: 'system',
            tags: ['student', studentId, 'photo']
          }
        );
      }

      // Stocker avec stratégie critique
      return this.store(
        `student:${studentId}`,
        data,
        'critical',
        fileMetadata ? {
          file: Buffer.from([]), // Données déjà stockées
          metadata: {
            originalName: fileMetadata.originalName,
            mimeType: fileMetadata.mimeType,
            category: fileMetadata.category,
            uploadedBy: fileMetadata.uploadedBy,
            tags: fileMetadata.tags
          }
        } : undefined
      );
    } catch (error) {
      console.error('Error storing student data:', error);
      throw error;
    }
  }

  // Méthode pour stocker des documents avec compression
  async storeDocument<T>(
    documentId: string,
    data: T,
    documentFile: File,
    category: 'document' | 'report' | 'attachment' = 'document'
  ): Promise<StorageItem<T>> {
    try {
      // Optimiser le document selon sa catégorie
      let optimizedFile: Buffer;
      
      if (documentFile.type.startsWith('image/')) {
        optimizedFile = await imageOptimizationService.optimizeDocumentImage(
          Buffer.from(await documentFile.arrayBuffer()),
          documentFile.type
        );
      } else {
        optimizedFile = Buffer.from(await documentFile.arrayBuffer());
      }

      const fileMetadata = await fileStorageService.storeFile(
        optimizedFile,
        {
          originalName: documentFile.name,
          mimeType: documentFile.type,
          category,
          uploadedBy: 'system',
          tags: ['document', documentId, category]
        }
      );

      // Stocker avec stratégie importante
      return this.store(
        `document:${documentId}`,
        data,
        'important',
        {
          file: optimizedFile,
          metadata: {
            originalName: fileMetadata.originalName,
            mimeType: fileMetadata.mimeType,
            category: fileMetadata.category,
            uploadedBy: fileMetadata.uploadedBy,
            tags: fileMetadata.tags
          }
        }
      );
    } catch (error) {
      console.error('Error storing document:', error);
      throw error;
    }
  }

  // Méthode pour récupérer des données avec préchargement intelligent
  async getWithPreload<T>(key: string, relatedKeys?: string[]): Promise<T | null> {
    try {
      // Récupérer les données principales
      const data = await this.get<T>(key);
      
      // Précharger les données liées si spécifiées
      if (relatedKeys && relatedKeys.length > 0) {
        this.preloadRelatedData(relatedKeys);
      }
      
      return data;
    } catch (error) {
      console.error('Error getting data with preload:', error);
      return null;
    }
  }

  // Méthode pour précharger des données liées
  private async preloadRelatedData(keys: string[]): Promise<void> {
    try {
      for (const key of keys) {
        // Vérifier si la donnée est déjà en cache
        const storageItem = this.storageItems.get(key);
        if (storageItem) {
          // Remettre en cache avec priorité élevée
          await enhancedCache.set(
            storageItem.cacheKey,
            storageItem.data,
            'frequent',
            ['preload', key]
          );
        }
      }
    } catch (error) {
      console.error('Error preloading related data:', error);
    }
  }

  // Méthode pour nettoyer le stockage selon les stratégies
  async cleanup(): Promise<void> {
    try {
      // Nettoyer le cache
      await enhancedCache.cleanup();
      
      // Nettoyer les éléments de stockage expirés
      const now = Date.now();
      const expiredItems: string[] = [];
      
      for (const [key, item] of this.storageItems.entries()) {
        const age = now - item.lastAccessed.getTime();
        const maxAge = this.getMaxAge(item.strategy);
        
        if (age > maxAge) {
          expiredItems.push(key);
        }
      }
      
      // Supprimer les éléments expirés
      for (const key of expiredItems) {
        const item = this.storageItems.get(key);
        if (item) {
          // Supprimer du cache
          await enhancedCache.delete(item.cacheKey);
          
          // Supprimer le fichier si il existe
          if (item.metadata) {
            await fileStorageService.deleteFile(item.metadata.id);
          }
          
          // Supprimer de la liste
          this.storageItems.delete(key);
        }
      }
      
      console.log(`Cleaned up ${expiredItems.length} expired items`);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Méthode pour obtenir les statistiques complètes
  async getStorageStats(): Promise<StorageStats> {
    try {
      const cacheStats = await enhancedCache.getStats();
      const fileStats = await fileStorageService.getStorageStats();
      
      // Calculer les statistiques globales
      const totalItems = this.storageItems.size + cacheStats.itemCount;
      const totalSize = this.calculateTotalSize() + cacheStats.totalSize + fileStats.totalSize;
      
      const stats: StorageStats = {
        sqlite: {
          totalItems: this.storageItems.size,
          totalSize: this.calculateTotalSize(),
          tables: {} // À implémenter avec la base SQLite
        },
        cache: {
          totalItems: cacheStats.itemCount,
          totalSize: cacheStats.totalSize,
          hitRate: cacheStats.hitRate,
          strategies: cacheStats.strategyStats
        },
        files: {
          totalFiles: fileStats.totalFiles,
          totalSize: fileStats.totalSize,
          categories: fileStats.categoryBreakdown
        },
        overall: {
          totalItems,
          totalSize,
          compressionRatio: this.calculateCompressionRatio()
        }
      };
      
      return stats;
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw error;
    }
  }

  // Méthodes utilitaires privées
  private generateCacheKey(key: string, strategyType: string): string {
    return `${strategyType}:${key}:${Date.now()}`;
  }

  private calculateSize(data: any): number {
    try {
      const jsonString = JSON.stringify(data);
      return new Blob([jsonString]).size;
    } catch (error) {
      return 1024; // Taille par défaut
    }
  }

  private calculateTotalSize(): number {
    let totalSize = 0;
    for (const item of this.storageItems.values()) {
      totalSize += item.size;
    }
    return totalSize;
  }

  private calculateCompressionRatio(): number {
    // À implémenter avec des métriques réelles de compression
    return 0;
  }

  private getMaxAge(strategy: StorageStrategy): number {
    const maxAges: Record<string, number> = {
      'immediate': 24 * 60 * 60 * 1000, // 24 heures
      'lazy': 12 * 60 * 60 * 1000, // 12 heures
      'background': 6 * 60 * 60 * 1000 // 6 heures
    };
    
    return maxAges[strategy.type] || 12 * 60 * 60 * 1000;
  }

  // Méthode pour démarrer le nettoyage automatique
  startAutoCleanup(interval: number = 60 * 60 * 1000): void { // 1 heure par défaut
    setInterval(() => {
      this.cleanup();
    }, interval);
  }

  // Méthode pour obtenir un élément de stockage
  getStorageItem(key: string): StorageItem | undefined {
    return this.storageItems.get(key);
  }

  // Méthode pour lister tous les éléments de stockage
  getAllStorageItems(): StorageItem[] {
    return Array.from(this.storageItems.values());
  }

  // Méthode pour obtenir les stratégies disponibles
  getAvailableStrategies(): Map<string, StorageStrategy> {
    return new Map(this.strategies);
  }
}

export const hybridStorageService = HybridStorageService.getInstance();
