import React from 'react';
import { X, DollarSign, Calendar, Users, GraduationCap, BookOpen } from 'lucide-react';
import { FeeConfiguration } from '../../services/financeService';

interface FeeConfigurationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  configuration: FeeConfiguration | null;
}

const FeeConfigurationViewModal: React.FC<FeeConfigurationViewModalProps> = ({
  isOpen,
  onClose,
  configuration
}) => {
  if (!isOpen || !configuration) return null;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  // Capitaliser le niveau scolaire
  const capitalizeLevel = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'maternelle': 'Maternelle',
      'primaire': 'Primaire',
      '1er-cycle-secondaire': '1er cycle secondaire',
      '2nd-cycle-secondaire': '2nd cycle secondaire'
    };
    return levelMap[level] || level;
  };

  const getLevelInfo = (level: string) => {
    const levelInfo: Record<string, {
      icon: React.ComponentType<any>;
      description: string;
      color: string;
    }> = {
      'maternelle': {
        icon: BookOpen,
        description: 'Éducation préscolaire',
        color: 'from-pink-500 to-rose-600'
      },
      'primaire': {
        icon: GraduationCap,
        description: 'Enseignement fondamental',
        color: 'from-blue-500 to-indigo-600'
      },
      '1er-cycle-secondaire': {
        icon: Users,
        description: 'Premier cycle du secondaire',
        color: 'from-green-500 to-emerald-600'
      },
      '2nd-cycle-secondaire': {
        icon: GraduationCap,
        description: 'Deuxième cycle du secondaire',
        color: 'from-purple-500 to-violet-600'
      }
    };
    
    return levelInfo[level] || {
      icon: BookOpen,
      description: 'Niveau scolaire',
      color: 'from-gray-500 to-gray-600'
    };
  };

  const levelInfo = getLevelInfo(configuration.level);
  const Icon = levelInfo.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${levelInfo.color} rounded-xl flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Configuration de frais
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {configuration.className ? `Classe: ${configuration.className}` : `Niveau: ${capitalizeLevel(configuration.level)}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informations générales */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Informations générales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Niveau</label>
                <p className="text-gray-900 dark:text-gray-100 font-semibold">{capitalizeLevel(configuration.level)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Classe</label>
                <p className="text-gray-900 dark:text-gray-100 font-semibold">
                  {configuration.className ? `Classe: ${configuration.className}` : 'Configuration au niveau'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Date d'effet</label>
                <p className="text-gray-900 dark:text-gray-100 font-semibold">
                  {new Date(configuration.effectiveDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Année académique</label>
                <p className="text-gray-900 dark:text-gray-100 font-semibold">
                  {configuration.academicYearId?.replace('academic-year-', '') || configuration.academicYearId}
                </p>
              </div>
            </div>
          </div>

          {/* Détails des frais */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Détails des frais
            </h3>
            <div className="space-y-4">
              {/* Frais d'inscription */}
              {configuration.inscriptionFee > 0 && (
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-green-600 mr-3" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Frais d'inscription</span>
                  </div>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatAmount(configuration.inscriptionFee)} F CFA
                  </span>
                </div>
              )}

              {/* Frais de réinscription */}
              {configuration.reinscriptionFee > 0 ? (
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Frais de réinscription</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {formatAmount(configuration.reinscriptionFee)} F CFA
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-green-600 mr-3" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Frais de réinscription</span>
                  </div>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    Gratuit
                  </span>
                </div>
              )}

              {/* Frais de scolarité */}
              {configuration.tuitionFees && configuration.tuitionFees.length > 0 && configuration.tuitionFees.some(fee => fee > 0) && (
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center mb-3">
                    <DollarSign className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Frais de scolarité</span>
                  </div>
                  <div className="space-y-2">
                    {configuration.tuitionFees.map((fee, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Montant
                        </span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          {formatAmount(fee)} F CFA
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900 dark:text-gray-100">Total</span>
                        <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {formatAmount(configuration.tuitionFees.reduce((sum, fee) => sum + fee, 0))} F CFA
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Métadonnées */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Informations système
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <label className="text-gray-600 dark:text-gray-400">École</label>
                <p className="text-gray-900 dark:text-gray-100">{configuration.schoolName || configuration.schoolId}</p>
              </div>
              {(configuration.createdAt || configuration.updatedAt) && (
                <div className="flex space-x-6">
                  {configuration.createdAt && (
                    <div className="flex-1">
                      <label className="text-gray-600 dark:text-gray-400">Créé le</label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {new Date(configuration.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  )}
                  {configuration.updatedAt && (
                    <div className="flex-1">
                      <label className="text-gray-600 dark:text-gray-400">Modifié le</label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {new Date(configuration.updatedAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeeConfigurationViewModal;
