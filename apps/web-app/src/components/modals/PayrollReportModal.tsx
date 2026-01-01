import React, { useState, useEffect } from 'react';
import { FileText, Download, Send, CheckCircle, AlertTriangle, X, Calendar, User, DollarSign } from 'lucide-react';
import { PayrollReport } from '../../types/planning';

interface PayrollReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: PayrollReport) => Promise<void>;
  onExport: (reportId: string, format: 'pdf' | 'excel' | 'csv') => Promise<void>;
  onSend: (reportId: string) => Promise<void>;
  report?: PayrollReport | null;
  employeeId?: string;
  period?: string;
}

const PayrollReportModal: React.FC<PayrollReportModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onExport,
  onSend,
  report,
  employeeId,
  period
}) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    periodStart: '',
    periodEnd: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    baseSalary: 0,
    hourlyRate: 0,
    totalHoursWorked: 0,
    regularHours: 0,
    overtimeHours: 0,
    overtimeRate: 1.5,
    overtimePay: 0,
    housingAllowance: 0,
    transportAllowance: 0,
    fixedBonuses: 0,
    performanceBonus: 0,
    otherAllowances: 0,
    totalAllowances: 0,
    grossSalary: 0,
    grossOvertime: 0,
    totalGrossPay: 0,
    cnssEmployee: 0,
    cnssEmployer: 0,
    irpp: 0,
    advanceDeduction: 0,
    otherDeductions: 0,
    totalDeductions: 0,
    netPay: 0,
    status: 'draft' as 'draft' | 'calculated' | 'approved' | 'paid',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Initialiser les données du formulaire
  useEffect(() => {
    if (report) {
      setFormData({
        employeeId: report.employeeId,
        employeeName: report.employeeName,
        periodStart: report.periodStart,
        periodEnd: report.periodEnd,
        year: report.year,
        month: report.month,
        baseSalary: report.baseSalary || 0,
        hourlyRate: report.hourlyRate || 0,
        totalHoursWorked: report.totalHoursWorked || 0,
        regularHours: report.regularHours || 0,
        overtimeHours: report.overtimeHours || 0,
        overtimeRate: report.overtimeRate || 1.5,
        overtimePay: report.overtimePay || 0,
        housingAllowance: report.housingAllowance || 0,
        transportAllowance: report.transportAllowance || 0,
        fixedBonuses: report.fixedBonuses || 0,
        performanceBonus: report.performanceBonus || 0,
        otherAllowances: report.otherAllowances || 0,
        totalAllowances: report.totalAllowances || 0,
        grossSalary: report.grossSalary || 0,
        grossOvertime: report.grossOvertime || 0,
        totalGrossPay: report.totalGrossPay || 0,
        cnssEmployee: report.cnssEmployee || 0,
        cnssEmployer: report.cnssEmployer || 0,
        irpp: report.irpp || 0,
        advanceDeduction: report.advanceDeduction || 0,
        otherDeductions: report.otherDeductions || 0,
        totalDeductions: report.totalDeductions || 0,
        netPay: report.netPay || 0,
        status: report.status,
        notes: report.notes || ''
      });
    } else if (employeeId && period) {
      // Nouveau rapport
      setFormData(prev => ({
        ...prev,
        employeeId,
        periodStart: period,
        periodEnd: period,
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
      }));
    }
  }, [report, employeeId, period]);

  // Calculer automatiquement les montants
  useEffect(() => {
    const overtimePay = formData.overtimeHours * formData.hourlyRate * formData.overtimeRate;
    const totalAllowances = formData.housingAllowance + formData.transportAllowance + 
                           formData.fixedBonuses + formData.performanceBonus + formData.otherAllowances;
    const grossSalary = formData.regularHours * formData.hourlyRate;
    const totalGrossPay = grossSalary + overtimePay + totalAllowances;
    
    // Calculs des déductions (exemples)
    const cnssEmployee = totalGrossPay * 0.05; // 5% CNSS employé
    const cnssEmployer = totalGrossPay * 0.08; // 8% CNSS employeur
    const irpp = Math.max(0, (totalGrossPay - 50000) * 0.1); // IRPP simplifié
    const totalDeductions = cnssEmployee + irpp + formData.advanceDeduction + formData.otherDeductions;
    const netPay = totalGrossPay - totalDeductions;

      setFormData(prev => ({
        ...prev,
      overtimePay,
      totalAllowances,
      grossSalary,
      totalGrossPay,
      cnssEmployee,
      cnssEmployer,
      irpp,
      totalDeductions,
      netPay
    }));
  }, [
    formData.overtimeHours, formData.hourlyRate, formData.overtimeRate,
    formData.regularHours, formData.housingAllowance, formData.transportAllowance,
    formData.fixedBonuses, formData.performanceBonus, formData.otherAllowances,
    formData.advanceDeduction, formData.otherDeductions
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const reportData: PayrollReport = {
        id: report?.id || `payroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        contractId: report?.contractId || '',
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        position: report?.position || '',
        periodStart: formData.periodStart,
        periodEnd: formData.periodEnd,
        year: formData.year,
        month: formData.month,
        baseSalary: formData.baseSalary,
        hourlyRate: formData.hourlyRate,
        totalHoursWorked: formData.totalHoursWorked,
        regularHours: formData.regularHours,
        overtimeHours: formData.overtimeHours,
        overtimeRate: formData.overtimeRate,
        overtimePay: formData.overtimePay,
        housingAllowance: formData.housingAllowance,
        transportAllowance: formData.transportAllowance,
        fixedBonuses: formData.fixedBonuses,
        performanceBonus: formData.performanceBonus,
        otherAllowances: formData.otherAllowances,
        totalAllowances: formData.totalAllowances,
        grossSalary: formData.grossSalary,
        grossOvertime: formData.overtimePay,
        totalGrossPay: formData.totalGrossPay,
        cnssEmployee: formData.cnssEmployee,
        cnssEmployer: formData.cnssEmployer,
        irpp: formData.irpp,
        advanceDeduction: formData.advanceDeduction,
        otherDeductions: formData.otherDeductions,
        totalDeductions: formData.totalDeductions,
        netPay: formData.netPay,
        status: formData.status,
        calculatedAt: report?.calculatedAt || new Date().toISOString(),
        calculatedBy: report?.calculatedBy || 'Système',
        approvedAt: report?.approvedAt,
        approvedBy: report?.approvedBy,
        paidAt: report?.paidAt,
        paidBy: report?.paidBy,
        paymentMethod: report?.paymentMethod,
        bankAccount: report?.bankAccount,
        mobileMoneyAccount: report?.mobileMoneyAccount,
        notes: formData.notes,
        schoolId: report?.schoolId || 'school-1',
        createdAt: report?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSave(reportData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!report?.id) return;
    
    setIsExporting(true);
    try {
      await onExport(report.id, format);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSend = async () => {
    if (!report?.id) return;
    
    setIsSending(true);
    try {
      await onSend(report.id);
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {report ? 'Rapport de paie' : 'Nouveau rapport de paie'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {report ? 'Modifiez les détails du rapport' : 'Créez un nouveau rapport de paie'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Employé
              </label>
              <input
                type="text"
                value={formData.employeeName}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Nom de l'employé"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Période
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={formData.periodStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, periodStart: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="date"
                  value={formData.periodEnd}
                  onChange={(e) => setFormData(prev => ({ ...prev, periodEnd: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          {/* Heures travaillées */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              Heures travaillées
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total heures
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={formData.totalHoursWorked}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalHoursWorked: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Heures normales
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={formData.regularHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, regularHours: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Heures supplémentaires
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={formData.overtimeHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, overtimeHours: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
            </div>
          </div>
        </div>
        
          {/* Rémunération */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-500" />
              Rémunération
          </h4>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Salaire de base
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData(prev => ({ ...prev, baseSalary: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Taux horaire
              </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            {/* Allocations */}
            <div className="mt-4">
              <h5 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Allocations</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Allocation logement
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.housingAllowance}
                    onChange={(e) => setFormData(prev => ({ ...prev, housingAllowance: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Allocation transport
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.transportAllowance}
                    onChange={(e) => setFormData(prev => ({ ...prev, transportAllowance: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              </div>
          </div>

          {/* Résumé des calculs */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Résumé des calculs</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Salaire brut:</span>
                  <span className="font-medium">{formData.grossSalary.toFixed(2)} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span>Heures sup:</span>
                  <span className="font-medium">{formData.overtimePay.toFixed(2)} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span>Allocations:</span>
                  <span className="font-medium">{formData.totalAllowances.toFixed(2)} FCFA</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total brut:</span>
                  <span className="text-green-600">{formData.totalGrossPay.toFixed(2)} FCFA</span>
          </div>
        </div>
        
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>CNSS employé:</span>
                  <span className="font-medium">{formData.cnssEmployee.toFixed(2)} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span>IRPP:</span>
                  <span className="font-medium">{formData.irpp.toFixed(2)} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span>Autres déductions:</span>
                  <span className="font-medium">{formData.otherDeductions.toFixed(2)} FCFA</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total déductions:</span>
                  <span className="text-red-600">{formData.totalDeductions.toFixed(2)} FCFA</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex justify-between text-xl font-bold">
                <span>Net à payer:</span>
                <span className="text-green-600">{formData.netPay.toFixed(2)} FCFA</span>
            </div>
          </div>
        </div>
        
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
              </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Notes optionnelles..."
            />
        </div>
        
          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              {report && (
                <>
                  <button
                    type="button"
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport('excel')}
                    disabled={isExporting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={isSending}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Envoyer</span>
                  </button>
                </>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>{report ? 'Modifier' : 'Créer'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
          </div>
        </div>
  );
};

export default PayrollReportModal;