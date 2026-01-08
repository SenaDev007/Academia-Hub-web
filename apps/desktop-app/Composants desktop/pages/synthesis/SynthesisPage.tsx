/**
 * ============================================================================
 * SYNTHESIS PAGE - PAGE DE BILANS ET SYNTHÈSE
 * ============================================================================
 * 
 * Page principale pour les bilans et la synthèse :
 * - Bilans par module
 * - Bilan général
 * - KPI globaux
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  TrendingUp, 
  Calculator, 
  Users, 
  Building, 
  BookOpen,
  MessageSquare,
  UserCheck,
  BarChart3,
  PieChart,
  DollarSign,
  GraduationCap,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useSchoolLevel } from '../../contexts/SchoolLevelContext';
import { useTenant } from '../../contexts/TenantContext';
import { api } from '../../lib/api/client';
import { SchoolLevelSelector } from '../../components/school-level/SchoolLevelSelector';

interface FinancialSummary {
  total_revenue: number;
  total_expenses: number;
  net_balance: number;
  payment_count: number;
  expense_count: number;
}

interface EffectifsSummary {
  total_students: number;
  active_students: number;
  total_teachers: number;
  active_teachers: number;
  total_classes: number;
  student_teacher_ratio: number | null;
  student_class_ratio: number | null;
}

interface KPIGlobal {
  total_students_all_levels: number;
  active_students_all_levels: number;
  total_teachers_all_levels: number;
  total_revenue_all_levels: number;
  total_expenses_all_levels: number;
  net_balance_all_levels: number;
  active_school_levels_count: number;
}

export const SynthesisPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedSchoolLevelId, selectedSchoolLevel } = useSchoolLevel();
  const { tenantId } = useTenant();
  
  const [activeTab, setActiveTab] = useState<'general' | 'by-module' | 'by-level'>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Données
  const [kpiGlobal, setKpiGlobal] = useState<KPIGlobal | null>(null);
  const [financesByModule, setFinancesByModule] = useState<any[]>([]);
  const [financesByLevel, setFinancesByLevel] = useState<any[]>([]);
  const [effectifsByLevel, setEffectifsByLevel] = useState<EffectifsSummary[]>([]);
  const [dashboardData, setDashboardData] = useState<any[]>([]);

  // Récupérer schoolLevelId depuis les query params ou le contexte
  const schoolLevelId = searchParams.get('schoolLevelId') || selectedSchoolLevelId;

  // Charger les données
  const loadData = async () => {
    if (!tenantId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Charger KPI global (tous niveaux)
      const kpiResponse = await api.synthesis?.getKPIGlobal?.();
      if (kpiResponse?.data) {
        setKpiGlobal(kpiResponse.data);
      }

      // Charger les données selon l'onglet actif
      if (activeTab === 'general') {
        // Bilan général : KPI globaux (déjà chargé)
      } else if (activeTab === 'by-module' && schoolLevelId) {
        // Bilans par module
        const financesModuleResponse = await api.synthesis?.getFinancesByModule?.(schoolLevelId);
        if (financesModuleResponse?.data) {
          setFinancesByModule(Array.isArray(financesModuleResponse.data) ? financesModuleResponse.data : []);
        }
      } else if (activeTab === 'by-level') {
        // Bilans par niveau
        const financesLevelResponse = await api.synthesis?.getFinancesByLevel?.();
        if (financesLevelResponse?.data) {
          setFinancesByLevel(Array.isArray(financesLevelResponse.data) ? financesLevelResponse.data : []);
        }

        const effectifsResponse = await api.synthesis?.getEffectifsByLevel?.();
        if (effectifsResponse?.data) {
          setEffectifsByLevel(Array.isArray(effectifsResponse.data) ? effectifsResponse.data : []);
        }

        if (schoolLevelId) {
          const dashboardResponse = await api.synthesis?.getDashboardWithKPI?.(schoolLevelId);
          if (dashboardResponse?.data) {
            setDashboardData(Array.isArray(dashboardResponse.data) ? dashboardResponse.data : []);
          }
        }
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des données:', err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenantId, activeTab, schoolLevelId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return 'N/A';
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                Bilans & Synthèse
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Vue globale des performances par niveau et par module
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {/* Sélecteur de niveau scolaire */}
          <div className="mb-6">
            <SchoolLevelSelector />
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              {[
                { id: 'general', label: 'Bilan Général', icon: BarChart3 },
                { id: 'by-module', label: 'Bilans par Module', icon: PieChart },
                { id: 'by-level', label: 'Bilans par Niveau', icon: GraduationCap },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <>
            {/* Bilan Général */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                {kpiGlobal ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Élèves (Tous niveaux)
                          </h3>
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {formatNumber(kpiGlobal.total_students_all_levels)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {formatNumber(kpiGlobal.active_students_all_levels)} actifs
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Enseignants (Tous niveaux)
                          </h3>
                          <UserCheck className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {formatNumber(kpiGlobal.total_teachers_all_levels)}
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Revenus Totaux
                          </h3>
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(kpiGlobal.total_revenue_all_levels)}
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Dépenses Totales
                          </h3>
                          <Calculator className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(kpiGlobal.total_expenses_all_levels)}
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Solde Net
                          </h3>
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className={`text-3xl font-bold ${
                          kpiGlobal.net_balance_all_levels >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {formatCurrency(kpiGlobal.net_balance_all_levels)}
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Niveaux Actifs
                          </h3>
                          <GraduationCap className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {formatNumber(kpiGlobal.active_school_levels_count)}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
            )}

            {/* Bilans par Module */}
            {activeTab === 'by-module' && (
              <div className="space-y-6">
                {!schoolLevelId ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                    <p className="text-yellow-800 dark:text-yellow-200">
                      Veuillez sélectionner un niveau scolaire pour voir les bilans par module
                    </p>
                  </div>
                ) : financesByModule.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {financesByModule.map((module, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {module.module_name}
                          </h3>
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded">
                            {module.module_type}
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Revenus</div>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(module.total_revenue)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Dépenses</div>
                            <div className="text-2xl font-bold text-red-600">
                              {formatCurrency(module.total_expenses)}
                            </div>
                          </div>
                          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Solde Net</div>
                            <div className={`text-2xl font-bold ${
                              module.net_balance >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(module.net_balance)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    Aucune donnée disponible pour ce niveau
                  </div>
                )}
              </div>
            )}

            {/* Bilans par Niveau */}
            {activeTab === 'by-level' && (
              <div className="space-y-6">
                {financesByLevel.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {financesByLevel.map((level, index) => {
                      const effectifs = effectifsByLevel.find(e => e.school_level_id === level.school_level_id);
                      const dashboard = dashboardData.find(d => d.school_level_id === level.school_level_id);
                      
                      return (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              {level.school_level_name}
                            </h3>
                            <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded">
                              {level.school_level_type}
                            </span>
                          </div>

                          {/* Finances */}
                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                              Finances
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Revenus</div>
                                <div className="text-lg font-bold text-green-600">
                                  {formatCurrency(level.total_revenue)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Dépenses</div>
                                <div className="text-lg font-bold text-red-600">
                                  {formatCurrency(level.total_expenses)}
                                </div>
                              </div>
                              <div className="col-span-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <div className="text-xs text-gray-600 dark:text-gray-400">Solde Net</div>
                                <div className={`text-xl font-bold ${
                                  level.net_balance >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {formatCurrency(level.net_balance)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Effectifs */}
                          {effectifs && (
                            <div className="mb-6">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Effectifs
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">Élèves</div>
                                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {formatNumber(effectifs.active_students)} / {formatNumber(effectifs.total_students)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">Enseignants</div>
                                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {formatNumber(effectifs.active_teachers)} / {formatNumber(effectifs.total_teachers)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">Classes</div>
                                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {formatNumber(effectifs.total_classes)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">Ratio É/T</div>
                                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {effectifs.student_teacher_ratio ? effectifs.student_teacher_ratio.toFixed(1) : 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* KPI Additionnels */}
                          {dashboard && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                KPI
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                {dashboard.revenue_per_student && (
                                  <div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Revenus/Élève</div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                                      {formatCurrency(dashboard.revenue_per_student)}
                                    </div>
                                  </div>
                                )}
                                {dashboard.class_occupancy_rate && (
                                  <div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Taux Remplissage</div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                                      {dashboard.class_occupancy_rate.toFixed(1)}%
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

