import React, { useState, useEffect } from 'react';
import { ExternalLink, X, Info } from 'lucide-react';

interface NavigationNotificationProps {
  isVisible: boolean;
  targetModule: string;
  targetTab?: string;
  onClose: () => void;
  onConfirm: () => void;
}

const NavigationNotification: React.FC<NavigationNotificationProps> = ({
  isVisible,
  targetModule,
  targetTab,
  onClose,
  onConfirm
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Auto-hide après 30 secondes
      const timer = setTimeout(() => {
        onClose();
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getModuleDisplayName = (module: string) => {
    const moduleNames: { [key: string]: string } = {
      'Finance': 'Finance',
      'HR': 'Ressources Humaines',
      'Cafeteria': 'Cafétéria',
      'Boutique': 'Boutique',
      'Communication': 'Communication',
      'Health': 'Santé'
    };
    return moduleNames[module] || module;
  };

  const getTabDisplayName = (tab: string) => {
    const tabNames: { [key: string]: string } = {
      'payroll': 'Gestion de la paie',
      'personnel': 'Personnel',
      'contracts': 'Contrats',
      'training': 'Formation',
      'evaluations': 'Évaluations'
    };
    return tabNames[tab] || tab;
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`
        bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 
        rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out
        ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Redirection automatique
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Vous allez être redirigé vers le module{' '}
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {getModuleDisplayName(targetModule)}
              </span>
              {targetTab && (
                <>
                  {' '}dans l'onglet{' '}
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {getTabDisplayName(targetTab)}
                  </span>
                </>
              )}
            </p>
            
            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={onConfirm}
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Continuer
              </button>
              <button
                onClick={onClose}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Annuler
              </button>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavigationNotification;
