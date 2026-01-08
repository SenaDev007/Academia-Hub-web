import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Clock, RefreshCw, X } from 'lucide-react';

interface ResolutionResult {
  success: boolean;
  message: string;
  resolvedConflicts: string[];
  failedResolutions: string[];
}

interface ResolutionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ResolutionResult | null;
  isResolving?: boolean;
}

const ResolutionResultModal: React.FC<ResolutionResultModalProps> = ({
  isOpen,
  onClose,
  result,
  isResolving = false
}) => {
  if (!isOpen) return null;

  const getStatusIcon = () => {
    if (isResolving) return <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />;
    if (result?.success) return <CheckCircle className="w-8 h-8 text-green-500" />;
    if (result?.failedResolutions.length > 0 && result?.resolvedConflicts.length > 0) {
      return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
    }
    return <XCircle className="w-8 h-8 text-red-500" />;
  };

  const getStatusColor = () => {
    if (isResolving) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (result?.success) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (result?.failedResolutions.length > 0 && result?.resolvedConflicts.length > 0) {
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    }
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  const getStatusTitle = () => {
    if (isResolving) return 'Résolution en cours...';
    if (result?.success) return 'Résolution réussie';
    if (result?.failedResolutions.length > 0 && result?.resolvedConflicts.length > 0) {
      return 'Résolution partielle';
    }
    return 'Résolution échouée';
  };

  const getStatusMessage = () => {
    if (isResolving) return 'Veuillez patienter pendant la résolution du conflit...';
    return result?.message || 'Aucun résultat disponible';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={!isResolving ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
              {getStatusIcon()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {getStatusTitle()}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isResolving ? 'Traitement en cours' : 'Résultat de la résolution'}
              </p>
            </div>
          </div>
          {!isResolving && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors duration-200"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {isResolving ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Résolution en cours
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Nous ajustons les disponibilités pour résoudre le conflit...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Message principal */}
              <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
                <div className="flex items-center space-x-3">
                  {getStatusIcon()}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {getStatusTitle()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {getStatusMessage()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Détails des résultats */}
              {result && (
                <div className="space-y-3">
                  {/* Conflits résolus */}
                  {result.resolvedConflicts.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-300">
                          Conflits résolus ({result.resolvedConflicts.length})
                        </span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Les disponibilités ont été ajustées avec succès pour résoudre les conflits de charge de travail.
                      </p>
                    </div>
                  )}

                  {/* Échecs de résolution */}
                  {result.failedResolutions.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                      <div className="flex items-center space-x-2 mb-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-800 dark:text-red-300">
                          Échecs ({result.failedResolutions.length})
                        </span>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-400">
                        Certains conflits n'ont pas pu être résolus automatiquement et nécessitent une intervention manuelle.
                      </p>
                    </div>
                  )}

                  {/* Recommandations */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800 dark:text-blue-300">
                        Recommandations
                      </span>
                    </div>
                    <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                      <li>• Vérifiez les nouvelles disponibilités dans l'onglet "Gestion Individuelle"</li>
                      <li>• Les conflits non résolus nécessitent une intervention manuelle</li>
                      <li>• Vous pouvez relancer l'analyse pour vérifier les résultats</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isResolving && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200"
            >
              Fermer
            </button>
            {result?.resolvedConflicts.length > 0 && (
              <button
                onClick={() => {
                  onClose();
                  // Optionnel : recharger la page ou mettre à jour les données
                  window.location.reload();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Actualiser</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResolutionResultModal;
