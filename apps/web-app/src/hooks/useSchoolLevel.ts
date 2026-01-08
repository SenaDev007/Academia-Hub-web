/**
 * ============================================================================
 * USE SCHOOL LEVEL HOOK
 * ============================================================================
 * 
 * Hook pour gérer le niveau scolaire courant
 * Persiste dans localStorage
 * ============================================================================
 */

import { useState, useEffect } from 'react';

interface SchoolLevel {
  id: string;
  code: string;
  label: string;
  isActive: boolean;
}

export function useSchoolLevel() {
  const [currentLevel, setCurrentLevelState] = useState<SchoolLevel | null>(null);
  const [availableLevels, setAvailableLevels] = useState<SchoolLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSchoolLevels = async () => {
      try {
        const response = await fetch('/api/school-levels');
        if (response.ok) {
          const levels: SchoolLevel[] = await response.json();
          const activeLevels = levels.filter(l => l.isActive);
          setAvailableLevels(activeLevels);

          // Récupérer le niveau sauvegardé ou utiliser le premier actif
          const savedLevelId = localStorage.getItem('currentSchoolLevelId');
          const selectedLevel = savedLevelId
            ? activeLevels.find(l => l.id === savedLevelId) || activeLevels[0]
            : activeLevels[0];

          if (selectedLevel) {
            setCurrentLevelState(selectedLevel);
            localStorage.setItem('currentSchoolLevelId', selectedLevel.id);
          }
        }
      } catch (error) {
        console.error('Failed to load school levels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSchoolLevels();
  }, []);

  const setCurrentLevel = (levelId: string) => {
    const level = availableLevels.find(l => l.id === levelId);
    if (level) {
      setCurrentLevelState(level);
      localStorage.setItem('currentSchoolLevelId', levelId);
    }
  };

  return {
    currentLevel,
    setCurrentLevel,
    availableLevels,
    isLoading,
  };
}

