import React, { useState, useEffect } from 'react';
import { 
  HardDrive, 
  Database, 
  FileText, 
  Image, 
  BarChart3, 
  Trash2, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { hybridStorageService, StorageStats } from '../../services/hybridStorageService';
import { enhancedCache } from '../../services/offline/EnhancedCache';
import { localDatabaseService } from '../../services/localDatabaseService';

const StorageDashboard: React.FC = () => {
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadStats();
    // Mettre à jour les stats toutes les 30 secondes
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [storage, cache] = await Promise.all([
        hybridStorageService.getStorageStats(),
        enhancedCache.getStats()
      ]);
      
      setStorageStats(storage);
      setCacheStats(cache);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading storage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      await localDatabaseService.clearCache();
      await loadStats();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const preloadData = async () => {
    try {
      await localDatabaseService.preloadFrequentData();
      await loadStats();
    } catch (error) {
      console.error('Error preloading data:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
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
            Tableau de bord du stockage
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gestion intelligente du stockage hybride
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={preloadData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Précharger
          </button>
          <button
            onClick={clearCache}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Vider le cache
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      {storageStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total SQLite
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {storageStats.sqlite.totalItems}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Cache IndexedDB
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {storageStats.cache.totalItems}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Fichiers locaux
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {storageStats.files.totalFiles}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <HardDrive className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Taille totale
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatBytes(storageStats.overall.totalSize)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Détails du cache */}
      {cacheStats && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performance du cache
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Taux de réussite
                </p>
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPercentage(cacheStats.hitRate)}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Taille du cache
                </p>
                <div className="flex items-center">
                  <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatBytes(cacheStats.totalSize)}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Éléments en cache
                </p>
                <div className="flex items-center">
                  <Database className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {cacheStats.itemCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stratégies de cache */}
      {storageStats && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Stratégies de cache
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(storageStats.cache.strategies).map(([strategy, stats]) => (
                <div key={strategy} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      strategy === 'frequent' ? 'bg-green-500' :
                      strategy === 'normal' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {strategy}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Éléments</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{stats.count}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Taille</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatBytes(stats.size)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Taux de réussite</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatPercentage(stats.hitRate)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Catégories de fichiers */}
      {storageStats && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Stockage des fichiers
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(storageStats.files.categories).map(([category, stats]) => (
                <div key={category} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {category.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {stats.count} fichiers
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ 
                          width: `${(stats.size / Math.max(storageStats.files.totalSize, 1)) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatBytes(stats.size)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Informations de mise à jour */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Dernière mise à jour : {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default StorageDashboard;
