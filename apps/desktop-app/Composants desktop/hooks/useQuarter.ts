import { useState, useEffect } from 'react';
import { quarterService, Quarter } from '../services/QuarterService';

/**
 * Hook React pour utiliser le service des trimestres
 */
export const useQuarter = () => {
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [currentQuarter, setCurrentQuarter] = useState<Quarter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuarters = async () => {
      try {
        console.log('🔄 useQuarter: Chargement des trimestres...');
        setLoading(true);
        // Attendre que le service soit initialisé
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('🔍 useQuarter: Appel de quarterService.getAllQuarters()...');
        const quartersList = quarterService.getAllQuarters();
        console.log('🔍 useQuarter: Appel de quarterService.getCurrentQuarter()...');
        const current = quarterService.getCurrentQuarter();
        
        console.log('📊 useQuarter: Trimestres récupérés:', quartersList.length);
        console.log('📊 useQuarter: Trimestre actuel:', current);
        console.log('📊 useQuarter: Détails des trimestres:', quartersList);
        
        setQuarters(quartersList);
        setCurrentQuarter(current);
        setLoading(false);
      } catch (error) {
        console.error('❌ useQuarter: Erreur lors du chargement des trimestres:', error);
        setLoading(false);
      }
    };

    loadQuarters();
  }, []);

  const refreshQuarters = async () => {
    try {
      setLoading(true);
      await quarterService.refreshQuarters();
      const quartersList = quarterService.getAllQuarters();
      const current = quarterService.getCurrentQuarter();
      
      setQuarters(quartersList);
      setCurrentQuarter(current);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des trimestres:', error);
      setLoading(false);
    }
  };

  return {
    quarters,
    currentQuarter,
    loading,
    refreshQuarters,
    getQuarterById: quarterService.getQuarterById.bind(quarterService),
    getActiveQuarters: quarterService.getActiveQuarters.bind(quarterService),
    getQuartersByAcademicYear: quarterService.getQuartersByAcademicYear.bind(quarterService),
    isDateInQuarter: quarterService.isDateInQuarter.bind(quarterService),
    getQuarterForDate: quarterService.getQuarterForDate.bind(quarterService),
    getQuarterOptions: quarterService.getQuarterOptions.bind(quarterService),
    getCurrentQuarterId: quarterService.getCurrentQuarterId.bind(quarterService),
    getCurrentQuarterLabel: quarterService.getCurrentQuarterLabel.bind(quarterService)
  };
};
