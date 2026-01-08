interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number;
  size: number;
}

interface CacheStats {
  totalSize: number;
  itemCount: number;
  hitRate: number;
  lastCleanup: number;
}

export class UniversalCache {
  private static instance: UniversalCache;
  private dbName = 'AcademiaHubCache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private stats: CacheStats = {
    totalSize: 0,
    itemCount: 0,
    hitRate: 0,
    lastCleanup: Date.now()
  };
  private hits = 0;
  private misses = 0;

  private constructor() {
    this.initDB();
  }

  static getInstance(): UniversalCache {
    if (!UniversalCache.instance) {
      UniversalCache.instance = new UniversalCache();
    }
    return UniversalCache.instance;
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
        
        // Store principal pour les données
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('expiry', 'expiry');
        }

        // Store pour les métadonnées
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
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

  async get(key: string): Promise<any> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        
        request.onsuccess = () => {
          const result = request.result;
          
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

          this.hits++;
          resolve(result.data);
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Erreur lors de la lecture du cache:', error);
      return null;
    }
  }

  async set(key: string, data: any, ttl: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const db = await this.ensureDB();
      const serializedData = JSON.stringify(data);
      const size = new Blob([serializedData]).size;
      
      // Vérifier les limites de taille
      if (size > 10 * 1024 * 1024) { // 10MB par item
        throw new Error('Données trop volumineuses pour le cache');
      }

      const item: CacheItem = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + ttl,
        size
      };

      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      return new Promise((resolve, reject) => {
        const request = store.put({ key, ...item });
        
        request.onsuccess = () => {
          this.updateStats();
          resolve();
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Erreur lors de l\'écriture du cache:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      return new Promise((resolve, reject) => {
        const request = store.delete(key);
        
        request.onsuccess = () => {
          this.updateStats();
          resolve();
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du cache:', error);
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
          this.stats = {
            totalSize: 0,
            itemCount: 0,
            hitRate: 0,
            lastCleanup: Date.now()
          };
          this.hits = 0;
          this.misses = 0;
          resolve();
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Erreur lors du nettoyage du cache:', error);
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
      console.error('Erreur lors du nettoyage automatique:', error);
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
          const items = request.result;
          let totalSize = 0;
          let validItems = 0;
          const now = Date.now();
          
          items.forEach(item => {
            if (item.expiry > now) {
              totalSize += item.size || 0;
              validItems++;
            }
          });
          
          this.stats.totalSize = totalSize;
          this.stats.itemCount = validItems;
          this.stats.hitRate = this.hits + this.misses > 0 
            ? (this.hits / (this.hits + this.misses)) * 100 
            : 0;
          
          resolve();
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des stats:', error);
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      
      return new Promise((resolve, reject) => {
        const request = store.getAllKeys();
        
        request.onsuccess = () => {
          resolve(request.result as string[]);
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des clés:', error);
      return [];
    }
  }

  // Nettoyage automatique périodique
  startAutoCleanup(interval: number = 60 * 60 * 1000): void { // 1 heure par défaut
    setInterval(() => {
      this.cleanup();
    }, interval);
  }
}