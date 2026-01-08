import React, { useState, useMemo } from 'react';
import { 
  Users, 
  BookOpen, 
  Clock, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  User,
  TrendingUp,
  BarChart3,
  Activity,
  Target,
  Award,
  Grid3X3,
  List,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { PlanningTeacher, PlanningClass, PlanningSubject } from '../../../../types/planning';
import { EducationalCycle } from './TeachersTab';
// import { sortClassesByLevel, getLevelDisplayName, getLevelCategory, getAvailableCategories } from '../../../../utils/levelUtils';
import AssignmentPrintModal from '../../../modals/AssignmentPrintModal';
import { useAcademicYear } from '../../../../hooks/useAcademicYear';
// import { useSchoolSettings } from '../../../../hooks/useSchoolSettings';

interface TeachersAssignmentsProps {
  teachers: PlanningTeacher[];
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  assignments?: Array<{
    id: string;
    teacher_id: string;
    class_id: string;
    subject_id?: string;
    hours_per_week: number;
    mode?: string;
    start_date?: string;
  }>; // Ajouter les données d'affectations
  selectedCycle: EducationalCycle;
  onSaveAssignment: (assignmentData: Assignment) => Promise<void>;
  onViewAssignmentDetails?: (assignment: Assignment) => void;
  onEditAssignment?: (assignment: Assignment) => void;
  onDeleteAssignment?: (assignment: Assignment) => void;
}

interface Assignment {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail?: string;
  classId: string;
  className: string;
  classLevel: string;
  subjectNames: string[];
  subjectsCount: number;
  hoursPerWeek: number;
  startDate: string;
  status: 'active' | 'inactive' | 'pending';
  mode?: 'maternelle' | 'primaire' | 'secondaire';
  scheduleEntries?: Array<{
    id: string;
    day: string;
    startTime: string;
    endTime: string;
  }>;
}

const TeachersAssignments: React.FC<TeachersAssignmentsProps> = ({
  teachers,
  classes,
  subjects,
  assignments: rawAssignments,
  // selectedCycle,
  // onSaveAssignment,
  onViewAssignmentDetails,
  onEditAssignment,
  onDeleteAssignment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [printViewMode] = useState<'list' | 'summary'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'hours' | 'subjects' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // États pour l'export
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { currentAcademicYear, getCurrentAcademicYearLabel } = useAcademicYear();
  // const { schoolSettings } = useSchoolSettings();

  // Utiliser directement les données d'affectations
  const assignments = useMemo((): Assignment[] => {
    if (!rawAssignments || rawAssignments.length === 0) {
      return [];
    }

    return rawAssignments.map(assignment => {
      const classObj = classes.find(c => c.id === assignment.class_id);
      const classLevel = classObj?.level?.toLowerCase() || '';
      
      let subjectNames: string[] = [];
      let subjectsCount = 0;
      
      const mode = assignment.mode || 'maternelle'; // Mode par défaut
      
      if (mode === 'secondaire' && assignment.subject_id) {
        // Enseignant de secondaire : une matière spécifique
        const subjectName = subjects.find(s => s.id === assignment.subject_id)?.name || 'Inconnue';
        subjectNames = [subjectName];
        subjectsCount = 1;
      } else if (mode === 'maternelle' || mode === 'primaire') {
        // Enseignant de maternelle/primaire : toutes les matières du niveau
        let subjectLevel = null;
        if (classLevel.includes('maternelle') || classLevel.includes('ps') || classLevel.includes('ms') || classLevel.includes('gs')) {
          subjectLevel = 'maternelle';
        } else if (classLevel.includes('primaire') || classLevel.includes('cp') || classLevel.includes('ce') || classLevel.includes('cm')) {
          subjectLevel = 'primaire';
        }
        
        if (subjectLevel) {
          const levelSubjects = subjects.filter(subject => subject.level === subjectLevel);
          subjectNames = levelSubjects.map(s => s.name);
          subjectsCount = levelSubjects.length;
        }
      }
      
      return {
        id: assignment.id,
        teacherId: assignment.teacher_id,
        teacherName: teachers.find(t => t.id === assignment.teacher_id)?.name || 'Inconnu',
        teacherEmail: teachers.find(t => t.id === assignment.teacher_id)?.email || '',
        classId: assignment.class_id,
        className: classObj?.name || 'Inconnue',
        classLevel: classObj?.level || '',
        subjectNames,
        subjectsCount,
        hoursPerWeek: assignment.hours_per_week || 0,
        startDate: assignment.start_date || new Date().toISOString().split('T')[0],
        status: 'active' as const,
        mode: (assignment.mode as 'maternelle' | 'primaire' | 'secondaire') || 'maternelle', // Ajouter le mode
        scheduleEntries: []
      };
    });
  }, [rawAssignments, teachers, classes, subjects]);

  // Filtrer les affectations
  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const matchesSearch = !searchTerm || 
        assignment.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.subjectNames.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesClass = !filterClass || assignment.className === filterClass;
      const matchesSubject = !filterSubject || assignment.subjectNames.includes(filterSubject);

      return matchesSearch && matchesClass && matchesSubject;
    });
  }, [assignments, searchTerm, filterClass, filterSubject]);


  // Classes disponibles pour le filtre
  const availableClasses = useMemo(() => {
    const classNames = [...new Set(assignments.map(a => a.className))];
    return classNames.sort();
  }, [assignments]);

  // Matières disponibles pour le filtre
  const availableSubjects = useMemo(() => {
    const subjectNames = [...new Set(assignments.flatMap(a => a.subjectNames))];
    return subjectNames.sort();
  }, [assignments]);

  // Logique de tri
  const sortedAssignments = useMemo(() => {
    return [...filteredAssignments].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.teacherName.localeCompare(b.teacherName);
          break;
        case 'hours':
          comparison = a.hoursPerWeek - b.hoursPerWeek;
          break;
        case 'subjects':
          comparison = a.subjectsCount - b.subjectsCount;
          break;
        case 'date':
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredAssignments, sortBy, sortOrder]);

  // Statistiques modernes
  const stats = useMemo(() => {
    const totalHours = assignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);
    const avgHours = assignments.length > 0 ? Math.round(totalHours / assignments.length) : 0;
    const totalSubjects = assignments.reduce((sum, a) => sum + a.subjectsCount, 0);
    const uniqueTeachers = new Set(assignments.map(a => a.teacherId)).size;
    const uniqueClasses = new Set(assignments.map(a => a.classId)).size;
    
    return {
      totalAssignments: assignments.length,
      totalHours,
      avgHours,
      totalSubjects,
      uniqueTeachers,
      uniqueClasses
    };
  }, [assignments]);

  // Transformer les données pour l'export
  const exportAssignments = useMemo(() => {
    return assignments.map(assignment => ({
      id: assignment.id,
      teacherId: assignment.teacherId,
      teacherName: assignment.teacherName,
      mode: assignment.mode || 'maternelle' as 'maternelle' | 'primaire' | 'secondaire',
      classId: assignment.classId,
      className: assignment.className,
      subjectId: assignment.subjectNames.length === 1 ? assignment.subjectNames[0] : undefined,
      subjectName: assignment.subjectNames.length === 1 ? assignment.subjectNames[0] : undefined,
      subjectIds: assignment.subjectNames,
      subjectNames: assignment.subjectNames,
      subjectsCount: assignment.subjectsCount,
      classIds: [assignment.classId],
      classNames: [assignment.className],
      hoursPerWeek: assignment.hoursPerWeek,
      startDate: assignment.startDate,
      endDate: undefined,
      status: assignment.status === 'active' ? 'active' as 'active' | 'pending' | 'expired' : 
              assignment.status === 'pending' ? 'pending' as 'active' | 'pending' | 'expired' : 
              'expired' as 'active' | 'pending' | 'expired'
    }));
  }, [assignments]);

  if (assignments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune affectation
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Aucune affectation d'enseignant trouvée pour le cycle sélectionné.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête moderne avec gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Sparkles className="w-8 h-8 mr-3" />
                Affectations des Enseignants
              </h1>
              <p className="text-orange-100 text-lg">
                Gestion moderne des affectations pédagogiques
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg"
                title="Exporter les affectations"
                aria-label="Exporter les affectations"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Vue en grille"
                aria-label="Basculer vers la vue en grille"
                className={`p-3 rounded-xl transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                    : 'bg-white/10 hover:bg-white/20 text-white/80'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="Vue en liste"
                aria-label="Basculer vers la vue en liste"
                className={`p-3 rounded-xl transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' 
                    : 'bg-white/10 hover:bg-white/20 text-white/80'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques modernes avec cartes glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.totalAssignments}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Affectations actives</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.totalHours}h
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Heures totales</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <BarChart3 className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.totalSubjects}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Matières couvertes</p>
        </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </div>
              <Award className="w-5 h-5 text-orange-500" />
        </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.avgHours}h
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Moyenne par enseignant</p>
        </div>
        </div>
      </div>

      {/* Barre de recherche et filtres modernes */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une affectation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              aria-label="Filtrer par classe"
              className="px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
            >
              <option value="">Toutes les classes</option>
              {availableClasses.map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>

            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              aria-label="Filtrer par matière"
              className="px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
            >
              <option value="">Toutes les matières</option>
              {availableSubjects.map(subjectName => (
                <option key={subjectName} value={subjectName}>{subjectName}</option>
              ))}
            </select>

            {/* Tri */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'hours' | 'subjects' | 'date')}
                aria-label="Trier par"
                className="px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
              >
                <option value="name">Nom</option>
                <option value="hours">Heures</option>
                <option value="subjects">Matières</option>
                <option value="date">Date</option>
              </select>
            <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title="Changer l'ordre de tri"
                aria-label="Changer l'ordre de tri"
                className="p-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-white/70 dark:hover:bg-gray-700/70 transition-colors"
            >
                <ChevronDown className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Liste des affectations modernes */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAssignments.map((assignment) => (
            <div key={assignment.id} className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* En-tête de la carte */}
              <div className="relative z-10 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{assignment.teacherName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {assignment.className}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onViewAssignmentDetails?.(assignment)}
                      title="Voir les détails"
                      aria-label="Voir les détails de l'affectation"
                      className="p-2 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditAssignment?.(assignment)}
                      title="Modifier l'affectation"
                      aria-label="Modifier l'affectation"
                      className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
          <button
                      onClick={() => onDeleteAssignment?.(assignment)}
                      title="Supprimer l'affectation"
                      aria-label="Supprimer l'affectation"
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
          </button>
                  </div>
                </div>

                {/* Informations principales */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Matières</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{assignment.subjectsCount}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">disciplines</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Heures</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{assignment.hoursPerWeek}h</p>
                    <p className="text-xs text-green-600 dark:text-green-400">par semaine</p>
                  </div>
                </div>

                {/* Liste des matières */}
                {assignment.subjectNames.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Matières assignées</p>
                    <div className="flex flex-wrap gap-2">
                      {assignment.subjectNames.slice(0, 3).map((subject, index) => (
                        <span key={index} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs font-medium rounded-full">
                          {subject}
                        </span>
                      ))}
                      {assignment.subjectNames.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                          +{assignment.subjectNames.length - 3} autres
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Statut */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Statut</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    assignment.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {assignment.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-900/20 dark:to-red-900/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Enseignant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Classe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Matières
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Heures
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {assignment.teacherName}
                          </div>
                          {assignment.teacherEmail && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                              {assignment.teacherEmail}
                          </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{assignment.className}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{assignment.classLevel}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                                {assignment.subjectsCount} matière{assignment.subjectsCount > 1 ? 's' : ''}
                              </div>
                      {assignment.subjectNames.length > 0 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {assignment.subjectNames.join(', ')}
                          </div>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{assignment.hoursPerWeek}h</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        assignment.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {assignment.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onViewAssignmentDetails?.(assignment)}
                          title="Voir les détails"
                          aria-label="Voir les détails de l'affectation"
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditAssignment?.(assignment)}
                          title="Modifier l'affectation"
                          aria-label="Modifier l'affectation"
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteAssignment?.(assignment)}
                          title="Supprimer l'affectation"
                          aria-label="Supprimer l'affectation"
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section d'actions en bas */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {sortedAssignments.filter(a => a.status === 'active').length} affectations actives
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {sortedAssignments.filter(a => a.status !== 'active').length} affectations inactives
              </span>
            </div>
          </div>
          
        </div>
      </div>

      {/* Modal d'export */}
        <AssignmentPrintModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        assignments={exportAssignments}
        academicYear={getCurrentAcademicYearLabel() || currentAcademicYear?.name || 'Année académique'}
          viewMode={printViewMode}
        />
    </div>
  );
};

export default TeachersAssignments;
