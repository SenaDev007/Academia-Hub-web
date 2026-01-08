import React, { useState } from 'react';
import FormModal from './FormModal';
import { Settings, Save, DollarSign, Calculator, Shield, Calendar } from 'lucide-react';

interface PayrollSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  currentSettings?: any;
}

const PayrollSettingsModal: React.FC<PayrollSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings
}) => {
  const [settings, setSettings] = useState({
    // Paramètres généraux
    payrollCycle: currentSettings?.payrollCycle || 'monthly',
    paymentDay: currentSettings?.paymentDay || 25,
    currency: currentSettings?.currency || 'XOF',
    
    // Paramètres CNSS
    cnssSalaryRate: currentSettings?.cnssSalaryRate || 3.6,
    cnssEmployerRate: currentSettings?.cnssEmployerRate || 16.4,
    cnssCeiling: currentSettings?.cnssCeiling || 1000000,
    
    // Paramètres fiscaux
    irppEnabled: currentSettings?.irppEnabled || true,
    professionalTrainingTax: currentSettings?.professionalTrainingTax || 1.2,
    
    // Paramètres de calcul
    workingDaysPerMonth: currentSettings?.workingDaysPerMonth || 22,
    workingHoursPerWeek: currentSettings?.workingHoursPerWeek || 40,
    overtimeRate1: currentSettings?.overtimeRate1 || 1.15,
    overtimeRate2: currentSettings?.overtimeRate2 || 1.5,
    overtimeRate3: currentSettings?.overtimeRate3 || 2,
    
    // Paramètres d'affichage
    showEmployerContributions: currentSettings?.showEmployerContributions || true,
    showPayrollHistory: currentSettings?.showPayrollHistory || true,
    showTaxDetails: currentSettings?.showTaxDetails || true,
    
    // Paramètres de notification
    emailNotifications: currentSettings?.emailNotifications || true,
    smsNotifications: currentSettings?.smsNotifications || false,
    reminderDays: currentSettings?.reminderDays || 3
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Paramètres de paie"
      size="lg"
      footer={
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="payroll-settings-form"
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </button>
        </div>
      }
    >
      <form id="payroll-settings-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Paramètres généraux */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Paramètres généraux
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="payrollCycle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cycle de paie
              </label>
              <select
                id="payrollCycle"
                name="payrollCycle"
                value={settings.payrollCycle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="monthly">Mensuel</option>
                <option value="biweekly">Bimensuel</option>
                <option value="weekly">Hebdomadaire</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="paymentDay" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Jour de paiement (mensuel)
              </label>
              <input
                type="number"
                id="paymentDay"
                name="paymentDay"
                value={settings.paymentDay}
                onChange={handleChange}
                min="1"
                max="31"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Devise
              </label>
              <select
                id="currency"
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="XOF">F CFA (XOF)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="USD">Dollar US (USD)</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Paramètres CNSS et fiscaux */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            Paramètres CNSS et fiscaux
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cnssSalaryRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Taux CNSS salarié (%)
              </label>
              <input
                type="number"
                id="cnssSalaryRate"
                name="cnssSalaryRate"
                value={settings.cnssSalaryRate}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="cnssEmployerRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Taux CNSS employeur (%)
              </label>
              <input
                type="number"
                id="cnssEmployerRate"
                name="cnssEmployerRate"
                value={settings.cnssEmployerRate}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="cnssCeiling" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Plafond CNSS (F CFA)
              </label>
              <input
                type="number"
                id="cnssCeiling"
                name="cnssCeiling"
                value={settings.cnssCeiling}
                onChange={handleChange}
                min="0"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="professionalTrainingTax" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Taxe de Formation Professionnelle (%)
              </label>
              <input
                type="number"
                id="professionalTrainingTax"
                name="professionalTrainingTax"
                value={settings.professionalTrainingTax}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="irppEnabled"
                name="irppEnabled"
                checked={settings.irppEnabled}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="irppEnabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Activer le calcul automatique de l'IRPP
              </label>
            </div>
          </div>
          
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Ces paramètres sont basés sur la réglementation béninoise en vigueur. Veuillez les mettre à jour en cas de changement législatif.
            </p>
          </div>
        </div>
        
        {/* Paramètres de calcul */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Calculator className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Paramètres de calcul
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="workingDaysPerMonth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Jours ouvrables par mois
              </label>
              <input
                type="number"
                id="workingDaysPerMonth"
                name="workingDaysPerMonth"
                value={settings.workingDaysPerMonth}
                onChange={handleChange}
                min="20"
                max="26"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="workingHoursPerWeek" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heures de travail par semaine
              </label>
              <input
                type="number"
                id="workingHoursPerWeek"
                name="workingHoursPerWeek"
                value={settings.workingHoursPerWeek}
                onChange={handleChange}
                min="35"
                max="48"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="overtimeRate1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Taux heures sup. (jour)
              </label>
              <input
                type="number"
                id="overtimeRate1"
                name="overtimeRate1"
                value={settings.overtimeRate1}
                onChange={handleChange}
                min="1"
                step="0.05"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="overtimeRate2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Taux heures sup. (nuit)
              </label>
              <input
                type="number"
                id="overtimeRate2"
                name="overtimeRate2"
                value={settings.overtimeRate2}
                onChange={handleChange}
                min="1"
                step="0.05"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="overtimeRate3" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Taux heures sup. (jours fériés)
              </label>
              <input
                type="number"
                id="overtimeRate3"
                name="overtimeRate3"
                value={settings.overtimeRate3}
                onChange={handleChange}
                min="1"
                step="0.05"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
        
        {/* Paramètres d'affichage et notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
            Affichage et notifications
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showEmployerContributions"
                  name="showEmployerContributions"
                  checked={settings.showEmployerContributions}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="showEmployerContributions" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Afficher les contributions employeur
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showPayrollHistory"
                  name="showPayrollHistory"
                  checked={settings.showPayrollHistory}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="showPayrollHistory" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Afficher l'historique de paie
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showTaxDetails"
                  name="showTaxDetails"
                  checked={settings.showTaxDetails}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="showTaxDetails" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Afficher les détails fiscaux
                </label>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Notifications par email
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smsNotifications"
                  name="smsNotifications"
                  checked={settings.smsNotifications}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="smsNotifications" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Notifications par SMS
                </label>
              </div>
              
              <div>
                <label htmlFor="reminderDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Jours de rappel avant échéance
                </label>
                <input
                  type="number"
                  id="reminderDays"
                  name="reminderDays"
                  value={settings.reminderDays}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormModal>
  );
};

export default PayrollSettingsModal;