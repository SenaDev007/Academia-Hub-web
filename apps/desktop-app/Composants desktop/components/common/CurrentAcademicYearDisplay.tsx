import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { useAcademicYear } from '../../hooks/useAcademicYear';

interface CurrentAcademicYearDisplayProps {
  className?: string;
  showIcon?: boolean;
  showPeriod?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export const CurrentAcademicYearDisplay: React.FC<CurrentAcademicYearDisplayProps> = ({
  className = '',
  showIcon = true,
  showPeriod = true,
  variant = 'default'
}) => {
  const { currentAcademicYear, loading } = useAcademicYear();

  if (loading || !currentAcademicYear) {
    return (
      <div className={`flex items-center ${className}`}>
        {showIcon && <Calendar className="w-4 h-4 mr-2 text-gray-400" />}
        <span className="text-gray-400">Chargement...</span>
      </div>
    );
  }

  const formatPeriod = (startDate: string | Date, endDate: string | Date) => {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    const startMonth = start.toLocaleDateString('fr-FR', { month: 'short' });
    const endMonth = end.toLocaleDateString('fr-FR', { month: 'short' });
    return `${startMonth} ${start.getFullYear()} - ${endMonth} ${end.getFullYear()}`;
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center ${className}`}>
        {showIcon && <Calendar className="w-4 h-4 mr-2 text-white/90" />}
        <span className="font-semibold text-white">
          {currentAcademicYear.label}
        </span>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`flex items-center ${className}`}>
        {showIcon && (
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
            <Calendar className="w-5 h-5 text-white" />
          </div>
        )}
        <div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {currentAcademicYear.label}
          </div>
          {showPeriod && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formatPeriod(currentAcademicYear.startDate, currentAcademicYear.endDate)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Variant par défaut
  return (
    <div className={`flex items-center ${className}`}>
      {showIcon && <Calendar className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />}
      <div className="flex items-center">
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {currentAcademicYear.label}
        </span>
        {showPeriod && (
          <>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatPeriod(currentAcademicYear.startDate, currentAcademicYear.endDate)}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default CurrentAcademicYearDisplay;
