import { useState, useEffect, useCallback } from 'react';
import { financeService, DailyClosure, DailyClosureStats } from '../services/financeService';
import { useUser } from '../contexts/UserContext';
import { useAcademicYear } from './useAcademicYear';

export const useDailyClosure = () => {
  const [dailyClosures, setDailyClosures] = useState<DailyClosure[]>([]);
  const [dailyClosureStats, setDailyClosureStats] = useState<DailyClosureStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useUser();
  const { currentAcademicYear } = useAcademicYear();

  // Charger les clôtures quotidiennes
  const fetchDailyClosures = useCallback(async (filters?: any) => {
    if (!user?.schoolId) {
      console.warn('School ID not available for fetching daily closures');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Chargement des clôtures quotidiennes...', { schoolId: user.schoolId, filters });
      
      const closures = await financeService.getDailyClosures(user.schoolId, {
        ...filters,
        academicYearId: currentAcademicYear?.id
      });
      
      console.log('✅ Clôtures quotidiennes chargées:', closures);
      
      // Traiter la réponse de l'API (qui peut être un tableau ou un objet avec success/data)
      if (Array.isArray(closures)) {
        setDailyClosures(closures);
      } else if (closures && typeof closures === 'object' && 'data' in closures) {
        setDailyClosures(closures.data || []);
      } else {
        setDailyClosures([]);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des clôtures:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des clôtures');
    } finally {
      setLoading(false);
    }
  }, [user?.schoolId, currentAcademicYear?.id]);

  // Charger les statistiques de clôture pour une date
  const fetchDailyClosureStats = useCallback(async (date: string) => {
    if (!user?.schoolId) {
      console.warn('School ID not available for fetching daily closure stats');
      return;
    }

    try {
      console.log('🔍 Chargement des statistiques de clôture...', { schoolId: user.schoolId, date });
      
      const stats = await financeService.getDailyClosureStats(user.schoolId, date);
      
      console.log('✅ Statistiques de clôture chargées:', stats);
      setDailyClosureStats(stats);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des statistiques:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
    }
  }, [user?.schoolId]);

  // Créer une clôture quotidienne
  const createDailyClosure = useCallback(async (closureData: Omit<DailyClosure, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.schoolId) {
      throw new Error('School ID not available');
    }

    try {
      console.log('🔍 Création d\'une clôture quotidienne...', closureData);
      
      const newClosure = await financeService.createDailyClosure({
        ...closureData,
        schoolId: user.schoolId,
        academicYearId: currentAcademicYear?.id
      });
      
      console.log('✅ Clôture quotidienne créée:', newClosure);
      
      // Ajouter la nouvelle clôture à la liste
      setDailyClosures(prev => [newClosure, ...prev]);
      
      return newClosure;
    } catch (err) {
      console.error('❌ Erreur lors de la création de la clôture:', err);
      throw err;
    }
  }, [user?.schoolId, currentAcademicYear?.id]);

  // Modifier une clôture quotidienne
  const updateDailyClosure = useCallback(async (id: string, closureData: Partial<DailyClosure>) => {
    if (!user?.schoolId) {
      throw new Error('School ID not available');
    }

    try {
      console.log('🔍 Modification d\'une clôture quotidienne...', { id, closureData });
      
      const updatedClosure = await financeService.updateDailyClosure(id, closureData);
      
      console.log('✅ Clôture quotidienne modifiée:', updatedClosure);
      
      // Mettre à jour la clôture dans la liste
      setDailyClosures(prev => prev.map(closure => 
        closure.id === id ? updatedClosure : closure
      ));
      
      return updatedClosure;
    } catch (err) {
      console.error('❌ Erreur lors de la modification de la clôture:', err);
      throw err;
    }
  }, [user?.schoolId]);

  // Supprimer une clôture quotidienne
  const deleteDailyClosure = useCallback(async (id: string) => {
    try {
      console.log('🔍 Suppression d\'une clôture quotidienne...', id);
      
      await financeService.deleteDailyClosure(id);
      
      console.log('✅ Clôture quotidienne supprimée:', id);
      
      // Supprimer la clôture de la liste
      setDailyClosures(prev => prev.filter(closure => closure.id !== id));
    } catch (err) {
      console.error('❌ Erreur lors de la suppression de la clôture:', err);
      throw err;
    }
  }, []);

  // Approuver une clôture quotidienne
  const approveDailyClosure = useCallback(async (id: string, approvedBy: string) => {
    try {
      console.log('🔍 Approbation d\'une clôture quotidienne...', { id, approvedBy });
      
      await financeService.approveDailyClosure(id, approvedBy);
      
      console.log('✅ Clôture quotidienne approuvée:', id);
      
      // Mettre à jour le statut de la clôture dans la liste
      setDailyClosures(prev => prev.map(closure => 
        closure.id === id 
          ? { ...closure, status: 'approved' as const, approvedBy, approvedAt: new Date().toISOString() }
          : closure
      ));
    } catch (err) {
      console.error('❌ Erreur lors de l\'approbation de la clôture:', err);
      throw err;
    }
  }, []);

  // Actualiser les données
  const refreshData = useCallback(async () => {
    await fetchDailyClosures();
  }, [fetchDailyClosures]);

  // Charger les données au montage du composant
  useEffect(() => {
    if (user?.schoolId) {
      fetchDailyClosures();
    }
  }, [user?.schoolId, fetchDailyClosures]);

  return {
    dailyClosures,
    dailyClosureStats,
    loading,
    error,
    fetchDailyClosures,
    fetchDailyClosureStats,
    createDailyClosure,
    updateDailyClosure,
    deleteDailyClosure,
    approveDailyClosure,
    refreshData
  };
};
