import React from 'react';
import { HeaderConfig } from '../../types/documentSettings';
import BeninFlag from '../icons/BeninFlag';
import SchoolLogo from '../icons/SchoolLogo';

interface BeninOfficialHeaderProps {
  headerConfig: HeaderConfig;
  showLogos?: boolean;
  className?: string;
}

const BeninOfficialHeader: React.FC<BeninOfficialHeaderProps> = ({
  headerConfig,
  showLogos = true,
  className = ''
}) => {
  const isMaternellePrimaire = headerConfig.slogan?.includes('Maternel et Primaire');
  const isSecondaire = headerConfig.slogan?.includes('Secondaire et de la Formation Professionnelle');

  const renderSlogan = () => {
    if (!headerConfig.slogan) return null;
    
    const lines = headerConfig.slogan.split('\n');
    return (
      <div className="text-center space-y-1">
        {lines.map((line, index) => (
          <div key={index} className={`font-medium ${
            index === 0 ? 'text-lg font-bold' : 
            index === 1 ? 'text-base font-semibold' : 
            'text-sm'
          }`}>
            {line}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {/* En-tête officiel */}
      <div className="border-b-2 border-gray-800 pb-4 mb-4">
        <div className="flex items-start justify-between">
          {/* Logo du drapeau du Bénin (à gauche) */}
          {showLogos && (
            <div className="flex-shrink-0 w-16 h-20">
              <div className="w-full h-full border border-gray-300 rounded-sm overflow-hidden">
                <BeninFlag width={64} height={80} className="w-full h-full" />
              </div>
            </div>
          )}

          {/* Contenu central */}
          <div className="flex-1 mx-4">
            {renderSlogan()}
            
            {/* Nom de l'école */}
            <div className="text-center mt-4">
              <h1 className="text-xl font-bold text-gray-900">
                {headerConfig.schoolName}
              </h1>
            </div>

            {/* Informations de contact */}
            <div className="text-center mt-2 text-sm text-gray-700">
              <div>{headerConfig.schoolAddress}</div>
              <div>Tél: {headerConfig.schoolPhone}</div>
              {headerConfig.schoolEmail && (
                <div>Email: {headerConfig.schoolEmail}</div>
              )}
            </div>

            {/* Année scolaire */}
            {headerConfig.academicYear && (
              <div className="text-center mt-2 text-sm font-medium text-gray-800">
                Année scolaire: {headerConfig.academicYear}
              </div>
            )}
          </div>

          {/* Logo de l'école (à droite) */}
          {showLogos && (
            <div className="flex-shrink-0 w-16 h-20">
              <SchoolLogo 
                width={64} 
                height={80} 
                schoolName={headerConfig.schoolName || 'ÉCOLE'}
                className="w-full h-full"
              />
            </div>
          )}
        </div>

        {/* Texte additionnel (type de document) */}
        {headerConfig.additionalText && (
          <div className="text-center mt-4">
            <div className="inline-block px-4 py-2 bg-gray-100 border border-gray-300 rounded">
              <span className="text-lg font-semibold text-gray-800">
                {headerConfig.additionalText}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Informations spécifiques au niveau */}
      <div className="text-xs text-gray-600 text-center">
        {isMaternellePrimaire && (
          <div>
            Ministère des Enseignements Maternel et Primaire - 
            Direction Départementale du {headerConfig.slogan?.split('du ')[1]?.split('\n')[0] || '{{departement}}'} - 
            Circonscription Scolaire de {headerConfig.slogan?.split('de ')[1] || '{{circonscription}}'}
          </div>
        )}
        {isSecondaire && (
          <div>
            Ministère des Enseignements Secondaire et de la Formation Professionnelle - 
            Direction Départementale du {headerConfig.slogan?.split('du ')[1]?.split('\n')[0] || '{{departement}}'}
          </div>
        )}
      </div>
    </div>
  );
};

export default BeninOfficialHeader;
