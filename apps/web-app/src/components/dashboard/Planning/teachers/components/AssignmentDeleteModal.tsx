import React from 'react';
import { X, AlertTriangle, Trash2, User, BookOpen } from 'lucide-react';

interface Assignment {
  id: string;
  teacherId: string;
  teacherName: string;
  mode: 'maternelle' | 'primaire' | 'secondaire';
  classId?: string;
  className?: string;
  subjectId?: string;
  subjectName?: string;
  subjectIds?: string[];
  subjectNames?: string[];
  subjectsCount?: number;
  classIds?: string[];
  classNames?: string[];
  hoursPerWeek: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'pending' | 'expired';
}

interface AssignmentDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  assignment: Assignment | null;
  loading?: boolean;
}

const AssignmentDeleteModal: React.FC<AssignmentDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  assignment,
  loading = false
}) => {
  if (!isOpen || !assignment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-600 to-red-700 p-6 text-white rounded-t-2xl">
          <div className="absolute inset-0 bg-black/10 rounded-t-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Supprimer l'affectation</h2>
                  <p className="text-red-100">Cette action est irréversible</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                title="Fermer"
                aria-label="Fermer la modal"
                disabled={loading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avertissement */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                  Attention !
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Vous êtes sur le point de supprimer définitivement cette affectation. 
                  Cette action ne peut pas être annulée.
                </p>
              </div>
            </div>
          </div>

          {/* Détails de l'affectation à supprimer */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Affectation qui sera supprimée :
            </h3>
            
            <div className="space-y-3">
              {/* Enseignant */}
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Enseignant :</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {assignment.teacherName}
                </span>
              </div>

              {/* Classes */}
              {assignment.classNames && assignment.classNames.length > 0 && (
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Classes :</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {assignment.classNames.join(', ')}
                  </span>
                </div>
              )}

              {/* Matières */}
              {assignment.subjectsCount && assignment.subjectsCount > 0 && (
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Matières :</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {assignment.subjectsCount} matières
                  </span>
                </div>
              )}

              {/* Charge */}
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Charge :</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {assignment.hoursPerWeek}h/semaine
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Suppression...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer définitivement</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDeleteModal;
