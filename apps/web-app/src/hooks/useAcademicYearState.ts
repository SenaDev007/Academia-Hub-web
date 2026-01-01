import { useState, useEffect } from 'react';
import { useAcademicYear } from './useAcademicYear';

/**
 * Hook personnalisé pour gérer l'état de l'année scolaire sélectionnée
 * dans les différents modules de l'application
 */
export const useAcademicYearState = (moduleName: string = 'default') => {
  const { 
    currentAcademicYear, 
    loading: academicYearLoading,
    getCurrentAcademicYearId 
  } = useAcademicYear();

  // État local pour l'année scolaire sélectionnée
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialiser avec l'année scolaire actuelle (priorité absolue)
  useEffect(() => {
    if (currentAcademicYear && !isInitialized) {
      // Nettoyer le cache localStorage des anciens formats
      const oldFormatKey = `academicYear_${moduleName}`;
      const oldValue = localStorage.getItem(oldFormatKey);
      if (oldValue && oldValue.startsWith('year-')) {
        console.log('🧹 Nettoyage du cache localStorage - ancien format détecté:', oldValue);
        localStorage.removeItem(oldFormatKey);
      }
      
      // Toujours initialiser avec l'année actuelle
      setSelectedAcademicYear(currentAcademicYear.id);
      setIsInitialized(true);
    }
  }, [currentAcademicYear, isInitialized, moduleName]);

  // Sauvegarder la préférence dans localStorage
  useEffect(() => {
    if (selectedAcademicYear && isInitialized) {
      localStorage.setItem(`academicYear_${moduleName}`, selectedAcademicYear);
    }
  }, [selectedAcademicYear, moduleName, isInitialized]);

  return {
    selectedAcademicYear,
    setSelectedAcademicYear,
    currentAcademicYear,
    academicYearLoading,
    getCurrentAcademicYearId
  };
};
