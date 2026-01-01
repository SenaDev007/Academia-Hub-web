import { useState, useEffect, useCallback, useRef } from 'react';

interface LazyModuleOptions {
  preload?: boolean;
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
  priority?: 'high' | 'medium' | 'low';
  preloadOnHover?: boolean;
  preloadOnIdle?: boolean;
  cacheKey?: string;
}

// Cache global pour les modules chargés
const moduleCache = new Map<string, React.ComponentType<any>>();
const loadingPromises = new Map<string, Promise<React.ComponentType<any>>>();

// Détection de la connexion réseau
const getConnectionSpeed = (): 'slow' | 'fast' => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection && connection.effectiveType) {
      return ['slow-2g', '2g', '3g'].includes(connection.effectiveType) ? 'slow' : 'fast';
    }
  }
  return 'fast';
};

interface LazyModuleState<T> {
  Component: T | null;
  loading: boolean;
  error: Error | null;
  retryCount: number;
}

export function useLazyModule<T = React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyModuleOptions = {}
) {
  const {
    preload = false,
    retryCount: maxRetries = 3,
    retryDelay = 1000,
    timeout = getConnectionSpeed() === 'slow' ? 15000 : 8000,
    priority = 'medium',
    preloadOnHover = false,
    preloadOnIdle = false,
    cacheKey
  } = options;

  const [state, setState] = useState<LazyModuleState<T>>({
    Component: null,
    loading: false,
    error: null,
    retryCount: 0
  });

  const loadStartTime = useRef<number>(0);
  const abortController = useRef<AbortController | null>(null);

  const getCacheKey = useCallback(() => {
    return cacheKey || importFn.toString();
  }, [cacheKey, importFn]);

  const loadModule = useCallback(async (retryCount = 0): Promise<void> => {
    const key = getCacheKey();
    
    // Vérifier le cache d'abord
    if (moduleCache.has(key)) {
      const cachedComponent = moduleCache.get(key) as T;
      setState({
        Component: cachedComponent,
        loading: false,
        error: null,
        retryCount: 0
      });
      return;
    }

    // Vérifier si le module est déjà en cours de chargement
    if (loadingPromises.has(key)) {
      try {
        const Component = await loadingPromises.get(key) as T;
        setState({
          Component,
          loading: false,
          error: null,
          retryCount: 0
        });
        return;
      } catch (error) {
        // Continue avec le chargement normal en cas d'erreur
      }
    }

    if (state.Component || state.loading) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    loadStartTime.current = performance.now();

    // Annuler la requête précédente si elle existe
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      // Créer la promesse de chargement avec timeout adaptatif
      const loadingPromise = importFn();
      loadingPromises.set(key, loadingPromise.then(module => module.default));

      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Module loading timeout'));
        }, timeout);
        
        // Nettoyer le timeout si la requête est annulée
        abortController.current?.signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new Error('Module loading aborted'));
        });
      });

      // Course entre import et timeout
      const { default: Component } = await Promise.race([
        loadingPromise,
        timeoutPromise
      ]);

      // Mettre en cache le composant
      moduleCache.set(key, Component);
      
      // Enregistrer les métriques de performance
      const loadTime = performance.now() - loadStartTime.current;
      console.log(`Module loaded in ${loadTime.toFixed(2)}ms`);

      setState({
        Component,
        loading: false,
        error: null,
        retryCount: 0
      });

      // Nettoyer la promise de chargement
      loadingPromises.delete(key);

    } catch (error) {
      const err = error as Error;
      
      // Ne pas traiter les erreurs d'annulation
      if (err.message === 'Module loading aborted') {
        return;
      }

      console.error('Failed to load module:', err);
      loadingPromises.delete(key);

      if (retryCount < maxRetries) {
        // Retry avec backoff exponentiel et jitter
        const baseDelay = retryDelay * Math.pow(2, retryCount);
        const jitter = Math.random() * 1000; // Ajouter du jitter pour éviter les thundering herds
        const delay = baseDelay + jitter;
        
        setTimeout(() => {
          loadModule(retryCount + 1);
        }, delay);
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: err,
          retryCount: retryCount + 1
        }));
      }
    }
  }, [importFn, maxRetries, retryDelay, timeout, state.Component, state.loading, getCacheKey]);

  const retry = useCallback(() => {
    setState(prev => ({ ...prev, error: null, retryCount: 0 }));
    loadModule(0);
  }, [loadModule]);

  const preloadModule = useCallback(() => {
    if (!state.Component && !state.loading) {
      loadModule(0);
    }
  }, [loadModule, state.Component, state.loading]);

  // Préchargement intelligent basé sur les conditions
  useEffect(() => {
    if (preload) {
      preloadModule();
    }
  }, [preload, preloadModule]);

  // Préchargement au survol
  useEffect(() => {
    if (!preloadOnHover) return;

    const handleMouseEnter = () => {
      preloadModule();
    };

    // Ajouter l'écouteur sur tous les liens de navigation pertinents
    const navLinks = document.querySelectorAll('[data-preload-on-hover]');
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', handleMouseEnter);
    });

    return () => {
      navLinks.forEach(link => {
        link.removeEventListener('mouseenter', handleMouseEnter);
      });
    };
  }, [preloadOnHover, preloadModule]);

  // Préchargement pendant les temps d'inactivité
  useEffect(() => {
    if (!preloadOnIdle) return;

    let idleTimer: NodeJS.Timeout;
    
    const handleIdle = () => {
      preloadModule();
    };

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(handleIdle, 2000); // 2 secondes d'inactivité
    };

    // Événements qui réinitialisent le timer d'inactivité
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
    };
  }, [preloadOnIdle, preloadModule]);

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return {
    Component: state.Component,
    loading: state.loading,
    error: state.error,
    retry,
    preload: preloadModule,
    retryCount: state.retryCount
  };
}

