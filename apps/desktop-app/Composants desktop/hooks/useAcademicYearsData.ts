import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import dataService from '../services/dataService';

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  schoolId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicYearStats {
  totalYears: number;
  activeYear: string;
  currentYear: string;
  yearsRange: string;
}

interface UseAcademicYearsDataReturn {
  // Données
  academicYears: AcademicYear[];
  stats: AcademicYearStats;
  
  // États de chargement
  loading: boolean;
  academicYearsLoading: boolean;
  statsLoading: boolean;
  
  // États d'erreur
  error: string | null;
  
  // Fonctions de récupération
  fetchAcademicYears: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useAcademicYearsData(): UseAcademicYearsDataReturn {
  const { user } = useUser();
  
  // Référence pour éviter les appels multiples
  const isInitializingRef = useRef(false);
  
  // États des données
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [stats, setStats] = useState<AcademicYearStats>({
    totalYears: 0,
    activeYear: '',
    currentYear: '',
    yearsRange: ''
  });
  
  // États de chargement
  const [loading, setLoading] = useState(false);
  const [academicYearsLoading, setAcademicYearsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // État d'erreur
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer toutes les années académiques
  const fetchAcademicYears = useCallback(async () => {
    setAcademicYearsLoading(true);
    setError(null);
    
    try {
      console.log('=== DEBUG fetchAcademicYears ===');
      
      // Vérifier si on est dans un environnement Electron
      if (typeof window !== 'undefined' && (window as any).electronAPI?.database) {
        // En production Electron - utiliser la base de données
        console.log('Mode Electron détecté - utilisation de la base de données');
        
        // Récupérer les années académiques sans dépendance à l'école
        let yearsData = await dataService.getAllAcademicYears();
        console.log('Années académiques récupérées:', yearsData);
        
        // Si aucune année n'existe, les créer automatiquement (une seule fois)
        if (yearsData.length === 0 && !isInitializingRef.current) {
          console.log('📅 Aucune année académique trouvée - création automatique...');
          isInitializingRef.current = true;
          try {
            await dataService.initializeDefaultAcademicYears();
            yearsData = await dataService.getAllAcademicYears();
            console.log('✅ Années académiques créées automatiquement:', yearsData);
          } finally {
            isInitializingRef.current = false;
          }
        }
        
        // Migration : s'assurer que tous les IDs utilisent le bon format
        const migratedYears = yearsData.map(year => {
          if (year.id && year.id.startsWith('year-')) {
            const newId = year.id.replace('year-', 'academic-year-');
            console.log('🔄 Migration ID année scolaire:', year.id, '->', newId);
            return { ...year, id: newId };
          }
          return year;
        });
        
        if (migratedYears.some((year, index) => year.id !== yearsData[index].id)) {
          console.log('✅ Migration des IDs d\'années scolaires terminée');
          setAcademicYears(migratedYears);
        } else {
        setAcademicYears(yearsData);
        }
      } else {
        // En développement web - utiliser des données mockées
        console.log('Mode développement détecté - utilisation des données mockées');
        const mockYears = dataService.getSimulatedAcademicYears();
        setAcademicYears(mockYears);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des années académiques:', err);
      setError('Erreur lors de la récupération des années académiques');
    } finally {
      setAcademicYearsLoading(false);
    }
  }, []);

  // Fonction pour récupérer les statistiques des années académiques
  const fetchStats = useCallback(async () => {
    
    setStatsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 fetchStats appelé avec schoolId:', user.schoolId);
      
      const totalYears = academicYears.length;
      const activeYear = academicYears.find(year => year.isActive)?.name || '';
      const currentYear = new Date().getFullYear().toString();
      
      // Calculer la plage d'années
      const years = academicYears.map(year => year.name).sort();
      const yearsRange = years.length > 0 ? `${years[0]} - ${years[years.length - 1]}` : '';
      
      const statsData: AcademicYearStats = {
        totalYears,
        activeYear,
        currentYear,
        yearsRange
      };
      
      console.log('📊 Statistiques des années académiques:', statsData);
      setStats(statsData);
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err);
      setError('Erreur lors de la récupération des statistiques');
    } finally {
      setStatsLoading(false);
    }
  }, [user?.schoolId, academicYears]);

  // Fonction pour récupérer toutes les données
  const fetchData = useCallback(async () => {
    
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchAcademicYears()
      ]);
    } catch (err) {
      console.error('Erreur lors de la récupération des données années académiques:', err);
      setError('Erreur lors de la récupération des données années académiques');
    } finally {
      setLoading(false);
    }
  }, [user?.schoolId, fetchAcademicYears]);

  // Fonction de rafraîchissement
  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Les années académiques sont créées automatiquement par le système
  // Pas besoin de fonctions CRUD manuelles

  // Effet pour charger les données au montage
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Effet pour mettre à jour les stats quand les années académiques changent
  useEffect(() => {
    if (academicYears.length > 0) {
      fetchStats();
    }
  }, [academicYears, fetchStats]);

  return {
    // Données
    academicYears,
    stats,
    
    // États de chargement
    loading,
    academicYearsLoading,
    statsLoading,
    
    // États d'erreur
    error,
    
    // Fonctions de récupération
    fetchAcademicYears,
    refreshData,
  };
}
