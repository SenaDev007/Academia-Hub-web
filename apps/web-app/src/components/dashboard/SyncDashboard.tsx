import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Pause,
  Settings,
  Trash2,
  BarChart3
} from 'lucide-react';
import { hybridSyncService, SyncStats, SyncItem, SyncConfig } from '../../services/hybridSyncService';
import { localDatabaseService } from '../../services/localDatabaseService';

const SyncDashboard: React.FC = () => {
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [syncConfig, setSyncConfig] = useState<SyncConfig | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadSyncData();
    // Mettre à jour les données toutes les 10 secondes
    const interval = setInterval(loadSyncData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadSyncData = async () => {
    try {
      setLoading(true);
      const [stats, queue, config, online] = await Promise.all([
        hybridSyncService.getSyncStats(),
        hybridSyncService.getSyncQueue(),
        hybridSyncService.getConfig(),
        localDatabaseService.isOnline()
      ]);
      
      setSyncStats(stats);
      setSyncQueue(queue);
      setSyncConfig(config);
      setIsOnline(online);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading sync data:', error);
    } finally {
      setLoading(false);
    }
  };

  const forceSync = async () => {
    try {
      await localDatabaseService.forceSync();
      await loadSyncData();
    } catch (error) {
      console.error('Error forcing sync:', error);
    }
  };

  const clearSyncQueue = async () => {
    try {
      await localDatabaseService.clearSyncQueue();
      await loadSyncData();
    } catch (error) {
      console.error('Error clearing sync queue:', error);
    }
  };

  const toggleAutoSync = async () => {
    if (syncConfig) {
      const newConfig = { ...syncConfig, autoSync: !syncConfig.autoSync };
      await localDatabaseService.updateSyncConfig(newConfig);
      await loadSyncData();
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'in_progress': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'in_progress': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tableau de bord de synchronisation
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gestion de la synchronisation hybride avec le serveur distant
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={forceSync}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Forcer la sync
          </button>
          <button
            onClick={clearSyncQueue}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Vider la queue
          </button>
        </div>
      </div>

      {/* Statut de connectivité */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Statut de connectivité
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isOnline ? (
                <Wifi className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
              ) : (
                <WifiOff className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {isOnline ? 'En ligne' : 'Hors ligne'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isOnline ? 'Synchronisation active' : 'Synchronisation en attente'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleAutoSync}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                syncConfig?.autoSync
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {syncConfig?.autoSync ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Auto-sync activé
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Auto-sync désactivé
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques de synchronisation */}
      {syncStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total en queue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {syncStats.totalItems}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  En attente
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {syncStats.pendingItems}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Échecs
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {syncStats.failedItems}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Dernière sync
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {syncStats.lastSync ? formatDate(syncStats.lastSync) : 'Jamais'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration de synchronisation */}
      {syncConfig && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Configuration
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Intervalle de synchronisation
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {Math.round(syncConfig.syncInterval / 60000)} minutes
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Taille des lots
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {syncConfig.batchSize} éléments
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Tentatives maximales
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {syncConfig.maxRetries} tentatives
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Résolution de conflits
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {syncConfig.conflictResolution}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Queue de synchronisation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Queue de synchronisation
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {syncQueue.length} éléments en attente
          </p>
        </div>
        <div className="p-6">
          {syncQueue.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Aucun élément en attente de synchronisation
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {syncQueue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.type.toUpperCase()} {item.entity}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Priorité: {item.priority} • Tentatives: {item.attempts}/{item.maxAttempts}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Créé: {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {item.error && (
                    <div className="text-right">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Erreur: {item.error}
                      </p>
                      {item.retryAfter && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Retry: {formatDate(item.retryAfter)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Informations de mise à jour */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Dernière mise à jour : {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default SyncDashboard;
