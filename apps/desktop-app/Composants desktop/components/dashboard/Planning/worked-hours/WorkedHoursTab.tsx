import React, { useState, useMemo, useEffect } from 'react';
import { 
  Clock, 
  Users, 
  BarChart3, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  Settings,
  Plus,
  Filter,
  Download,
  TrendingUp,
  CheckCircle,
  X
} from 'lucide-react';
import { PlanningTeacher, PlanningClass, PlanningSubject } from '../../../../types/planning';
import TimeTrackingView from './TimeTrackingView';
import ConsolidationView from './ConsolidationView';
import PayrollReportsView from './PayrollReportsView';
import AlertsView from './AlertsView';
import { WorkedHoursEntryModal } from '../../../modals';

export type WorkedHoursView = 'tracking' | 'consolidation' | 'reports' | 'alerts';

interface WorkedHoursTabProps {
  teachers: PlanningTeacher[];
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  allEmployees?: any[]; // Tous les employés (enseignants + personnel)
  workedHours?: any[];
  workedHoursLoading?: boolean;
  workedHoursError?: string | null;
  onSaveWorkedHours: (data: any) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const WorkedHoursTab: React.FC<WorkedHoursTabProps> = ({
  teachers,
  classes,
  subjects,
  allEmployees,
  workedHours = [],
  workedHoursLoading = false,
  workedHoursError = null,
  onSaveWorkedHours,
  loading: externalLoading = false,
  error: externalError = null
}) => {
  const [activeView, setActiveView] = useState<WorkedHoursView>('tracking');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [isManualEntryModalOpen, setIsManualEntryModalOpen] = useState(false);

  // États locaux pour les autres données
  const [summaries, setSummaries] = useState<any[]>([]);
  const [payrollReports, setPayrollReports] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({});

  // Combinaison des états de chargement et d'erreur
  const loading = externalLoading || workedHoursLoading;
  const error = externalError || workedHoursError;
  
  // Log des données reçues
  useEffect(() => {
    console.log('🔍 WorkedHoursTab - Données reçues:');
    console.log('  - workedHours:', workedHours);
    console.log('  - workedHours.length:', workedHours.length, 'entrées');
    console.log('  - workedHoursLoading:', workedHoursLoading);
    console.log('  - workedHoursError:', workedHoursError);
  }, [workedHours, workedHoursLoading, workedHoursError]);
  

  // Statistiques calculées à partir des vraies données
  const stats = useMemo(() => {
    const totalScheduled = workedHours.reduce((sum, entry) => sum + entry.scheduledHours, 0);
    const totalValidated = workedHours.reduce((sum, entry) => sum + entry.validatedHours, 0);
    const totalOvertime = workedHours.reduce((sum, entry) => 
      sum + Math.max(0, entry.validatedHours - entry.scheduledHours), 0);
    const totalAbsences = workedHours.reduce((sum, entry) => 
      sum + Math.max(0, entry.scheduledHours - entry.validatedHours), 0);

    return {
      totalScheduled,
      totalValidated,
      totalOvertime,
      totalAbsences,
      completionRate: totalScheduled > 0 ? Math.round((totalValidated / totalScheduled) * 100) : 0,
      activeAlerts: alerts.filter(alert => !alert.isResolved).length
    };
  }, [workedHours, alerts]);

  const navigationViews = [
    {
      id: 'tracking' as WorkedHoursView,
      name: 'Saisie & Validation',
      description: 'Enregistrer et valider les heures travaillées',
      icon: Clock,
      color: 'from-blue-600 to-indigo-700',
    },
    {
      id: 'consolidation' as WorkedHoursView,
      name: 'Consolidation',
      description: 'Vues journalières, hebdomadaires et mensuelles',
      icon: BarChart3,
      color: 'from-green-600 to-emerald-700',
    },
    {
      id: 'reports' as WorkedHoursView,
      name: 'Rapports Paie',
      description: 'Génération et envoi des rapports de paie',
      icon: FileText,
      color: 'from-purple-600 to-violet-700',
    },
    {
      id: 'alerts' as WorkedHoursView,
      name: 'Alertes & Contrôles',
      description: 'Surveillance des anomalies et dépassements',
      icon: AlertTriangle,
      color: 'from-orange-600 to-red-700',
    }
  ];

  const handleSaveWorkedHours = async (data: any) => {
    try {
      await onSaveWorkedHours(data);
    } catch (error) {
      console.error('Erreur lors de la gestion des heures travaillées:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h2 className="text-3xl font-bold mb-2">Heures Travaillées</h2>
              <p className="text-slate-100 text-lg">Suivi et gestion du temps de travail des enseignants</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsManualEntryModalOpen(true)}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Saisie manuelle
              </button>
              <button
                onClick={() => {/* TODO: Ouvrir modal d'export */}}
                className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                <Download className="w-5 h-5 mr-2" />
                Exporter
              </button>
            </div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Heures Prévues</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalScheduled}h</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Heures Validées</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalValidated}h</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Heures Supplémentaires</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.totalOvertime}h</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Alertes Actives</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.activeAlerts}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation des vues */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
        <nav className="flex space-x-1" role="tablist">
          {navigationViews.map((view) => {
            const Icon = view.icon;
            const isActive = activeView === view.id;

            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`
                  flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-slate-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
                role="tab"
                aria-selected={isActive ? 'true' : 'false'}
                title={view.description}
              >
                <Icon className="w-4 h-4 mr-2" />
                {view.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des vues */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
          <p className="ml-3 text-gray-600 dark:text-gray-400">Chargement des données...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600 dark:text-red-400">
          <X className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div className="content-area">
          {activeView === 'tracking' && (
            <TimeTrackingView
              teachers={teachers}
              classes={classes}
              subjects={subjects}
              allEmployees={allEmployees}
              workedHours={workedHours}
              onSave={handleSaveWorkedHours}
            />
          )}

          {activeView === 'consolidation' && (
            <ConsolidationView
              teachers={teachers}
              workedHours={workedHours}
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          )}

          {activeView === 'reports' && (
            <PayrollReportsView
              teachers={teachers}
              workedHours={workedHours}
              payrollReports={payrollReports}
              onGenerateReport={() => console.log('Génération de rapport')}
              onSendToPayroll={() => console.log('Envoi à la paie')}
            />
          )}

          {activeView === 'alerts' && (
            <AlertsView
              alerts={alerts}
              onResolveAlert={(alertId) => console.log('Résolution d\'alerte:', alertId)}
            />
          )}
        </div>
      )}

      {/* Modal de saisie manuelle */}
      {isManualEntryModalOpen && (
        <WorkedHoursEntryModal
          isOpen={isManualEntryModalOpen}
          onClose={() => setIsManualEntryModalOpen(false)}
          onSave={async (data) => {
            await createWorkedHoursEntry(data);
            setIsManualEntryModalOpen(false);
          }}
          teachers={teachers}
          classes={classes}
          subjects={subjects}
          allEmployees={allEmployees}
        />
      )}
    </div>
  );
};

export default WorkedHoursTab;
