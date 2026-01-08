import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { useAcademicYear } from './useAcademicYear';
import { financeService, FeeConfiguration, FeeConfigurationCreateData } from '../services/financeService';
import { getCurrentSchoolId } from '../services/dataService';

export interface UseFeeConfigurationsReturn {
  feeConfigurations: FeeConfiguration[];
  loading: boolean;
  error: string | null;
  createFeeConfiguration: (data: FeeConfigurationCreateData) => Promise<void>;
  updateFeeConfiguration: (id: string, data: Partial<FeeConfiguration>) => Promise<void>;
  deleteFeeConfiguration: (id: string) => Promise<void>;
  fetchFeeConfigurations: (academicYearId?: string) => Promise<void>;
  refreshData: () => Promise<void>; // Ajouté pour s'aligner sur Planning/Students
}

export const useFeeConfigurations = (): UseFeeConfigurationsReturn => {
  const { user } = useUser();
  const { currentAcademicYear, loading: academicYearLoading } = useAcademicYear();
  const [feeConfigurations, setFeeConfigurations] = useState<FeeConfiguration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeeConfigurations = useCallback(async (academicYearId?: string) => {
    const schoolId = user?.schoolId || getCurrentSchoolId();
    if (!schoolId) {
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
      console.log('📊 Récupération des configurations de frais...');
      console.log('schoolId:', schoolId);
      console.log('academicYearId:', yearId);
      
      const response = await financeService.getFeeConfigurations(schoolId, { academicYearId: yearId });
      console.log('✅ Configurations récupérées:', response);
      
      // Traiter la réponse de l'API (qui peut être un tableau ou un objet avec success/data)
      if (Array.isArray(response)) {
        setFeeConfigurations(response);
      } else if (response && typeof response === 'object' && 'data' in response) {
        setFeeConfigurations(response.data || []);
      } else {
        setFeeConfigurations([]);
      }
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des configurations:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [user?.schoolId, currentAcademicYear?.id]);

  const createFeeConfiguration = useCallback(async (data: FeeConfigurationCreateData) => {
    if (!user?.schoolId) {
      console.error('Aucun établissement sélectionné');
      throw new Error('Aucun établissement sélectionné');
    }
    
    try {
      console.log('=== DEBUG createFeeConfiguration dans useFeeConfigurations ===');
      console.log('data reçu:', data);
      console.log('data.configurations:', data.configurations);
      console.log('data.configurations length:', data.configurations?.length);
      if (data.configurations && data.configurations.length > 0) {
        console.log('Première configuration:', data.configurations[0]);
        console.log('Première configuration level:', data.configurations[0].level);
        console.log('Première configuration classId:', data.configurations[0].classId);
      }
      console.log('Appel de feeConfigurationService.createFeeConfiguration avec:', { ...data, schoolId: user.schoolId });
      
      // Suivre l'approche Students : laisser le service backend gérer la création de l'année académique
      const result = await financeService.createFeeConfiguration({ ...data, schoolId: user.schoolId });
      console.log('Résultat createFeeConfiguration:', result);
      
      console.log('Rafraîchissement des données...');
      await fetchFeeConfigurations(data.academicYearId);
      console.log('Données rafraîchies avec succès');
    } catch (err) {
      console.error('Erreur lors de la création de la configuration:', err);
      throw err;
    }
  }, [user?.schoolId, fetchFeeConfigurations]);

  const updateFeeConfiguration = useCallback(async (id: string, data: Partial<FeeConfiguration>) => {
    try {
      console.log('=== DEBUG updateFeeConfiguration ===');
      console.log('id:', id, 'data:', data);
      
      const result = await financeService.updateFeeConfiguration(id, data);
      console.log('Résultat updateFeeConfiguration:', result);
      
      await fetchFeeConfigurations(data.academicYearId);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la configuration:', err);
      throw err;
    }
  }, [fetchFeeConfigurations]);

  const deleteFeeConfiguration = useCallback(async (id: string) => {
    try {
      console.log('=== DEBUG deleteFeeConfiguration ===');
      console.log('id:', id);
      
      await financeService.deleteFeeConfiguration(id);
      console.log('Configuration supprimée avec succès');
      
      // Rafraîchir la liste localement
      setFeeConfigurations(prev => prev.filter(config => config.id !== id));
      
      // Recharger les données depuis le serveur pour s'assurer de la cohérence
      if (user?.schoolId && currentAcademicYear?.id) {
        await fetchFeeConfigurations();
      }
    } catch (err) {
      console.error('Erreur lors de la suppression de la configuration:', err);
      throw err;
    }
  }, [user?.schoolId, currentAcademicYear?.id, fetchFeeConfigurations]);

  // Charger les configurations au montage et quand schoolId ou currentAcademicYear change
  useEffect(() => {
    if (user?.schoolId && currentAcademicYear?.id) {
      fetchFeeConfigurations();
    }
  }, [user?.schoolId, currentAcademicYear?.id, fetchFeeConfigurations]);

  // Fonction refreshData pour s'aligner sur Planning/Students
  const refreshData = useCallback(async () => {
    await fetchFeeConfigurations();
  }, [fetchFeeConfigurations]);

  return {
    feeConfigurations,
    loading,
    error,
    createFeeConfiguration,
    updateFeeConfiguration,
    deleteFeeConfiguration,
    fetchFeeConfigurations,
    refreshData
  };
};
