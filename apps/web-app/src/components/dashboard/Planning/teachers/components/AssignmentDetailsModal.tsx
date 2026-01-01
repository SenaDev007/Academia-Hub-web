import React from 'react';
import { X, User, BookOpen, Clock, MapPin, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { PlanningTeacher, PlanningClass, PlanningSubject } from '../../../../../types/planning';

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

interface AssignmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  teacher?: PlanningTeacher;
  classes: PlanningClass[];
  subjects: PlanningSubject[];
}

const AssignmentDetailsModal: React.FC<AssignmentDetailsModalProps> = ({
  isOpen,
  onClose,
  assignment,
  teacher,
  classes,
  subjects
}) => {
  if (!isOpen || !assignment) return null;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          icon: CheckCircle,
          label: 'Actif'
        };
      case 'pending':
        return {
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          icon: AlertCircle,
          label: 'En attente'
        };
      case 'expired':
        return {
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          icon: AlertCircle,
          label: 'Expiré'
        };
      default:
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-900/30',
          icon: AlertCircle,
          label: 'Inconnu'
        };
    }
  };

  const getModeInfo = (mode: string) => {
    switch (mode) {
      case 'maternelle':
        return {
          color: 'text-pink-600 dark:text-pink-400',
          bgColor: 'bg-pink-100 dark:bg-pink-900/30',
          label: 'Maternelle'
        };
      case 'primaire':
        return {
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          label: 'Primaire'
        };
      case 'secondaire':
        return {
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-100 dark:bg-purple-900/30',
          label: 'Secondaire'
        };
      default:
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-900/30',
          label: 'Inconnu'
        };
    }
  };

  const statusInfo = getStatusInfo(assignment.status);
  const modeInfo = getModeInfo(assignment.mode);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Détails de l'affectation</h2>
                  <p className="text-indigo-100">Informations complètes sur l'affectation</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                title="Fermer"
                aria-label="Fermer la modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Enseignant */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Enseignant
                </h3>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {assignment.teacherName}
                </p>
                {teacher?.email && (
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    {teacher.email}
                  </p>
                )}
                {teacher?.phone && (
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    {teacher.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Statut et Mode */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Statut & Mode
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${modeInfo.bgColor} ${modeInfo.color}`}>
                    {modeInfo.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Affectation */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Affectation
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Classes */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Classes assignées
                </p>
                {assignment.classNames && assignment.classNames.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {assignment.classNames.map((className, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-lg"
                      >
                        {className}
                      </span>
                    ))}
                  </div>
                ) : assignment.className ? (
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-lg">
                      {assignment.className}
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Aucune classe assignée</p>
                )}
              </div>

              {/* Matières */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Matières ({assignment.subjectsCount || 0})
                </p>
                {assignment.subjectNames && assignment.subjectNames.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {assignment.subjectNames.slice(0, 5).map((subjectName, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-md"
                      >
                        {subjectName}
                      </span>
                    ))}
                    {assignment.subjectNames.length > 5 && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-md">
                        +{assignment.subjectNames.length - 5} autres
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Aucune matière assignée</p>
                )}
              </div>
            </div>
          </div>

          {/* Charge de travail */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Charge de travail
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {assignment.hoursPerWeek}h
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  Par semaine
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {assignment.subjectsCount || 0}
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  Matières
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {assignment.classNames?.length || (assignment.className ? 1 : 0)}
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  Classes
                </p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Période
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de début
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {new Date(assignment.startDate).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              {assignment.endDate && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de fin
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(assignment.endDate).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium rounded-xl transition-all duration-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailsModal;
