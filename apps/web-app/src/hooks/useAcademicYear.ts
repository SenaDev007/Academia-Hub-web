import { useState, useEffect, useCallback } from 'react';
import { useAcademicYearsData } from './useAcademicYearsData';

/**
 * Hook React pour utiliser les années scolaires (comme Students)
 */
export const useAcademicYear = () => {
  const { 
    academicYears, 
    loading: academicYearsLoading,
    error: academicYearsError 
  } = useAcademicYearsData();
  
  const [currentAcademicYear, setCurrentAcademicYear] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Trouver l'année académique actuelle
  useEffect(() => {
    if (academicYears.length > 0) {
      const current = academicYears.find(year => year.isActive) || academicYears[0];
      setCurrentAcademicYear(current);
      setLoading(false);
    }
  }, [academicYears]);

  // Méthodes utilitaires
  const getAcademicYearById = useCallback((id: string) => {
    return academicYears.find(year => year.id === id) || null;
  }, [academicYears]);

  const getActiveAcademicYears = useCallback(() => {
    return academicYears.filter(year => year.isActive);
  }, [academicYears]);

  const getPastAcademicYears = useCallback(() => {
    const currentDate = new Date();
    return academicYears.filter(year => new Date(year.endDate) < currentDate);
  }, [academicYears]);

  const getFutureAcademicYears = useCallback(() => {
    const currentDate = new Date();
    return academicYears.filter(year => new Date(year.startDate) > currentDate);
  }, [academicYears]);

  const isDateInAcademicYear = useCallback((date: Date, yearId: string) => {
    const year = getAcademicYearById(yearId);
    if (!year) return false;
    
    const checkDate = new Date(date);
    const startDate = new Date(year.startDate);
    const endDate = new Date(year.endDate);
    
    return checkDate >= startDate && checkDate <= endDate;
  }, [getAcademicYearById]);

  const getAcademicYearForDate = useCallback((date: Date) => {
    return academicYears.find(year => isDateInAcademicYear(date, year.id)) || null;
  }, [academicYears, isDateInAcademicYear]);

  const getAcademicYearOptions = useCallback(() => {
    return academicYears.map(year => ({
      value: year.id,
      label: year.name,
      isCurrent: year.isActive
    }));
  }, [academicYears]);

  const getCurrentAcademicYearId = useCallback(() => {
    return currentAcademicYear?.id || '';
  }, [currentAcademicYear]);

  const getCurrentAcademicYearLabel = useCallback(() => {
    return currentAcademicYear?.name || '';
  }, [currentAcademicYear]);

  const refreshAcademicYears = async () => {
    // Le rafraîchissement est géré par useAcademicYearsData
    setLoading(false);
  };

  return {
    academicYears,
    currentAcademicYear,
    loading: loading || academicYearsLoading,
    refreshAcademicYears,
    getAcademicYearById,
    getActiveAcademicYears,
    getPastAcademicYears,
    getFutureAcademicYears,
    isDateInAcademicYear,
    getAcademicYearForDate,
    getAcademicYearOptions,
    getCurrentAcademicYearId,
    getCurrentAcademicYearLabel
  };
};
