import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import dataService from '../services/dataService';

export interface Quarter {
  id: string;
  name: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
  quarterNumber: number;
  isActive: boolean;
  schoolId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuarterStats {
  totalQuarters: number;
  activeQuarter: string;
  currentQuarter: string;
  quartersRange: string;
}

interface UseQuartersDataReturn {
  // Données
  quarters: Quarter[];
  stats: QuarterStats;
  
  // États de chargement
  loading: boolean;
  quartersLoading: boolean;
  statsLoading: boolean;
  
  // États d'erreur
  error: string | null;
  
  // Fonctions de récupération
  fetchQuarters: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useQuartersData(): UseQuartersDataReturn {
  const { user } = useUser();
  
  // Référence pour éviter les appels multiples
  const isInitializingRef = useRef(false);
  
  // États des données
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [stats, setStats] = useState<QuarterStats>({
    totalQuarters: 0,
    activeQuarter: '',
    currentQuarter: '',
    quartersRange: ''
  });
  
  // États de chargement
  const [loading, setLoading] = useState(false);
  const [quartersLoading, setQuartersLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // État d'erreur
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer tous les trimestres
  const fetchQuarters = useCallback(async () => {
    setQuartersLoading(true);
    setError(null);
    
    try {
      console.log('=== DEBUG fetchQuarters ===');
      
      // Vérifier si on est dans un environnement Electron
      if (typeof window !== 'undefined' && (window as any).electronAPI?.database) {
        // En production Electron - utiliser la base de données
        console.log('Mode Electron détecté - utilisation de la base de données');
        
        // Récupérer les trimestres
        let quartersData = await dataService.getQuarters(user.schoolId);
        console.log('Trimestres récupérés:', quartersData);
        
        // Si aucun trimestre n'existe, les créer automatiquement (une seule fois)
        if (quartersData.length === 0 && !isInitializingRef.current) {
          console.log('📅 Aucun trimestre trouvé - création automatique...');
          isInitializingRef.current = true;
          try {
            // Créer les trimestres pour toutes les années scolaires existantes
            await dataService.initializeDefaultQuarters();
            quartersData = await dataService.getQuarters(user.schoolId);
            console.log('✅ Trimestres créés automatiquement:', quartersData);
          } finally {
            isInitializingRef.current = false;
          }
        }
        
        setQuarters(quartersData);
      } else {
        // En développement web - utiliser des données mockées
        console.log('Mode développement détecté - utilisation des données mockées');
        const mockQuarters = dataService.getSimulatedQuarters();
        setQuarters(mockQuarters);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des trimestres:', err);
      setError('Erreur lors de la récupération des trimestres');
    } finally {
      setQuartersLoading(false);
    }
  }, [user.schoolId]);

  // Fonction pour récupérer les statistiques des trimestres
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 fetchStats appelé avec schoolId:', user.schoolId);
      
      const totalQuarters = quarters.length;
      const activeQuarter = quarters.find(quarter => quarter.isActive)?.name || '';
      const currentQuarter = new Date().getMonth() < 9 ? '1er Trimestre' : '2ème Trimestre';
      
      // Calculer la plage des trimestres
      const quarterNames = quarters.map(quarter => quarter.name).sort();
      const quartersRange = quarterNames.length > 0 ? `${quarterNames[0]} - ${quarterNames[quarterNames.length - 1]}` : '';
      
      const statsData: QuarterStats = {
        totalQuarters,
        activeQuarter,
        currentQuarter,
        quartersRange
      };
      
      console.log('📊 Statistiques des trimestres:', statsData);
      setStats(statsData);
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques des trimestres:', err);
      setError('Erreur lors de la récupération des statistiques des trimestres');
    } finally {
      setStatsLoading(false);
    }
  }, [quarters.length, user.schoolId]); // Utiliser quarters.length au lieu de quarters pour éviter les re-rendus

  // Fonction pour rafraîchir toutes les données
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await fetchQuarters();
      // fetchStats sera appelé automatiquement par l'useEffect quand quarters change
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des données des trimestres:', err);
      setError('Erreur lors du rafraîchissement des données des trimestres');
    } finally {
      setLoading(false);
    }
  }, [fetchQuarters]);

  // Effet pour charger les données au montage du composant
  useEffect(() => {
    if (user.schoolId) {
      refreshData();
    }
  }, [user.schoolId, refreshData]);

  // Effet pour mettre à jour les statistiques quand les trimestres changent
  useEffect(() => {
    if (quarters.length > 0) {
      fetchStats();
    }
  }, [quarters.length]); // Supprimer fetchStats de la dépendance pour éviter la boucle

  return {
    // Données
    quarters,
    stats,
    
    // États de chargement
    loading,
    quartersLoading,
    statsLoading,
    
    // États d'erreur
    error,
    
    // Fonctions de récupération
    fetchQuarters,
    refreshData
  };
}
