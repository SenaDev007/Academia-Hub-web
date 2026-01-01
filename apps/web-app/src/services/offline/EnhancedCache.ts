import { UniversalCache } from './UniversalCache';

export interface CacheStrategy {
  type: 'frequent' | 'normal' | 'rare';
  ttl: number; // Time to live en millisecondes
  maxSize: number; // Taille maximale en bytes
  priority: number; // 1 = haute priorité, 5 = basse priorité
}

export interface CacheItem<T = any> {
  key: string;
  data: T;
  timestamp: number;
  expiry: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
  strategy: CacheStrategy;
  tags?: string[];
}

export interface CacheStats {
  totalSize: number;
  itemCount: number;
  hitRate: number;
  lastCleanup: number;
  strategyStats: Record<string, { count: number; size: number; hitRate: number }>;
}

export class EnhancedCache {
  private static instance: EnhancedCache;
  private dbName = 'AcademiaHubEnhancedCache';
  private dbVersion = 2;
  private db: IDBDatabase | null = null;
  private stats: CacheStats = {
    totalSize: 0,
    itemCount: 0,
    hitRate: 0,
    lastCleanup: Date.now(),
    strategyStats: {}
  };
  private hits = 0;
  private misses = 0;
  private strategies: Map<string, CacheStrategy> = new Map();

  private constructor() {
    this.initializeStrategies();
    this.initDB();
  }

  static getInstance(): EnhancedCache {
    if (!EnhancedCache.instance) {
      EnhancedCache.instance = new EnhancedCache();
    }
    return EnhancedCache.instance;
  }

  private initializeStrategies(): void {
    // Stratégie pour les données fréquemment accédées (étudiants, classes, etc.)
    this.strategies.set('frequent', {
      type: 'frequent',
      ttl: 24 * 60 * 60 * 1000, // 24 heures
      maxSize: 50 * 1024 * 1024, // 50MB
      priority: 1
    });

    // Stratégie pour les données normales (examens, notes, etc.)
    this.strategies.set('normal', {
      type: 'normal',
      ttl: 12 * 60 * 60 * 1000, // 12 heures
      maxSize: 100 * 1024 * 1024, // 100MB
      priority: 3
    });

    // Stratégie pour les données rarement accédées (historique, archives, etc.)
    this.strategies.set('rare', {
      type: 'rare',
      ttl: 6 * 60 * 60 * 1000, // 6 heures
      maxSize: 25 * 1024 * 1024, // 25MB
      priority: 5
    });
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store principal pour les données avec stratégies
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('expiry', 'expiry');
          store.createIndex('strategy', 'strategy.type');
          store.createIndex('tags', 'tags');
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    return this.db!;
  }

  async set<T>(
    key: string, 
    data: T, 
    strategyType: 'frequent' | 'normal' | 'rare' = 'normal',
    tags?: string[]
  ): Promise<void> {
    try {
      const strategy = this.strategies.get(strategyType);
      if (!strategy) {
        throw new Error(`Strategy ${strategyType} not found`);
      }

      const db = await this.ensureDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');

      const item: CacheItem<T> = {
        key,
        data,
        timestamp: Date.now(),
        expiry: Date.now() + strategy.ttl,
        size: JSON.stringify(data).length,
        accessCount: 0,
        lastAccessed: Date.now(),
        strategy,
        tags
      };

      return new Promise((resolve, reject) => {
        const request = store.put(item);
        
        request.onsuccess = () => {
          this.updateStats();
          resolve();
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error setting cache item:', error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        
        request.onsuccess = () => {
          const result = request.result as CacheItem<T>;
          
          if (!result) {
            this.misses++;
            resolve(null);
            return;
          }

          // Vérifier l'expiration
          if (Date.now() > result.expiry) {
            this.delete(key); // Nettoyage asynchrone
            this.misses++;
            resolve(null);
            return;
          }

          // Mettre à jour les statistiques d'accès
          result.accessCount++;
          result.lastAccessed = Date.now();
          
          // Mettre à jour dans la base
          const updateRequest = store.put(result);
          updateRequest.onsuccess = () => {
            this.hits++;
            this.updateStats();
            resolve(result.data);
          };
          
          updateRequest.onerror = () => reject(updateRequest.error);
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting cache item:', error);
      return null;
    }
  }

  async getMultiple<T>(keys: string[]): Promise<Map<string, T>> {
    const results = new Map<string, T>();
    
    for (const key of keys) {
      const data = await this.get<T>(key);
      if (data !== null) {
        results.set(key, data);
      }
    }
    
    return results;
  }

  async delete(key: string): Promise<boolean> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      return new Promise((resolve, reject) => {
        const request = store.delete(key);
        
        request.onsuccess = () => {
          this.updateStats();
          resolve(true);
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error deleting cache item:', error);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      return new Promise((resolve, reject) => {
        const request = store.clear();
        
        request.onsuccess = () => {
          this.stats.totalSize = 0;
          this.stats.itemCount = 0;
          this.hits = 0;
          this.misses = 0;
          resolve();
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  async getByTags(tags: string[]): Promise<CacheItem[]> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        
        request.onsuccess = () => {
          const items = request.result as CacheItem[];
          const filtered = items.filter(item => 
            item.tags && tags.some(tag => item.tags!.includes(tag))
          );
          resolve(filtered);
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting items by tags:', error);
      return [];
    }
  }

  async cleanup(): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('expiry');
      
      const now = Date.now();
      const range = IDBKeyRange.upperBound(now);
      
      return new Promise((resolve, reject) => {
        const request = index.openCursor(range);
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            this.stats.lastCleanup = now;
            this.updateStats();
            resolve();
          }
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  async getStats(): Promise<CacheStats> {
    await this.updateStats();
    return { ...this.stats };
  }

  private async updateStats(): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        
        request.onsuccess = () => {
          const items = request.result as CacheItem[];
          const now = Date.now();
          
          // Filtrer les éléments valides
          const validItems = items.filter(item => item.expiry > now);
          
          // Calculer les statistiques globales
          this.stats.totalSize = validItems.reduce((sum, item) => sum + item.size, 0);
          this.stats.itemCount = validItems.length;
          this.stats.hitRate = this.hits + this.misses > 0 
            ? (this.hits / (this.hits + this.misses)) * 100 
            : 0;
          
          // Calculer les statistiques par stratégie
          this.stats.strategyStats = {};
          for (const strategy of this.strategies.values()) {
            const strategyItems = validItems.filter(item => item.strategy.type === strategy.type);
            const strategyHits = strategyItems.reduce((sum, item) => sum + item.accessCount, 0);
            
            this.stats.strategyStats[strategy.type] = {
              count: strategyItems.length,
              size: strategyItems.reduce((sum, item) => sum + item.size, 0),
              hitRate: strategyHits > 0 ? (strategyHits / (strategyHits + strategyItems.length)) * 100 : 0
            };
          }
          
          resolve();
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  // Nettoyage automatique périodique
  startAutoCleanup(interval: number = 30 * 60 * 1000): void { // 30 minutes par défaut
    setInterval(() => {
      this.cleanup();
    }, interval);
  }

  // Préchargement intelligent basé sur les patterns d'usage
  async preloadFrequentData(): Promise<void> {
    try {
      // Cette méthode peut être étendue pour précharger les données fréquemment utilisées
      console.log('Preloading frequent data...');
    } catch (error) {
      console.error('Error preloading frequent data:', error);
    }
  }
}

export const enhancedCache = EnhancedCache.getInstance();