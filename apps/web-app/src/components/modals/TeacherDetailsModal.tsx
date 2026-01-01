import React from 'react';
import { X, Clock, Users, Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { PlanningTeacher } from '../../types/planning';

interface TeacherAvailability {
  teacherId: string;
  teacherName: string;
  availability: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
  constraints: {
    preferredStartTime: string;
    preferredEndTime: string;
    unavailableDays: number[];
    notes: string;
  };
}

interface TeacherDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: PlanningTeacher | null;
  availability: TeacherAvailability | null;
}

const TeacherDetailsModal: React.FC<TeacherDetailsModalProps> = ({
  isOpen,
  onClose,
  teacher,
  availability
}) => {
  if (!isOpen || !teacher) return null;

  const days = [
    { id: 1, name: 'Lundi', short: 'Lun' },
    { id: 2, name: 'Mardi', short: 'Mar' },
    { id: 3, name: 'Mercredi', short: 'Mer' },
    { id: 4, name: 'Jeudi', short: 'Jeu' },
    { id: 5, name: 'Vendredi', short: 'Ven' },
    { id: 6, name: 'Samedi', short: 'Sam' }
  ];

  const getAvailabilityStatus = () => {
    if (!availability) return { status: 'none', count: 0 };
    
    const availableDays = availability.availability.filter(a => a.isAvailable).length;
    const totalDays = availability.availability.length;
    
    if (availableDays === totalDays) return { status: 'full', count: availableDays };
    if (availableDays >= totalDays * 0.7) return { status: 'good', count: availableDays };
    if (availableDays > 0) return { status: 'limited', count: availableDays };
    return { status: 'none', count: 0 };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'full': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'good': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'limited': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'none': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'full': return 'Entièrement disponible';
      case 'good': return 'Bien disponible';
      case 'limited': return 'Disponibilité limitée';
      case 'none': return 'Indisponible';
      default: return 'Statut inconnu';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'full': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'good': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'limited': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'none': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const status = getAvailabilityStatus();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                Détails de l'enseignant
              </h3>
              <p className="text-blue-100 text-sm">
                Informations complètes sur les disponibilités
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors duration-200"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Informations personnelles
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Nom complet:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{teacher.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Matière:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{teacher.subject || 'Toutes matières'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Classes:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {teacher.classes?.length || 0} classe(s)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Heures/semaine:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {teacher.hoursPerWeek || 0}h
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Statut de disponibilité
              </h4>
              <div className="flex items-center space-x-3 mb-4">
                {getStatusIcon(status.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status.status)}`}>
                  {getStatusLabel(status.status)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Jours disponibles:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {status.count}/6 jours
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Taux de disponibilité:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {Math.round((status.count / 6) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Disponibilités détaillées */}
          {availability && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Planning hebdomadaire
                </h4>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {days.map(day => {
                    const dayAvailability = availability.availability.find(a => a.dayOfWeek === day.id);
                    const isAvailable = dayAvailability?.isAvailable || false;
                    
                    return (
                      <div
                        key={day.id}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          isAvailable
                            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                            : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">
                            {day.name}
                          </h5>
                          {isAvailable ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        
                        {isAvailable && dayAvailability ? (
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                              <Clock className="w-4 h-4 mr-1" />
                              {dayAvailability.startTime} - {dayAvailability.endTime}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {Math.round((new Date(`2000-01-01 ${dayAvailability.endTime}`).getTime() - 
                                new Date(`2000-01-01 ${dayAvailability.startTime}`).getTime()) / (1000 * 60 * 60) * 10) / 10}h
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Indisponible
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Contraintes et notes */}
          {availability?.constraints && (
            <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                Contraintes et préférences
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Heure de début préférée:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {availability.constraints.preferredStartTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Heure de fin préférée:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {availability.constraints.preferredEndTime}
                  </span>
                </div>
                {availability.constraints.unavailableDays.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Jours indisponibles:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {availability.constraints.unavailableDays.map(day => 
                        days.find(d => d.id === day)?.short
                      ).join(', ')}
                    </span>
                  </div>
                )}
                {availability.constraints.notes && (
                  <div className="mt-3">
                    <span className="text-gray-600 dark:text-gray-400 block mb-1">Notes:</span>
                    <p className="text-gray-900 dark:text-gray-100 italic">
                      {availability.constraints.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailsModal;
