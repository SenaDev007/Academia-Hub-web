import React, { useState, useEffect } from 'react';
import { Activity, Clock, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface LoadingMetrics {
  moduleName: string;
  loadTime: number;
  cacheHit: boolean;
  networkSpeed: string;
  timestamp: number;
  status: 'success' | 'error' | 'timeout';
}

interface LoadingPerformanceMonitorProps {
  isVisible?: boolean;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
}

const LoadingPerformanceMonitor: React.FC<LoadingPerformanceMonitorProps> = ({
  isVisible = false,
  position = 'bottom-right'
}) => {
  const [metrics, setMetrics] = useState<LoadingMetrics[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Écouter les événements de performance personnalisés
  useEffect(() => {
    const handleModuleLoad = (event: CustomEvent<LoadingMetrics>) => {
      setMetrics(prev => [...prev.slice(-9), event.detail]); // Garder les 10 derniers
    };

    window.addEventListener('module-load-performance', handleModuleLoad as EventListener);
    
    return () => {
      window.removeEventListener('module-load-performance', handleModuleLoad as EventListener);
    };
  }, []);

  // Calculer les statistiques
  const stats = React.useMemo(() => {
    if (metrics.length === 0) return null;

    const successful = metrics.filter(m => m.status === 'success');
    const avgLoadTime = successful.reduce((sum, m) => sum + m.loadTime, 0) / successful.length;
    const cacheHitRate = (successful.filter(m => m.cacheHit).length / successful.length) * 100;
    const errorRate = (metrics.filter(m => m.status === 'error').length / metrics.length) * 100;

    return {
      avgLoadTime: Math.round(avgLoadTime),
      cacheHitRate: Math.round(cacheHitRate),
      errorRate: Math.round(errorRate),
      totalModules: metrics.length
    };
  }, [metrics]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  const getStatusIcon = (status: LoadingMetrics['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      case 'timeout':
        return <Clock className="w-3 h-3 text-yellow-500" />;
    }
  };

  const getLoadTimeColor = (loadTime: number) => {
    if (loadTime < 500) return 'text-green-600';
    if (loadTime < 1000) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isVisible || !stats) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div 
          className="p-3 bg-gray-50 dark:bg-gray-700 cursor-pointer flex items-center justify-between"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Performance
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>{stats.avgLoadTime}ms</span>
            <div className={`w-2 h-2 rounded-full ${
              stats.avgLoadTime < 500 ? 'bg-green-500' : 
              stats.avgLoadTime < 1000 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-3 space-y-3">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">Avg:</span>
                <span className={`font-medium ${getLoadTimeColor(stats.avgLoadTime)}`}>
                  {stats.avgLoadTime}ms
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">Cache:</span>
                <span className="font-medium text-green-600">
                  {stats.cacheHitRate}%
                </span>
              </div>
            </div>

            {/* Recent Loads */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chargements récents:
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {metrics.slice(-5).reverse().map((metric, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {getStatusIcon(metric.status)}
                      <span className="truncate text-gray-600 dark:text-gray-400">
                        {metric.moduleName}
                      </span>
                      {metric.cacheHit && (
                        <span className="text-green-500 text-[10px]">cached</span>
                      )}
                    </div>
                    <span className={`font-medium ${getLoadTimeColor(metric.loadTime)}`}>
                      {metric.loadTime}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Network Info */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {metrics.length > 0 && (
                  <span>Réseau: {metrics[metrics.length - 1]?.networkSpeed || 'unknown'}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Hook pour envoyer les métriques de performance
export const useLoadingPerformanceTracker = () => {
  const trackModuleLoad = React.useCallback((
    moduleName: string,
    loadTime: number,
    cacheHit: boolean = false,
    status: LoadingMetrics['status'] = 'success'
  ) => {
    const networkSpeed = (() => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        return connection?.effectiveType || 'unknown';
      }
      return 'unknown';
    })();

    const metric: LoadingMetrics = {
      moduleName,
      loadTime,
      cacheHit,
      networkSpeed,
      timestamp: Date.now(),
      status
    };

    // Envoyer l'événement personnalisé
    window.dispatchEvent(new CustomEvent('module-load-performance', { detail: metric }));
  }, []);

  return { trackModuleLoad };
};

export default LoadingPerformanceMonitor;
