import React, { useState } from 'react';
import FormModal from './FormModal';
import { FileText, Download, Calendar, Building, Send, Check, AlertTriangle } from 'lucide-react';

interface PayrollDeclarationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (declarationOptions: any) => void;
}

const PayrollDeclarationModal: React.FC<PayrollDeclarationModalProps> = ({
  isOpen,
  onClose,
  onGenerate
}) => {
  const [formData, setFormData] = useState({
    declarationType: 'cnss',
    period: 'month',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    quarter: Math.floor(new Date().getMonth() / 3) + 1,
    includeAllEmployees: true,
    includePermanent: true,
    includeVacataire: true,
    generatePaymentSlip: true,
    electronicSubmission: true,
    comments: ''
  });

  // Données fictives pour les statistiques de déclaration
  const declarationStats = {
    cnss: {
      totalEmployees: 65,
      totalGrossSalary: 15678000,
      employeeContribution: 564408,
      employerContribution: 2571192,
      totalContribution: 3135600
    },
    irpp: {
      totalEmployees: 65,
      totalTaxableIncome: 15113592, // Salaire brut - CNSS employé
      totalTax: 1208000
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'includeAllEmployees') {
      // Si on sélectionne "Tous les employés", on coche aussi les sous-catégories
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        includePermanent: checked,
        includeVacataire: checked
      }));
    } else if (name === 'includePermanent' || name === 'includeVacataire') {
      // Si on décoche une sous-catégorie, on décoche aussi "Tous les employés"
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        includeAllEmployees: checked && (
          (name === 'includePermanent' && prev.includeVacataire) || 
          (name === 'includeVacataire' && prev.includePermanent)
        )
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
    onGenerate(formData);
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Générer une déclaration sociale ou fiscale"
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
            form="payroll-declaration-form"
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Générer la déclaration
          </button>
        </div>
      }
    >
      <form id="payroll-declaration-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Type de déclaration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Type de déclaration
          </h4>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="declarationType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sélectionner le type de déclaration*
              </label>
              <select
                id="declarationType"
                name="declarationType"
                value={formData.declarationType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="cnss">Déclaration CNSS</option>
                <option value="irpp">Déclaration IRPP</option>
                <option value="tcs">Taxe sur les Salaires (TCS)</option>
                <option value="fp">Taxe de Formation Professionnelle</option>
              </select>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Information</h5>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {formData.declarationType === 'cnss' && "La déclaration CNSS doit être soumise mensuellement à la Caisse Nationale de Sécurité Sociale avant le 15 du mois suivant."}
                {formData.declarationType === 'irpp' && "La déclaration IRPP doit être soumise mensuellement à la Direction Générale des Impôts avant le 10 du mois suivant."}
                {formData.declarationType === 'tcs' && "La Taxe sur les Salaires (TCS) doit être déclarée mensuellement à la Direction Générale des Impôts."}
                {formData.declarationType === 'fp' && "La Taxe de Formation Professionnelle (1,2% de la masse salariale) doit être déclarée mensuellement."}
              </p>
            </div>
          </div>
        </div>
        
        {/* Période */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            Période de déclaration
          </h4>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type de période*
              </label>
              <select
                id="period"
                name="period"
                value={formData.period}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="month">Mensuelle</option>
                <option value="quarter">Trimestrielle</option>
                <option value="year">Annuelle</option>
              </select>
            </div>
            
            {formData.period === 'month' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mois*
                  </label>
                  <select
                    id="month"
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="1">Janvier</option>
                    <option value="2">Février</option>
                    <option value="3">Mars</option>
                    <option value="4">Avril</option>
                    <option value="5">Mai</option>
                    <option value="6">Juin</option>
                    <option value="7">Juillet</option>
                    <option value="8">Août</option>
                    <option value="9">Septembre</option>
                    <option value="10">Octobre</option>
                    <option value="11">Novembre</option>
                    <option value="12">Décembre</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Année*
                  </label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
              </div>
            )}
            
            {formData.period === 'quarter' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quarter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trimestre*
                  </label>
                  <select
                    id="quarter"
                    name="quarter"
                    value={formData.quarter}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="1">1er trimestre (Jan-Mar)</option>
                    <option value="2">2ème trimestre (Avr-Juin)</option>
                    <option value="3">3ème trimestre (Juil-Sep)</option>
                    <option value="4">4ème trimestre (Oct-Déc)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Année*
                  </label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
              </div>
            )}
            
            {formData.period === 'year' && (
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Année*
                </label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            )}
          </div>
        </div>
        
        {/* Filtres */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Employés à inclure
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeAllEmployees"
                name="includeAllEmployees"
                checked={formData.includeAllEmployees}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="includeAllEmployees" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Tous les employés
              </label>
            </div>
            
            <div className="ml-6 space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includePermanent"
                  name="includePermanent"
                  checked={formData.includePermanent}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="includePermanent" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Personnel permanent (CDI, CDD)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeVacataire"
                  name="includeVacataire"
                  checked={formData.includeVacataire}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="includeVacataire" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Personnel vacataire et contractuel
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Options */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
            Options de déclaration
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="generatePaymentSlip"
                name="generatePaymentSlip"
                checked={formData.generatePaymentSlip}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="generatePaymentSlip" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Générer le bordereau de paiement
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="electronicSubmission"
                name="electronicSubmission"
                checked={formData.electronicSubmission}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="electronicSubmission" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Préparer pour soumission électronique
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
            <Check className="w-5 h-5 mr-2" />
            Résumé de la déclaration
          </h4>
          
          {formData.declarationType === 'cnss' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-800 dark:text-green-300">Employés concernés:</span>
                  <span className="font-bold text-green-900 dark:text-green-200">{declarationStats.cnss.totalEmployees}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-green-800 dark:text-green-300">Masse salariale brute:</span>
                  <span className="font-medium text-green-900 dark:text-green-200">{formatAmount(declarationStats.cnss.totalGrossSalary)} F CFA</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-800 dark:text-green-300">Cotisation salariale (3,6%):</span>
                  <span className="font-medium text-green-900 dark:text-green-200">{formatAmount(declarationStats.cnss.employeeContribution)} F CFA</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-green-800 dark:text-green-300">Cotisation patronale (16,4%):</span>
                  <span className="font-medium text-green-900 dark:text-green-200">{formatAmount(declarationStats.cnss.employerContribution)} F CFA</span>
                </div>
                
                <div className="pt-2 border-t border-green-200 dark:border-green-800 flex justify-between">
                  <span className="font-semibold text-green-800 dark:text-green-300">Total à payer:</span>
                  <span className="font-bold text-lg text-green-900 dark:text-green-200">{formatAmount(declarationStats.cnss.totalContribution)} F CFA</span>
                </div>
              </div>
            </div>
          )}
          
          {formData.declarationType === 'irpp' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-800 dark:text-green-300">Employés concernés:</span>
                  <span className="font-bold text-green-900 dark:text-green-200">{declarationStats.irpp.totalEmployees}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-green-800 dark:text-green-300">Revenu imposable total:</span>
                  <span className="font-medium text-green-900 dark:text-green-200">{formatAmount(declarationStats.irpp.totalTaxableIncome)} F CFA</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-800 dark:text-green-300">IRPP total:</span>
                  <span className="font-medium text-green-900 dark:text-green-200">{formatAmount(declarationStats.irpp.totalTax)} F CFA</span>
                </div>
                
                <div className="pt-2 border-t border-green-200 dark:border-green-800 flex justify-between">
                  <span className="font-semibold text-green-800 dark:text-green-300">Total à verser à la DGI:</span>
                  <span className="font-bold text-lg text-green-900 dark:text-green-200">{formatAmount(declarationStats.irpp.totalTax)} F CFA</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h5 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">Rappel important</h5>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  {formData.declarationType === 'cnss' && "La déclaration CNSS doit être soumise avant le 15 du mois suivant. Tout retard entraîne des pénalités."}
                  {formData.declarationType === 'irpp' && "La déclaration IRPP doit être soumise avant le 10 du mois suivant. Tout retard entraîne des pénalités."}
                  {formData.declarationType === 'tcs' && "La Taxe sur les Salaires doit être déclarée et payée avant le 10 du mois suivant."}
                  {formData.declarationType === 'fp' && "La Taxe de Formation Professionnelle doit être déclarée et payée avant le 10 du mois suivant."}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              Aperçu
            </button>
            
            <button
              type="button"
              className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Soumettre en ligne
            </button>
          </div>
        </div>
      </form>
    </FormModal>
  );
};

export default PayrollDeclarationModal;