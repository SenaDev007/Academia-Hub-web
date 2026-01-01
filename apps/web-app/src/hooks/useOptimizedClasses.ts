import { useState, useEffect, useCallback, useRef } from 'react';
import { usePlanningData } from './usePlanningData';

interface ClassData {
  id: string;
  name: string;
  level: string;
  capacity?: number;
  schoolId: string;
}

interface UseOptimizedClassesReturn {
  classes: ClassData[];
  loading: boolean;
  error: string | null;
  refreshClasses: () => Promise<void>;
  lastRefresh: Date | null;
}

export const useOptimizedClasses = (): UseOptimizedClassesReturn => {
  const { classes: planningClasses, refreshData: planningRefreshData } = usePlanningData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Fonction de rafraîchissement optimisée avec debouncing
  const refreshClasses = useCallback(async () => {
    // Éviter les rafraîchissements multiples simultanés
    if (isRefreshingRef.current) {
      console.log('🔄 Rafraîchissement déjà en cours, ignoré');
      return;
    }

    // Annuler le timeout précédent s'il existe
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Debouncing : attendre 300ms avant de rafraîchir
    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        isRefreshingRef.current = true;
        setLoading(true);
        setError(null);
        
        console.log('🔄 Rafraîchissement optimisé des classes...');
        await planningRefreshData();
        setLastRefresh(new Date());
        
        console.log('✅ Classes rafraîchies avec succès');
      } catch (err) {
        console.error('❌ Erreur lors du rafraîchissement des classes:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
        isRefreshingRef.current = false;
      }
    }, 300);
  }, [planningRefreshData]);

  // Rafraîchissement initial au montage
  useEffect(() => {
    refreshClasses();
  }, []); // Seulement au montage

  // Nettoyage du timeout au démontage
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    classes: planningClasses || [],
    loading,
    error,
    refreshClasses,
    lastRefresh
  };
};
