/**
 * ============================================================================
 * SCHOOL LEVEL SELECTOR - SÉLECTEUR DE NIVEAU SCOLAIRE
 * ============================================================================
 * 
 * Composant pour sélectionner le niveau scolaire.
 * OBLIGATOIRE pour toutes les opérations métier.
 * 
 * ============================================================================
 */

import React from 'react';
import { ChevronDown, GraduationCap, AlertCircle } from 'lucide-react';
import { useSchoolLevel } from '../../contexts/SchoolLevelContext';

interface SchoolLevelSelectorProps {
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

export const SchoolLevelSelector: React.FC<SchoolLevelSelectorProps> = ({
  className = '',
  showLabel = true,
  compact = false,
}) => {
  const {
    schoolLevels,
    selectedSchoolLevel,
    selectedSchoolLevelId,
    isLoading,
    error,
    selectSchoolLevel,
    isLevelRequired,
  } = useSchoolLevel();

  const [isOpen, setIsOpen] = React.useState(false);

  // Si aucun niveau n'est requis (routes publiques), ne pas afficher
  if (!isLevelRequired) {
    return null;
  }

  // Si aucun niveau n'est sélectionné et qu'un niveau est requis, afficher un avertissement
  if (!selectedSchoolLevelId && isLevelRequired && !isLoading) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg ${className}`}>
        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          Veuillez sélectionner un niveau scolaire
        </span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 ${className}`}>
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-sm text-gray-600 dark:text-gray-400">Chargement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}>
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
      </div>
    );
  }

  if (schoolLevels.length === 0) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
        <AlertCircle className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Aucun niveau scolaire disponible
        </span>
      </div>
    );
  }

  const getLevelIcon = (type: string) => {
    switch (type) {
      case 'MATERNELLE':
        return '🎨';
      case 'PRIMAIRE':
        return '📚';
      case 'SECONDAIRE':
        return '🎓';
      default:
        return '🏫';
    }
  };

  const getLevelColor = (type: string) => {
    switch (type) {
      case 'MATERNELLE':
        return 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800';
      case 'PRIMAIRE':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'SECONDAIRE':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {showLabel && !compact && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Niveau scolaire <span className="text-red-500">*</span>
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between gap-3 px-4 py-2.5
            bg-white dark:bg-gray-800 border rounded-lg
            hover:border-blue-400 dark:hover:border-blue-600
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-colors duration-200
            ${selectedSchoolLevel ? getLevelColor(selectedSchoolLevel.type) : 'border-gray-300 dark:border-gray-700'}
            ${compact ? 'px-3 py-1.5 text-sm' : ''}
          `}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedSchoolLevel && (
              <>
                <span className="text-lg flex-shrink-0">
                  {getLevelIcon(selectedSchoolLevel.type)}
                </span>
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium truncate">
                    {selectedSchoolLevel.name}
                  </div>
                  {!compact && (
                    <div className="text-xs opacity-75 truncate">
                      {selectedSchoolLevel.abbreviation}
                    </div>
                  )}
                </div>
              </>
            )}
            {!selectedSchoolLevel && (
              <span className="text-gray-500 dark:text-gray-400">
                Sélectionner un niveau
              </span>
            )}
          </div>
          <ChevronDown 
            className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <>
            {/* Overlay pour fermer le menu */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu déroulant */}
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
              {schoolLevels.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => {
                    selectSchoolLevel(level.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3
                    hover:bg-gray-50 dark:hover:bg-gray-700
                    transition-colors duration-150
                    ${selectedSchoolLevelId === level.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  `}
                >
                  <span className="text-xl flex-shrink-0">
                    {getLevelIcon(level.type)}
                  </span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {level.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {level.abbreviation}
                      {level.description && ` • ${level.description}`}
                    </div>
                  </div>
                  {selectedSchoolLevelId === level.id && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