// Hook for preloading multiple modules with priority and intelligent scheduling
export function usePreloadModules(
  modules: Array<{
    name: string;
    importFn: () => Promise<{ default: React.ComponentType<any> }>;
    priority?: 'high' | 'medium' | 'low';
    condition?: () => boolean;
  }>
) {
  const [preloadedModules, setPreloadedModules] = useState<Set<string>>(new Set());
  const [preloadingModules, setPreloadingModules] = useState<Set<string>>(new Set());
  const [preloadErrors, setPreloadErrors] = useState<Map<string, Error>>(new Map());

  const preloadModule = useCallback(async (
    moduleName: string, 
    importFn: () => Promise<{ default: React.ComponentType<any> }>,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    if (preloadedModules.has(moduleName) || preloadingModules.has(moduleName)) {
      return;
    }

    // Vérifier le cache global
    const cacheKey = importFn.toString();
    if (moduleCache.has(cacheKey)) {
      setPreloadedModules(prev => new Set([...prev, moduleName]));
      return;
    }

    setPreloadingModules(prev => new Set([...prev, moduleName]));

    try {
      const startTime = performance.now();
      const { default: Component } = await importFn();
      
      // Mettre en cache
      moduleCache.set(cacheKey, Component);
      
      const loadTime = performance.now() - startTime;
      console.log(`Preloaded module ${moduleName} in ${loadTime.toFixed(2)}ms`);
      
      setPreloadedModules(prev => new Set([...prev, moduleName]));
      setPreloadErrors(prev => {
        const newMap = new Map(prev);
        newMap.delete(moduleName);
        return newMap;
      });
    } catch (error) {
      console.warn(`Failed to preload module ${moduleName}:`, error);
      setPreloadErrors(prev => new Map([...prev, [moduleName, error as Error]]));
    } finally {
      setPreloadingModules(prev => {
        const newSet = new Set(prev);
        newSet.delete(moduleName);
        return newSet;
      });
    }
  }, [preloadedModules, preloadingModules]);

  const preloadByPriority = useCallback(async (targetPriority: 'high' | 'medium' | 'low') => {
    const filteredModules = modules.filter(module => {
      const priority = module.priority || 'medium';
      const conditionMet = !module.condition || module.condition();
      return priority === targetPriority && conditionMet;
    });

    const promises = filteredModules.map(module => 
      preloadModule(module.name, module.importFn, module.priority)
    );

    await Promise.allSettled(promises);
  }, [modules, preloadModule]);

  const preloadAll = useCallback(async () => {
    // Précharger par ordre de priorité
    await preloadByPriority('high');
    
    // Attendre un peu avant de précharger les modules de priorité moyenne
    await new Promise(resolve => setTimeout(resolve, 100));
    await preloadByPriority('medium');
    
    // Attendre encore avant les modules de faible priorité
    await new Promise(resolve => setTimeout(resolve, 500));
    await preloadByPriority('low');
  }, [preloadByPriority]);

  const preloadOnIdle = useCallback(() => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        preloadAll();
      }, { timeout: 5000 });
    } else {
      // Fallback pour les navigateurs qui ne supportent pas requestIdleCallback
      setTimeout(preloadAll, 1000);
    }
  }, [preloadAll]);

  return {
    preloadedModules,
    preloadingModules,
    preloadErrors,
    preloadModule,
    preloadAll,
    preloadByPriority,
    preloadOnIdle,
    isPreloaded: (moduleName: string) => preloadedModules.has(moduleName),
    isPreloading: (moduleName: string) => preloadingModules.has(moduleName),
    getPreloadError: (moduleName: string) => preloadErrors.get(moduleName)
  };
}

