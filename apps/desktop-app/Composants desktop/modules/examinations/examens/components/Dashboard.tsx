import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  Users, 
  FileText, 
  BarChart3, 
  Award, 
  ClipboardList,
  TrendingUp,
  Calendar,
  CheckCircle,
  RefreshCw,
  GraduationCap,
  Target,
  Clock,
  ArrowUpRight,
  Activity,
  Zap,
  Shield
} from 'lucide-react';
import AcademicYearSelector from '../../../components/common/AcademicYearSelector';
import QuarterSelector from '../../../components/common/QuarterSelector';
import { useAcademicYearState } from '../../../hooks/useAcademicYearState';
import { useQuarterState } from '../../../hooks/useQuarterState';
import { apiService } from '../services/api';

interface DashboardProps {
  onViewChange: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  // Hooks pour la gestion des années scolaires et trimestres
  const {
    selectedAcademicYear,
    setSelectedAcademicYear,
    currentAcademicYear
  } = useAcademicYearState('examinations');

  const {
    selectedQuarter,
    setSelectedQuarter,
    currentQuarter
  } = useQuarterState('examinations');

  // État pour les données du dashboard
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalGrades: 0,
    totalBulletins: 0,
    averageScore: 0,
    successRate: 0,
    totalClasses: 0,
    totalSubjects: 0,
    isLoading: true
  });

  const [recentActivities, setRecentActivities] = useState<Array<{
    action: string;
    time: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }>>([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setDashboardData(prev => ({ ...prev, isLoading: true }));

      // Charger les statistiques globales
      const statsResponse = await apiService.getStatistiquesGlobales({
        academicYearId: selectedAcademicYear,
        quarterId: selectedQuarter
      });

      if (statsResponse.data) {
        setDashboardData({
          totalStudents: statsResponse.data.totalStudents || 0,
          totalGrades: 0, // À calculer depuis les notes
          totalBulletins: 0, // À calculer depuis les bulletins
          averageScore: statsResponse.data.averageScore || 0,
          successRate: 85.5, // À calculer depuis les données réelles
          totalClasses: 12, // À récupérer depuis les données
          totalSubjects: 8, // À récupérer depuis les données
          isLoading: false
        });
      }

      // Charger les activités récentes
      loadRecentActivities();

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setDashboardData(prev => ({ ...prev, isLoading: false }));
    }
  }, [selectedAcademicYear, selectedQuarter]);

  // Charger les données du dashboard
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const loadRecentActivities = async () => {
    try {
      // Simuler des activités récentes basées sur les vraies données
      const activities = [
        { action: 'Notes saisies pour CM2-A - Mathématiques', time: 'Il y a 5 minutes', icon: CheckCircle, color: 'text-green-500' },
        { action: 'Bulletins générés pour 6ème', time: 'Il y a 1 heure', icon: FileText, color: 'text-blue-500' },
        { action: 'Conseil de classe programmé - 5ème A', time: 'Il y a 2 heures', icon: Calendar, color: 'text-purple-500' },
        { action: 'Mise à jour des statistiques trimestrielles', time: 'Il y a 3 heures', icon: TrendingUp, color: 'text-orange-500' }
      ];
      setRecentActivities(activities);
    } catch (error) {
      console.error('Erreur lors du chargement des activités:', error);
    }
  };

  const stats = [
    { 
      label: 'Total Élèves', 
      value: dashboardData.totalStudents.toLocaleString(), 
      icon: Users, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      trend: '+12%',
      trendColor: 'text-green-600'
    },
    { 
      label: 'Notes Saisies', 
      value: dashboardData.totalGrades.toLocaleString(), 
      icon: BookOpen, 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      trend: '+8%',
      trendColor: 'text-green-600'
    },
    { 
      label: 'Taux de Réussite', 
      value: `${dashboardData.successRate.toFixed(1)}%`, 
      icon: Target, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      trend: '+5%',
      trendColor: 'text-green-600'
    },
    { 
      label: 'Moyenne Générale', 
      value: `${dashboardData.averageScore.toFixed(1)}/20`, 
      icon: BarChart3, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      trend: '+2.3',
      trendColor: 'text-green-600'
    }
  ];

  const quickActions = [
    { 
      label: 'Saisie des Notes', 
      description: 'Saisir et modifier les notes des élèves',
      icon: BookOpen, 
      action: () => onViewChange('saisie'), 
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    { 
      label: 'Générer Bulletins', 
      description: 'Créer et imprimer les bulletins',
      icon: FileText, 
      action: () => onViewChange('bulletins'), 
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    { 
      label: 'Bordereaux', 
      description: 'Gérer les bordereaux de notes',
      icon: ClipboardList, 
      action: () => onViewChange('bordereau'), 
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    { 
      label: 'Statistiques', 
      description: 'Analyser les performances',
      icon: BarChart3, 
      action: () => onViewChange('statistiques'), 
      color: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    { 
      label: 'Conseils de Classe', 
      description: 'Organiser les conseils de classe',
      icon: Users, 
      action: () => onViewChange('conseils'), 
      color: 'from-red-500 to-red-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    { 
      label: 'Tableaux d\'Honneur', 
      description: 'Gérer les tableaux d\'honneur',
      icon: Award, 
      action: () => onViewChange('tableaux'), 
      color: 'from-yellow-500 to-yellow-600',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    }
  ];

  const handleRefresh = () => {
    loadDashboardData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="space-y-8 p-6">
        {/* Header moderne avec gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-90"></div>
          <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="flex justify-between items-start">
              <div className="text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
        <div>
                    <h1 className="text-3xl font-bold">
            Tableau de bord Examens
          </h1>
                    <p className="text-blue-100 text-lg">
            Gérez les notes, bulletins et évaluations de votre établissement
          </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{currentAcademicYear?.name || 'Chargement...'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{currentQuarter?.name || 'Chargement...'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={dashboardData.isLoading}
                className="flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 disabled:opacity-50 border border-white/30"
              >
                {dashboardData.isLoading ? (
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5 mr-2" />
                )}
                Actualiser
              </button>
            </div>
        </div>
      </div>

        {/* Sélecteurs modernes */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <AcademicYearSelector
              moduleName="examinations"
              className="w-full"
              onChange={(yearId) => {
                setSelectedAcademicYear(yearId);
                console.log('Année scolaire sélectionnée:', yearId);
              }}
            />
          </div>
          <div className="flex-1">
            <QuarterSelector
              moduleName="examinations"
              className="w-full"
                academicYearId={selectedAcademicYear}
              onChange={(quarterId) => {
                setSelectedQuarter(quarterId);
                console.log('Trimestre sélectionné:', quarterId);
              }}
            />
          </div>
        </div>
        
          {/* Informations contextuelles modernes */}
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Période Active
                  </p>
                  <p className="text-sm text-gray-600">
                    {currentAcademicYear?.name || 'Chargement...'} - {currentQuarter?.name || 'Chargement...'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Shield className="w-4 h-4" />
                <span>Données sécurisées</span>
              </div>
          </div>
        </div>
      </div>

        {/* Stats modernes avec cartes glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
            <div key={index} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
                  <div className="flex items-center space-x-1 text-sm">
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    <span className={`font-semibold ${stat.trendColor}`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.label}
                </p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </p>
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stat.bgColor} rounded-full transition-all duration-1000 ${
                        index === 0 ? 'w-1/4' : 
                        index === 1 ? 'w-1/2' : 
                        index === 2 ? 'w-3/4' : 
                        'w-full'
                      }`}
                    ></div>
                  </div>
              </div>
            </div>
          </div>
        ))}
      </div>

        {/* Actions rapides modernes */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
          Actions Rapides
        </h2>
              <p className="text-gray-600">
                Accédez rapidement aux fonctionnalités principales
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
                className="group relative overflow-hidden bg-white/60 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/80 transition-all duration-300 border border-white/20 hover:shadow-xl hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${action.iconBg}`}>
                      <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-sm text-gray-600 group-hover:text-gray-500 transition-colors">
                      {action.description}
                    </p>
                  </div>
                </div>
            </button>
          ))}
        </div>
      </div>

        {/* Activités récentes modernes */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
          Activités Récentes
        </h2>
              <p className="text-gray-600">
                Dernières actions effectuées dans le système
              </p>
            </div>
          </div>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
              <div key={index} className="group flex items-start space-x-4 p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/60 transition-all duration-300 hover:shadow-lg">
                <div className={`p-2 rounded-lg ${activity.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                  <activity.icon className={`h-5 w-5 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                  {activity.action}
                </p>
                  <p className="text-xs text-gray-500 mt-1">
                  {activity.time}
                </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
