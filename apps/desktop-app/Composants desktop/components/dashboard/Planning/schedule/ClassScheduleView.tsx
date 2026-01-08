import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Users, 
  User, 
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
  CheckCircle
} from 'lucide-react';
import { PlanningClass, PlanningSubject, PlanningTeacher, PlanningRoom, PlanningSchedule, WorkHoursConfig } from '../../../../types/planning';
import { sortClassesByLevel, getLevelDisplayName, getLevelCategory } from '../../../../utils/levelUtils';
import { ScheduleEntryModal, ConfirmDeleteModal } from '../../../modals';

interface ClassScheduleViewProps {
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  teachers: PlanningTeacher[];
  rooms: PlanningRoom[];
  schedule: PlanningSchedule[];
  workHours: WorkHoursConfig | null;
  selectedClass: string | null;
  viewMode: 'grid' | 'list';
  onSaveScheduleEntry: (scheduleData: any) => Promise<void>;
  onSelectClass: (classId: string) => void;
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

const ClassScheduleView: React.FC<ClassScheduleViewProps> = ({
  classes,
  subjects,
  teachers,
  rooms,
  schedule,
  workHours,
  selectedClass,
  viewMode,
  onSaveScheduleEntry,
  onSelectClass,
  onRefreshData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [preSelectedDay, setPreSelectedDay] = useState<number | undefined>();
  const [preSelectedTime, setPreSelectedTime] = useState<string | undefined>();
  
  // États pour le modal de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<ScheduleEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const days = [
    { id: 1, name: 'Lundi', short: 'Lun' },
    { id: 2, name: 'Mardi', short: 'Mar' },
    { id: 3, name: 'Mercredi', short: 'Mer' },
    { id: 4, name: 'Jeudi', short: 'Jeu' },
    { id: 5, name: 'Vendredi', short: 'Ven' },
    { id: 6, name: 'Samedi', short: 'Sam' }
  ];

  // Obtenir les informations de la classe sélectionnée
  const currentClass = selectedClass ? classes.find(c => c.id === selectedClass) : null;
  const currentClassSchedule = selectedClass ? schedule.filter(s => s.classId === selectedClass) : [];

  // Générer les créneaux horaires dynamiquement basés sur les données réelles
  const timeSlots = useMemo(() => {
    if (!currentClassSchedule.length) {
      // Créneaux par défaut si aucune donnée
      return [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];
    }

    // Extraire tous les créneaux horaires uniques des entrées existantes
    const uniqueTimeSlots = new Set<string>();
    currentClassSchedule.forEach(entry => {
      const timeSlot = `${entry.startTime}-${entry.endTime}`;
      uniqueTimeSlots.add(timeSlot);
    });

    // Trier les créneaux par heure de début
    return Array.from(uniqueTimeSlots).sort((a, b) => {
      const startA = a.split('-')[0];
      const startB = b.split('-')[0];
      return startA.localeCompare(startB);
    });
  }, [currentClassSchedule]);

  // Filtrer et trier les classes
  const filteredClasses = useMemo(() => {
    const filtered = classes.filter(cls => {
      const matchesLevel = selectedLevel === 'all' || getLevelDisplayName(cls.level) === selectedLevel;
      const matchesSearch = !searchTerm || cls.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesLevel && matchesSearch;
    });
    return sortClassesByLevel(filtered);
  }, [classes, selectedLevel, searchTerm]);

  // Créer la grille d'emploi du temps pour la classe sélectionnée
  const scheduleGrid = useMemo(() => {
    if (!selectedClass) return {};

    const grid: { [key: string]: { [key: string]: ScheduleEntry | null } } = {};
    
    // Initialiser la grille
    timeSlots.forEach(slot => {
      grid[slot] = {};
      days.forEach(day => {
        grid[slot][day.short] = null;
      });
    });

    // Remplir la grille avec les entrées d'emploi du temps
    currentClassSchedule.forEach(entry => {
      const timeSlot = `${entry.startTime}-${entry.endTime}`;
      const dayShort = days.find(d => d.id === entry.dayOfWeek)?.short;
      
      if (grid[timeSlot] && dayShort) {
        grid[timeSlot][dayShort] = entry as ScheduleEntry;
      }
    });

    return grid;
  }, [selectedClass, currentClassSchedule, timeSlots, days]);

  // Calculer les statistiques de la classe
  const classStats = useMemo(() => {
    if (!selectedClass) return null;

    const totalSlots = 6 * 9; // 6 jours × 9 créneaux
    const filledSlots = currentClassSchedule.length;
    const uniqueSubjects = new Set(currentClassSchedule.map(s => s.subjectId)).size;
    const uniqueTeachers = new Set(currentClassSchedule.map(s => s.teacherId)).size;
    
    return {
      completion: Math.round((filledSlots / totalSlots) * 100),
      filledSlots,
      totalSlots,
      uniqueSubjects,
      uniqueTeachers,
      hoursPerWeek: filledSlots
    };
  }, [selectedClass, currentClassSchedule]);

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Matière inconnue';
  };

