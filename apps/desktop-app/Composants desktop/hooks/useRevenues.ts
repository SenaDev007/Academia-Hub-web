import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { useAcademicYear } from './useAcademicYear';
import { revenueService, Revenue, RevenueCreateData, RevenueStats } from '../services/revenueService';

export interface UseRevenuesReturn {
  revenues: Revenue[];
  revenueStats: RevenueStats | null;
  loading: boolean;
  error: string | null;
  createRevenue: (data: RevenueCreateData) => Promise<void>;
  updateRevenue: (id: string, data: Partial<Revenue>) => Promise<void>;
  deleteRevenue: (id: string) => Promise<void>;
  fetchRevenues: (academicYearId?: string) => Promise<void>;
  syncTuitionPayments: () => Promise<{ success: boolean; synced: number; errors: string[] }>;
  refreshData: () => Promise<void>;
}

export const useRevenues = (): UseRevenuesReturn => {
  const { user } = useUser();
  const { currentAcademicYear, loading: academicYearLoading } = useAcademicYear();
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenues = useCallback(async (academicYearId?: string) => {
    if (!user?.schoolId) {
      console.error('Aucun établissement sélectionné');
      return;
    }

    // Utiliser l'année académique fournie ou l'année actuelle
    const yearId = academicYearId || currentAcademicYear?.id;
    if (!yearId) {
      console.log('Aucune année académique disponible');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('📊 Récupération des recettes...');
      console.log('schoolId:', user.schoolId);
      console.log('academicYearId:', yearId);
      
      const response = await revenueService.getRevenues(user.schoolId, { academicYearId: yearId });
      console.log('✅ Recettes récupérées:', response);
      
      // Traiter la réponse de l'API
      if (Array.isArray(response)) {
        setRevenues(response);
      } else if (response && typeof response === 'object' && 'data' in response) {
        setRevenues(response.data || []);
      } else {
        setRevenues([]);
      }

      // Récupérer les statistiques
      const stats = await revenueService.getRevenueStats(user.schoolId, { academicYearId: yearId });
      setRevenueStats(stats);
      
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des recettes:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [user?.schoolId, currentAcademicYear?.id]);

  const createRevenue = useCallback(async (data: RevenueCreateData) => {
    if (!user?.schoolId) {
      console.error('Aucun établissement sélectionné');
      throw new Error('Aucun établissement sélectionné');
    }
    
    try {
      console.log('=== DEBUG createRevenue dans useRevenues ===');
      console.log('data reçu:', data);
      
      const result = await revenueService.createRevenue({ ...data, schoolId: user.schoolId });
      console.log('Résultat createRevenue:', result);
      
      console.log('Rafraîchissement des données...');
      await fetchRevenues(data.academicYearId);
      console.log('Données rafraîchies avec succès');
    } catch (err) {
      console.error('Erreur lors de la création de la recette:', err);
      throw err;
    }
  }, [user?.schoolId, fetchRevenues]);

  const updateRevenue = useCallback(async (id: string, data: Partial<Revenue>) => {
    try {
      console.log('=== DEBUG updateRevenue ===');
      console.log('id:', id, 'data:', data);
      
      const result = await revenueService.updateRevenue(id, data);
      console.log('Résultat updateRevenue:', result);
      
      await fetchRevenues(data.academicYearId);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la recette:', err);
      throw err;
    }
  }, [fetchRevenues]);

  const deleteRevenue = useCallback(async (id: string) => {
    try {
      console.log('=== DEBUG deleteRevenue ===');
      console.log('id:', id);
      
      await revenueService.deleteRevenue(id);
      console.log('Recette supprimée avec succès');
      
      // Rafraîchir la liste localement
      setRevenues(prev => prev.filter(revenue => revenue.id !== id));
      
      // Recharger les données depuis le serveur pour s'assurer de la cohérence
      if (user?.schoolId && currentAcademicYear?.id) {
        await fetchRevenues();
      }
    } catch (err) {
      console.error('Erreur lors de la suppression de la recette:', err);
      throw err;
    }
  }, [user?.schoolId, currentAcademicYear?.id, fetchRevenues]);

  const syncTuitionPayments = useCallback(async () => {
    if (!user?.schoolId) {
      console.error('Aucun établissement sélectionné');
      throw new Error('Aucun établissement sélectionné');
    }
    
    try {
      console.log('🔄 Synchronisation des frais de scolarité...');
      setLoading(true);
      
      const result = await revenueService.syncTuitionPayments(user.schoolId, currentAcademicYear?.id);
      console.log('Résultat de la synchronisation:', result);
      
      // Rafraîchir les données après synchronisation
      await fetchRevenues();
      
      return result;
    } catch (err) {
      console.error('Erreur lors de la synchronisation:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.schoolId, currentAcademicYear?.id, fetchRevenues]);

  // Charger les recettes au montage et quand schoolId ou currentAcademicYear change
  useEffect(() => {
    if (user?.schoolId && currentAcademicYear?.id) {
      fetchRevenues();
    }
  }, [user?.schoolId, currentAcademicYear?.id, fetchRevenues]);

  // Fonction refreshData pour s'aligner sur les autres hooks
  const refreshData = useCallback(async () => {
    await fetchRevenues();
  }, [fetchRevenues]);

  return {
    revenues,
    revenueStats,
    loading,
    error,
    createRevenue,
    updateRevenue,
    deleteRevenue,
    fetchRevenues,
    syncTuitionPayments,
    refreshData
  };
};
