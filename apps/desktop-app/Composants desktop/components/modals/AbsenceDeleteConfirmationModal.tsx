import React from 'react';
import { X, AlertTriangle, Trash2, User, Calendar, Clock } from 'lucide-react';

interface AbsenceDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  absence: {
    id: string;
    studentName?: string;
    firstName?: string;
    lastName?: string;
    className?: string;
    class?: string;
    date: string;
    period: string;
    reason: string;
    justified: boolean;
    parentNotified: boolean;
  } | null;
  isLoading?: boolean;
}

const AbsenceDeleteConfirmationModal: React.FC<AbsenceDeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  absence,
  isLoading = false
}) => {
  if (!isOpen || !absence) return null;

  // Debug: vérifier les données reçues
  console.log('=== DEBUG AbsenceDeleteConfirmationModal ===');
  console.log('Absence reçue:', absence);
  console.log('studentName:', absence.studentName);
  console.log('Toutes les clés:', Object.keys(absence));

  // Fonction pour traduire les périodes
  const translatePeriod = (period: string) => {
    const periodMap: { [key: string]: string } = {
      'morning': 'Matin',
      'afternoon': 'Après-midi',
      'full_day': 'Journée complète'
    };
    return periodMap[period] || period;
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-white">
                    Confirmer la suppression
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 rounded-md p-1.5 text-white hover:bg-opacity-30 transition-colors"
                disabled={isLoading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="bg-white dark:bg-gray-800 px-6 py-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Supprimer cette absence ?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Cette action est irréversible. L'absence sera définitivement supprimée.
                </p>

                {/* Détails de l'absence */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Élève</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {absence.studentName || 
                         (absence.firstName && absence.lastName ? `${absence.firstName} ${absence.lastName}` : 'Nom non disponible')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(absence.date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Période</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {translatePeriod(absence.period)}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Motif</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {absence.reason}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbsenceDeleteConfirmationModal;
