import React, { useState, useMemo } from 'react';
import { 
  User, 
  Users, 
  BookOpen, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Search,
  Copy,
  Download,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar
} from 'lucide-react';
import { PlanningClass, PlanningSubject, PlanningTeacher, PlanningSchedule, WorkHoursConfig } from '../../../../types/planning';

interface TeacherScheduleViewProps {
  teachers: PlanningTeacher[];
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  schedule: PlanningSchedule[];
  workHours: WorkHoursConfig | null;
  selectedTeacher: string | null;
  viewMode: 'grid' | 'list';
  onSaveScheduleEntry: (scheduleData: any) => Promise<void>;
  onSelectTeacher: (teacherId: string) => void;
  onRefreshData?: () => Promise<void>;
}

interface ScheduleEntry {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomId?: string;
  notes?: string;
}

const TeacherScheduleView: React.FC<TeacherScheduleViewProps> = ({
  teachers,
  classes,
  subjects,
  schedule,
  workHours,
  selectedTeacher,
  viewMode,
  onSaveScheduleEntry,
  onSelectTeacher,
  onRefreshData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);

  const days = [
    { id: 1, name: 'Lundi', short: 'Lun' },
    { id: 2, name: 'Mardi', short: 'Mar' },
    { id: 3, name: 'Mercredi', short: 'Mer' },
    { id: 4, name: 'Jeudi', short: 'Jeu' },
    { id: 5, name: 'Vendredi', short: 'Ven' },
    { id: 6, name: 'Samedi', short: 'Sam' }
  ];

  // Obtenir les informations de l'enseignant sélectionné
  const currentTeacher = selectedTeacher ? teachers.find(t => t.id === selectedTeacher) : null;
  const currentTeacherSchedule = selectedTeacher ? schedule.filter(s => s.teacherId === selectedTeacher) : [];

  // Générer les créneaux horaires dynamiquement basés sur les données réelles
  const timeSlots = useMemo(() => {
    if (!currentTeacherSchedule.length) {
      // Créneaux par défaut si aucune donnée
      return [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];
    }

    // Extraire tous les créneaux horaires uniques des entrées existantes
    const uniqueTimeSlots = new Set<string>();
    currentTeacherSchedule.forEach(entry => {
      const timeSlot = `${entry.startTime}-${entry.endTime}`;
      uniqueTimeSlots.add(timeSlot);
    });

    // Trier les créneaux par heure de début
    return Array.from(uniqueTimeSlots).sort((a, b) => {
      const startA = a.split('-')[0];
      const startB = b.split('-')[0];
      return startA.localeCompare(startB);
    });
  }, [currentTeacherSchedule]);

  // Filtrer les enseignants
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      const matchesSubject = selectedSubject === 'all' || teacher.subject === selectedSubject;
      const matchesSearch = !searchTerm || teacher.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSubject && matchesSearch;
    });
  }, [teachers, selectedSubject, searchTerm]);

  // Créer la grille d'emploi du temps pour l'enseignant sélectionné
  const scheduleGrid = useMemo(() => {
    if (!selectedTeacher) return {};

    const grid: { [key: string]: { [key: string]: ScheduleEntry | null } } = {};
    
    // Initialiser la grille
    timeSlots.forEach(slot => {
      grid[slot] = {};
      days.forEach(day => {
        grid[slot][day.short] = null;
      });
    });

    // Remplir la grille avec les entrées d'emploi du temps
    currentTeacherSchedule.forEach(entry => {
      const timeSlot = `${entry.startTime}-${entry.endTime}`;
      const dayShort = days.find(d => d.id === entry.dayOfWeek)?.short;
      
      if (grid[timeSlot] && dayShort) {
        grid[timeSlot][dayShort] = entry as ScheduleEntry;
      }
    });

    return grid;
  }, [selectedTeacher, currentTeacherSchedule, timeSlots, days]);

  // Calculer les statistiques de l'enseignant
  const teacherStats = useMemo(() => {
    if (!selectedTeacher) return null;

    const totalHours = currentTeacherSchedule.length;
    const uniqueClasses = new Set(currentTeacherSchedule.map(s => s.classId)).size;
    const uniqueSubjects = new Set(currentTeacherSchedule.map(s => s.subjectId)).size;
    
    // Calculer la répartition par jour
    const dailyDistribution = days.map(day => {
      const daySchedule = currentTeacherSchedule.filter(s => s.dayOfWeek === day.id);
      return {
        day: day.name,
        hours: daySchedule.length
      };
    });

    const maxHoursPerDay = Math.max(...dailyDistribution.map(d => d.hours));
    const averageHoursPerDay = totalHours / 6;
    
    return {
      totalHours,
      uniqueClasses,
      uniqueSubjects,
      dailyDistribution,
      maxHoursPerDay,
      averageHoursPerDay: Math.round(averageHoursPerDay * 10) / 10,
      workloadPercentage: Math.round((totalHours / 30) * 100) // Assumant 30h max par semaine
    };
  }, [selectedTeacher, currentTeacherSchedule]);

  const getClassName = (classId: string) => {
    return classes.find(c => c.id === classId)?.name || 'Classe inconnue';
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Matière inconnue';
  };

  const getClassColor = (classId: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
    ];
    
    const index = Math.abs(classId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length;
    return colors[index];
  };

  const getWorkloadColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-blue-600';
    return 'text-green-600';
  };

  const handleAddScheduleEntry = () => {
    setEditingEntry(null);
    setShowAddModal(true);
  };

  const handleEditScheduleEntry = (entry: ScheduleEntry) => {
    setEditingEntry(entry);
    setShowAddModal(true);
  };

  const handleDeleteScheduleEntry = async (entryId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
      try {
        console.log('🗑️ Suppression de l\'entrée:', entryId);
        
        // Appeler la vraie API de suppression
        const { planningService } = await import('../../../../services/planningService');
        const result = await planningService.deleteScheduleEntry(entryId);
        
        if (result.success) {
          console.log('✅ Suppression réussie:', result.message);
          
          // Recharger les données si la fonction est disponible
          if (onRefreshData) {
            console.log('🔄 Rechargement des données après suppression...');
            await onRefreshData();
          }
          
          console.log('✅ Suppression terminée avec succès');
        } else {
          console.error('❌ Erreur lors de la suppression:', result.error);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
      }
    }
  };

  const handleExportSchedule = () => {
    // TODO: Implémenter l'export
    console.log('Export emploi du temps enseignant:', selectedTeacher);
  };

  if (!selectedTeacher) {
    return (
      <div className="space-y-6">
        {/* Filtres */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un enseignant..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-sm"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              aria-label="Filtrer par matière"
            >
              <option value="all">Toutes les matières</option>
              {Array.from(new Set(subjects.map(s => s.name).filter(Boolean))).map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste des enseignants */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Sélectionnez un enseignant pour voir son emploi du temps
            </h3>
          </div>
          
          <div className="p-6">
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : ''}`}>
              {filteredTeachers.map((teacher) => {
                const teacherSchedule = schedule.filter(s => s.teacherId === teacher.id);
                const workload = teacherSchedule.length;
                const workloadPercentage = Math.round((workload / 30) * 100);
                
                return (
                  <div 
                    key={teacher.id} 
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => onSelectTeacher(teacher.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{teacher.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{teacher.subject || 'Toutes matières'}</p>
                        </div>
                      </div>
                      
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        workloadPercentage >= 90 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        workloadPercentage >= 75 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                        workloadPercentage >= 50 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {workloadPercentage}%
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>{workload} heures/semaine</p>
                      <p>{new Set(teacherSchedule.map(s => s.classId)).size} classes</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredTeachers.length === 0 && (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucun enseignant trouvé</h3>
                <p className="text-gray-600 dark:text-gray-400">Aucun enseignant ne correspond aux critères de recherche.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de l'enseignant sélectionné */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onSelectTeacher('')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Retour à la liste des enseignants"
            >
              ←
            </button>
            
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {currentTeacher?.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {currentTeacher?.subject || 'Toutes matières'} • {teacherStats?.totalHours} heures/semaine • {teacherStats?.workloadPercentage}% de charge
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAddScheduleEntry}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter un cours
            </button>
            
            <button
              onClick={handleExportSchedule}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>

        {/* Statistiques de l'enseignant */}
        {teacherStats && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className={`text-2xl font-bold ${getWorkloadColor(teacherStats.workloadPercentage)}`}>
                {teacherStats.workloadPercentage}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Charge de travail</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{teacherStats.totalHours}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Heures/semaine</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">{teacherStats.uniqueClasses}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Classes</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{teacherStats.averageHoursPerDay}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Heures/jour</div>
            </div>
          </div>
        )}
      </div>

      {/* Répartition hebdomadaire */}
      {teacherStats && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
            Répartition Hebdomadaire
          </h3>
          
          <div className="space-y-3">
            {teacherStats.dailyDistribution.map((day) => (
              <div key={day.day} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-20 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {day.day}
                  </div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${teacherStats.maxHoursPerDay > 0 ? (day.hours / teacherStats.maxHoursPerDay) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                  {day.hours}h
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grille d'emploi du temps */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Emploi du Temps - {currentTeacher?.name}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Horaire
                </th>
                {days.map(day => (
                  <th key={day.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {day.name}
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
                    const entry = scheduleGrid[timeSlot]?.[day.short];
                    
                    return (
                      <td key={day.id} className="px-6 py-4 text-center">
                        {entry ? (
                          <div className={`p-2 rounded-lg text-xs ${getClassColor(entry.classId)} relative group`}>
                            <div className="font-medium">{getClassName(entry.classId)}</div>
                            <div className="text-xs opacity-75">{getSubjectName(entry.subjectId)}</div>
                            
                            {/* Afficher la durée et la salle si disponibles */}
                            {(entry as any).duration && (
                              <div className="text-xs opacity-60 mt-1">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {(entry as any).duration}
                              </div>
                            )}
                            {(entry as any).room && (
                              <div className="text-xs opacity-60">
                                <BookOpen className="w-3 h-3 inline mr-1" />
                                {(entry as any).room}
                              </div>
                            )}
                            
                            {/* Actions au survol */}
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-1">
                              <button
                                onClick={() => handleEditScheduleEntry(entry)}
                                className="p-1 bg-white/20 rounded text-white hover:bg-white/30"
                                title="Modifier"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteScheduleEntry(entry.id)}
                                className="p-1 bg-white/20 rounded text-white hover:bg-white/30"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              // TODO: Ouvrir le modal d'ajout avec pré-remplissage
                              handleAddScheduleEntry();
                            }}
                            className="w-full h-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center justify-center"
                            title="Ajouter un cours"
                          >
                            <Plus className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Actions Rapides</h3>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              // TODO: Optimiser la répartition
              console.log('Optimisation de la répartition');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Optimiser la répartition
          </button>
          
          <button
            onClick={() => {
              // TODO: Vérifier la disponibilité
              console.log('Vérification de la disponibilité');
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Vérifier la disponibilité
          </button>
          
          <button
            onClick={() => {
              // TODO: Analyser la charge
              console.log('Analyse de la charge de travail');
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Analyser la charge
          </button>
        </div>
      </div>

      {/* TODO: Ajouter le modal d'ajout/édition de cours */}
    </div>
  );
};

export default TeacherScheduleView;
