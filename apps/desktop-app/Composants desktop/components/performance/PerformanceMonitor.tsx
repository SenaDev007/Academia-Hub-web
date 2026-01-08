import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Clock, 
  Download, 
  Zap, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PerformanceMetrics {
  moduleLoadTimes: Record<string, number>;
  bundleSizes: Record<string, number>;
  cacheHitRate: number;
  errorCount: number;
  totalModulesLoaded: number;
  averageLoadTime: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  showDetails?: boolean;
  className?: string;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  enabled = import.meta.env.DEV,
  showDetails = false,
  className = ''
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    moduleLoadTimes: {},
    bundleSizes: {},
    cacheHitRate: 0,
    errorCount: 0,
    totalModulesLoaded: 0,
    averageLoadTime: 0
  });

  const [isVisible, setIsVisible] = useState(false);
  const [performanceEntries, setPerformanceEntries] = useState<PerformanceEntry[]>([]);

  // Monitor module load times
  const recordModuleLoadTime = useCallback((moduleName: string, loadTime: number) => {
    setMetrics(prev => {
      const newLoadTimes = { ...prev.moduleLoadTimes, [moduleName]: loadTime };
      const totalModules = Object.keys(newLoadTimes).length;
      const averageTime = Object.values(newLoadTimes).reduce((a, b) => a + b, 0) / totalModules;
      
      return {
        ...prev,
        moduleLoadTimes: newLoadTimes,
        totalModulesLoaded: totalModules,
        averageLoadTime: averageTime
      };
    });
  }, []);

  // Monitor bundle sizes
  const recordBundleSize = useCallback((moduleName: string, size: number) => {
    setMetrics(prev => ({
      ...prev,
      bundleSizes: { ...prev.bundleSizes, [moduleName]: size }
    }));
  }, []);

  // Monitor cache performance
  const recordCacheHit = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      cacheHitRate: prev.cacheHitRate + 1
    }));
  }, []);

  // Monitor errors
  const recordError = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1
    }));
  }, []);

  // Get performance entries
  useEffect(() => {
    if (!enabled) return;

    const updatePerformanceEntries = () => {
      const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      setPerformanceEntries(entries);
    };

    updatePerformanceEntries();
    const interval = setInterval(updatePerformanceEntries, 1000);

    return () => clearInterval(interval);
  }, [enabled]);

  // Monitor resource loading
  useEffect(() => {
    if (!enabled) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          const moduleName = resource.name.split('/').pop()?.split('-')[0] || 'unknown';
          
          if (resource.name.includes('module-') || resource.name.includes('chunk')) {
            recordModuleLoadTime(moduleName, resource.duration);
            recordBundleSize(moduleName, resource.transferSize || 0);
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => observer.disconnect();
  }, [enabled, recordModuleLoadTime, recordBundleSize]);

  // Monitor errors
  useEffect(() => {
    if (!enabled) return;

    const handleError = () => recordError();
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, [enabled, recordError]);

  // Get performance status
  const getPerformanceStatus = () => {
    if (metrics.averageLoadTime < 500) return 'excellent';
    if (metrics.averageLoadTime < 1000) return 'good';
    if (metrics.averageLoadTime < 2000) return 'fair';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'fair': return 'text-yellow-600 dark:text-yellow-400';
      case 'poor': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'fair': return <AlertCircle className="w-4 h-4" />;
      case 'poor': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (!enabled) return null;

  const status = getPerformanceStatus();
  const totalBundleSize = Object.values(metrics.bundleSizes).reduce((a, b) => a + b, 0);

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200"
        title="Performance Monitor"
      >
        <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>

      {/* Performance Panel */}
      {isVisible && (
        <div className="absolute bottom-16 right-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Performance Monitor
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>

          {/* Status Overview */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Performance Status
              </span>
              <div className={`flex items-center space-x-2 ${getStatusColor(status)}`}>
                {getStatusIcon(status)}
                <span className="text-sm font-medium capitalize">{status}</span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="space-y-3">
            {/* Average Load Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Temps de chargement moyen
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {metrics.averageLoadTime.toFixed(0)}ms
              </span>
            </div>

            {/* Modules Loaded */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Modules chargés
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {metrics.totalModulesLoaded}
              </span>
            </div>

            {/* Bundle Size */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Taille totale des bundles
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {(totalBundleSize / 1024).toFixed(1)}KB
              </span>
            </div>

            {/* Cache Hit Rate */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Taux de cache
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {metrics.cacheHitRate}%
              </span>
            </div>

            {/* Error Count */}
            {metrics.errorCount > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Erreurs
                  </span>
                </div>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  {metrics.errorCount}
                </span>
              </div>
            )}
          </div>

          {/* Detailed Module Times */}
          {showDetails && Object.keys(metrics.moduleLoadTimes).length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temps de chargement par module
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {Object.entries(metrics.moduleLoadTimes).map(([module, time]) => (
                  <div key={module} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                      {module}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {time.toFixed(0)}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
