import React from 'react';
import { X, AlertTriangle, Trash2, User, ArrowRight, Calendar } from 'lucide-react';

interface TransferDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transfer: {
    id: string;
    studentName?: string;
    firstName?: string;
    lastName?: string;
    fromClassName: string;
    toClassName: string;
    date: string;
    reason: string;
    status: string;
  } | null;
  isLoading?: boolean;
}

const TransferDeleteConfirmationModal: React.FC<TransferDeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transfer,
  isLoading = false
}) => {
  if (!isOpen || !transfer) return null;

  // Debug: vérifier les données reçues
  console.log('=== DEBUG TransferDeleteConfirmationModal ===');
  console.log('Transfer reçu:', transfer);
  console.log('studentName:', transfer.studentName);
  console.log('Toutes les clés:', Object.keys(transfer));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'approved':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'rejected':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all">
          
          {/* Header avec icône d'alerte */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Supprimer le transfert
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Action irréversible
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenu */}
          <div className="px-6 pb-4">
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Êtes-vous sûr de vouloir supprimer ce transfert d'élève ? Cette action est irréversible et supprimera définitivement le transfert de votre système.
              </p>
              
              {/* Détails du transfert */}
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Élève</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                    {getStatusText(transfer.status)}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nom de l'élève</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {transfer.studentName || 
                       (transfer.firstName && transfer.lastName ? `${transfer.firstName} ${transfer.lastName}` : 'Nom non disponible')}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Classe d'origine</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{transfer.fromClassName}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Classe de destination</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{transfer.toClassName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date du transfert</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(transfer.date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Motif</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{transfer.reason}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-3 text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Suppression...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferDeleteConfirmationModal;
