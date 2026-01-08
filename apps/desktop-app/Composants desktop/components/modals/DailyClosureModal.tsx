import React, { useState, useEffect } from 'react';
import { X, Clock, DollarSign, TrendingUp, Minus, Save, AlertCircle } from 'lucide-react';

interface DailyClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  closure?: any | null;
  isEditMode?: boolean;
  isLoading?: boolean;
}

const DailyClosureModal: React.FC<DailyClosureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  closure,
  isEditMode = false,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    date: '',
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    cashOnHand: 0,
    bankDeposits: 0,
    pendingPayments: 0,
    pendingExpenses: 0,
    notes: '',
    status: 'draft'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (closure && isEditMode) {
        setFormData({
          date: closure.date || '',
          totalIncome: closure.totalIncome || 0,
          totalExpenses: closure.totalExpenses || 0,
          netBalance: closure.netBalance || 0,
          cashOnHand: closure.cashOnHand || 0,
          bankDeposits: closure.bankDeposits || 0,
          pendingPayments: closure.pendingPayments || 0,
          pendingExpenses: closure.pendingExpenses || 0,
          notes: closure.notes || '',
          status: closure.status || 'draft'
        });
      } else {
        // Nouvelle clôture - initialiser avec la date d'aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        setFormData({
          date: today,
          totalIncome: 0,
          totalExpenses: 0,
          netBalance: 0,
          cashOnHand: 0,
          bankDeposits: 0,
          pendingPayments: 0,
          pendingExpenses: 0,
          notes: '',
          status: 'draft'
        });
      }
      setErrors({});
    }
  }, [isOpen, closure, isEditMode]);

  // Calculer automatiquement le solde net
  useEffect(() => {
    const netBalance = formData.totalIncome - formData.totalExpenses;
    setFormData(prev => ({ ...prev, netBalance }));
  }, [formData.totalIncome, formData.totalExpenses]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.date) {
      newErrors.date = 'La date est requise';
    }

    if (formData.totalIncome < 0) {
      newErrors.totalIncome = 'Le montant des recettes ne peut pas être négatif';
    }

    if (formData.totalExpenses < 0) {
      newErrors.totalExpenses = 'Le montant des dépenses ne peut pas être négatif';
    }

    if (formData.cashOnHand < 0) {
      newErrors.cashOnHand = 'Le montant des espèces ne peut pas être négatif';
    }

    if (formData.bankDeposits < 0) {
      newErrors.bankDeposits = 'Le montant des dépôts bancaires ne peut pas être négatif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {isEditMode ? 'Modifier la clôture' : 'Nouvelle clôture journalière'}
                </h2>
                <p className="text-indigo-100 text-sm">
                  {isEditMode ? 'Modifiez les informations de la clôture' : 'Créez une nouvelle clôture journalière'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={isLoading}
              title="Fermer"
              aria-label="Fermer le modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de clôture *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
                title="Date de clôture"
                aria-label="Date de clôture"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isLoading}
                title="Sélectionner le statut"
                aria-label="Statut de la clôture"
              >
                <option value="draft">Brouillon</option>
                <option value="completed">Terminée</option>
                <option value="pending">En attente</option>
              </select>
            </div>
          </div>

          {/* Montants financiers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-indigo-600" />
              Montants financiers
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recettes totales (F CFA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalIncome}
                  onChange={(e) => handleInputChange('totalIncome', parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.totalIncome ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                  title="Montant des recettes totales"
                  aria-label="Recettes totales en F CFA"
                />
                {errors.totalIncome && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.totalIncome}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dépenses totales (F CFA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalExpenses}
                  onChange={(e) => handleInputChange('totalExpenses', parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.totalExpenses ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                  title="Montant des dépenses totales"
                  aria-label="Dépenses totales en F CFA"
                />
                {errors.totalExpenses && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.totalExpenses}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Espèces en caisse (F CFA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cashOnHand}
                  onChange={(e) => handleInputChange('cashOnHand', parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.cashOnHand ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                  title="Montant des espèces en caisse"
                  aria-label="Espèces en caisse en F CFA"
                />
                {errors.cashOnHand && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.cashOnHand}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dépôts bancaires (F CFA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.bankDeposits}
                  onChange={(e) => handleInputChange('bankDeposits', parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.bankDeposits ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                  title="Montant des dépôts bancaires"
                  aria-label="Dépôts bancaires en F CFA"
                />
                {errors.bankDeposits && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.bankDeposits}
                  </p>
                )}
              </div>
            </div>

            {/* Solde net calculé automatiquement */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Solde net calculé:
                </span>
                <span className={`text-2xl font-bold ${
                  formData.netBalance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formData.netBalance.toLocaleString()} F CFA
                </span>
              </div>
            </div>
          </div>

          {/* Paiements et dépenses en attente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-indigo-600" />
              Paiements et dépenses en attente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Paiements en attente (F CFA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pendingPayments}
                  onChange={(e) => handleInputChange('pendingPayments', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={isLoading}
                  title="Montant des paiements en attente"
                  aria-label="Paiements en attente en F CFA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dépenses en attente (F CFA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pendingExpenses}
                  onChange={(e) => handleInputChange('pendingExpenses', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={isLoading}
                  title="Montant des dépenses en attente"
                  aria-label="Dépenses en attente en F CFA"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Ajoutez des notes ou commentaires sur cette clôture..."
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Mettre à jour' : 'Créer la clôture'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailyClosureModal;
