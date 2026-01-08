/**
 * Script pour mettre à jour automatiquement tous les modules avec le système d'années scolaires
 */

const fs = require('fs');
const path = require('path');

// Liste des modules à mettre à jour
const modules = [
  'Boutique.tsx',
  'Cafeteria.tsx', 
  'Communication.tsx',
  'EduCast.tsx',
  'EmploiDuTempsModern.tsx',
  'Health.tsx',
  'Laboratory.tsx',
  'Library.tsx',
  'Overview.tsx',
  'QHSE.tsx',
  'Settings.tsx',
  'StorageDashboard.tsx',
  'SyncDashboard.tsx',
  'Transport.tsx'
];

const dashboardPath = path.join(__dirname, '../components/dashboard');

// Imports à ajouter
const importsToAdd = `import { useAcademicYearState } from '../../hooks/useAcademicYearState';
import AcademicYearSelector from '../common/AcademicYearSelector';
import CurrentAcademicYearDisplay from '../common/CurrentAcademicYearDisplay';`;

// Code à ajouter dans le composant principal
const academicYearCode = `  
  // Gestion de l'année scolaire
  const { selectedAcademicYear, setSelectedAcademicYear } = useAcademicYearState('moduleName');`;

// Interface à ajouter dans le header
const headerInterface = `          {/* Affichage de l'année scolaire actuelle */}
          <CurrentAcademicYearDisplay variant="compact" />
          
          {/* Sélecteur d'année scolaire */}
          <AcademicYearSelector
            value={selectedAcademicYear}
            onChange={setSelectedAcademicYear}
            className="w-full sm:w-auto min-w-[200px]"
          />`;

function updateModule(moduleName) {
  const filePath = path.join(dashboardPath, moduleName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Module ${moduleName} non trouvé`);
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si déjà mis à jour
    if (content.includes('useAcademicYearState')) {
      console.log(`✅ Module ${moduleName} déjà mis à jour`);
      return;
    }

    // Ajouter les imports
    const importMatch = content.match(/import React, \{ useState, useEffect \} from 'react';/);
    if (importMatch) {
      content = content.replace(
        importMatch[0],
        importMatch[0] + '\n' + importsToAdd
      );
    }

    // Ajouter le code de gestion de l'année scolaire
    const componentMatch = content.match(/const \w+: React\.FC = \(\) => \{[\s\S]*?const \[activeTab, setActiveTab\] = useState/);
    if (componentMatch) {
      content = content.replace(
        componentMatch[0],
        componentMatch[0] + academicYearCode.replace('moduleName', moduleName.replace('.tsx', '').toLowerCase())
      );
    }

    // Ajouter l'interface dans le header
    const headerMatch = content.match(/(<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">[\s\S]*?<div className="mt-4 sm:mt-0 flex space-x-3">)/);
    if (headerMatch) {
      content = content.replace(
        headerMatch[0],
        headerMatch[0].replace(
          '<div className="mt-4 sm:mt-0 flex space-x-3">',
          '<div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">' + '\n' + headerInterface
        )
      );
    }

    // Sauvegarder le fichier
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Module ${moduleName} mis à jour avec succès`);
    
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour de ${moduleName}:`, error.message);
  }
}

// Exécuter la mise à jour pour tous les modules
console.log('🚀 Mise à jour des modules avec le système d\'années scolaires...\n');

modules.forEach(module => {
  updateModule(module);
});

console.log('\n✨ Mise à jour terminée !');
