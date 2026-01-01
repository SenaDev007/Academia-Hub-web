import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Users, 
  Calendar, 
  Filter, 
  Eye, 
  Edit, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';
import { PlanningTeacher, WorkHoursConfig } from '../../../../types/planning';
import { TeacherDetailsModal } from '../../../modals';

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

interface SchoolConstraints {
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  mandatoryBreaks: Array<{
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    duration: number;
  }>;
  blockedTimeSlots: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    reason: string;
  }>;
  minRestBetweenClasses: number;
  lunchBreakMandatory: boolean;
  lunchBreakStart: string;
  lunchBreakEnd: string;
}

interface AvailabilityStats {
  totalTeachers: number;
  fullyAvailable: number;
  withConstraints: number;
  conflicts: number;
  utilizationRate: number;
  averageHoursPerDay: number;
}

interface AvailabilityOverviewProps {
  teachers: PlanningTeacher[];
  teacherAvailabilities: TeacherAvailability[];
  workHours: WorkHoursConfig | null;
  constraints: SchoolConstraints;
  stats: AvailabilityStats;
  onEditAvailability: (teacher: PlanningTeacher) => void;
}

const AvailabilityOverview: React.FC<AvailabilityOverviewProps> = ({
  teachers,
  teacherAvailabilities,
  workHours,
  constraints,
  stats,
  onEditAvailability
}) => {
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTeacherForDetails, setSelectedTeacherForDetails] = useState<PlanningTeacher | null>(null);

  const days = [
    { id: 1, name: 'Lundi', short: 'Lun' },
    { id: 2, name: 'Mardi', short: 'Mar' },
    { id: 3, name: 'Mercredi', short: 'Mer' },
    { id: 4, name: 'Jeudi', short: 'Jeu' },
    { id: 5, name: 'Vendredi', short: 'Ven' },
    { id: 6, name: 'Samedi', short: 'Sam' }
  ];

  const timeSlots = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];

  // Filtrer les enseignants selon les critères
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      const matchesSearch = !searchTerm || 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      const availability = teacherAvailabilities.find(a => a.teacherId === teacher.id);
      if (!availability) return false;

      if (selectedDay !== 'all') {
        const dayAvailability = availability.availability.find(a => a.dayOfWeek === selectedDay);
        if (!dayAvailability?.isAvailable) return false;
      }

      return true;
    });
  }, [teachers, teacherAvailabilities, searchTerm, selectedDay]);

  // Fonction pour vérifier si un créneau est bloqué par les contraintes de l'école
  const isTimeSlotBlockedByConstraints = (timeSlot: string, dayId: number) => {
    const [startTime, endTime] = timeSlot.split('-');
    
    // Vérifier les créneaux bloqués
    const isBlocked = constraints.blockedTimeSlots.some(blocked => 
      blocked.dayOfWeek === dayId &&
      startTime >= blocked.startTime && 
      endTime <= blocked.endTime
    );
    
    if (isBlocked) return true;
    
    // Vérifier les pauses obligatoires
    const isInMandatoryBreak = constraints.mandatoryBreaks.some(breakTime => 
      startTime >= breakTime.startTime && 
      endTime <= breakTime.endTime
    );
    
    if (isInMandatoryBreak) return true;
    
    // Vérifier la pause déjeuner obligatoire
    if (constraints.lunchBreakMandatory) {
      const isInLunchBreak = startTime >= constraints.lunchBreakStart && 
                           endTime <= constraints.lunchBreakEnd;
      if (isInLunchBreak) return true;
    }
    
    return false;
  };

  // Créer la grille de disponibilité en tenant compte des contraintes
  const availabilityGrid = useMemo(() => {
    const grid: { [key: string]: { [key: string]: 'available' | 'unavailable' | 'partial' | 'blocked' } } = {};
    
    timeSlots.forEach(timeSlot => {
      grid[timeSlot] = {};
      days.forEach(day => {
        // Vérifier d'abord si le créneau est bloqué par les contraintes de l'école
        if (isTimeSlotBlockedByConstraints(timeSlot, day.id)) {
          grid[timeSlot][day.short] = 'blocked';
          return;
        }
        
        let availableCount = 0;
        let totalCount = 0;
        
        filteredTeachers.forEach(teacher => {
          const availability = teacherAvailabilities.find(a => a.teacherId === teacher.id);
          if (availability) {
            const dayAvailability = availability.availability.find(a => a.dayOfWeek === day.id);
            totalCount++;
            if (dayAvailability?.isAvailable) {
              // Vérifier si le créneau horaire est dans la plage disponible
              const [startHour] = timeSlot.split('-')[0].split(':');
              const [availStart] = dayAvailability.startTime.split(':');
              const [availEnd] = dayAvailability.endTime.split(':');
              
              if (parseInt(startHour) >= parseInt(availStart) && parseInt(startHour) < parseInt(availEnd)) {
                availableCount++;
              }
            }
          }
        });
        
        if (totalCount === 0) {
          grid[timeSlot][day.short] = 'unavailable';
        } else if (availableCount === totalCount) {
          grid[timeSlot][day.short] = 'available';
        } else if (availableCount > 0) {
          grid[timeSlot][day.short] = 'partial';
        } else {
          grid[timeSlot][day.short] = 'unavailable';
        }
      });
    });
    
    return grid;
  }, [filteredTeachers, teacherAvailabilities, timeSlots, days, constraints]);

  const getAvailabilityStatus = (teacher: PlanningTeacher) => {
    const availability = teacherAvailabilities.find(a => a.teacherId === teacher.id);
    if (!availability) return { status: 'unknown', count: 0 };
    
    const availableDays = availability.availability.filter(a => a.isAvailable).length;
    const totalDays = availability.availability.length;
    
    if (availableDays === totalDays) return { status: 'full', count: availableDays };
    if (availableDays >= totalDays * 0.7) return { status: 'good', count: availableDays };
    if (availableDays > 0) return { status: 'limited', count: availableDays };
    return { status: 'none', count: 0 };
  };

  const getCellColor = (status: 'available' | 'unavailable' | 'partial' | 'blocked') => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'partial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'unavailable': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'blocked': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'full': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'good': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'limited': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'none': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
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

  const exportAvailabilities = () => {
    // TODO: Implémenter l'export des disponibilités
    console.log('Export des disponibilités');
  };

  const handleViewDetails = (teacher: PlanningTeacher) => {
    setSelectedTeacherForDetails(teacher);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedTeacherForDetails(null);
  };

  return (
    <div className="space-y-6">
      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux d'Utilisation</p>
              <p className="text-2xl font-bold text-blue-600">{stats.utilizationRate}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Créneaux disponibles</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Moyenne Quotidienne</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.averageHoursPerDay}h</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Par enseignant</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avec Contraintes</p>
              <p className="text-2xl font-bold text-orange-600">{stats.withConstraints}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Enseignants</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conflits Détectés</p>
              <p className="text-2xl font-bold text-red-600">{stats.conflicts}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">À résoudre</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et contrôles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Recherche */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un enseignant..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-3">
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              aria-label="Filtrer par jour"
            >
              <option value="all">Tous les jours</option>
              {days.map(day => (
                <option key={day.id} value={day.id}>{day.name}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
              aria-label="Filtrer par créneau"
            >
              <option value="all">Tous les créneaux</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>

            {/* Mode d'affichage */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                title="Vue grille"
              >
                <Calendar className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-2 text-sm ${viewMode === 'timeline' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                title="Vue chronologie"
              >
                <Clock className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={exportAvailabilities}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              title="Exporter les disponibilités"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Vue grille - Matrice de disponibilité */}
      {viewMode === 'grid' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Matrice de Disponibilité Globale
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Visualisation des créneaux disponibles pour l'ensemble des enseignants
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Créneau
                  </th>
                  {days.map(day => (
                    <th key={day.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {day.short}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {timeSlots.map((timeSlot, index) => (
                  <tr key={timeSlot} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {timeSlot}
                    </td>
                    {days.map(day => {
                      const status = availabilityGrid[timeSlot]?.[day.short] || 'unavailable';
                      return (
                        <td key={day.id} className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCellColor(status)}`}>
                            {status === 'available' ? '✓' : 
                             status === 'partial' ? '◐' : 
                             status === 'blocked' ? '🚫' : '✗'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Légende */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center space-x-4 text-sm flex-wrap gap-y-2">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">✓</span>
                <span className="text-gray-600 dark:text-gray-400">Tous disponibles</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">◐</span>
                <span className="text-gray-600 dark:text-gray-400">Partiellement disponibles</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">✗</span>
                <span className="text-gray-600 dark:text-gray-400">Non disponibles</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">🚫</span>
                <span className="text-gray-600 dark:text-gray-400">Bloqué par contraintes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vue chronologie - Liste des enseignants */}
      {viewMode === 'timeline' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Disponibilités par Enseignant
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Détail des créneaux disponibles pour chaque enseignant
            </p>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTeachers.map((teacher) => {
              const availability = teacherAvailabilities.find(a => a.teacherId === teacher.id);
              const status = getAvailabilityStatus(teacher);
              
              return (
                <div key={teacher.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {teacher.name}
                          </h4>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(status.status)}
                            <span className={`text-sm font-medium ${
                              status.status === 'full' ? 'text-green-600' :
                              status.status === 'good' ? 'text-blue-600' :
                              status.status === 'limited' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {getStatusLabel(status.status)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span>{teacher.subject || 'Toutes matières'}</span>
                          <span className="mx-2">•</span>
                          <span>{status.count}/6 jours disponibles</span>
                          {availability?.constraints.notes && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="italic">{availability.constraints.notes}</span>
                            </>
                          )}
                        </div>
                        
                        {/* Timeline des disponibilités */}
                        <div className="mt-3 flex space-x-2">
                          {days.map(day => {
                            const dayAvailability = availability?.availability.find(a => a.dayOfWeek === day.id);
                            const isAvailable = dayAvailability?.isAvailable || false;
                            
                            return (
                              <div
                                key={day.id}
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  isAvailable 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                }`}
                                title={isAvailable 
                                  ? `${day.name}: ${dayAvailability?.startTime} - ${dayAvailability?.endTime}`
                                  : `${day.name}: Indisponible`
                                }
                              >
                                {day.short}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(teacher)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditAvailability(teacher)}
                        className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                        title="Modifier les disponibilités"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredTeachers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Aucun enseignant trouvé
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Aucun enseignant ne correspond aux critères de filtrage sélectionnés.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal de détails de l'enseignant */}
      <TeacherDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        teacher={selectedTeacherForDetails}
        availability={selectedTeacherForDetails ? teacherAvailabilities.find(a => a.teacherId === selectedTeacherForDetails.id) || null : null}
      />
    </div>
  );
};

export default AvailabilityOverview;
