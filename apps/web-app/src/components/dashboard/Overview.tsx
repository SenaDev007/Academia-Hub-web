import React from 'react';
import { useAcademicYearState } from '../../hooks/useAcademicYearState';
import { useDashboardData } from '../../hooks/useDashboardData';
import AcademicYearSelector from '../common/AcademicYearSelector';
import { 
  Users, 
  GraduationCap, 
  TrendingUp, 
  DollarSign,
  Calendar,
  BookOpen,
  MessageSquare,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';

const Overview: React.FC = () => {
  // Gestion de l'année scolaire
  const { selectedAcademicYear, setSelectedAcademicYear } = useAcademicYearState('overview');
  
  // Données du dashboard
  const {
    stats: dashboardStats,
    recentActivities,
    upcomingEvents,
    loading: dashboardLoading,
    error: dashboardError,
    refreshData
  } = useDashboardData();

  // Formatage des statistiques
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const stats = [
    {
      title: 'Total Élèves',
      value: formatNumber(dashboardStats.totalStudents),
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-600 to-blue-700',
      loading: dashboardLoading
    },
    {
      title: 'Revenus du mois',
      value: formatCurrency(dashboardStats.monthlyRevenue),
      change: '+8%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-600 to-green-700',
      loading: dashboardLoading
    },
    {
      title: 'Taux de réussite',
      value: `${dashboardStats.successRate}%`,
      change: '+3%',
      trend: 'up',
      icon: Award,
      color: 'from-purple-600 to-purple-700',
      loading: dashboardLoading
    },
    {
      title: 'Enseignants actifs',
      value: formatNumber(dashboardStats.activeTeachers),
      change: '+2',
      trend: 'up',
      icon: GraduationCap,
      color: 'from-orange-600 to-orange-700',
      loading: dashboardLoading
    }
  ];

  // Gestion des erreurs
  if (dashboardError) {
    console.error('Erreur du dashboard:', dashboardError);
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold mb-2">Tableau de Bord</h1>
              <p className="text-blue-100">
                Aperçu général de votre établissement scolaire
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Sélecteur d'année scolaire */}
              <AcademicYearSelector
                value={selectedAcademicYear}
                onChange={setSelectedAcademicYear}
                className="w-full sm:w-auto min-w-[200px]"
                labelColor="white"
              />
              
              <button 
                onClick={refreshData}
                disabled={dashboardLoading}
                className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dashboardLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="w-4 h-4 mr-2" />
                )}
                {dashboardLoading ? 'Chargement...' : 'Actualiser'}
              </button>
            </div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full"></div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.loading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stat.value}</span>
                )}
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{stat.title}</h4>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                Activités récentes
              </h2>
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors">
                Voir tout
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {dashboardLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                <span className="ml-2 text-gray-500">Chargement des activités...</span>
              </div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 border border-gray-100 dark:border-gray-700">
                  <div className={`p-3 rounded-xl shadow-sm ${
                    activity.status === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                    activity.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    activity.status === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {activity.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
                    {activity.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
                    {activity.status === 'error' && <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                    {activity.status === 'info' && <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {activity.time}
                    </p>
                    {activity.amount && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                        {formatCurrency(activity.amount)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucune activité récente</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                Événements à venir
              </h2>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Prochains</span>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {dashboardLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                <span className="ml-2 text-gray-500">Chargement des événements...</span>
              </div>
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 rounded-xl border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 hover:shadow-md transition-all duration-200">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{event.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {event.date} à {event.time}
                  </p>
                  {event.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{event.description}</p>
                  )}
                  {event.location && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                      {event.location}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucun événement à venir</p>
              </div>
            )}
          </div>
          
          <button className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
            Voir le calendrier complet
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            Actions rapides
          </h2>
        </div>
        
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group shadow-sm hover:shadow-md">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-300">Nouvel élève</span>
          </button>
          
          <button className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 group shadow-sm hover:shadow-md">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-300">Encaissement</span>
          </button>
          
          <button className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 group shadow-sm hover:shadow-md">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300">Saisir notes</span>
          </button>
          
          <button className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 group shadow-sm hover:shadow-md">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-700 dark:group-hover:text-orange-300">Message parents</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overview;