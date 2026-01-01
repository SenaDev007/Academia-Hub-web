/**
 * Exemples d'utilisation du système d'années scolaires dynamiques
 * pour les différents modules de l'application
 */

import React from 'react';
import { useAcademicYear } from '../services/AcademicYearService';
import { useAcademicYearState } from '../hooks/useAcademicYearState';
import AcademicYearSelector from '../components/common/AcademicYearSelector';
import CurrentAcademicYearDisplay from '../components/common/CurrentAcademicYearDisplay';

// ========================================
// EXEMPLE 1: Module Students
// ========================================
export const StudentsModuleExample: React.FC = () => {
  const { selectedAcademicYear, setSelectedAcademicYear } = useAcademicYearState('students');
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Module Students</h2>
      
      {/* Affichage de l'année scolaire actuelle */}
      <CurrentAcademicYearDisplay variant="detailed" className="mb-6" />
      
      {/* Sélecteur d'année scolaire */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Année scolaire sélectionnée
        </label>
        <AcademicYearSelector
          value={selectedAcademicYear}
          onChange={setSelectedAcademicYear}
          className="w-full max-w-xs"
        />
      </div>
      
      {/* Contenu du module basé sur l'année sélectionnée */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <p>Données des étudiants pour l'année: <strong>{selectedAcademicYear}</strong></p>
      </div>
    </div>
  );
};

// ========================================
// EXEMPLE 2: Module HR
// ========================================
export const HRModuleExample: React.FC = () => {
  const { selectedAcademicYear, setSelectedAcademicYear } = useAcademicYearState('hr');
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Module HR</h2>
      
      {/* Affichage compact de l'année scolaire */}
      <CurrentAcademicYearDisplay variant="compact" className="mb-4" />
      
      {/* Sélecteur d'année scolaire */}
      <div className="mb-4">
        <AcademicYearSelector
          value={selectedAcademicYear}
          onChange={setSelectedAcademicYear}
          className="w-full max-w-xs"
        />
      </div>
      
      {/* Contenu du module */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <p>Données RH pour l'année: <strong>{selectedAcademicYear}</strong></p>
      </div>
    </div>
  );
};

// ========================================
// EXEMPLE 3: Module Academics
// ========================================
export const AcademicsModuleExample: React.FC = () => {
  const { selectedAcademicYear, setSelectedAcademicYear } = useAcademicYearState('academics');
  const { getAcademicYearForDate, isDateInAcademicYear } = useAcademicYear();
  
  // Exemple d'utilisation des fonctions utilitaires
  const checkDateInAcademicYear = (date: Date) => {
    return isDateInAcademicYear(date, selectedAcademicYear);
  };
  
  const getAcademicYearForSpecificDate = (date: Date) => {
    return getAcademicYearForDate(date);
  };
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Module Academics</h2>
      
      {/* Affichage de l'année scolaire */}
      <CurrentAcademicYearDisplay variant="default" showPeriod={true} className="mb-6" />
      
      {/* Sélecteur d'année scolaire */}
      <div className="mb-4">
        <AcademicYearSelector
          value={selectedAcademicYear}
          onChange={setSelectedAcademicYear}
          className="w-full max-w-xs"
        />
      </div>
      
      {/* Exemple d'utilisation des fonctions utilitaires */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">Fonctions utilitaires:</h3>
        <p>Date du jour dans l'année sélectionnée: {checkDateInAcademicYear(new Date()) ? 'Oui' : 'Non'}</p>
        <p>Année scolaire pour le 15 septembre 2025: {getAcademicYearForSpecificDate(new Date(2025, 8, 15))?.label || 'Non trouvée'}</p>
      </div>
      
      {/* Contenu du module */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <p>Données académiques pour l'année: <strong>{selectedAcademicYear}</strong></p>
      </div>
    </div>
  );
};

// ========================================
// EXEMPLE 4: Module Reports
// ========================================
export const ReportsModuleExample: React.FC = () => {
  const { selectedAcademicYear, setSelectedAcademicYear } = useAcademicYearState('reports');
  const { getActiveAcademicYears, getPastAcademicYears } = useAcademicYear();
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Module Reports</h2>
      
      {/* Affichage de l'année scolaire */}
      <CurrentAcademicYearDisplay variant="detailed" className="mb-6" />
      
      {/* Sélecteur d'année scolaire */}
      <div className="mb-4">
        <AcademicYearSelector
          value={selectedAcademicYear}
          onChange={setSelectedAcademicYear}
          className="w-full max-w-xs"
        />
      </div>
      
      {/* Liste des années disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Années Actives</h3>
          <ul className="text-sm text-green-700 dark:text-green-300">
            {getActiveAcademicYears().map(year => (
              <li key={year.id}>• {year.label}</li>
            ))}
          </ul>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Années Passées</h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300">
            {getPastAcademicYears().map(year => (
              <li key={year.id}>• {year.label}</li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Contenu du module */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <p>Rapports pour l'année: <strong>{selectedAcademicYear}</strong></p>
      </div>
    </div>
  );
};

// ========================================
// EXEMPLE 5: Utilisation avancée avec filtrage
// ========================================
export const AdvancedUsageExample: React.FC = () => {
  const { selectedAcademicYear, setSelectedAcademicYear } = useAcademicYearState('advanced');
  const { 
    academicYears, 
    currentAcademicYear, 
    getAcademicYearForDate,
    isDateInAcademicYear 
  } = useAcademicYear();
  
  // Exemple de filtrage des données par année scolaire
  const filterDataByAcademicYear = (data: any[], academicYearId: string) => {
    return data.filter(item => {
      if (item.academicYearId) {
        return item.academicYearId === academicYearId;
      }
      if (item.date) {
        return isDateInAcademicYear(new Date(item.date), academicYearId);
      }
      return false;
    });
  };
  
  // Exemple de données
  const sampleData = [
    { id: 1, name: 'Étudiant 1', date: '2025-09-15', academicYearId: '2025-2026' },
    { id: 2, name: 'Étudiant 2', date: '2024-10-15', academicYearId: '2024-2025' },
    { id: 3, name: 'Étudiant 3', date: '2025-11-15', academicYearId: '2025-2026' },
  ];
  
  const filteredData = filterDataByAcademicYear(sampleData, selectedAcademicYear);
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Utilisation Avancée</h2>
      
      {/* Sélecteur d'année scolaire */}
      <div className="mb-4">
        <AcademicYearSelector
          value={selectedAcademicYear}
          onChange={setSelectedAcademicYear}
          className="w-full max-w-xs"
        />
      </div>
      
      {/* Données filtrées */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Données filtrées pour {selectedAcademicYear}:</h3>
        <ul>
          {filteredData.map(item => (
            <li key={item.id} className="text-sm">
              • {item.name} ({item.date})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default {
  StudentsModuleExample,
  HRModuleExample,
  AcademicsModuleExample,
  ReportsModuleExample,
  AdvancedUsageExample
};
