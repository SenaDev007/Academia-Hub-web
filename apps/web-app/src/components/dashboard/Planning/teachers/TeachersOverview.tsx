import React, { useState, useMemo } from 'react';
import { 
  Users, 
  BookOpen, 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Hash,
  Plus,
  User,
  Mail,
  Phone,
  TrendingUp,
  BarChart3,
  Activity,
  Target,
  Award,
  Star,
  Zap,
  Layers,
  Grid3X3,
  List,
  MoreVertical,
  ChevronDown,
  Sparkles,
  GraduationCap,
  Brain,
  Heart,
  Shield,
  Crown,
  Rocket,
  Globe,
  Sun,
  Moon
} from 'lucide-react';
import { PlanningTeacher, PlanningClass, PlanningSubject } from '../../../../types/planning';
import { EducationalCycle } from './TeachersTab';
import { sortClassesByLevel, getLevelDisplayName, getLevelCategory, getAvailableCategories } from '../../../../utils/levelUtils';
import TeacherCard from './components/TeacherCard';
import AssignmentSummary from './components/AssignmentSummary';
import AssignmentWizard from './AssignmentWizard';

interface TeachersOverviewProps {
  teachers: PlanningTeacher[];
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  selectedCycle: EducationalCycle;
  onTeacherSelect: (teacherId: string) => void;
  onNewAssignment: () => void;
  onViewTeacherPlanning?: (teacher: PlanningTeacher) => void;
  onEditAssignment?: (assignment: any) => void;
  onSaveAssignment?: (assignmentData: any) => Promise<void>;
}

