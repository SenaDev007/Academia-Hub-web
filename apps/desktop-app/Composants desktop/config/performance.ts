/**
 * Configuration des optimisations de performance
 */

export const PERFORMANCE_CONFIG = {
  // Images
  IMAGES: {
    // Compression par défaut
    DEFAULT_QUALITY: 0.8,
    DEFAULT_MAX_WIDTH: 800,
    DEFAULT_MAX_HEIGHT: 600,
    
    // Aperçus
    PREVIEW_MAX_WIDTH: 200,
    PREVIEW_MAX_HEIGHT: 200,
    PREVIEW_QUALITY: 0.7,
    
    // Lazy loading
    LAZY_LOADING_THRESHOLD: 0.1,
    LAZY_LOADING_ROOT_MARGIN: '50px',
    
    // Cache
    CACHE_SIZE: 50, // Nombre d'images en cache
    CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  },

  // Documents
  DOCUMENTS: {
    // Pagination
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    
    // Lazy loading
    LAZY_LOAD_THRESHOLD: 0.1,
    
    // Prévisualisation
    MAX_PREVIEW_SIZE: 5 * 1024 * 1024, // 5MB
    SUPPORTED_PREVIEW_TYPES: ['pdf', 'image/jpeg', 'image/png', 'image/gif'],
  },

  // Données
  DATA: {
    // Debounce pour la recherche
    SEARCH_DEBOUNCE_MS: 300,
    
    // Cache des requêtes
    QUERY_CACHE_TTL: 2 * 60 * 1000, // 2 minutes
    
    // Pagination
    DEFAULT_ITEMS_PER_PAGE: 10,
    MAX_ITEMS_PER_PAGE: 50,
  },

  // UI
  UI: {
    // Animations
    ANIMATION_DURATION: 200,
    
    // Skeleton loading
    SKELETON_ANIMATION_DURATION: 1500,
    
    // Toast
    TOAST_DURATION: 3000,
  },

  // Performance
  PERFORMANCE: {
    // Virtual scrolling threshold
    VIRTUAL_SCROLL_THRESHOLD: 100,
    
    // Memoization
    MEMO_DEPENDENCIES_THRESHOLD: 5,
    
    // Bundle splitting
    CHUNK_SIZE_LIMIT: 250 * 1024, // 250KB
  }
} as const;

/**
 * Utilitaires de performance
 */
export class PerformanceUtils {
  /**
   * Mesure le temps d'exécution d'une fonction
   */
  static async measureExecutionTime<T>(
    fn: () => Promise<T>,
    label: string
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    return { result, duration };
  }

  /**
   * Debounce une fonction
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle une fonction
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Vérifie si l'appareil est lent
   */
  static isSlowDevice(): boolean {
    // Vérifier la mémoire disponible
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / memory.totalJSHeapSize > 0.8;
    }
    
    // Vérifier le nombre de cores
    if ('hardwareConcurrency' in navigator) {
      return navigator.hardwareConcurrency < 4;
    }
    
    return false;
  }

  /**
   * Optimise les performances selon l'appareil
   */
  static getOptimizedConfig() {
    const isSlow = this.isSlowDevice();
    
    return {
      imageQuality: isSlow ? 0.6 : PERFORMANCE_CONFIG.IMAGES.DEFAULT_QUALITY,
      pageSize: isSlow ? 5 : PERFORMANCE_CONFIG.DATA.DEFAULT_ITEMS_PER_PAGE,
      enableLazyLoading: true,
      enableVirtualScrolling: isSlow,
      debounceMs: isSlow ? 500 : PERFORMANCE_CONFIG.DATA.SEARCH_DEBOUNCE_MS,
    };
  }
}

/**
 * Hook pour les métriques de performance
 */
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    isSlowDevice: false,
  });

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(prev => ({
        ...prev,
        isSlowDevice: PerformanceUtils.isSlowDevice(),
        memoryUsage: 'memory' in performance 
          ? (performance as any).memory.usedJSHeapSize 
          : 0,
      }));
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

// Import React pour le hook
import { useState, useEffect } from 'react';
