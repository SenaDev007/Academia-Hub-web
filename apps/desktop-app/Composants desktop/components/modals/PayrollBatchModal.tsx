import React, { useState } from 'react';
import FormModal from './FormModal';
import { DollarSign, Save, Calendar, Clock, Download, Upload, FileText, Users } from 'lucide-react';

interface PayrollBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (batchData: any) => void;
}

const PayrollBatchModal: React.FC<PayrollBatchModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    payPeriod: new Date().toISOString().split('T')[0].substring(0, 7), // Format YYYY-MM
    paymentDate: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
    description: '',
    employeeTypes: ['permanent', 'vacataire'],
    departments: [],
    includeAllowances: true,
    includeOvertime: true,
    generateDeclarations: true,
    comments: ''
  });

  // Données fictives pour les départements
  const departmentOptions = [
    { id: 'admin', name: 'Administration' },
    { id: 'teaching', name: 'Enseignement' },
    { id: 'support', name: 'Services de soutien' },
    { id: 'maintenance', name: 'Maintenance' }
  ];

  // Statistiques fictives pour le traitement par lots
  const batchStats = {
    totalEmployees: 65,
    permanentEmployees: 45,
    vacataireEmployees: 20,
    estimatedGrossSalary: 15678000,
    estimatedNetSalary: 12145000,
    estimatedEmployerCost: 18234000
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'departments') {
      // Gestion des sélections multiples pour les départements
      const select = e.target as HTMLSelectElement;
      const selectedOptions = Array.from(select.selectedOptions).map(option => option.value);
      setFormData(prev => ({
        ...prev,
        departments: selectedOptions
      }));
    } else if (name === 'employeeTypes') {
      // Gestion des cases à cocher pour les types d'employés
      const employeeType = value;
      setFormData(prev => ({
        ...prev,
        employeeTypes: checked 
          ? [...prev.employeeTypes, employeeType]
          : prev.employeeTypes.filter(type => type !== employeeType)
      }));
    } else {
      // Gestion des autres champs
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Formatage des montants en F CFA
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Traitement de paie par lot"
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
            form="payroll-batch-form"
            className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Lancer le traitement
          </button>
        </div>
      }
    >
      <form id="payroll-batch-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Période et description
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="payPeriod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Période de paie*
              </label>
              <input
                type="month"
                id="payPeriod"
                name="payPeriod"
                value={formData.payPeriod}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de paiement*
              </label>
              <input
                type="date"
                id="paymentDate"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description du lot*
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Ex: Paie mensuelle Janvier 2024"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        
        {/* Filtres */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Filtres et sélection
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Types d'employés à inclure*
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="employeeTypes-permanent"
                    name="employeeTypes"
                    value="permanent"
                    checked={formData.employeeTypes.includes('permanent')}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label htmlFor="employeeTypes-permanent" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Personnel permanent (CDI, CDD)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="employeeTypes-vacataire"
                    name="employeeTypes"
                    value="vacataire"
                    checked={formData.employeeTypes.includes('vacataire')}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label htmlFor="employeeTypes-vacataire" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Personnel vacataire et contractuel
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="departments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Départements (laisser vide pour tous)
              </label>
              <select
                id="departments"
                name="departments"
                multiple
                value={formData.departments}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                size={4}
              >
                {departmentOptions.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs départements
              </p>
            </div>
          </div>
        </div>
        
        {/* Options */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
            Options de traitement
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeAllowances"
                name="includeAllowances"
                checked={formData.includeAllowances}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="includeAllowances" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Inclure les indemnités et primes
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeOvertime"
                name="includeOvertime"
                checked={formData.includeOvertime}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="includeOvertime" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Inclure les heures supplémentaires
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="generateDeclarations"
                name="generateDeclarations"
                checked={formData.generateDeclarations}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="generateDeclarations" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Générer les déclarations sociales et fiscales
              </label>
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Commentaires
            </label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        
        {/* Résumé */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-900/30">
          <h4 className="text-lg font-medium text-green-900 dark:text-green-300 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Résumé du traitement
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-800 dark:text-green-300">Employés concernés:</span>
                <span className="font-bold text-green-900 dark:text-green-200">{batchStats.totalEmployees}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-green-800 dark:text-green-300">Personnel permanent:</span>
                <span className="font-medium text-green-900 dark:text-green-200">{batchStats.permanentEmployees}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-green-800 dark:text-green-300">Personnel vacataire:</span>
                <span className="font-medium text-green-900 dark:text-green-200">{batchStats.vacataireEmployees}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-800 dark:text-green-300">Masse salariale brute:</span>
                <span className="font-medium text-green-900 dark:text-green-200">{formatAmount(batchStats.estimatedGrossSalary)} F CFA</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-green-800 dark:text-green-300">Salaires nets estimés:</span>
                <span className="font-medium text-green-900 dark:text-green-200">{formatAmount(batchStats.estimatedNetSalary)} F CFA</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-green-800 dark:text-green-300">Coût employeur total:</span>
                <span className="font-medium text-green-900 dark:text-green-200">{formatAmount(batchStats.estimatedEmployerCost)} F CFA</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              Aperçu détaillé
            </button>
            
            <button
              type="button"
              className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter simulation
            </button>
          </div>
        </div>
      </form>
    </FormModal>
  );
};

export default PayrollBatchModal;