const TeachersOverviewModern: React.FC<TeachersOverviewProps> = ({
  teachers,
  classes,
  subjects,
  selectedCycle,
  onTeacherSelect,
  onNewAssignment,
  onViewTeacherPlanning,
  onEditAssignment,
  onSaveAssignment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'hours' | 'subjects' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isAssignmentWizardOpen, setIsAssignmentWizardOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);

  // Statistiques calculées basées sur les données des enseignants
  const stats = useMemo(() => {
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.status === 'active').length;
    const teachersWithAssignments = teachers.filter(t => t.classes && t.classes.length > 0);
    const assignedSubjects = new Set(teachers.flatMap(t => t.subjects || []));
    const totalHours = teachers.reduce((sum, t) => sum + (t.hoursPerWeek || 0), 0);
    const averageHours = totalTeachers > 0 ? Math.round(totalHours / totalTeachers) : 0;

    return {
      total: totalTeachers,
      active: activeTeachers,
      assignments: teachersWithAssignments.length,
      subjects: assignedSubjects.size,
      totalHours,
      avgHours: averageHours
    };
  }, [teachers]);

  // Enseignants filtrés
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      const matchesSearch = !searchTerm || 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subjects?.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
        teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !filterStatus || teacher.status === filterStatus;
      const matchesSubject = !filterSubject || 
        teacher.subjects?.includes(filterSubject) || 
        teacher.subject === filterSubject;

      return matchesSearch && matchesStatus && matchesSubject;
    });
  }, [teachers, searchTerm, filterStatus, filterSubject]);

  // Matières disponibles pour le filtre
  const availableSubjects = useMemo(() => {
    const subjectsSet = new Set();
    teachers.forEach(teacher => {
      if (teacher.subjects && teacher.subjects.length > 0) {
        teacher.subjects.forEach(subject => subjectsSet.add(subject));
      } else if (teacher.subject) {
        subjectsSet.add(teacher.subject);
      }
    });
    return Array.from(subjectsSet).sort();
  }, [teachers]);

  // Logique de tri
  const sortedTeachers = useMemo(() => {
    return [...filteredTeachers].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'hours':
          comparison = (a.hoursPerWeek || 0) - (b.hoursPerWeek || 0);
          break;
        case 'subjects':
          comparison = (a.subjects?.length || 0) - (b.subjects?.length || 0);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredTeachers, sortBy, sortOrder]);

  const getCycleDisplayName = (cycle: EducationalCycle): string => {
    switch (cycle) {
      case 'maternelle': return 'Maternelle';
      case 'primaire': return 'Primaire';
      case 'secondaire': return 'Secondaire';
      default: return 'Tous';
    }
  };

  const handleEditAssignment = (assignment: any) => {
    if (onEditAssignment) {
      onEditAssignment(assignment);
    } else {
      setEditingAssignment(assignment);
      setIsAssignmentWizardOpen(true);
    }
  };

  const handleSaveAssignmentWrapper = async (assignmentData: any) => {
    if (onSaveAssignment) {
      await onSaveAssignment(assignmentData);
    }
    setIsAssignmentWizardOpen(false);
    setEditingAssignment(null);
  };

  if (teachers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun enseignant trouvé
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Aucun enseignant n'est assigné au cycle {getLevelDisplayName(selectedCycle).toLowerCase()}.
          </p>
          <button
            onClick={onNewAssignment}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer une affectation
          </button>
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
                <GraduationCap className="w-8 h-8 mr-3" />
                Vue d'Ensemble des Enseignants
              </h1>
              <p className="text-orange-100 text-lg">
                {selectedCycle !== 'all' ? `Cycle ${getLevelDisplayName(selectedCycle)} - ` : ''}Gestion pédagogique moderne
              </p>
            </div>
            <div className="flex items-center space-x-3">
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
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.total}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Enseignants total</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.active}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Enseignants actifs</p>
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
              {stats.subjects}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Matières couvertes</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
              <Target className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.avgHours}h
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Charge moyenne</p>
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
                placeholder="Rechercher un enseignant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filtrer par statut"
              className="px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="on-leave">En congé</option>
            </select>

            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              aria-label="Filtrer par matière"
              className="px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
            >
              <option value="">Toutes les matières</option>
              {availableSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            {/* Tri */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Trier par"
                className="px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"
              >
                <option value="name">Nom</option>
                <option value="hours">Heures</option>
                <option value="subjects">Matières</option>
                <option value="status">Statut</option>
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

      {/* Liste des enseignants modernes */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTeachers.map((teacher) => (
            <div key={teacher.id} className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* En-tête de la carte */}
              <div className="relative z-10 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                        teacher.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{teacher.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {teacher.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onViewTeacherPlanning?.(teacher)}
                      title="Voir le planning"
                      aria-label="Voir le planning de l'enseignant"
                      className="p-2 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
          <button
                      onClick={() => onTeacherSelect(teacher.id)}
                      title="Sélectionner l'enseignant"
                      aria-label="Sélectionner l'enseignant"
                      className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                    >
                      <Edit className="w-4 h-4" />
          </button>
        </div>
                </div>

                {/* Informations principales */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <span className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">Matières</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{teacher.subjects?.length || 0}</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">disciplines</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Heures</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{teacher.hoursPerWeek || 0}h</p>
                    <p className="text-xs text-green-600 dark:text-green-400">par semaine</p>
                  </div>
                </div>

                {/* Liste des matières */}
                {teacher.subjects && teacher.subjects.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Matières enseignées</p>
                    <div className="flex flex-wrap gap-2">
                      {teacher.subjects.slice(0, 3).map((subject, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full">
                          {subject}
                        </span>
                      ))}
                      {teacher.subjects.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                          +{teacher.subjects.length - 3} autres
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Classes assignées */}
                {teacher.classes && teacher.classes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Classes assignées</p>
                    <div className="flex flex-wrap gap-2">
                      {teacher.classes.slice(0, 2).map((className, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-medium rounded-full">
                          {className}
                        </span>
                      ))}
                      {teacher.classes.length > 2 && (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                          +{teacher.classes.length - 2} autres
                        </span>
                      )}
                    </div>
        </div>
      )}

                {/* Statut */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Statut</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    teacher.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {teacher.status === 'active' ? 'Actif' : 'Inactif'}
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
              <thead className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-900/20 dark:to-purple-900/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Enseignant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Matière
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Classes
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
                {sortedTeachers.map((teacher) => {
                  const actualSubjects = teacher.subjects?.map(subjectName => ({ name: subjectName, id: 'static' })) || [];
                  const actualClasses = teacher.classes?.map(className => classes.find(c => c.name === className)).filter(Boolean) || [];
                  const actualHours = teacher.hoursPerWeek || 0;

                      return (
                      <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {teacher.name}
                              </div>
                              {teacher.email && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {teacher.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                              {actualSubjects.length > 0 ? (
                                actualSubjects.length === 1 ? 
                                  actualSubjects[0].name :
                                  `${actualSubjects.length} matières`
                              ) : (
                            'Non assignée'
                              )}
                            </div>
                            {actualSubjects.length > 1 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                            <div className="truncate">
                              {actualSubjects.slice(0, 3).map(s => s.name).join(', ')}
                              {actualSubjects.length > 3 && ` +${actualSubjects.length - 3} autres`}
                            </div>
                          </div>
                            )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                              {actualClasses.length > 0 
                                ? actualClasses.map(c => c.name).join(', ')
                              : 'Aucune classe'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{actualHours}h</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            teacher.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {teacher.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                            <button
                            onClick={() => onViewTeacherPlanning?.(teacher)}
                            title="Voir le planning"
                            aria-label="Voir le planning de l'enseignant"
                              className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                            >
                            <Eye className="w-4 h-4" />
                            </button>
                            <button
                            onClick={() => onTeacherSelect(teacher.id)}
                            title="Sélectionner l'enseignant"
                            aria-label="Sélectionner l'enseignant"
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
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
                {sortedTeachers.filter(t => t.status === 'active').length} enseignants actifs
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {sortedTeachers.filter(t => t.status !== 'active').length} enseignants inactifs
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={onNewAssignment}
              className="flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle affectation
            </button>
          </div>
        </div>
        </div>

      {/* Modal d'affectation */}
      {isAssignmentWizardOpen && (
        <AssignmentWizard
          isOpen={isAssignmentWizardOpen}
          onClose={() => setIsAssignmentWizardOpen(false)}
          onSave={handleSaveAssignmentWrapper}
          teachers={teachers}
          classes={classes}
          subjects={subjects}
          selectedCycle={selectedCycle}
          editingAssignment={editingAssignment}
        />
      )}
    </div>
  );
};

export default TeachersOverviewModern;
