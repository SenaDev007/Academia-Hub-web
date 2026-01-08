import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Users, 
  User, 
  BookOpen, 
  Clock, 
  Settings, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  BarChart3,
  Filter,
  Download,
  RefreshCw,
  Grid,
  List
} from 'lucide-react';
import ScheduleOverview from './ScheduleOverview';
import ClassScheduleView from './ClassScheduleView';
import TeacherScheduleView from './TeacherScheduleView';
import ScheduleGenerator from './ScheduleGenerator';
import ConflictResolver from './ConflictResolver';
import { PlanningClass, PlanningSubject, PlanningTeacher, PlanningRoom, PlanningSchedule, WorkHoursConfig } from '../../../../types/planning';

export type ScheduleView = 'overview' | 'by-class' | 'by-teacher' | 'generator' | 'conflicts';

interface ScheduleTabProps {
  teachers: PlanningTeacher[];
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  rooms: PlanningRoom[];
  schedule: PlanningSchedule[];
  workHours: WorkHoursConfig | null;
  onSaveScheduleEntry: (scheduleData: any) => Promise<void>;
  onRefreshData?: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

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

const ScheduleTab: React.FC<ScheduleTabProps> = ({
  teachers,
  classes,
  subjects,
  rooms,
  schedule,
  workHours,
  onSaveScheduleEntry,
  onRefreshData,
  loading = false,
  error = null
}) => {
  const [activeView, setActiveView] = useState<ScheduleView>('overview');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Calculer les statistiques de l'emploi du temps
  const scheduleStats = useMemo((): ScheduleStats => {
    const scheduledClasses = new Set(schedule.map(s => s.classId)).size;
    const activeTeachers = new Set(schedule.map(s => s.teacherId)).size;
    const totalSlots = classes.length * 6 * 9; // 6 jours × 9 créneaux par jour
    const filledSlots = schedule.length;
    
    // Simuler la détection de conflits
    const conflicts = schedule.filter((entry, index) => {
      return schedule.some((other, otherIndex) => 
        index !== otherIndex &&
        entry.teacherId === other.teacherId &&
        entry.dayOfWeek === other.dayOfWeek &&
        entry.startTime === other.startTime
      );
    }).length;

    const completionRate = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;
    const averageHoursPerTeacher = activeTeachers > 0 ? Math.round((filledSlots / activeTeachers) * 10) / 10 : 0;
    const averageSubjectsPerClass = scheduledClasses > 0 ? Math.round((filledSlots / scheduledClasses) * 10) / 10 : 0;

    return {
      totalClasses: classes.length,
      scheduledClasses,
      totalTeachers: teachers.length,
      activeTeachers,
      totalSlots,
      filledSlots,
      conflicts,
      completionRate,
      averageHoursPerTeacher,
      averageSubjectsPerClass
    };
  }, [teachers, classes, schedule]);

  const navigationTabs = [
    {
      id: 'overview' as ScheduleView,
      name: 'Vue d\'ensemble',
      icon: Eye,
      description: 'Aperçu global des emplois du temps et statistiques'
    },
    {
      id: 'by-class' as ScheduleView,
      name: 'Par classe',
      icon: Users,
      description: 'Emplois du temps organisés par classe'
    },
    {
      id: 'by-teacher' as ScheduleView,
      name: 'Par enseignant',
      icon: User,
      description: 'Emplois du temps organisés par enseignant'
    },
    {
      id: 'generator' as ScheduleView,
      name: 'Génération auto',
      icon: Zap,
      description: 'Génération automatique d\'emplois du temps optimisés'
    },
    {
      id: 'conflicts' as ScheduleView,
      name: 'Résolution conflits',
      icon: AlertTriangle,
      description: 'Identifier et résoudre les conflits d\'emploi du temps'
    }
  ];

  const handleGenerateSchedule = async () => {
    // TODO: Implémenter la génération automatique
    console.log('Génération automatique d\'emploi du temps');
  };

  const handleExportSchedules = () => {
    // TODO: Implémenter l'export des emplois du temps
    console.log('Export des emplois du temps');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="ml-3 text-gray-600 dark:text-gray-400">Chargement des emplois du temps...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Erreur de chargement</h3>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h2 className="text-3xl font-bold mb-2">Emplois du Temps</h2>
              <p className="text-indigo-100 text-lg">
                Gérez et optimisez les plannings de cours pour toutes les classes et enseignants
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="text-2xl font-bold">{scheduleStats.scheduledClasses}</div>
                <div className="text-xs text-indigo-100">Classes planifiées</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="text-2xl font-bold">{scheduleStats.activeTeachers}</div>
                <div className="text-xs text-indigo-100">Enseignants actifs</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="text-2xl font-bold text-green-300">{scheduleStats.completionRate}%</div>
                <div className="text-xs text-indigo-100">Complétude</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="text-2xl font-bold text-orange-300">{scheduleStats.conflicts}</div>
                <div className="text-xs text-indigo-100">Conflits</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
      </div>

      {/* Navigation des vues */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
        <nav className="flex space-x-1" role="tablist">
          {navigationTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`
                  flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
                role="tab"
                aria-selected={isActive ? 'true' : 'false'}
                title={tab.description}
              >
                <Icon className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Barre d'actions */}
      {(activeView === 'by-class' || activeView === 'by-teacher') && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm ${viewMode === 'grid' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                  title="Vue grille"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm ${viewMode === 'list' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                  title="Vue liste"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerateSchedule}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Zap className="w-4 h-4" />
                Générer auto
              </button>
              
              <button
                onClick={handleExportSchedules}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Exporter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu des vues */}
      <div className="min-h-96">
        {activeView === 'overview' && (
          <ScheduleOverview
            teachers={teachers}
            classes={classes}
            subjects={subjects}
            schedule={schedule}
            workHours={workHours}
            stats={scheduleStats}
            onSelectClass={(classId) => {
              setSelectedClass(classId);
              setActiveView('by-class');
            }}
            onSelectTeacher={(teacherId) => {
              setSelectedTeacher(teacherId);
              setActiveView('by-teacher');
            }}
          />
        )}

        {activeView === 'by-class' && (
          <ClassScheduleView
            classes={classes}
            subjects={subjects}
            teachers={teachers}
            rooms={rooms}
            schedule={schedule}
            workHours={workHours}
            selectedClass={selectedClass}
            viewMode={viewMode}
            onSaveScheduleEntry={onSaveScheduleEntry}
            onSelectClass={setSelectedClass}
            onRefreshData={onRefreshData}
          />
        )}

        {activeView === 'by-teacher' && (
          <TeacherScheduleView
            teachers={teachers}
            classes={classes}
            subjects={subjects}
            schedule={schedule}
            workHours={workHours}
            selectedTeacher={selectedTeacher}
            viewMode={viewMode}
            onSaveScheduleEntry={onSaveScheduleEntry}
            onSelectTeacher={setSelectedTeacher}
            onRefreshData={onRefreshData}
          />
        )}

        {activeView === 'generator' && (
          <ScheduleGenerator
            teachers={teachers}
            classes={classes}
            subjects={subjects}
            workHours={workHours}
            onGenerateSchedule={onSaveScheduleEntry}
          />
        )}

        {activeView === 'conflicts' && (
          <ConflictResolver
            teachers={teachers}
            classes={classes}
            subjects={subjects}
            schedule={schedule}
            workHours={workHours}
            onResolveConflict={onSaveScheduleEntry}
          />
        )}
      </div>
    </div>
  );
};

export default ScheduleTab;