// Hook for module performance monitoring
export function useModulePerformance() {
  const [metrics, setMetrics] = useState<{
    loadTimes: Record<string, number>;
    errorCount: Record<string, number>;
    cacheHits: Record<string, number>;
  }>({
    loadTimes: {},
    errorCount: {},
    cacheHits: {}
  });

  const recordLoadTime = useCallback((moduleName: string, loadTime: number) => {
    setMetrics(prev => ({
      ...prev,
      loadTimes: {
        ...prev.loadTimes,
        [moduleName]: loadTime
      }
    }));
  }, []);

  const recordError = useCallback((moduleName: string) => {
    setMetrics(prev => ({
      ...prev,
      errorCount: {
        ...prev.errorCount,
        [moduleName]: (prev.errorCount[moduleName] || 0) + 1
      }
    }));
  }, []);

  const recordCacheHit = useCallback((moduleName: string) => {
    setMetrics(prev => ({
      ...prev,
      cacheHits: {
        ...prev.cacheHits,
        [moduleName]: (prev.cacheHits[moduleName] || 0) + 1
      }
    }));
  }, []);

  const getAverageLoadTime = useCallback((moduleName?: string) => {
    if (moduleName) {
      return metrics.loadTimes[moduleName] || 0;
    }
    
    const times = Object.values(metrics.loadTimes);
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }, [metrics.loadTimes]);

  const getErrorRate = useCallback((moduleName?: string) => {
    if (moduleName) {
      const errors = metrics.errorCount[moduleName] || 0;
      const loads = Object.keys(metrics.loadTimes).length;
      return loads > 0 ? (errors / loads) * 100 : 0;
    }
    
    const totalErrors = Object.values(metrics.errorCount).reduce((a, b) => a + b, 0);
    const totalLoads = Object.keys(metrics.loadTimes).length;
    return totalLoads > 0 ? (totalErrors / totalLoads) * 100 : 0;
  }, [metrics.errorCount, metrics.loadTimes]);

  return {
    metrics,
    recordLoadTime,
    recordError,
    recordCacheHit,
    getAverageLoadTime,
    getErrorRate
  };
}
