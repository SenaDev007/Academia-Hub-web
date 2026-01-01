import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Calculator, FileText, TrendingUp, CheckCircle, 
  AlertTriangle, Download, Eye, Edit, Calendar, Users, BarChart3 
} from 'lucide-react';
import { Contract } from '../../services/hrService';
import { payrollService, Payroll, PayrollCalculation } from '../../services/payrollService';

interface ContractFinanceIntegrationProps {
  contract: Contract;
  onClose: () => void;
}

const ContractFinanceIntegration: React.FC<ContractFinanceIntegrationProps> = ({ contract, onClose }) => {
  const [activeTab, setActiveTab] = useState<'payroll' | 'calculation' | 'reports'>('payroll');
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [currentCalculation, setCurrentCalculation] = useState<PayrollCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  useEffect(() => {
    loadPayrollData();
  }, [contract.id, selectedPeriod]);

  const loadPayrollData = async () => {
    setLoading(true);
    try {
      // Charger les paies existantes
      const payrollsData = await payrollService.getPayroll({
        contractId: contract.id,
        year: selectedPeriod.year,
        month: selectedPeriod.month
      });
      setPayrolls(payrollsData);

      // Charger le calcul actuel
      const calculation = await payrollService.calculatePayroll(
        contract.id,
        selectedPeriod.year,
        selectedPeriod.month
      );
      if (calculation.success) {
        setCurrentCalculation(calculation.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de paie:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayroll = async () => {
    setLoading(true);
    try {
      const result = await payrollService.calculatePayroll(
        contract.id,
        selectedPeriod.year,
        selectedPeriod.month
      );
      
      if (result.success && result.data) {
        const payrollData = {
          ...result.data,
          employeeName: result.data.employeeName,
          position: contract.position,
          status: 'calculated',
          calculatedAt: new Date().toISOString(),
          calculatedBy: 'user',
          schoolId: contract.schoolId
        };

        const createResult = await payrollService.createPayroll(payrollData);
        if (createResult.success) {
          await loadPayrollData();
        }
      }
    } catch (error) {
      console.error('Erreur lors de la génération de la paie:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return payrollService.getStatusColor(status);
  };

  const getStatusLabel = (status: string) => {
    return payrollService.getStatusLabel(status);
  };

  const formatCurrency = (amount: number) => {
    return payrollService.formatCurrency(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month - 1];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Intégration Finance</h2>
                <p className="text-emerald-100">{contract.employeeName} - {contract.position}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <AlertTriangle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Période de sélection */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Période de paie
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={selectedPeriod.month}
                      onChange={(e) => setSelectedPeriod(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {getMonthName(i + 1)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedPeriod.year}
                      onChange={(e) => setSelectedPeriod(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - 2 + i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <button
                  onClick={loadPayrollData}
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Chargement...' : 'Actualiser'}
                </button>
              </div>
              <button
                onClick={handleGeneratePayroll}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Générer la paie
              </button>
            </div>
          </div>

          {/* Navigation des onglets */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <nav className="flex space-x-8 px-6 py-4" aria-label="Tabs">
              {[
                { id: 'payroll', name: 'Paies', icon: DollarSign },
                { id: 'calculation', name: 'Calcul', icon: Calculator },
                { id: 'reports', name: 'Rapports', icon: BarChart3 }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
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
            {/* Onglet Paies */}
            {activeTab === 'payroll' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Paies générées ({payrolls.length})
                  </h3>
                </div>

                {payrolls.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Aucune paie générée
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Aucune paie n'a été générée pour cette période.
                    </p>
                    <button
                      onClick={handleGeneratePayroll}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Générer la première paie
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {payrolls.map((payroll) => (
                      <div
                        key={payroll.id}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {getMonthName(payroll.month)} {payroll.year}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(payroll.periodStart)} - {formatDate(payroll.periodEnd)}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payroll.status)}`}>
                            {getStatusLabel(payroll.status)}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Salaire brut:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {formatCurrency(payroll.totalGrossPay)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Déductions:</span>
                            <span className="font-medium text-red-600">
                              -{formatCurrency(payroll.totalDeductions)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Net à payer:</span>
                            <span className="font-bold text-emerald-600">
                              {formatCurrency(payroll.netPay)}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-4">
                          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Onglet Calcul */}
            {activeTab === 'calculation' && currentCalculation && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Calcul de paie - {getMonthName(selectedPeriod.month)} {selectedPeriod.year}
                  </h3>
                </div>

                {/* Résumé du calcul */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center">
                      <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Heures travaillées</p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                          {currentCalculation.totalHoursWorked.toFixed(1)}h
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-center">
                      <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Salaire brut</p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                          {formatCurrency(currentCalculation.totalGrossPay)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                    <div className="flex items-center">
                      <TrendingUp className="w-8 h-8 text-red-600 dark:text-red-400" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">Déductions</p>
                        <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                          {formatCurrency(currentCalculation.totalDeductions)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center">
                      <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Net à payer</p>
                        <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                          {formatCurrency(currentCalculation.netPay)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Détail du calcul */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Rémunération */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Rémunération
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Salaire de base:</span>
                        <span className="font-medium">{formatCurrency(currentCalculation.grossSalary)}</span>
                      </div>
                      {currentCalculation.overtimePay > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Heures supplémentaires:</span>
                          <span className="font-medium">{formatCurrency(currentCalculation.overtimePay)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Avantages:</span>
                        <span className="font-medium">{formatCurrency(currentCalculation.totalAllowances)}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                        <span className="font-semibold">Total brut:</span>
                        <span className="font-bold">{formatCurrency(currentCalculation.totalGrossPay)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Déductions */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Déductions
                    </h4>
                    <div className="space-y-3">
                      {currentCalculation.cnssEmployee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">CNSS employé:</span>
                          <span className="font-medium">{formatCurrency(currentCalculation.cnssEmployee)}</span>
                        </div>
                      )}
                      {currentCalculation.irpp > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">IRPP:</span>
                          <span className="font-medium">{formatCurrency(currentCalculation.irpp)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                        <span className="font-semibold">Total déductions:</span>
                        <span className="font-bold text-red-600">{formatCurrency(currentCalculation.totalDeductions)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Rapports */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Rapports de paie
                  </h3>
                </div>

                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Rapports en développement
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Les rapports de paie seront disponibles prochainement.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractFinanceIntegration;
