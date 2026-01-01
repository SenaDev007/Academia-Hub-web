import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useQuartersData } from '../../hooks/useQuartersData';
import { useQuarterState } from '../../hooks/useQuarterState';

interface QuarterSelectorProps {
  moduleName?: string;
  className?: string;
  disabled?: boolean;
  showLabel?: boolean;
  label?: string;
  placeholder?: string;
  academicYearId?: string; // Nouvelle prop pour filtrer par année scolaire
  onChange?: (quarterId: string) => void;
}

const QuarterSelector: React.FC<QuarterSelectorProps> = ({
  moduleName = 'default',
  className = '',
  disabled = false,
  showLabel = true,
  label = 'Trimestre',
  placeholder = 'Sélectionner un trimestre',
  academicYearId,
  onChange
}) => {
  const {
    quarters,
    quartersLoading,
    error
  } = useQuartersData();

  // Filtrer les trimestres par année scolaire si academicYearId est fourni
  const filteredQuarters = academicYearId 
    ? quarters.filter(quarter => quarter.academicYearId === academicYearId)
    : quarters;

  const quarterLoading = quartersLoading;

  const {
    selectedQuarter,
    setSelectedQuarter
  } = useQuarterState(moduleName);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const quarterId = e.target.value;
    setSelectedQuarter(quarterId);
    if (onChange) {
      onChange(quarterId);
    }
  };

  const getQuarterIcon = (quarterNumber: number) => {
    switch (quarterNumber) {
      case 1:
        return '🍂'; // Automne
      case 2:
        return '❄️'; // Hiver
      case 3:
        return '🌸'; // Printemps
      case 4:
        return '☀️'; // Été/Vacances
      default:
        return '📅';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          value={selectedQuarter || ''}
          onChange={handleChange}
          disabled={disabled || quarterLoading}
          className={`w-full px-4 py-3 pl-10 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label={label}
        >
          {quarterLoading ? (
            <option value="">Chargement des trimestres...</option>
          ) : filteredQuarters.length > 0 ? (
            filteredQuarters.map((quarter) => (
              <option key={quarter.id} value={quarter.id}>
                {getQuarterIcon(quarter.quarterNumber)} {quarter.name} {quarter.isActive ? '(Actuel)' : ''}
              </option>
            ))
          ) : (
            <option value="">{placeholder}</option>
          )}
        </select>
        
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {quarterLoading ? (
            <Clock className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Calendar className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
};

export default QuarterSelector;
