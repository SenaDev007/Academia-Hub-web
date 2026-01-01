import React from 'react';
import { Baby, GraduationCap, BookOpen, Users } from 'lucide-react';
import { EducationalCycle } from './TeachersTab';

interface CycleSelectorProps {
  selectedCycle: EducationalCycle;
  onCycleChange: (cycle: EducationalCycle) => void;
  teacherCounts: {
    all: number;
    maternelle: number;
    primaire: number;
    secondaire: number;
  };
}

const CycleSelector: React.FC<CycleSelectorProps> = ({
  selectedCycle,
  onCycleChange,
  teacherCounts
}) => {
  const cycles = [
    {
      id: 'all' as EducationalCycle,
      name: 'Tous les niveaux scolaires',
      description: 'Vue d\'ensemble complète',
      icon: Users,
      color: 'from-gray-600 to-gray-700',
      hoverColor: 'hover:from-gray-700 hover:to-gray-800',
      count: teacherCounts.all
    },
    {
      id: 'maternelle' as EducationalCycle,
      name: 'Maternelle',
      description: 'Maternelle 1, 2, 3',
      icon: Baby,
      color: 'from-pink-600 to-rose-700',
      hoverColor: 'hover:from-pink-700 hover:to-rose-800',
      count: teacherCounts.maternelle
    },
    {
      id: 'primaire' as EducationalCycle,
      name: 'Primaire',
      description: 'CI, CP, CE1, CE2, CM1, CM2',
      icon: BookOpen,
      color: 'from-blue-600 to-cyan-700',
      hoverColor: 'hover:from-blue-700 hover:to-cyan-800',
      count: teacherCounts.primaire
    },
    {
      id: 'secondaire' as EducationalCycle,
      name: '1er & 2nd Cycle secondaire',
      description: 'Collège et Lycée',
      icon: GraduationCap,
      color: 'from-purple-600 to-indigo-700',
      hoverColor: 'hover:from-purple-700 hover:to-indigo-800',
      count: teacherCounts.secondaire
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cycles.map((cycle) => {
        const Icon = cycle.icon;
        const isSelected = selectedCycle === cycle.id;
        
        return (
          <button
            key={cycle.id}
            onClick={() => onCycleChange(cycle.id)}
            className={`
              relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 transform
              ${isSelected 
                ? `bg-gradient-to-br ${cycle.color} text-white scale-105 shadow-xl ring-4 ring-white ring-opacity-60` 
                : `bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:scale-102 ${cycle.hoverColor}`
              }
            `}
          >
            {/* Icône de fond décorative */}
            <div className={`absolute -top-2 -right-2 w-16 h-16 rounded-full flex items-center justify-center ${
              isSelected ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <Icon className={`w-8 h-8 ${
                isSelected ? 'text-white' : 'text-gray-400 dark:text-gray-500'
              }`} />
            </div>

            {/* Contenu principal */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                  }`} />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${
                    isSelected ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {cycle.name}
                  </h3>
                  <p className={`text-sm ${
                    isSelected ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {cycle.description}
                  </p>
                </div>
              </div>

              {/* Statistiques */}
              <div className="flex items-center justify-start">
                <div>
                  <div className={`text-2xl font-bold ${
                    isSelected ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {cycle.count}
                  </div>
                  <div className={`text-sm ${
                    isSelected ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {cycle.count === 1 ? 'enseignant' : 'enseignants'}
                  </div>
                </div>
              </div>
            </div>

            {/* Indicateur de sélection */}
            {isSelected && (
              <div className="absolute top-4 right-4">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CycleSelector;
