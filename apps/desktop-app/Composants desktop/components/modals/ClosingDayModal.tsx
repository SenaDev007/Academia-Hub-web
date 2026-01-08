import React, { useState } from 'react';
import FormModal from './FormModal';
import { Calculator, Save, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface ClosingDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (closingData: any) => void;
  closingData?: any;
}

const ClosingDayModal: React.FC<ClosingDayModalProps> = ({
  isOpen,
  onClose,
  onSave,
  closingData
}) => {
  // Données fictives pour la clôture de journée
  const defaultData = {
    date: new Date().toISOString().split('T')[0],
    totalIncome: closingData?.totalIncome || 4250,
    totalExpenses: closingData?.totalExpenses || 1890,
    netBalance: closingData?.netBalance || 2360,
    cashBalance: closingData?.cashBalance || 1200,
    bankBalance: closingData?.bankBalance || 45230,
    status: closingData?.status || 'open',
    notes: closingData?.notes || '',
    cashCount: {
      bills10000: closingData?.cashCount?.bills10000 || 0,
      bills5000: closingData?.cashCount?.bills5000 || 0,
      bills2000: closingData?.cashCount?.bills2000 || 0,
      bills1000: closingData?.cashCount?.bills1000 || 0,
      coins500: closingData?.cashCount?.coins500 || 0,
      coins100: closingData?.cashCount?.coins100 || 0,
      coins50: closingData?.cashCount?.coins50 || 0,
      coins25: closingData?.cashCount?.coins25 || 0,
      coins10: closingData?.cashCount?.coins10 || 0,
      coins5: closingData?.cashCount?.coins5 || 0
    },
    hasDiscrepancy: closingData?.hasDiscrepancy || false,
    discrepancyAmount: closingData?.discrepancyAmount || 0,
    discrepancyReason: closingData?.discrepancyReason || ''
  };

  const [formData, setFormData] = useState(defaultData);
  const [isReconciling, setIsReconciling] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('cashCount.')) {
      const cashCountField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        cashCount: {
          ...prev.cashCount,
          [cashCountField]: type === 'number' ? parseInt(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const calculateCashTotal = () => {
    const { bills10000, bills5000, bills2000, bills1000, coins500, coins100, coins50, coins25, coins10, coins5 } = formData.cashCount;
    return (
      bills10000 * 10000 +
      bills5000 * 5000 +
      bills2000 * 2000 +
      bills1000 * 1000 +
      coins500 * 500 +
      coins100 * 100 +
      coins50 * 50 +
      coins25 * 25 +
      coins10 * 10 +
      coins5 * 5
    );
  };

  const calculateDiscrepancy = () => {
    const countedCash = calculateCashTotal();
    const reportedCash = formData.cashBalance;
    return countedCash - reportedCash;
  };

  const handleReconcile = () => {
    setIsReconciling(true);
    const discrepancy = calculateDiscrepancy();
    
    setFormData(prev => ({
      ...prev,
      hasDiscrepancy: discrepancy !== 0,
      discrepancyAmount: discrepancy
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculer le solde net
    const netBalance = formData.totalIncome - formData.totalExpenses;
    
    onSave({
      ...formData,
      netBalance,
      status: 'closed'
    });
    onClose();
  };

  // Formatage des montants en F CFA
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Clôture de journée"
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
            form="closing-day-form"
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Clôturer la journée
          </button>
        </div>
      }
    >
      <form id="closing-day-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Résumé de la journée */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Calculator className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Résumé de la journée
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date*
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Statut
              </label>
              <input
                type="text"
                id="status"
                value={formData.status === 'open' ? 'Ouvert' : 'Clôturé'}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="totalIncome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total encaissements (F CFA)*
              </label>
              <input
                type="number"
                id="totalIncome"
                name="totalIncome"
                value={formData.totalIncome}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="totalExpenses" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total dépenses (F CFA)*
              </label>
              <input
                type="number"
                id="totalExpenses"
                name="totalExpenses"
                value={formData.totalExpenses}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="cashBalance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Solde caisse (F CFA)*
              </label>
              <input
                type="number"
                id="cashBalance"
                name="cashBalance"
                value={formData.cashBalance}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="bankBalance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Solde bancaire (F CFA)*
              </label>
              <input
                type="number"
                id="bankBalance"
                name="bankBalance"
                value={formData.bankBalance}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
        
        {/* Comptage de caisse */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
              Comptage de caisse
            </h4>
            
            <button
              type="button"
              onClick={handleReconcile}
              className="px-3 py-1 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 flex items-center text-sm"
            >
              <Calculator className="w-4 h-4 mr-1" />
              Réconcilier
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label htmlFor="cashCount.bills10000" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Billets 10 000
              </label>
              <input
                type="number"
                id="cashCount.bills10000"
                name="cashCount.bills10000"
                value={formData.cashCount.bills10000}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="cashCount.bills5000" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Billets 5 000
              </label>
              <input
                type="number"
                id="cashCount.bills5000"
                name="cashCount.bills5000"
                value={formData.cashCount.bills5000}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="cashCount.bills2000" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Billets 2 000
              </label>
              <input
                type="number"
                id="cashCount.bills2000"
                name="cashCount.bills2000"
                value={formData.cashCount.bills2000}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="cashCount.bills1000" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Billets 1 000
              </label>
              <input
                type="number"
                id="cashCount.bills1000"
                name="cashCount.bills1000"
                value={formData.cashCount.bills1000}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="cashCount.coins500" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pièces 500
              </label>
              <input
                type="number"
                id="cashCount.coins500"
                name="cashCount.coins500"
                value={formData.cashCount.coins500}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="cashCount.coins100" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pièces 100
              </label>
              <input
                type="number"
                id="cashCount.coins100"
                name="cashCount.coins100"
                value={formData.cashCount.coins100}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="cashCount.coins50" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pièces 50
              </label>
              <input
                type="number"
                id="cashCount.coins50"
                name="cashCount.coins50"
                value={formData.cashCount.coins50}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="cashCount.coins25" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pièces 25
              </label>
              <input
                type="number"
                id="cashCount.coins25"
                name="cashCount.coins25"
                value={formData.cashCount.coins25}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="cashCount.coins10" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pièces 10
              </label>
              <input
                type="number"
                id="cashCount.coins10"
                name="cashCount.coins10"
                value={formData.cashCount.coins10}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="cashCount.coins5" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pièces 5
              </label>
              <input
                type="number"
                id="cashCount.coins5"
                name="cashCount.coins5"
                value={formData.cashCount.coins5}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          
          {isReconciling && (
            <div className="mt-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">Total compté:</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{formatAmount(calculateCashTotal())} F CFA</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">Solde caisse déclaré:</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{formatAmount(formData.cashBalance)} F CFA</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300">Écart:</span>
                <span className={`font-bold ${calculateDiscrepancy() === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatAmount(calculateDiscrepancy())} F CFA
                </span>
              </div>
              
              {calculateDiscrepancy() !== 0 && (
                <div className="mt-3">
                  <label htmlFor="discrepancyReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Raison de l'écart
                  </label>
                  <textarea
                    id="discrepancyReason"
                    name="discrepancyReason"
                    value={formData.discrepancyReason}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Expliquez la raison de l'écart..."
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Notes de clôture
          </h4>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Notes sur la journée, événements particuliers, etc."
            />
          </div>
        </div>
        
        {/* Récapitulatif */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-900/30">
          <h4 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Récapitulatif de clôture
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Date:</span>
                <span className="font-bold text-blue-900 dark:text-blue-200">{formData.date}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Total encaissements:</span>
                <span className="font-medium text-green-600 dark:text-green-400">+{formatAmount(formData.totalIncome)} F CFA</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Total dépenses:</span>
                <span className="font-medium text-red-600 dark:text-red-400">-{formatAmount(formData.totalExpenses)} F CFA</span>
              </div>
              
              <div className="pt-2 border-t border-blue-200 dark:border-blue-800 flex justify-between">
                <span className="font-semibold text-blue-800 dark:text-blue-300">Solde net:</span>
                <span className="font-bold text-blue-900 dark:text-blue-200">
                  {formatAmount(formData.totalIncome - formData.totalExpenses)} F CFA
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Caisse physique:</span>
                <span className="font-medium text-blue-900 dark:text-blue-200">{formatAmount(formData.cashBalance)} F CFA</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Solde bancaire:</span>
                <span className="font-medium text-blue-900 dark:text-blue-200">{formatAmount(formData.bankBalance)} F CFA</span>
              </div>
              
              {isReconciling && calculateDiscrepancy() !== 0 && (
                <div className="flex justify-between">
                  <span className="text-blue-800 dark:text-blue-300">Écart de caisse:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{formatAmount(calculateDiscrepancy())} F CFA</span>
                </div>
              )}
              
              <div className="pt-2 border-t border-blue-200 dark:border-blue-800 flex justify-between">
                <span className="font-semibold text-blue-800 dark:text-blue-300">Total trésorerie:</span>
                <span className="font-bold text-blue-900 dark:text-blue-200">
                  {formatAmount(formData.cashBalance + formData.bankBalance)} F CFA
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h5 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">Attention</h5>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  La clôture de journée est une opération définitive. Une fois validée, vous ne pourrez plus modifier les transactions de cette journée.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormModal>
  );
};

export default ClosingDayModal;