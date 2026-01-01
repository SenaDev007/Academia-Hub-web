import { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PreloadConfig {
  modules: Array<{
    name: string;
    route: string;
    importFn: () => Promise<{ default: React.ComponentType<any> }>;
    priority: 'high' | 'medium' | 'low';
    preloadConditions?: {
      onRouteVisit?: string[]; // Précharger quand l'utilisateur visite ces routes
      onUserAction?: string[]; // Précharger sur certaines actions utilisateur
      onIdle?: boolean; // Précharger pendant l'inactivité
      onNetworkIdle?: boolean; // Précharger quand le réseau est libre
      afterDelay?: number; // Précharger après un délai (ms)
    };
  }>;
  strategy?: 'aggressive' | 'conservative' | 'adaptive';
}

interface PreloadState {
  preloadedModules: Set<string>;
  preloadingModules: Set<string>;
  failedModules: Set<string>;
  preloadProgress: Map<string, number>;
}

// Cache global pour éviter les rechargements
const globalModuleCache = new Map<string, React.ComponentType<any>>();
const preloadPromises = new Map<string, Promise<void>>();

// Throttling pour éviter les logs répétitifs
let lastNetworkWarning = 0;
const NETWORK_WARNING_THROTTLE = 5000; // 5 secondes

export const useIntelligentPreloader = (config: PreloadConfig) => {
  const location = useLocation();
  const [state, setState] = useState<PreloadState>({
    preloadedModules: new Set(),
    preloadingModules: new Set(),
    failedModules: new Set(),
    preloadProgress: new Map()
  });

  const [networkInfo, setNetworkInfo] = useState({
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0
  });

  // Détecter les informations réseau
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const updateNetworkInfo = () => {
          setNetworkInfo({
            effectiveType: connection.effectiveType || 'unknown',
            downlink: connection.downlink || 0,
            rtt: connection.rtt || 0
          });
        };

        updateNetworkInfo();
        connection.addEventListener('change', updateNetworkInfo);

        return () => {
          connection.removeEventListener('change', updateNetworkInfo);
        };
      }
    }
  }, []);

  // Déterminer si les conditions réseau sont favorables
  const isNetworkFavorable = useCallback(() => {
    if (networkInfo.effectiveType === 'unknown') return true;
    
    const slowConnections = ['slow-2g', '2g'];
    const fastConnections = ['3g', '4g', '5g'];
    
    if (config.strategy === 'conservative') {
      return fastConnections.includes(networkInfo.effectiveType);
    } else if (config.strategy === 'aggressive') {
      return !slowConnections.includes(networkInfo.effectiveType);
    } else { // adaptive
      return networkInfo.downlink > 1.5 || fastConnections.includes(networkInfo.effectiveType);
    }
  }, [networkInfo, config.strategy]);

  // Précharger un module spécifique
  const preloadModule = useCallback(async (moduleName: string, importFn: () => Promise<{ default: React.ComponentType<any> }>) => {
    // Éviter les doublons
    if (state.preloadedModules.has(moduleName) || state.preloadingModules.has(moduleName)) {
      return;
    }

    // Vérifier le cache global
    const cacheKey = `${moduleName}_${importFn.toString()}`;
    if (globalModuleCache.has(cacheKey)) {
      setState(prev => ({
        ...prev,
        preloadedModules: new Set([...prev.preloadedModules, moduleName])
      }));
      return;
    }

    // Vérifier si une promesse de préchargement existe déjà
    if (preloadPromises.has(moduleName)) {
      try {
        await preloadPromises.get(moduleName);
        return;
      } catch (error) {
        // Continue avec un nouveau préchargement
      }
    }

    setState(prev => ({
      ...prev,
      preloadingModules: new Set([...prev.preloadingModules, moduleName]),
      preloadProgress: new Map([...prev.preloadProgress, [moduleName, 0]])
    }));

    const preloadPromise = (async () => {
      try {
        const startTime = performance.now();
        
        // Simuler le progrès
        const progressInterval = setInterval(() => {
          setState(prev => {
            const currentProgress = prev.preloadProgress.get(moduleName) || 0;
            const newProgress = Math.min(currentProgress + Math.random() * 20, 90);
            return {
              ...prev,
              preloadProgress: new Map([...prev.preloadProgress, [moduleName, newProgress]])
            };
          });
        }, 100);

        const { default: Component } = await importFn();
        
        clearInterval(progressInterval);
        
        // Mettre en cache
        globalModuleCache.set(cacheKey, Component);
        
        const loadTime = performance.now() - startTime;
        console.log(`✅ Module ${moduleName} préchargé en ${loadTime.toFixed(2)}ms`);

        setState(prev => ({
          ...prev,
          preloadedModules: new Set([...prev.preloadedModules, moduleName]),
          preloadingModules: new Set([...prev.preloadingModules].filter(m => m !== moduleName)),
          preloadProgress: new Map([...prev.preloadProgress, [moduleName, 100]])
        }));

      } catch (error) {
        console.warn(`❌ Échec du préchargement de ${moduleName}:`, error);
        setState(prev => ({
          ...prev,
          failedModules: new Set([...prev.failedModules, moduleName]),
          preloadingModules: new Set([...prev.preloadingModules].filter(m => m !== moduleName))
        }));
      }
    })();

    preloadPromises.set(moduleName, preloadPromise);
    await preloadPromise;
    preloadPromises.delete(moduleName);

  }, [state.preloadedModules, state.preloadingModules]);

  // Précharger les modules selon les conditions
  const preloadByConditions = useCallback(async (currentRoute: string, userAction?: string) => {
    if (!isNetworkFavorable()) {
      const now = Date.now();
      if (now - lastNetworkWarning > NETWORK_WARNING_THROTTLE) {
        console.log('🚫 Réseau défavorable, préchargement suspendu');
        lastNetworkWarning = now;
      }
      return;
    }

    const modulesToPreload = config.modules.filter(module => {
      const conditions = module.preloadConditions;
      if (!conditions) return false;

      // Vérifier les conditions de route
      if (conditions.onRouteVisit && conditions.onRouteVisit.includes(currentRoute)) {
        return true;
      }

      // Vérifier les conditions d'action utilisateur
      if (userAction && conditions.onUserAction && conditions.onUserAction.includes(userAction)) {
        return true;
      }

      return false;
    });

    // Trier par priorité
    const sortedModules = modulesToPreload.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Précharger séquentiellement pour éviter la surcharge
    for (const module of sortedModules) {
      await preloadModule(module.name, module.importFn);
      
      // Petite pause entre les préchargements
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }, [config.modules, isNetworkFavorable, preloadModule]);

  // Préchargement pendant l'inactivité
  const preloadOnIdle = useCallback(() => {
    const idleModules = config.modules.filter(module => 
      module.preloadConditions?.onIdle && 
      !state.preloadedModules.has(module.name) &&
      !state.preloadingModules.has(module.name)
    );

    if (idleModules.length === 0) return;

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(async (deadline: any) => {
        for (const module of idleModules) {
          if (deadline.timeRemaining() > 0) {
            await preloadModule(module.name, module.importFn);
          } else {
            break;
          }
        }
      }, { timeout: 5000 });
    } else {
      // Fallback
      setTimeout(async () => {
        for (const module of idleModules.slice(0, 2)) { // Limiter à 2 modules
          await preloadModule(module.name, module.importFn);
        }
      }, 1000);
    }
  }, [config.modules, state.preloadedModules, state.preloadingModules, preloadModule]);

  // Préchargement avec délai
  const preloadWithDelay = useCallback(() => {
    config.modules.forEach(module => {
      if (module.preloadConditions?.afterDelay && 
          !state.preloadedModules.has(module.name) &&
          !state.preloadingModules.has(module.name)) {
        
        setTimeout(() => {
          preloadModule(module.name, module.importFn);
        }, module.preloadConditions.afterDelay);
      }
    });
  }, [config.modules, state.preloadedModules, state.preloadingModules, preloadModule]);

  // Réagir aux changements de route
  useEffect(() => {
    preloadByConditions(location.pathname);
  }, [location.pathname, preloadByConditions]);

  // Démarrer les préchargements avec délai
  useEffect(() => {
    preloadWithDelay();
  }, [preloadWithDelay]);

  // Préchargement pendant l'inactivité
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(preloadOnIdle, 3000); // 3 secondes d'inactivité
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, { passive: true });
    });

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer);
      });
    };
  }, [preloadOnIdle]);

  // API publique
  return {
    // État
    preloadedModules: state.preloadedModules,
    preloadingModules: state.preloadingModules,
    failedModules: state.failedModules,
    preloadProgress: state.preloadProgress,
    
    // Méthodes
    preloadModule,
    preloadByConditions,
    preloadOnIdle,
    
    // Utilitaires
    isPreloaded: (moduleName: string) => state.preloadedModules.has(moduleName),
    isPreloading: (moduleName: string) => state.preloadingModules.has(moduleName),
    hasFailed: (moduleName: string) => state.failedModules.has(moduleName),
    getProgress: (moduleName: string) => state.preloadProgress.get(moduleName) || 0,
    
    // Statistiques
    stats: {
      total: config.modules.length,
      preloaded: state.preloadedModules.size,
      preloading: state.preloadingModules.size,
      failed: state.failedModules.size,
      networkInfo
    }
  };
};
