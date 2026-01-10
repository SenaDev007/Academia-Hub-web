/**
 * ============================================================================
 * USE MODULE CONTEXT - HOOK DE CONTEXTE MODULE
 * ============================================================================
 * 
 * Hook pour accéder au contexte du module actif
 * Fournit : academicYear, schoolLevel, academicTrack, tenant
 * 
 * ============================================================================
 */

import { useAcademicYear } from './useAcademicYear';
import { useSchoolLevel } from './useSchoolLevel';
import { useFeature } from './useFeature';
import { FeatureCode } from '@/lib/features/tenant-features.service';

export interface ModuleContext {
  /** Année scolaire active */
  academicYear: {
    id: string;
    label: string;
    name: string;
  } | null;
  /** Niveau scolaire actif */
  schoolLevel: {
    id: string;
    code: string;
    label: string;
  } | null;
  /** Track académique actif (FR/EN) */
  academicTrack: {
    id: string;
    code: string;
    name: string;
  } | null;
  /** Option bilingue activée */
  isBilingualEnabled: boolean;
  /** Chargement */
  isLoading: boolean;
}

/**
 * Hook pour accéder au contexte du module
 * 
 * @returns ModuleContext
 */
export function useModuleContext(): ModuleContext {
  const { currentYear, isLoading: yearLoading } = useAcademicYear();
  const { currentLevel, isLoading: levelLoading } = useSchoolLevel();
  const { isEnabled: isBilingualEnabled } = useFeature(FeatureCode.BILINGUAL_TRACK);

  // TODO: Récupérer le track académique actif depuis le contexte
  // Pour l'instant, on retourne null
  const academicTrack = null;

  return {
    academicYear: currentYear
      ? {
          id: currentYear.id,
          label: currentYear.label,
          name: currentYear.name || currentYear.label,
        }
      : null,
    schoolLevel: currentLevel
      ? {
          id: currentLevel.id,
          code: currentLevel.code,
          label: currentLevel.label || currentLevel.code,
        }
      : null,
    academicTrack,
    isBilingualEnabled: isBilingualEnabled || false,
    isLoading: yearLoading || levelLoading,
  };
}

