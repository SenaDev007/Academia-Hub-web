import React, { useState } from 'react';
import FormModal from './FormModal';
import { DollarSign, Save, Calculator, Download, FileText, User, Calendar, Clock } from 'lucide-react';

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payrollData: any) => void;
  employeeData?: any;
  isEdit?: boolean;
}

const PayrollModal: React.FC<PayrollModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeData,
  isEdit = false
}) => {
  // Constantes pour les calculs de paie selon la réglementation béninoise
  const CNSS_EMPLOYEE_RATE = 3.6; // 3,6% pour la part salariale
  const CNSS_EMPLOYER_RATE = 16.4; // 16,4% pour la part patronale
  const CNSS_CEILING = 1000000; // Plafond CNSS en F CFA
  const PROFESSIONAL_TRAINING_TAX = 1.2; // Taxe de formation professionnelle 1,2%

  // Barème IRPP (Impôt sur le Revenu des Personnes Physiques) au Bénin
  const IRPP_BRACKETS = [
    { min: 0, max: 50000, rate: 0 },
    { min: 50001, max: 130000, rate: 10 },
    { min: 130001, max: 280000, rate: 15 },
    { min: 280001, max: 530000, rate: 20 },
    { min: 530001, Infinity: 30 }
  ];

  // État initial du formulaire
  const [formData, setFormData] = useState({
    employeeId: employeeData?.id || '',
    employeeName: employeeData?.name || '',
    employeeType: employeeData?.type || 'permanent', // 'permanent' ou 'vacataire'
    payPeriod: new Date().toISOString().split('T')[0].substring(0, 7), // Format YYYY-MM
    baseSalary: employeeData?.baseSalary || 0,
    workingHours: employeeData?.workingHours || 0,
    hourlyRate: employeeData?.hourlyRate || 0,
    allowances: {
      transport: employeeData?.allowances?.transport || 0,
      housing: employeeData?.allowances?.housing || 0,
      responsibility: employeeData?.allowances?.responsibility || 0,
      performance: employeeData?.allowances?.performance || 0,
      other: employeeData?.allowances?.other || 0
    },
    benefits: {
      vehicle: employeeData?.benefits?.vehicle || false,
      housing: employeeData?.benefits?.housing || false,
      phone: employeeData?.benefits?.phone || false
    },
    deductions: {
      advance: employeeData?.deductions?.advance || 0,
      loan: employeeData?.deductions?.loan || 0,
      other: employeeData?.deductions?.other || 0
    },
    overtime: {
      hours: employeeData?.overtime?.hours || 0,
      rate: employeeData?.overtime?.rate || 1.5
    },
    absences: employeeData?.absences || 0,
    paymentMethod: employeeData?.paymentMethod || 'bank_transfer',
    bankDetails: employeeData?.bankDetails || '',
    comments: employeeData?.comments || ''
  });

  // État pour les résultats calculés
  const [calculatedResults, setCalculatedResults] = useState({
    grossSalary: 0,
    cnssSalary: 0,
    cnssEmployee: 0,
    cnssEmployer: 0,
    taxableIncome: 0,
    irpp: 0,
    netSalary: 0,
    totalEmployerCost: 0
  });

  // Gestion des changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Gestion des champs imbriqués (allowances, benefits, deductions, overtime)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      // Gestion des champs simples
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
  };

  // Calcul de l'IRPP selon le barème progressif
  const calculateIRPP = (taxableIncome: number): number => {
    let tax = 0;
    let remainingIncome = taxableIncome;
    
    for (const bracket of IRPP_BRACKETS) {
      if (remainingIncome <= 0) break;
      
      const taxableAmount = Math.min(remainingIncome, (bracket.max || Infinity) - bracket.min);
      tax += (taxableAmount * bracket.rate) / 100;
      remainingIncome -= taxableAmount;
    }
    
    return tax;
  };

  // Calcul complet de la paie
  const calculatePayroll = () => {
    let grossSalary = 0;
    
    // Calcul du salaire brut selon le type d'employé
    if (formData.employeeType === 'permanent') {
      // Pour les employés permanents, on utilise le salaire de base
      grossSalary = formData.baseSalary;
      
      // Ajout des indemnités
      const totalAllowances = Object.values(formData.allowances).reduce((sum, value) => sum + (value as number), 0);
      grossSalary += totalAllowances;
      
      // Ajout des heures supplémentaires
      const overtimePay = formData.baseSalary / 173.33 * formData.overtime.hours * formData.overtime.rate;
      grossSalary += overtimePay;
      
      // Déduction pour absences non justifiées
      const dailyRate = formData.baseSalary / 22; // 22 jours ouvrables par mois en moyenne
      grossSalary -= dailyRate * formData.absences;
    } else {
      // Pour les vacataires, on calcule en fonction des heures travaillées
      grossSalary = formData.hourlyRate * formData.workingHours;
    }
    
    // Calcul de la cotisation CNSS (plafonnée)
    const cnssSalary = Math.min(grossSalary, CNSS_CEILING);
    const cnssEmployee = (cnssSalary * CNSS_EMPLOYEE_RATE) / 100;
    const cnssEmployer = (cnssSalary * CNSS_EMPLOYER_RATE) / 100;
    
    // Calcul du revenu imposable
    const taxableIncome = grossSalary - cnssEmployee;
    
    // Calcul de l'IRPP
    const irpp = calculateIRPP(taxableIncome);
    
    // Autres déductions
    const totalDeductions = Object.values(formData.deductions).reduce((sum, value) => sum + (value as number), 0);
    
    // Calcul du salaire net
    const netSalary = taxableIncome - irpp - totalDeductions;
    
    // Coût total pour l'employeur
    const trainingTax = (grossSalary * PROFESSIONAL_TRAINING_TAX) / 100;
    const totalEmployerCost = grossSalary + cnssEmployer + trainingTax;
    
    // Mise à jour des résultats calculés
    setCalculatedResults({
      grossSalary,
      cnssSalary,
      cnssEmployee,
      cnssEmployer,
      taxableIncome,
      irpp,
      netSalary,
      totalEmployerCost
    });
  };

  // Calcul automatique lorsque les données du formulaire changent
  React.useEffect(() => {
    calculatePayroll();
  }, [formData]);

  // Formatage des montants en F CFA
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Préparation des données à envoyer
    const payrollData = {
      ...formData,
      calculations: calculatedResults
    };
    
    onSave(payrollData);
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier une fiche de paie" : "Nouvelle fiche de paie"}
      size="xl"
      footer={
        <div className="flex justify-between">
          <div>
            <button
              type="button"
              onClick={calculatePayroll}
              className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 flex items-center"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Recalculer
            </button>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="payroll-form"
              className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEdit ? "Mettre à jour" : "Enregistrer"}
            </button>
          </div>
        </div>
      }
    >
      <form id="payroll-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Informations de l'employé
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID Employé*
              </label>
              <input
                type="text"
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom complet*
              </label>
              <input
                type="text"
                id="employeeName"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="employeeType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type d'employé*
              </label>
              <select
                id="employeeType"
                name="employeeType"
                value={formData.employeeType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="permanent">Personnel permanent</option>
                <option value="vacataire">Personnel vacataire</option>
              </select>
            </div>
            
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
          </div>
        </div>
        
        {/* Rémunération */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            Éléments de rémunération
          </h4>
          
          {formData.employeeType === 'permanent' ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="baseSalary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Salaire de base mensuel (F CFA)*
                </label>
                <input
                  type="number"
                  id="baseSalary"
                  name="baseSalary"
                  value={formData.baseSalary}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="allowances.transport" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Indemnité de transport (F CFA)
                  </label>
                  <input
                    type="number"
                    id="allowances.transport"
                    name="allowances.transport"
                    value={formData.allowances.transport}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <label htmlFor="allowances.housing" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Indemnité de logement (F CFA)
                  </label>
                  <input
                    type="number"
                    id="allowances.housing"
                    name="allowances.housing"
                    value={formData.allowances.housing}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <label htmlFor="allowances.responsibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prime de responsabilité (F CFA)
                  </label>
                  <input
                    type="number"
                    id="allowances.responsibility"
                    name="allowances.responsibility"
                    value={formData.allowances.responsibility}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <label htmlFor="allowances.performance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prime de performance (F CFA)
                  </label>
                  <input
                    type="number"
                    id="allowances.performance"
                    name="allowances.performance"
                    value={formData.allowances.performance}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="overtime.hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Heures supplémentaires
                  </label>
                  <input
                    type="number"
                    id="overtime.hours"
                    name="overtime.hours"
                    value={formData.overtime.hours}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <label htmlFor="overtime.rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Taux de majoration
                  </label>
                  <select
                    id="overtime.rate"
                    name="overtime.rate"
                    value={formData.overtime.rate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="1.15">15% (Heures de jour)</option>
                    <option value="1.5">50% (Heures de nuit)</option>
                    <option value="2">100% (Dimanches et jours fériés)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="absences" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Absences non justifiées (jours)
                </label>
                <input
                  type="number"
                  id="absences"
                  name="absences"
                  value={formData.absences}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="benefits.vehicle"
                    name="benefits.vehicle"
                    checked={formData.benefits.vehicle}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label htmlFor="benefits.vehicle" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Avantage véhicule
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="benefits.housing"
                    name="benefits.housing"
                    checked={formData.benefits.housing}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label htmlFor="benefits.housing" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Avantage logement
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="benefits.phone"
                    name="benefits.phone"
                    checked={formData.benefits.phone}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label htmlFor="benefits.phone" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Avantage téléphone
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Taux horaire (F CFA)*
                  </label>
                  <input
                    type="number"
                    id="hourlyRate"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <label htmlFor="workingHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Heures travaillées*
                  </label>
                  <input
                    type="number"
                    id="workingHours"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="allowances.other" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Indemnités diverses (F CFA)
                </label>
                <input
                  type="number"
                  id="allowances.other"
                  name="allowances.other"
                  value={formData.allowances.other}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Déductions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Calculator className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
            Déductions
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="deductions.advance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Avances sur salaire (F CFA)
              </label>
              <input
                type="number"
                id="deductions.advance"
                name="deductions.advance"
                value={formData.deductions.advance}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="deductions.loan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Remboursement prêt (F CFA)
              </label>
              <input
                type="number"
                id="deductions.loan"
                name="deductions.loan"
                value={formData.deductions.loan}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="deductions.other" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Autres retenues (F CFA)
              </label>
              <input
                type="number"
                id="deductions.other"
                name="deductions.other"
                value={formData.deductions.other}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
        
        {/* Paiement */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Modalités de paiement
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Méthode de paiement*
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="bank_transfer">Virement bancaire</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="cash">Espèces</option>
                <option value="check">Chèque</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="bankDetails" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Coordonnées bancaires / Mobile Money
              </label>
              <input
                type="text"
                id="bankDetails"
                name="bankDetails"
                value={formData.bankDetails}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="RIB ou numéro de téléphone"
              />
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
        
        {/* Résumé des calculs */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-900/30">
          <h4 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-4 flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Résumé des calculs
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Salaire brut:</span>
                <span className="font-bold text-blue-900 dark:text-blue-200">{formatAmount(calculatedResults.grossSalary)} F CFA</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Cotisation CNSS (3,6%):</span>
                <span className="font-medium text-blue-900 dark:text-blue-200">-{formatAmount(calculatedResults.cnssEmployee)} F CFA</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">IRPP:</span>
                <span className="font-medium text-blue-900 dark:text-blue-200">-{formatAmount(calculatedResults.irpp)} F CFA</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Autres déductions:</span>
                <span className="font-medium text-blue-900 dark:text-blue-200">
                  -{formatAmount(Object.values(formData.deductions).reduce((sum, value) => sum + (value as number), 0))} F CFA
                </span>
              </div>
              
              <div className="pt-2 border-t border-blue-200 dark:border-blue-800 flex justify-between">
                <span className="font-semibold text-blue-800 dark:text-blue-300">Salaire net:</span>
                <span className="font-bold text-lg text-blue-900 dark:text-blue-200">{formatAmount(calculatedResults.netSalary)} F CFA</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Charges patronales:</span>
                <span className="font-medium text-blue-900 dark:text-blue-200">{formatAmount(calculatedResults.cnssEmployer)} F CFA</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Taxe FP (1,2%):</span>
                <span className="font-medium text-blue-900 dark:text-blue-200">
                  {formatAmount((calculatedResults.grossSalary * PROFESSIONAL_TRAINING_TAX) / 100)} F CFA
                </span>
              </div>
              
              <div className="pt-2 border-t border-blue-200 dark:border-blue-800 flex justify-between">
                <span className="font-semibold text-blue-800 dark:text-blue-300">Coût total employeur:</span>
                <span className="font-bold text-lg text-blue-900 dark:text-blue-200">{formatAmount(calculatedResults.totalEmployerCost)} F CFA</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              Aperçu bulletin
            </button>
          </div>
        </div>
      </form>
    </FormModal>
  );
};

export default PayrollModal;