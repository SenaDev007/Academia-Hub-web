import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, TrendingUp, AlertTriangle, CheckCircle, 
  XCircle, Play, Pause, BarChart3, Calculator, Users 
} from 'lucide-react';
import { Contract } from '../../services/hrService';
import { planningService, WorkSchedule, TimeTracking, ContractHoursAnalysis } from '../../services/planningService';

interface ContractPlanningIntegrationProps {
  contract: Contract;
  onClose: () => void;
}

const ContractPlanningIntegration: React.FC<ContractPlanningIntegrationProps> = ({ contract, onClose }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'tracking' | 'analysis'>('schedule');
  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([]);
  const [timeTracking, setTimeTracking] = useState<TimeTracking[]>([]);
  const [hoursAnalysis, setHoursAnalysis] = useState<ContractHoursAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadPlanningData();
  }, [contract.id, selectedPeriod]);

  const loadPlanningData = async () => {
    setLoading(true);
    try {
      // Charger les plannings
      const schedules = await planningService.getWorkSchedules({
        contractId: contract.id,
        dateFrom: selectedPeriod.start,
        dateTo: selectedPeriod.end
      });
      setWorkSchedules(schedules);

      // Charger le suivi du temps
      const tracking = await planningService.getTimeTracking({
        contractId: contract.id,
        dateFrom: selectedPeriod.start,
        dateTo: selectedPeriod.end
      });
      setTimeTracking(tracking);

      // Charger l'analyse des heures
      const analysis = await planningService.getContractHoursAnalysis(
        contract.id,
        selectedPeriod.start,
        selectedPeriod.end
      );
      setHoursAnalysis(analysis);
    } catch (error) {
      console.error('Erreur lors du chargement des données de planning:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'late': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return Calendar;
      case 'in_progress': return Play;
      case 'completed': return CheckCircle;
      case 'absent': return XCircle;
      case 'late': return AlertTriangle;
      default: return Clock;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '--:--';
    return timeString;
  };

  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h${minutes > 0 ? minutes.toString().padStart(2, '0') : ''}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Intégration Planning</h2>
                <p className="text-indigo-100">{contract.employeeName} - {contract.position}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Période de sélection */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Période d'analyse
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={selectedPeriod.start}
                    onChange={(e) => setSelectedPeriod(prev => ({ ...prev, start: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <span className="flex items-center text-gray-500">à</span>
                  <input
                    type="date"
                    value={selectedPeriod.end}
                    onChange={(e) => setSelectedPeriod(prev => ({ ...prev, end: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <button
                onClick={loadPlanningData}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Chargement...' : 'Actualiser'}
              </button>
            </div>
          </div>

          {/* Navigation des onglets */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <nav className="flex space-x-8 px-6 py-4" aria-label="Tabs">
              {[
                { id: 'schedule', name: 'Planning', icon: Calendar },
                { id: 'tracking', name: 'Suivi', icon: Clock },
                { id: 'analysis', name: 'Analyse', icon: BarChart3 }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="p-6">
            {/* Onglet Planning */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Planning des heures ({workSchedules.length} journées)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workSchedules.map((schedule) => {
                    const StatusIcon = getStatusIcon(schedule.status);
                    return (
                      <div
                        key={schedule.id}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="w-5 h-5 text-gray-500" />
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {new Date(schedule.date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                            {schedule.status === 'planned' ? 'Planifié' :
                             schedule.status === 'in_progress' ? 'En cours' :
                             schedule.status === 'completed' ? 'Terminé' :
                             schedule.status === 'absent' ? 'Absent' :
                             schedule.status === 'late' ? 'En retard' : schedule.status}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Heures planifiées:</span>
                            <span className="font-medium">{formatHours(schedule.plannedHours)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Heures effectuées:</span>
                            <span className="font-medium">{formatHours(schedule.actualHours)}</span>
                          </div>
                          {schedule.overtimeHours > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Heures sup:</span>
                              <span className="font-medium text-orange-600">{formatHours(schedule.overtimeHours)}</span>
                            </div>
                          )}
                          {schedule.startTime && schedule.endTime && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Horaires:</span>
                              <span className="font-medium">
                                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                              </span>
                            </div>
                          )}
                          {schedule.location && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Lieu:</span>
                              <span className="font-medium">{schedule.location}</span>
                            </div>
                          )}
                          {schedule.isRemote && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                              Télétravail
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Onglet Suivi */}
            {activeTab === 'tracking' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Suivi détaillé du temps ({timeTracking.length} enregistrements)
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Arrivée
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Départ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Heures sup
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {timeTracking.map((track) => (
                        <tr key={track.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {new Date(track.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatTime(track.checkInTime || '')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatTime(track.checkOutTime || '')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {formatHours(track.totalHours)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                            {formatHours(track.overtimeHours)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-1">
                              {track.isLate && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                                  Retard
                                </span>
                              )}
                              {track.isAbsent && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                                  Absent
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Onglet Analyse */}
            {activeTab === 'analysis' && hoursAnalysis && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Analyse des heures et calculs de paie
                  </h3>
                </div>

                {/* Statistiques générales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center">
                      <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Heures planifiées</p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                          {formatHours(hoursAnalysis.totalPlannedHours)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-center">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Heures effectuées</p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                          {formatHours(hoursAnalysis.totalActualHours)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center">
                      <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Heures supplémentaires</p>
                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                          {formatHours(hoursAnalysis.totalOvertimeHours)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center">
                      <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Taux d'efficacité</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                          {hoursAnalysis.efficiencyRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculs de paie */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center mb-4">
                    <Calculator className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mr-2" />
                    <h4 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Calculs de paie</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-emerald-700 dark:text-emerald-300">Salaire de base:</span>
                        <span className="font-medium text-emerald-900 dark:text-emerald-100">
                          {formatCurrency(hoursAnalysis.basePay)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-700 dark:text-emerald-300">Heures supplémentaires:</span>
                        <span className="font-medium text-emerald-900 dark:text-emerald-100">
                          {formatCurrency(hoursAnalysis.overtimePay)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-emerald-200 dark:border-emerald-700 pt-2">
                        <span className="font-semibold text-emerald-800 dark:text-emerald-200">Total brut:</span>
                        <span className="font-bold text-emerald-900 dark:text-emerald-100">
                          {formatCurrency(hoursAnalysis.totalGrossPay)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-emerald-700 dark:text-emerald-300">Déductions:</span>
                        <span className="font-medium text-emerald-900 dark:text-emerald-100">
                          {formatCurrency(hoursAnalysis.deductions)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-emerald-200 dark:border-emerald-700 pt-2">
                        <span className="font-semibold text-emerald-800 dark:text-emerald-200">Net à payer:</span>
                        <span className="font-bold text-emerald-900 dark:text-emerald-100">
                          {formatCurrency(hoursAnalysis.netPay)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistiques de présence */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                      <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Jours travaillés</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {hoursAnalysis.totalWorkingDays}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                      <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Jours d'absence</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {hoursAnalysis.totalAbsentDays}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                      <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Jours de retard</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {hoursAnalysis.totalLateDays}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPlanningIntegration;
