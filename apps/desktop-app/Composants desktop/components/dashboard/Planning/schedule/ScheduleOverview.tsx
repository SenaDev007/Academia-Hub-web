import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Users, 
  User, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  Eye,
  Edit,
  Plus,
  Filter,
  Search,
  Grid,
  PieChart
} from 'lucide-react';
import { PlanningClass, PlanningSubject, PlanningTeacher, PlanningSchedule, WorkHoursConfig } from '../../../../types/planning';
import { sortClassesByLevel, getLevelDisplayName, getLevelCategory, groupClassesByCategory } from '../../../../utils/levelUtils';

interface ScheduleStats {
  totalClasses: number;
  scheduledClasses: number;
  totalTeachers: number;
  activeTeachers: number;
  totalSlots: number;
  filledSlots: number;
  conflicts: number;
  completionRate: number;
  averageHoursPerTeacher: number;
  averageSubjectsPerClass: number;
}

interface ScheduleOverviewProps {
  teachers: PlanningTeacher[];
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  schedule: PlanningSchedule[];
  workHours: WorkHoursConfig | null;
  stats: ScheduleStats;
  onSelectClass: (classId: string) => void;
  onSelectTeacher: (teacherId: string) => void;
}

const ScheduleOverview: React.FC<ScheduleOverviewProps> = ({
  teachers,
  classes,
  subjects,
  schedule,
  workHours,
  stats,
  onSelectClass,
  onSelectTeacher
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState<'classes' | 'teachers'>('classes');

  const days = [
    { id: 1, name: 'Lundi', short: 'Lun' },
    { id: 2, name: 'Mardi', short: 'Mar' },
    { id: 3, name: 'Mercredi', short: 'Mer' },
    { id: 4, name: 'Jeudi', short: 'Jeu' },
    { id: 5, name: 'Vendredi', short: 'Ven' },
    { id: 6, name: 'Samedi', short: 'Sam' }
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00'
  ];

  // Analyser la répartition par niveau
  const levelDistribution = useMemo(() => {
    const distribution: { [key: string]: { classes: number; scheduled: number; completion: number } } = {};
    
    classes.forEach(cls => {
      const levelDisplay = getLevelDisplayName(cls.level);
      if (!distribution[levelDisplay]) {
        distribution[levelDisplay] = { classes: 0, scheduled: 0, completion: 0 };
      }
      distribution[levelDisplay].classes++;
      
      const classSchedule = schedule.filter(s => s.classId === cls.id);
      if (classSchedule.length > 0) {
        distribution[levelDisplay].scheduled++;
      }
    });

    Object.keys(distribution).forEach(level => {
      const { classes: totalClasses, scheduled } = distribution[level];
      distribution[level].completion = totalClasses > 0 ? Math.round((scheduled / totalClasses) * 100) : 0;
    });

    return distribution;
  }, [classes, schedule]);

  // Analyser la répartition par matière
  const subjectDistribution = useMemo(() => {
    const distribution: { [key: string]: { total: number; percentage: number } } = {};
    
    schedule.forEach(entry => {
      const subject = subjects.find(s => s.id === entry.subjectId);
      const subjectName = subject?.name || 'Matière inconnue';
      
      if (!distribution[subjectName]) {
        distribution[subjectName] = { total: 0, percentage: 0 };
      }
      distribution[subjectName].total++;
    });

    const totalEntries = schedule.length;
    Object.keys(distribution).forEach(subjectName => {
      distribution[subjectName].percentage = totalEntries > 0 
        ? Math.round((distribution[subjectName].total / totalEntries) * 100) 
        : 0;
    });

    return distribution;
  }, [schedule, subjects]);

  // Filtrer et trier les classes
  const filteredClasses = useMemo(() => {
    const filtered = classes.filter(cls => {
      const matchesLevel = selectedLevel === 'all' || getLevelDisplayName(cls.level) === selectedLevel;
      const matchesSearch = !searchTerm || cls.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesLevel && matchesSearch;
    });
    return sortClassesByLevel(filtered);
  }, [classes, selectedLevel, searchTerm]);

  // Filtrer les enseignants
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      const matchesSearch = !searchTerm || teacher.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [teachers, searchTerm]);

  const getClassScheduleCompletion = (classId: string) => {
    const classSchedule = schedule.filter(s => s.classId === classId);
    const totalSlots = 6 * 9; // 6 jours × 9 créneaux
    return Math.round((classSchedule.length / totalSlots) * 100);
  };

  const getTeacherScheduleLoad = (teacherId: string) => {
    const teacherSchedule = schedule.filter(s => s.teacherId === teacherId);
    return teacherSchedule.length;
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
    if (percentage >= 60) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
  };

  const getLoadColor = (load: number) => {
    if (load === 0) return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300';
    if (load <= 10) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
    if (load <= 20) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
    if (load <= 30) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
  };

  return (
    <div className="space-y-6">
      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux de Complétude</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.completionRate}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stats.filledSlots}/{stats.totalSlots} créneaux</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Classes Planifiées</p>
              <p className="text-2xl font-bold text-blue-600">{stats.scheduledClasses}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">sur {stats.totalClasses} classes</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Enseignants Actifs</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeTeachers}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stats.averageHoursPerTeacher}h/enseignant</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
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
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Répartition par niveau et matières */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par niveau */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-indigo-600" />
            Répartition par Niveau
          </h3>
          
          <div className="space-y-3">
            {Object.entries(levelDistribution).map(([level, data]) => (
              <div key={level} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{level}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {data.scheduled}/{data.classes} classes planifiées
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCompletionColor(data.completion)}`}>
                  {data.completion}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition par matière */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
            Répartition par Matière
          </h3>
          
          <div className="space-y-3">
            {Object.entries(subjectDistribution)
              .sort((a, b) => b[1].total - a[1].total)
              .slice(0, 6)
              .map(([subject, data]) => (
              <div key={subject} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{subject}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{data.total} cours</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${data.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-3 text-sm font-medium text-purple-600">
                  {data.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Recherche */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`Rechercher ${viewType === 'classes' ? 'une classe' : 'un enseignant'}...`}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filtres et contrôles */}
          <div className="flex gap-3">
            {viewType === 'classes' && (
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
            )}

            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewType('classes')}
                className={`px-3 py-2 text-sm ${viewType === 'classes' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Users className="w-4 h-4 mr-1 inline" />
                Classes
              </button>
              <button
                onClick={() => setViewType('teachers')}
                className={`px-3 py-2 text-sm ${viewType === 'teachers' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <User className="w-4 h-4 mr-1 inline" />
                Enseignants
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des classes ou enseignants */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {viewType === 'classes' ? 'Classes' : 'Enseignants'} - Aperçu des Plannings
          </h3>
        </div>
        
        <div className="p-6">
          {viewType === 'classes' ? (
            <div className="grid gap-4">
              {filteredClasses.map((cls) => {
                const completion = getClassScheduleCompletion(cls.id);
                const classSchedule = schedule.filter(s => s.classId === cls.id);
                const uniqueSubjects = new Set(classSchedule.map(s => s.subjectId)).size;
                
                return (
                  <div key={cls.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{cls.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {getLevelDisplayName(cls.level)} • {classSchedule.length} cours • {uniqueSubjects} matières
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCompletionColor(completion)}`}>
                        {completion}% planifié
                      </div>
                      
                      <button
                        onClick={() => onSelectClass(cls.id)}
                        className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                        title="Voir l'emploi du temps de la classe"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTeachers.map((teacher) => {
                const load = getTeacherScheduleLoad(teacher.id);
                const teacherSchedule = schedule.filter(s => s.teacherId === teacher.id);
                const uniqueClasses = new Set(teacherSchedule.map(s => s.classId)).size;
                
                return (
                  <div key={teacher.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{teacher.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {teacher.subject || 'Toutes matières'} • {load} cours • {uniqueClasses} classes
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getLoadColor(load)}`}>
                        {load} cours
                      </div>
                      
                      <button
                        onClick={() => onSelectTeacher(teacher.id)}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Voir l'emploi du temps de l'enseignant"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {(viewType === 'classes' ? filteredClasses : filteredTeachers).length === 0 && (
            <div className="text-center py-12">
              {viewType === 'classes' ? <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" /> : <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />}
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Aucun{viewType === 'classes' ? 'e classe' : ' enseignant'} trouvé{viewType === 'classes' ? 'e' : ''}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Aucun{viewType === 'classes' ? 'e classe' : ' enseignant'} ne correspond aux critères de recherche.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleOverview;
