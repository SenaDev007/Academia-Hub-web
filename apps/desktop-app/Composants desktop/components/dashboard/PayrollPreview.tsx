import React from 'react';
import { 
  Calculator, 
  ExternalLink, 
  Users, 
  FileText, 
  TrendingUp, 
  Shield,
  ArrowRight
} from 'lucide-react';

interface PayrollPreviewProps {
  onNavigateToFinance: () => void;
  personnelCount: number;
  totalSalary: number;
}

const PayrollPreview: React.FC<PayrollPreviewProps> = ({
  onNavigateToFinance,
  personnelCount,
  totalSalary
}) => {
  const features = [
    {
      icon: Calculator,
      title: 'Calcul des salaires',
      description: 'Calcul automatique des salaires, primes et charges'
    },
    {
      icon: FileText,
      title: 'Bulletins de paie',
      description: 'Génération et gestion des bulletins de paie'
    },
    {
      icon: TrendingUp,
      title: 'Suivi des évolutions',
      description: 'Historique des augmentations et promotions'
    },
    {
      icon: Shield,
      title: 'Conformité légale',
      description: 'Respect des obligations fiscales et sociales'
    }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              Gestion de la Paie
            </h3>
            <p className="text-emerald-700 dark:text-emerald-300 mt-2">
              La gestion des salaires et de la paie se fait dans le module Finance
            </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
            <Calculator className="w-8 h-8 text-white" />
          </div>
        </div>
        
        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white dark:bg-emerald-900/30 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Personnel actif</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {personnelCount}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-emerald-900/30 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Masse salariale</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {totalSalary.toLocaleString()} F CFA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fonctionnalités disponibles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Fonctionnalités disponibles dans le module Finance
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-gray-100">
                    {feature.title}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bouton de navigation */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Accéder à la Gestion de la Paie
          </h4>
          
          <p className="text-blue-700 dark:text-blue-300 mb-6 max-w-md mx-auto">
            Cliquez sur le bouton ci-dessous pour être redirigé vers le module Finance 
            et accéder à toutes les fonctionnalités de gestion de la paie.
          </p>
          
          <button
            onClick={onNavigateToFinance}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Calculator className="w-5 h-5 mr-2" />
            Aller au module Finance
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
          
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
            Vous serez redirigé vers l'onglet "Gestion de la paie"
          </p>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">i</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              Pourquoi cette redirection ?
            </p>
            <p>
              La gestion de la paie est centralisée dans le module Finance pour assurer 
              la cohérence des données financières et faciliter la comptabilité. 
              Cette séparation permet une meilleure organisation des responsabilités 
              et une gestion plus efficace des flux financiers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollPreview;
