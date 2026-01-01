import React, { useMemo, useState } from 'react';
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Target,
  Activity,
  X,
  Edit,
  Eye,
  Download,
  Sparkles,
  Zap,
  Award,
  Star,
  Grid3X3,
  List,
  ChevronDown,
  Search
} from 'lucide-react';
import { PlanningTeacher, PlanningClass, PlanningSubject } from '../../../../types/planning';
import { EducationalCycle } from './TeachersTab';
import WorkloadChart from './components/WorkloadChart';

interface TeachersWorkloadProps {
  teachers: PlanningTeacher[];
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  selectedCycle: EducationalCycle;
  onEditAssignment?: (assignment: unknown) => void;
}

interface TeacherWorkload {
  id: string;
  name: string;
  hoursPerWeek: number;
  maxHours: number;
  efficiency: number;
  classes: string[];
  subjects: string[];
  status: 'underloaded' | 'optimal' | 'overloaded' | 'critical';
  recommendations: string[];
}

const TeachersWorkload: React.FC<TeachersWorkloadProps> = ({
  teachers,
  classes,
  subjects,
  selectedCycle,
  onEditAssignment
}) => {
  const [selectedTeacherForDetails, setSelectedTeacherForDetails] = useState<TeacherWorkload | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // États pour la vue moderne
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'hours' | 'status' | 'efficiency'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fonction pour gérer l'ajustement de la charge de travail
  const handleAdjustWorkload = (teacher: TeacherWorkload) => {
    // Créer une affectation fictive pour l'édition
    const assignment = {
      id: `adjust-${teacher.id}`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      mode: selectedCycle === 'maternelle' ? 'maternelle' : 
            selectedCycle === 'primaire' ? 'primaire' : 'secondaire',
      classId: teacher.classes.length > 0 ? teacher.classes[0] : '',
      className: teacher.classes.length > 0 ? teacher.classes[0] : '',
      classIds: teacher.classes,
      classNames: teacher.classes,
      subjectIds: teacher.subjects.map(s => subjects.find(sub => sub.name === s)?.id).filter(Boolean),
      subjectNames: teacher.subjects,
      subjectsCount: teacher.subjects.length,
      hoursPerWeek: teacher.hoursPerWeek,
      startDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    
    if (onEditAssignment) {
      onEditAssignment(assignment);
    }
  };

  // Fonction pour gérer l'affichage des détails
  const handleViewDetails = (teacher: TeacherWorkload) => {
    setSelectedTeacherForDetails(teacher);
    setIsDetailsModalOpen(true);
  };

  // Fonction pour fermer le modal de détails
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedTeacherForDetails(null);
  };


  // Calculer la charge de travail pour chaque enseignant
  const workloadData: TeacherWorkload[] = useMemo(() => {
    return teachers.map(teacher => {
      // Utiliser directement les données de l'enseignant
      const assignedClasses = teacher.classes?.map(className => classes.find(c => c?.name === className)).filter(Boolean) || [];
      // Déterminer les matières selon le niveau
      let assignedSubjects: { name: string; id: string }[] = [];
      
      if (assignedClasses.length > 0) {
        const firstClass = assignedClasses[0];
        if (firstClass) {
          const level = firstClass.level.toLowerCase();
          
          // Pour la maternelle et primaire, utiliser toutes les matières du niveau
          if (level.includes('maternelle') || level.includes('primaire')) {
            // Récupérer toutes les matières du niveau depuis la liste des matières
            const levelSubjects = subjects.filter(subject => 
              subject.level.toLowerCase().includes(level.split(' ')[0])
            );
            assignedSubjects = levelSubjects.map(subject => ({ 
              name: subject.name, 
              id: subject.id 
            }));
          } else {
            // Pour le secondaire, utiliser la matière spécifique
            if (teacher.subject) {
              assignedSubjects = [{ name: teacher.subject, id: 'static' }];
            }
          }
        }
      }

      // Calculer les vraies heures de travail
      const realHoursPerWeek = teacher.hoursPerWeek && teacher.hoursPerWeek > 0 ? 
        teacher.hoursPerWeek : 
        (assignedClasses.length > 0 ? 
          (() => {
            const firstClass = assignedClasses[0];
            if (firstClass) {
              const level = firstClass.level.toLowerCase();
              // Utiliser les heures réelles de l'enseignant si disponibles
              if (teacher.hoursPerWeek && teacher.hoursPerWeek > 0) {
                return teacher.hoursPerWeek;
              }
              
              // Valeurs par défaut selon le niveau
              if (level.includes('maternelle')) return 20;
              if (level.includes('primaire')) return 18;
              if (level.includes('6') || level.includes('5') || level.includes('4') || level.includes('3') || 
                  level.includes('2nde') || level.includes('1ère') || level.includes('tle')) return 15;
            }
            return 18; // Valeur par défaut
          })() : 0);

      const maxHours = 25; // Heures maximum recommandées par semaine
      const efficiency = Math.min(100, (realHoursPerWeek / maxHours) * 100);
      
      let status: TeacherWorkload['status'] = 'optimal';
      const recommendations: string[] = [];
      
      if (realHoursPerWeek === 0) {
        status = 'underloaded';
        recommendations.push('Aucune affectation - Affecter des classes ou matières');
      } else if (realHoursPerWeek < 10) {
        status = 'underloaded';
        recommendations.push('Charge faible - Possibilité d\'ajouter des heures');
      } else if (realHoursPerWeek > maxHours) {
        if (realHoursPerWeek > 30) {
          status = 'critical';
          recommendations.push('Surcharge critique - Réduire immédiatement la charge');
        } else {
          status = 'overloaded';
          recommendations.push('Surcharge - Envisager une redistribution');
        }
      } else {
        status = 'optimal';
        recommendations.push('Charge équilibrée');
      }

      // Recommandations spécifiques selon le cycle
      if (selectedCycle === 'secondaire' && assignedSubjects.length > 0) {
        if (assignedSubjects.length === 1) {
          recommendations.push('Spécialisé en ' + assignedSubjects[0].name);
        } else if (assignedSubjects.length > 3) {
          recommendations.push('Multi-matières - Vérifier la spécialisation');
        }
      } else if ((selectedCycle === 'maternelle' || selectedCycle === 'primaire') && assignedClasses.length > 0) {
        if (assignedClasses.length > 1) {
          recommendations.push('Multi-classes - Vérifier la faisabilité');
        }
      }

      return {
        id: teacher.id,
        name: teacher.name,
        hoursPerWeek: realHoursPerWeek,
        maxHours,
        efficiency,
        classes: assignedClasses.map(c => c?.name || ''),
        subjects: assignedSubjects.map((s: { name: string; id: string }) => s.name),
        status,
        recommendations
      };
    });
  }, [teachers, classes, subjects, selectedCycle]);

  // Statistiques globales
  const stats = useMemo(() => {
    const totalHours = workloadData.reduce((acc, t) => acc + t.hoursPerWeek, 0);
    const avgHours = totalHours / workloadData.length || 0;
    const underloaded = workloadData.filter(t => t.status === 'underloaded').length;
    const optimal = workloadData.filter(t => t.status === 'optimal').length;
    const overloaded = workloadData.filter(t => t.status === 'overloaded' || t.status === 'critical').length;
    const maxPossibleHours = workloadData.length * 25;
    const utilizationRate = (totalHours / maxPossibleHours) * 100;

    return {
      totalHours: Math.round(totalHours),
      avgHours: Math.round(avgHours * 10) / 10,
      underloaded,
      optimal,
      overloaded,
      utilizationRate: Math.round(utilizationRate),
      efficiency: Math.round((optimal / workloadData.length) * 100) || 0
    };
  }, [workloadData]);

  // Données pour le graphique
  const chartData = useMemo(() => {
    return workloadData.map(teacher => {
      const nameParts = teacher.name.split(' ');
      const firstName = nameParts[0]; // Prénom
      const lastName = nameParts.slice(-1)[0]; // Nom de famille
      return {
        name: `${firstName} ${lastName}`, // Prénom + Nom de famille
        heures: teacher.hoursPerWeek,
        max: teacher.maxHours,
        status: teacher.status
      };
    });
  }, [workloadData]);

  const getStatusColor = (status: TeacherWorkload['status']) => {
    switch (status) {
      case 'underloaded': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'optimal': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      case 'overloaded': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: TeacherWorkload['status']) => {
    switch (status) {
      case 'underloaded': return <AlertTriangle className="w-4 h-4" />;
      case 'optimal': return <CheckCircle className="w-4 h-4" />;
      case 'overloaded': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: TeacherWorkload['status']) => {
    switch (status) {
      case 'underloaded': return 'Sous-chargé';
      case 'optimal': return 'Optimal';
      case 'overloaded': return 'Surchargé';
      case 'critical': return 'Critique';
      default: return 'Inconnu';
    }
  };

  // Filtrer et trier les données
  const filteredAndSortedData = useMemo(() => {
    let filtered = workloadData.filter(teacher => {
      const matchesSearch = !searchTerm || teacher.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || teacher.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    // Trier les données
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'hours':
          aValue = a.hoursPerWeek;
          bValue = b.hoursPerWeek;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'efficiency':
          aValue = a.efficiency;
          bValue = b.efficiency;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
      }
    });

    return filtered;
  }, [workloadData, searchTerm, filterStatus, sortBy, sortOrder]);

  return (
    <div className="space-y-8">
      {/* En-tête moderne avec gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Sparkles className="w-8 h-8 mr-3" />
                Charge de Travail des Enseignants
              </h1>
              <p className="text-blue-100 text-lg">
                Analyse moderne de la charge pédagogique
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => {}}
                className="flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg"
                title="Exporter l'analyse"
                aria-label="Exporter l'analyse de charge de travail"
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
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.totalHours}h
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Heures</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.avgHours}h
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Moyenne</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <Zap className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.utilizationRate}%
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Taux d'Utilisation</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <CheckCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <Award className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.optimal}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Équilibrés</p>
            </div>
          </div>
        </div>

      {/* Barre de recherche et filtres modernes */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un enseignant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
              />
            </div>
            </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filtrer par statut"
              className="px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
            >
              <option value="">Tous les statuts</option>
              <option value="optimal">Optimal</option>
              <option value="underloaded">Sous-chargé</option>
              <option value="overloaded">Surchargé</option>
              <option value="critical">Critique</option>
            </select>

            {/* Tri */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'hours' | 'status' | 'efficiency')}
                aria-label="Trier par"
                className="px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
              >
                <option value="name">Nom</option>
                <option value="hours">Heures</option>
                <option value="status">Statut</option>
                <option value="efficiency">Efficacité</option>
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

      {/* Graphique de répartition moderne */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
            Répartition des Charges de Travail
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Visualisation des heures hebdomadaires par enseignant (max recommandé: 25h)
          </p>
        </div>
        <WorkloadChart data={chartData} />
      </div>

      {/* Analyse détaillée des enseignants */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <User className="w-6 h-6 mr-2 text-blue-600" />
                Analyse Détaillée par Enseignant
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                État de la charge de travail et recommandations d'optimisation
              </p>
            </div>
          </div>
        </div>
        
        {/* Affichage conditionnel selon le mode */}
        {viewMode === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedData.map((teacher) => (
                <div key={teacher.id} className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    {/* En-tête de la carte */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        {teacher.name}
                      </h4>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(teacher.status)}`}>
                        {getStatusIcon(teacher.status)}
                        {getStatusLabel(teacher.status)}
                      </div>
                    </div>
                        </div>
                      </div>
                      
                    {/* Informations principales */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Heures</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{teacher.hoursPerWeek}h</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">sur {teacher.maxHours}h max</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Efficacité</span>
                        </div>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">{Math.round(teacher.efficiency)}%</p>
                        <p className="text-xs text-green-600 dark:text-green-400">d'utilisation</p>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                        <span>Charge de travail</span>
                        <span>{Math.round(teacher.efficiency)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            teacher.status === 'critical' ? 'bg-red-500' :
                            teacher.status === 'overloaded' ? 'bg-orange-500' :
                            teacher.status === 'optimal' ? 'bg-green-500' :
                            'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.min(100, teacher.efficiency)}%` }}
                        />
                      </div>
                    </div>

                    {/* Classes et matières */}
                    <div className="mb-4 space-y-2">
                    <div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Classes</span>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          {teacher.classes.length > 0 ? teacher.classes.join(', ') : 'Aucune'}
                        </p>
                    </div>
                      <div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Matières</span>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          {teacher.subjects.length > 0 ? teacher.subjects.join(', ') : 'Toutes matières'}
                        </p>
                  </div>
                </div>

                {/* Actions */}
                    <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleAdjustWorkload(teacher)}
                        className="flex-1 flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium px-3 py-2 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                    title="Ajuster la charge de travail"
                  >
                    <Edit className="w-4 h-4" />
                    Ajuster
                  </button>
                  <button 
                    onClick={() => handleViewDetails(teacher)}
                        className="flex-1 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Voir les détails"
                  >
                    <Eye className="w-4 h-4" />
                    Détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
        ) : (
          /* Vue liste */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Enseignant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Heures
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Efficacité
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Classes
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Matières
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAndSortedData.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                          <User className="w-5 h-5 text-white" />
            </div>
            <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {teacher.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(teacher.status)}`}>
                        {getStatusIcon(teacher.status)}
                        {getStatusLabel(teacher.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div className="font-medium">{teacher.hoursPerWeek}h</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">sur {teacher.maxHours}h max</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              teacher.status === 'critical' ? 'bg-red-500' :
                              teacher.status === 'overloaded' ? 'bg-orange-500' :
                              teacher.status === 'optimal' ? 'bg-green-500' :
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(100, teacher.efficiency)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                          {Math.round(teacher.efficiency)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {teacher.classes.length > 0 ? teacher.classes.join(', ') : 'Aucune'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {teacher.subjects.length > 0 ? teacher.subjects.join(', ') : 'Toutes matières'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleAdjustWorkload(teacher)}
                          className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                          title="Ajuster la charge de travail"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleViewDetails(teacher)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recommandations globales modernes */}
      {(stats.underloaded > 0 || stats.overloaded > 0) && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Recommandations d'Optimisation
              </h3>
              <div className="space-y-3">
                {stats.underloaded > 0 && (
                  <div className="flex items-start p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        {stats.underloaded} enseignant{stats.underloaded > 1 ? 's' : ''} sous-chargé{stats.underloaded > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        Envisager d'ajouter des affectations pour optimiser la charge de travail
                      </p>
                    </div>
                  </div>
                )}
                {stats.overloaded > 0 && (
                  <div className="flex items-start p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        {stats.overloaded} enseignant{stats.overloaded > 1 ? 's' : ''} surchargé{stats.overloaded > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Redistribuer la charge de travail pour éviter la surcharge
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Objectif d'optimisation
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Maintenir une charge entre 15-25h par enseignant pour une efficacité optimale
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails de la charge de travail */}
      {isDetailsModalOpen && selectedTeacherForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Détails de la charge de travail
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedTeacherForDetails.name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseDetailsModal}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Statut et charge actuelle */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Statut actuel</h4>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTeacherForDetails.status)}`}>
                    {getStatusIcon(selectedTeacherForDetails.status)}
                    {getStatusLabel(selectedTeacherForDetails.status)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Charge actuelle:</span>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedTeacherForDetails.hoursPerWeek}h / {selectedTeacherForDetails.maxHours}h
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Efficacité:</span>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {Math.round(selectedTeacherForDetails.efficiency)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Classes assignées */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Classes assignées</h4>
                {selectedTeacherForDetails.classes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacherForDetails.classes.map((className, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-md"
                      >
                        {className}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">Aucune classe assignée</p>
                )}
              </div>

              {/* Matières assignées */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Matières assignées</h4>
                {selectedTeacherForDetails.subjects.length > 0 ? (
                  <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacherForDetails.subjects.map((subjectName, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-medium rounded-md"
                      >
                        {subjectName}
                      </span>
                    ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedTeacherForDetails.subjects.length} matière{selectedTeacherForDetails.subjects.length > 1 ? 's' : ''} assignée{selectedTeacherForDetails.subjects.length > 1 ? 's' : ''}
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-blue-800 dark:text-blue-200 font-medium">Polyvalent</p>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Enseigne toutes les matières de sa classe (Maternelle/Primaire)
                    </p>
                  </div>
                )}
              </div>

              {/* Recommandations */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Recommandations</h4>
                <ul className="space-y-2">
                  {selectedTeacherForDetails.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCloseDetailsModal}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  handleCloseDetailsModal();
                  handleAdjustWorkload(selectedTeacherForDetails);
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
              >
                Ajuster la charge
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeachersWorkload;
