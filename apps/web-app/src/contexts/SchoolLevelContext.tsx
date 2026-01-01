/**
 * ============================================================================
 * SCHOOL LEVEL CONTEXT - GESTION DU NIVEAU SCOLAIRE
 * ============================================================================
 * 
 * Contexte pour gérer le niveau scolaire sélectionné dans l'interface.
 * Le niveau scolaire est OBLIGATOIRE pour toutes les opérations.
 * 
 * ============================================================================
 */

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api/client';
import { useTenant } from './TenantContext';

export interface SchoolLevel {
  id: string;
  tenantId: string;
  type: 'MATERNELLE' | 'PRIMAIRE' | 'SECONDAIRE';
  name: string;
  abbreviation: string;
  description?: string;
  order: number;
  isActive: boolean;
  metadata?: Record<string, any>;
}

interface SchoolLevelContextType {
  schoolLevels: SchoolLevel[];
  selectedSchoolLevel: SchoolLevel | null;
  selectedSchoolLevelId: string | null;
  isLoading: boolean;
  error: string | null;
  selectSchoolLevel: (schoolLevelId: string) => void;
  refreshSchoolLevels: () => Promise<void>;
  isLevelRequired: boolean; // Indique si un niveau doit être sélectionné
}

const SchoolLevelContext = createContext<SchoolLevelContextType | undefined>(undefined);

export const useSchoolLevel = () => {
  const context = useContext(SchoolLevelContext);
  if (context === undefined) {
    throw new Error('useSchoolLevel must be used within a SchoolLevelProvider');
  }
  return context;
};

interface SchoolLevelProviderProps {
  children: ReactNode;
}

export const SchoolLevelProvider: React.FC<SchoolLevelProviderProps> = ({ children }) => {
  const { tenantId } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [schoolLevels, setSchoolLevels] = useState<SchoolLevel[]>([]);
  const [selectedSchoolLevel, setSelectedSchoolLevel] = useState<SchoolLevel | null>(null);
  const [selectedSchoolLevelId, setSelectedSchoolLevelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Routes publiques qui n'ont pas besoin de niveau scolaire
  const publicRoutes = ['/login', '/register', '/forgot-password', '/', '/onboarding'];
  const isLevelRequired = !publicRoutes.some(route => location.pathname.startsWith(route));

  // Charger les niveaux scolaires depuis l'API
  const loadSchoolLevels = useCallback(async () => {
    if (!tenantId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Appel API pour récupérer les niveaux scolaires
      const response = await api.schoolLevels?.getAll?.(tenantId);
      
      if (response?.data) {
        const levels: SchoolLevel[] = Array.isArray(response.data) 
          ? response.data 
          : response.data.levels || [];
        
        // Trier par ordre
        const sortedLevels = levels
          .filter(level => level.isActive)
          .sort((a, b) => a.order - b.order);
        
        setSchoolLevels(sortedLevels);

        // Si aucun niveau n'est sélectionné, sélectionner le premier par défaut
        if (!selectedSchoolLevelId && sortedLevels.length > 0) {
          const savedLevelId = localStorage.getItem(`schoolLevelId_${tenantId}`);
          const levelToSelect = savedLevelId 
            ? sortedLevels.find(l => l.id === savedLevelId) || sortedLevels[0]
            : sortedLevels[0];
          
          setSelectedSchoolLevel(levelToSelect);
          setSelectedSchoolLevelId(levelToSelect.id);
          localStorage.setItem(`schoolLevelId_${tenantId}`, levelToSelect.id);
        }
      } else {
        throw new Error('Aucun niveau scolaire trouvé');
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des niveaux scolaires:', error);
      setError(error.message || 'Erreur lors du chargement des niveaux scolaires');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, selectedSchoolLevelId]);

  // Sélectionner un niveau scolaire
  const selectSchoolLevel = useCallback((schoolLevelId: string) => {
    const level = schoolLevels.find(l => l.id === schoolLevelId);
    if (level) {
      setSelectedSchoolLevel(level);
      setSelectedSchoolLevelId(schoolLevelId);
      if (tenantId) {
        localStorage.setItem(`schoolLevelId_${tenantId}`, schoolLevelId);
      }
    }
  }, [schoolLevels, tenantId]);

  // Rafraîchir les niveaux scolaires
  const refreshSchoolLevels = useCallback(async () => {
    await loadSchoolLevels();
  }, [loadSchoolLevels]);

  // Charger les niveaux au montage ou quand le tenant change
  useEffect(() => {
    if (tenantId) {
      loadSchoolLevels();
    }
  }, [tenantId, loadSchoolLevels]);

  // Restaurer le niveau sélectionné depuis localStorage
  useEffect(() => {
    if (tenantId && schoolLevels.length > 0 && !selectedSchoolLevelId) {
      const savedLevelId = localStorage.getItem(`schoolLevelId_${tenantId}`);
      if (savedLevelId) {
        const level = schoolLevels.find(l => l.id === savedLevelId);
        if (level) {
          setSelectedSchoolLevel(level);
          setSelectedSchoolLevelId(savedLevelId);
        } else {
          // Si le niveau sauvegardé n'existe plus, sélectionner le premier
          const firstLevel = schoolLevels[0];
          setSelectedSchoolLevel(firstLevel);
          setSelectedSchoolLevelId(firstLevel.id);
          localStorage.setItem(`schoolLevelId_${tenantId}`, firstLevel.id);
        }
      } else {
        // Aucun niveau sauvegardé, sélectionner le premier
        const firstLevel = schoolLevels[0];
        if (firstLevel) {
          setSelectedSchoolLevel(firstLevel);
          setSelectedSchoolLevelId(firstLevel.id);
          localStorage.setItem(`schoolLevelId_${tenantId}`, firstLevel.id);
        }
      }
    }
  }, [tenantId, schoolLevels, selectedSchoolLevelId]);

  const value: SchoolLevelContextType = {
    schoolLevels,
    selectedSchoolLevel,
    selectedSchoolLevelId,
    isLoading,
    error,
    selectSchoolLevel,
    refreshSchoolLevels,
    isLevelRequired,
  };

  return (
    <SchoolLevelContext.Provider value={value}>
      {children}
    </SchoolLevelContext.Provider>
  );
};

