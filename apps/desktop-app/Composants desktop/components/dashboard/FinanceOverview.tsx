import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard, 
  FileText, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Eye,
  Plus,
  Settings,
  Wallet,
  Calculator,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  Star,
  Award,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie, Legend } from 'recharts';

interface FinanceOverviewProps {
  // Données des paiements
  payments: any[];
  paymentsLoading: boolean;
  calculatedTuitionTotals: {
    totalExpected: number;
    totalPaid: number;
    totalRemaining: number;
  };
  
  // Données des dépenses
  expenses: any[];
  expensesLoading: boolean;
  calculateApprovedExpensesTotal: number;
  
  // Données des recettes
  revenues: any[];
  revenuesLoading: boolean;
  
  // Données de paie
  payroll: any[];
  payrollLoading: boolean;
  
  // Données de trésorerie
  treasuryStats: any;
  treasuryLoading: boolean;
  
  // Données de clôture journalière
  dailyClosures: any[];
  dailyClosureLoading: boolean;
  
  // Configuration des frais
  feeConfigurations: any[];
  feeConfigurationsLoading: boolean;
  
  // Classes
  classes: any[];
  classesLoading: boolean;
  
  // Fonctions de navigation
  onNavigateToTab: (tabId: string) => void;
  onNewPayment: () => void;
  onNewExpense: () => void;
  onNewRevenue: () => void;
  onNewPayroll: () => void;
}

