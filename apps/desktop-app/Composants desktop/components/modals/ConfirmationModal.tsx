import React from 'react';
import { AlertTriangle, X, CheckCircle, Trash2, Edit, Eye, Calendar, Users, DollarSign, BookOpen } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type: 'delete' | 'edit' | 'view' | 'warning';
  itemName?: string;
  isLoading?: boolean;
  details?: {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }[];
  warningMessage?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type,
  itemName,
  isLoading = false,
  details = [],
  warningMessage,
  confirmButtonText,
  cancelButtonText = 'Annuler'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'delete':
        return (
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        );
      case 'edit':
        return <Edit className="w-8 h-8 text-blue-500" />;
      case 'view':
        return <Eye className="w-8 h-8 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-gray-500" />;
    }
  };

  const getButtonStyles = () => {
    switch (type) {
      case 'delete':
        return {
          confirm: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-red-500/25',
          cancel: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
        };
      case 'edit':
        return {
          confirm: 'bg-blue-600 hover:bg-blue-700 text-white',
          cancel: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
        };
      case 'view':
        return {
          confirm: 'bg-green-600 hover:bg-green-700 text-white',
          cancel: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
        };
      case 'warning':
        return {
          confirm: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          cancel: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
        };
      default:
        return {
          confirm: 'bg-gray-600 hover:bg-gray-700 text-white',
          cancel: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
        };
    }
  };

  const getButtonText = () => {
    if (confirmButtonText) return confirmButtonText;
    
    switch (type) {
      case 'delete':
        return 'Supprimer définitivement';
      case 'edit':
        return 'Modifier';
      case 'view':
        return 'Voir';
      case 'warning':
        return 'Continuer';
      default:
        return 'Confirmer';
    }
  };

  const buttonStyles = getButtonStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all ${
          type === 'delete' ? 'border-2 border-red-200 dark:border-red-800' : ''
        }`}>
          {/* Header */}
          <div className={`px-6 py-3 border-b ${
            type === 'delete' 
              ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' 
              : 'border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getIcon()}
                <h3 className={`text-lg font-semibold ${
                  type === 'delete' 
                    ? 'text-red-900 dark:text-red-100' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                disabled={isLoading}
                title="Fermer"
                aria-label="Fermer le modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content - Layout paysage */}
          <div className="flex">
            {/* Colonne gauche - Message et avertissement */}
            <div className="flex-1 px-6 py-4">
              <p className={`mb-3 text-base leading-relaxed ${
              type === 'delete' 
                ? 'text-red-700 dark:text-red-300' 
                : 'text-gray-600 dark:text-gray-300'
            }`}>
              {message}
            </p>

              {/* Message d'avertissement */}
              {warningMessage && (
                <div className={`rounded-lg p-3 ${
                  type === 'delete' 
                    ? 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700' 
                    : 'bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700'
                }`}>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                      type === 'delete' 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`} />
                    <p className={`text-sm ${
                      type === 'delete' 
                        ? 'text-red-700 dark:text-red-300' 
                        : 'text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {warningMessage}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Colonne droite - Détails */}
            {(itemName || details.length > 0) && (
              <div className="flex-1 px-6 py-4 border-l border-gray-200 dark:border-gray-700">
                <div className={`rounded-xl p-4 ${
                type === 'delete' 
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                    : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}>
                  {itemName && (
                    <div className="mb-3">
                      <h4 className={`text-sm font-semibold mb-2 ${
                        type === 'delete' 
                          ? 'text-red-800 dark:text-red-200' 
                          : 'text-gray-800 dark:text-gray-200'
                      }`}>
                        Élément concerné
                      </h4>
                <p className={`text-sm ${
                  type === 'delete' 
                    ? 'text-red-700 dark:text-red-300' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                        {itemName}
                      </p>
                    </div>
                  )}

                  {details.length > 0 && (
                    <div>
                      <h4 className={`text-sm font-semibold mb-3 ${
                        type === 'delete' 
                          ? 'text-red-800 dark:text-red-200' 
                          : 'text-gray-800 dark:text-gray-200'
                      }`}>
                        Détails
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {details.map((detail, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            {detail.icon && (
                              <div className={`p-1 rounded-lg ${
                                type === 'delete' 
                                  ? 'bg-red-100 dark:bg-red-800/30' 
                                  : 'bg-gray-100 dark:bg-gray-600'
                              }`}>
                                {detail.icon}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className={`text-xs font-medium block ${
                                type === 'delete' 
                                  ? 'text-red-600 dark:text-red-400' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {detail.label}
                              </span>
                              <p className={`text-sm font-medium truncate ${
                                type === 'delete' 
                                  ? 'text-red-800 dark:text-red-200' 
                                  : 'text-gray-800 dark:text-gray-200'
                              }`}>
                                {detail.value}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-6 py-3 flex justify-end space-x-3 ${
            type === 'delete' 
              ? 'bg-red-50 dark:bg-red-900/10' 
              : 'bg-gray-50 dark:bg-gray-700'
          }`}>
            <button
              onClick={onClose}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${buttonStyles.cancel} ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {cancelButtonText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${buttonStyles.confirm} ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Chargement...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{getButtonText()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