  const getTeacherName = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId)?.name || 'Enseignant inconnu';
  };

  const getSubjectColor = (subjectId: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
    ];
    
    const index = Math.abs(subjectId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length;
    return colors[index];
  };

  const handleAddScheduleEntry = (day?: number, timeSlot?: string) => {
    setEditingEntry(null);
    setPreSelectedDay(day);
    setPreSelectedTime(timeSlot);
    setShowAddModal(true);
  };

  const handleEditScheduleEntry = (entry: ScheduleEntry) => {
    setEditingEntry(entry);
    setShowAddModal(true);
  };

  const handleDeleteScheduleEntry = (entry: ScheduleEntry) => {
    setEntryToDelete(entry);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    
    setIsDeleting(true);
    try {
      console.log('🗑️ Suppression de l\'entrée:', entryToDelete.id);
      
      // Appeler la vraie API de suppression
      const { planningService } = await import('../../../../services/planningService');
      const result = await planningService.deleteScheduleEntry(entryToDelete.id);
      
      if (result.success) {
        console.log('✅ Suppression réussie:', result.message);
        
        // Recharger les données si la fonction est disponible
        if (onRefreshData) {
          console.log('🔄 Rechargement des données après suppression...');
          await onRefreshData();
        }
        
        // Fermer le modal après succès
        setShowDeleteModal(false);
        setEntryToDelete(null);
        
        console.log('✅ Suppression terminée avec succès');
      } else {
        console.error('❌ Erreur lors de la suppression:', result.error);
        // Garder le modal ouvert en cas d'erreur
      }
      } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setEntryToDelete(null);
  };

  const handleCopySchedule = (fromClassId: string) => {
    // TODO: Implémenter la copie d'emploi du temps
    console.log('Copie emploi du temps depuis:', fromClassId);
  };

  const handleExportSchedule = () => {
    // TODO: Implémenter l'export
    console.log('Export emploi du temps classe:', selectedClass);
  };

  if (!selectedClass) {
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
                  placeholder="Rechercher une classe..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              aria-label="Filtrer par niveau"
            >
              <option value="all">Tous les niveaux</option>
              {Array.from(new Set(classes.map(c => getLevelDisplayName(c.level)).filter(Boolean))).sort().map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste des classes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Sélectionnez une classe pour voir son emploi du temps
            </h3>
          </div>
          
          <div className="p-6">
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : ''}`}>
              {filteredClasses.map((cls) => {
                const classSchedule = schedule.filter(s => s.classId === cls.id);
                const completion = Math.round((classSchedule.length / 54) * 100); // 54 = 6 jours × 9 créneaux
                
                return (
                  <div 
                    key={cls.id} 
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => onSelectClass(cls.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{cls.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{getLevelDisplayName(cls.level)}</p>
                        </div>
                      </div>
                      
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        completion >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        completion >= 60 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        completion >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {completion}%
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>{classSchedule.length} cours planifiés</p>
                      <p>{new Set(classSchedule.map(s => s.subjectId)).size} matières</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredClasses.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucune classe trouvée</h3>
                <p className="text-gray-600 dark:text-gray-400">Aucune classe ne correspond aux critères de recherche.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de la classe sélectionnée */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onSelectClass('')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Retour à la liste des classes"
            >
              ←
            </button>
            
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {currentClass?.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {getLevelDisplayName(currentClass?.level)} • {classStats?.filledSlots} cours planifiés • {classStats?.completion}% complet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAddScheduleEntry}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
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

        {/* Statistiques de la classe */}
        {classStats && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">{classStats.completion}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Complétude</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{classStats.hoursPerWeek}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Heures/semaine</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{classStats.uniqueSubjects}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Matières</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{classStats.uniqueTeachers}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Enseignants</div>
            </div>
          </div>
        )}
      </div>

      {/* Grille d'emploi du temps */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Emploi du Temps - {currentClass?.name}
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
                          <div className={`p-2 rounded-lg text-xs ${getSubjectColor(entry.subjectId)} relative group`}>
                            <div className="font-medium">{getSubjectName(entry.subjectId)}</div>
                            <div className="text-xs opacity-75">{getTeacherName(entry.teacherId)}</div>
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
                                onClick={() => handleDeleteScheduleEntry(entry)}
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
                              const dayId = days.find(d => d.short === day.short)?.id;
                              handleAddScheduleEntry(dayId, timeSlot);
                            }}
                            className="w-full h-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center"
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
            onClick={() => handleCopySchedule('')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copier depuis une autre classe
          </button>
          
          <button
            onClick={() => {
              // TODO: Générer automatiquement
              console.log('Génération automatique pour la classe');
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Compléter automatiquement
          </button>
          
          <button
            onClick={() => {
              // TODO: Vérifier les conflits
              console.log('Vérification des conflits');
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Vérifier les conflits
          </button>
        </div>
      </div>

      {/* Modal d'ajout/édition de cours */}
      <ScheduleEntryModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingEntry(null);
          setPreSelectedDay(undefined);
          setPreSelectedTime(undefined);
        }}
        onSave={onSaveScheduleEntry}
        classes={classes}
        subjects={subjects}
        teachers={teachers}
        rooms={rooms}
        workHours={workHours}
        editingEntry={editingEntry}
        selectedClass={selectedClass}
        preSelectedDay={preSelectedDay}
        preSelectedTime={preSelectedTime}
      />

      {/* Modal de confirmation de suppression */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Supprimer le cours"
        message="Êtes-vous sûr de vouloir supprimer ce cours de l'emploi du temps ? Cette action supprimera définitivement toutes les données associées."
        itemName={entryToDelete ? `${getSubjectName(entryToDelete.subjectId)} - ${getTeacherName(entryToDelete.teacherId)}` : undefined}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ClassScheduleView;