const FinanceOverview: React.FC<FinanceOverviewProps> = ({
  payments,
  paymentsLoading,
  calculatedTuitionTotals,
  expenses,
  expensesLoading,
  calculateApprovedExpensesTotal,
  revenues,
  revenuesLoading,
  payroll,
  payrollLoading,
  treasuryStats,
  treasuryLoading,
  dailyClosures,
  dailyClosureLoading,
  feeConfigurations,
  feeConfigurationsLoading,
  classes,
  classesLoading,
  onNavigateToTab,
  onNewPayment,
  onNewExpense,
  onNewRevenue,
  onNewPayroll
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Formatage des montants
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Calculs des statistiques
  const stats = {
    // Revenus totaux
    totalRevenue: calculatedTuitionTotals.totalPaid + (revenues?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0),
    
    // Dépenses totales
    totalExpenses: calculateApprovedExpensesTotal,
    
    // Solde net
    netBalance: (calculatedTuitionTotals.totalPaid + (revenues?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0)) - calculateApprovedExpensesTotal,
    
    // Masse salariale
    totalPayroll: payroll?.reduce((sum, p) => sum + (p.netSalary || 0), 0) || 0,
    
    // Paiements en attente
    pendingPayments: payments?.filter(p => p.status === 'pending').length || 0,
    
    // Dépenses en attente
    pendingExpenses: expenses?.filter(e => e.status === 'pending').length || 0,
    
    // Paies en attente
    pendingPayroll: payroll?.filter(p => p.status === 'draft').length || 0,
    
    // Taux de collecte
    collectionRate: calculatedTuitionTotals.totalExpected > 0 
      ? Math.round((calculatedTuitionTotals.totalPaid / calculatedTuitionTotals.totalExpected) * 100)
      : 0
  };

  // Données pour les graphiques
  const chartData = [
    { name: 'Jan', revenue: 1200000, expenses: 800000, payroll: 600000 },
    { name: 'Fév', revenue: 1500000, expenses: 900000, payroll: 650000 },
    { name: 'Mar', revenue: 1800000, expenses: 1000000, payroll: 700000 },
    { name: 'Avr', revenue: 1600000, expenses: 850000, payroll: 680000 },
    { name: 'Mai', revenue: 2000000, expenses: 1100000, payroll: 750000 },
    { name: 'Juin', revenue: 2200000, expenses: 1200000, payroll: 800000 }
  ];

  const pieData = [
    { name: 'Scolarité', value: calculatedTuitionTotals.totalPaid, color: '#10B981' },
    { name: 'Autres revenus', value: revenues?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0, color: '#3B82F6' },
    { name: 'Dépenses', value: calculateApprovedExpensesTotal, color: '#EF4444' },
    { name: 'Masse salariale', value: stats.totalPayroll, color: '#F59E0B' }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simuler un refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color, 
    trend, 
    trendValue, 
    onClick,
    loading = false 
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ComponentType<any>;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    onClick?: () => void;
    loading?: boolean;
  }) => (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group ${onClick ? 'hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && trendValue && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
            trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : 
             trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : 
             <Activity className="w-3 h-3" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {loading ? (
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Chargement...</span>
            </div>
          ) : (
            value
          )}
        </h3>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
      </div>
      
      {onClick && (
        <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
          <span>Voir détails</span>
          <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </div>
      )}
    </div>
  );

  const QuickActionCard = ({ 
    title, 
    description, 
    icon: Icon, 
    color, 
    onClick 
  }: {
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    color: string;
    onClick: () => void;
  }) => (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header avec actions rapides */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Vue d'ensemble Financière</h1>
              <p className="text-blue-100 text-lg">
                Tableau de bord complet de la gestion financière de l'établissement
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl px-4 py-2 focus:ring-2 focus:ring-white/50 focus:border-transparent"
              >
                <option value="week" className="text-gray-900">Cette semaine</option>
                <option value="month" className="text-gray-900">Ce mois</option>
                <option value="quarter" className="text-gray-900">Ce trimestre</option>
                <option value="year" className="text-gray-900">Cette année</option>
              </select>
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl px-4 py-2 hover:bg-white/30 transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Actions rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionCard
              title="Nouvel Encaissement"
              description="Enregistrer un paiement"
              icon={CreditCard}
              color="bg-green-500"
              onClick={onNewPayment}
            />
            <QuickActionCard
              title="Nouvelle Dépense"
              description="Ajouter une dépense"
              icon={FileText}
              color="bg-red-500"
              onClick={onNewExpense}
            />
            <QuickActionCard
              title="Nouvelle Recette"
              description="Enregistrer une recette"
              icon={DollarSign}
              color="bg-blue-500"
              onClick={onNewRevenue}
            />
            <QuickActionCard
              title="Gestion Paie"
              description="Créer une paie"
              icon={Calculator}
              color="bg-purple-500"
              onClick={onNewPayroll}
            />
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenus Totaux"
          value={`${formatAmount(stats.totalRevenue)} F CFA`}
          subtitle="Scolarité + Autres revenus"
          icon={TrendingUp}
          color="bg-gradient-to-br from-green-500 to-green-600"
          trend="up"
          trendValue="+12%"
          onClick={() => onNavigateToTab('payments')}
          loading={paymentsLoading || revenuesLoading}
        />
        
        <StatCard
          title="Dépenses Totales"
          value={`${formatAmount(stats.totalExpenses)} F CFA`}
          subtitle="Dépenses approuvées"
          icon={TrendingDown}
          color="bg-gradient-to-br from-red-500 to-red-600"
          trend="down"
          trendValue="-5%"
          onClick={() => onNavigateToTab('expenses')}
          loading={expensesLoading}
        />
        
        <StatCard
          title="Solde Net"
          value={`${formatAmount(stats.netBalance)} F CFA`}
          subtitle="Revenus - Dépenses"
          icon={Wallet}
          color={stats.netBalance >= 0 ? "bg-gradient-to-br from-blue-500 to-blue-600" : "bg-gradient-to-br from-orange-500 to-orange-600"}
          trend={stats.netBalance >= 0 ? "up" : "down"}
          trendValue={stats.netBalance >= 0 ? "Positif" : "Négatif"}
          onClick={() => onNavigateToTab('treasury')}
          loading={treasuryLoading}
        />
        
        <StatCard
          title="Masse Salariale"
          value={`${formatAmount(stats.totalPayroll)} F CFA`}
          subtitle="Total des salaires"
          icon={Users}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          trend="up"
          trendValue="+8%"
          onClick={() => onNavigateToTab('payroll')}
          loading={payrollLoading}
        />
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Évolution des flux financiers */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Évolution des Flux</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Revenus, dépenses et masse salariale</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Revenus</span>
              <div className="w-3 h-3 bg-red-500 rounded-full ml-4"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Dépenses</span>
              <div className="w-3 h-3 bg-purple-500 rounded-full ml-4"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Paie</span>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: any) => [`${formatAmount(value)} F CFA`, '']}
                  labelFormatter={(label) => `Mois: ${label}`}
                />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="expenses" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                <Area type="monotone" dataKey="payroll" stackId="3" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition des flux */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Répartition des Flux</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Distribution des revenus et dépenses</p>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${formatAmount(value)} F CFA`, '']} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Indicateurs de performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-blue-600">{stats.collectionRate}%</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Taux de Collecte</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Efficacité de collecte des frais</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-orange-600">{stats.pendingPayments + stats.pendingExpenses + stats.pendingPayroll}</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">En Attente</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Opérations en cours de traitement</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-green-600">
              {feeConfigurations?.length || 0}
            </span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Configurations</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Frais configurés</p>
        </div>
      </div>

      {/* Navigation rapide vers les modules */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Modules Financiers</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
            onClick={() => onNavigateToTab('payments')}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                Encaissements
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {payments?.length || 0} paiements enregistrés
              </p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
          </div>

          <div 
            className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
            onClick={() => onNavigateToTab('expenses')}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                Dépenses
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {expenses?.length || 0} dépenses enregistrées
              </p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
          </div>

          <div 
            className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
            onClick={() => onNavigateToTab('revenues')}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Recettes
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {revenues?.length || 0} recettes enregistrées
              </p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
          </div>

          <div 
            className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
            onClick={() => onNavigateToTab('payroll')}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Gestion de la Paie
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {payroll?.length || 0} bulletins de paie
              </p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
          </div>

          <div 
            className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
            onClick={() => onNavigateToTab('treasury')}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Trésorerie
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestion des flux de trésorerie
              </p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
          </div>

          <div 
            className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
            onClick={() => onNavigateToTab('daily-closure')}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Clôture Journalière
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {dailyClosures?.length || 0} clôtures effectuées
              </p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-teal-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceOverview;
