import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useAcademicYear } from '../../hooks/useAcademicYear';
import { useAcademicYearState } from '../../hooks/useAcademicYearState';

interface AcademicYearSelectorProps {
  moduleName?: string;
  className?: string;
  disabled?: boolean;
  showLabel?: boolean;
  label?: string;
  placeholder?: string;
  onChange?: (yearId: string) => void;
  labelColor?: 'white' | 'dark' | 'auto';
}

const AcademicYearSelector: React.FC<AcademicYearSelectorProps> = ({
  moduleName = 'default',
  className = '',
  disabled = false,
  showLabel = true,
  label = 'Année Scolaire',
  placeholder = 'Sélectionner une année scolaire',
  labelColor = 'auto',
  onChange
}) => {
  const {
    academicYears,
    currentAcademicYear,
    loading: academicYearLoading,
    getAcademicYearOptions
  } = useAcademicYear();

  const {
    selectedAcademicYear,
    setSelectedAcademicYear
  } = useAcademicYearState(moduleName);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const yearId = e.target.value;
    setSelectedAcademicYear(yearId);
    if (onChange) {
      onChange(yearId);
    }
  };

  // Détermine la couleur du label selon le contexte
  const getLabelColorClass = () => {
    switch (labelColor) {
      case 'white':
        return 'text-white';
      case 'dark':
        return 'text-gray-700 dark:text-gray-300';
      case 'auto':
      default:
        // Détecte si le composant est sur un fond sombre (dégradé)
        return className.includes('text-white') || className.includes('bg-gradient') 
          ? 'text-white' 
          : 'text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <label className={`block text-sm font-semibold ${getLabelColorClass()}`}>  
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          value={selectedAcademicYear || ''}
          onChange={handleChange}
          disabled={disabled || academicYearLoading}
          className={`w-full px-4 py-3 pl-10 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label={label}
        >
          {academicYearLoading ? (
            <option value="">Chargement des années scolaires...</option>
          ) : academicYears.length > 0 ? (
            getAcademicYearOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} {option.isCurrent ? '(Actuelle)' : ''}
              </option>
            ))
          ) : (
            <option value="">{placeholder}</option>
          )}
        </select>
        
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {academicYearLoading ? (
            <Clock className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Calendar className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
      
    </div>
  );
};

export default AcademicYearSelector;