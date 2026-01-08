import React from 'react';
import { FooterConfig } from '../../types/documentSettings';

interface BeninOfficialFooterProps {
  footerConfig: FooterConfig;
  className?: string;
}

const BeninOfficialFooter: React.FC<BeninOfficialFooterProps> = ({
  footerConfig,
  className = ''
}) => {
  const isMaternellePrimaire = footerConfig.legalNotice?.includes('Maternel et Primaire');
  const isSecondaire = footerConfig.legalNotice?.includes('Secondaire et de la Formation Professionnelle');

  const renderDate = () => {
    if (!footerConfig.date) return null;
    return (
      <div className="text-sm text-gray-700">
        Fait à {footerConfig.contactInfo?.split(' - ')[0] || '{{adresseEcole}}'}, le {new Date().toLocaleDateString('fr-FR')}
      </div>
    );
  };

  const renderPageNumber = () => {
    if (!footerConfig.pageNumber) return null;
    return (
      <div className="text-sm text-gray-500">
        Page 1
      </div>
    );
  };

  return (
    <div className={`w-full mt-8 ${className}`}>
      {/* Ligne de séparation */}
      <div className="border-t border-gray-300 pt-4">
        <div className="flex justify-between items-start">
          {/* Signature */}
          <div className="flex-1">
            <div className="text-center">
              <div className="text-sm text-gray-700 mb-2">
                {footerConfig.legalNotice}
              </div>
              
              {/* Espace pour signature */}
              <div className="mt-8 mb-2">
                <div className="text-sm font-medium text-gray-800">
                  {footerConfig.directorName}
                </div>
                <div className="text-sm text-gray-600">
                  {footerConfig.directorTitle}
                </div>
              </div>
            </div>
          </div>

          {/* Informations de contact et date */}
          <div className="text-right text-sm text-gray-600">
            <div className="mb-2">
              {footerConfig.contactInfo}
            </div>
            {renderDate()}
            {renderPageNumber()}
          </div>
        </div>

        {/* Informations spécifiques au niveau */}
        <div className="text-xs text-gray-500 text-center mt-4">
          {isMaternellePrimaire && (
            <div>
              Document établi conformément aux dispositions du Ministère des Enseignements Maternel et Primaire
            </div>
          )}
          {isSecondaire && (
            <div>
              Document établi conformément aux dispositions du Ministère des Enseignements Secondaire et de la Formation Professionnelle
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BeninOfficialFooter;
