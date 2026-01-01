import { useState, useEffect } from 'react';
import { useQuartersData } from './useQuartersData';

/**
 * Hook personnalisé pour gérer l'état du trimestre sélectionné
 * dans les différents modules de l'application
 */
export const useQuarterState = (moduleName: string = 'default') => {
  const { 
    quarters,
    quartersLoading: quarterLoading
  } = useQuartersData();

  const currentQuarter = quarters.find(quarter => quarter.isActive) || null;

  // État local pour le trimestre sélectionné
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialiser avec le trimestre actuel (priorité absolue)
  useEffect(() => {
    if (currentQuarter && !isInitialized) {
      // Toujours initialiser avec le trimestre actuel
      setSelectedQuarter(currentQuarter.id);
      setIsInitialized(true);
    }
  }, [currentQuarter, isInitialized]);

  // Sauvegarder la préférence dans localStorage
  useEffect(() => {
    if (selectedQuarter && isInitialized) {
      localStorage.setItem(`quarter_${moduleName}`, selectedQuarter);
    }
  }, [selectedQuarter, moduleName, isInitialized]);

  return {
    selectedQuarter,
    setSelectedQuarter,
    currentQuarter,
    quarterLoading
  };
};
