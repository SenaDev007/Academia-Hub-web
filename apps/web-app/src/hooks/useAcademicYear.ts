/**
 * ============================================================================
 * USE ACADEMIC YEAR HOOK
 * ============================================================================
 * 
 * Hook pour gérer l'année scolaire courante
 * Persiste dans localStorage
 * ============================================================================
 */

import { useState, useEffect } from 'react';

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export function useAcademicYear() {
  const [currentYear, setCurrentYearState] = useState<AcademicYear | null>(null);
  const [availableYears, setAvailableYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAcademicYears = async () => {
      try {
        const response = await fetch('/api/academic-years');
        if (response.ok) {
          const years: AcademicYear[] = await response.json();
          setAvailableYears(years);

          // Récupérer l'année sauvegardée ou utiliser l'année active
          const savedYearId = localStorage.getItem('currentAcademicYearId');
          const activeYear = years.find(y => y.isCurrent);
          const selectedYear = savedYearId
            ? years.find(y => y.id === savedYearId) || activeYear
            : activeYear;

          if (selectedYear) {
            setCurrentYearState(selectedYear);
            localStorage.setItem('currentAcademicYearId', selectedYear.id);
          }
        }
      } catch (error) {
        console.error('Failed to load academic years:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAcademicYears();
  }, []);

  const setCurrentYear = (yearId: string) => {
    const year = availableYears.find(y => y.id === yearId);
    if (year) {
      setCurrentYearState(year);
      localStorage.setItem('currentAcademicYearId', yearId);
    }
  };

  return {
    currentYear,
    setCurrentYear,
    availableYears,
    isLoading,
  };
}

