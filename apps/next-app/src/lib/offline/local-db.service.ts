/**
 * Local Database Service
 * 
 * Service pour gérer la base de données locale SQLite (ou IndexedDB pour Web)
 * 
 * PRINCIPE : Base locale complète avec toutes les tables métier
 */

import type { SyncEntityType } from '@/types';

// Pour Web : utiliser IndexedDB via idb
// Pour Desktop : utiliser better-sqlite3
// Cette implémentation est une abstraction

interface LocalDbConfig {
  dbName: string;
  version: number;
}

class LocalDbService {
  private db: any; // IDBDatabase pour Web, Database pour Desktop
  private isInitialized: boolean = false;

  constructor(private config: LocalDbConfig) {}

  /**
   * Initialise la base de données locale
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Détection de l'environnement
    if (typeof window !== 'undefined') {
      // Web : IndexedDB
      await this.initializeIndexedDB();
    } else {
      // Desktop : SQLite
      await this.initializeSQLite();
    }

    this.isInitialized = true;
  }

  /**
   * Initialise IndexedDB (Web)
   */
  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        this.createObjectStores(db);
      };
    });
  }

  /**
   * Crée les object stores (IndexedDB)
   */
  private createObjectStores(db: IDBDatabase): void {
    // Object store pour chaque entité
    const entities: SyncEntityType[] = [
      'student', 'grade', 'payment', 'teacher', 'class',
      'subject', 'exam', 'attendance', 'invoice'
    ];

    entities.forEach(entity => {
      if (!db.objectStoreNames.contains(`${entity}s`)) {
        const store = db.createObjectStore(`${entity}s`, { keyPath: 'id' });
        store.createIndex('tenant_id', 'tenantId', { unique: false });
        store.createIndex('_is_dirty', '_isDirty', { unique: false });
        store.createIndex('_last_sync', '_lastSync', { unique: false });
      }
    });

    // Object store pour l'outbox
    if (!db.objectStoreNames.contains('outbox_events')) {
      const outboxStore = db.createObjectStore('outbox_events', { keyPath: 'id' });
      outboxStore.createIndex('status', 'status', { unique: false });
      outboxStore.createIndex('tenant_id', 'tenantId', { unique: false });
      outboxStore.createIndex('created_at', 'createdAt', { unique: false });
    }

    // Object store pour sync_state
    if (!db.objectStoreNames.contains('sync_state')) {
      db.createObjectStore('sync_state', { keyPath: 'tenantId' });
    }
  }

  /**
   * Initialise SQLite (Desktop)
   */
  private async initializeSQLite(): Promise<void> {
    // Pour Desktop, utiliser better-sqlite3
    // Cette partie sera implémentée dans l'app Desktop
    const { Database } = require('better-sqlite3');
    const path = require('path');
    const { app } = require('electron');

    const dbPath = path.join(app.getPath('userData'), `${this.config.dbName}.db`);
    this.db = new Database(dbPath);

    // Exécuter le schéma SQLite
    await this.executeSQLiteSchema();
  }

  /**
   * Exécute le schéma SQLite
   */
  private async executeSQLiteSchema(): Promise<void> {
    // Le schéma sera chargé depuis un fichier SQL
    // Pour l'instant, placeholder
  }

  /**
   * Exécute une requête (lecture)
   */
  async query<T>(storeName: string, query?: (store: IDBObjectStore) => IDBRequest<T[]>): Promise<T[]> {
    await this.ensureInitialized();

    if (typeof window !== 'undefined') {
      // IndexedDB
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        
        if (query) {
          const request = query(store);
          request.onsuccess = () => resolve(Array.from(request.result || []));
          request.onerror = () => reject(request.error);
        } else {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        }
      });
    } else {
      // SQLite (Desktop)
      // Implémentation à faire
      throw new Error('SQLite query not implemented yet');
    }
  }

  /**
   * Exécute une commande (écriture)
   */
  async execute(storeName: string, operation: 'add' | 'put' | 'delete', data: any): Promise<void> {
    await this.ensureInitialized();

    if (typeof window !== 'undefined') {
      // IndexedDB
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        let request: IDBRequest;
        switch (operation) {
          case 'add':
            request = store.add(data);
            break;
          case 'put':
            request = store.put(data);
            break;
          case 'delete':
            request = store.delete(data.id || data);
            break;
          default:
            reject(new Error('Invalid operation'));
            return;
        }

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } else {
      // SQLite (Desktop)
      throw new Error('SQLite execute not implemented yet');
    }
  }

  /**
   * S'assure que la DB est initialisée
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }
}

// Instance singleton
export const localDb = new LocalDbService({
  dbName: 'academia-hub-local',
  version: 1
});

