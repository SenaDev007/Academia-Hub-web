import React, { useState, useEffect } from 'react';
import { Save, FileText, User, Calendar, DollarSign, Clock, XCircle, Building2, Calculator, FileCheck } from 'lucide-react';
import { Personnel } from '../../services/hrService';

interface ContractFormData {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  
  // === INFORMATIONS DE BASE DU CONTRAT ===
  contractType: 'permanent' | 'vacataire';
  contractDuration: 'CDI' | 'CDD' | 'mission-ponctuelle';
  workTimeType: 'plein-temps' | 'temps-partiel';
  startDate: string;
  endDate: string;
  
  // === RÉMUNÉRATION ===
  salaryType: 'fixe' | 'horaire';
  salary: number; // Salaire total (pour compatibilité)
  baseSalary: number; // Salaire de base (fixe mensuel)
  hourlyRate: number; // Taux horaire pour vacataires
  workingHours: number; // Heures par semaine
  maxWorkingHours: number; // Heures max par semaine
  
  // === AVANTAGES CONTRACTUELS ===
  housingAllowance: number; // Indemnité logement
  transportAllowance: number; // Indemnité transport
  fixedBonuses: number; // Primes fixes
  benefits: string; // Autres avantages (texte libre)
  
  // === DÉCLARATIONS SOCIALES ===
  cnssDeclaration: boolean; // Déclaré à la CNSS
  irppDeclaration: boolean; // Déclaré à l'IRPP
  otherDeductions: string; // Autres retenues
  
  // === INFORMATIONS CONTRACTUELLES ===
  probationPeriod: string;
  noticePeriod: string;
  renewalDate: string;
  signatureDate: string;
  specialClauses: string;
  
  // === INFORMATIONS BANCAIRES ===
  bankDetails: string;
  mobileMoneyType: string;
  mobileMoneyNumber: string;
  
  // === DOCUMENTS D'IDENTITÉ ===
  identityDocumentType: string;
  identityDocumentNumber: string;
  ifuNumber: string;
  uploadedDocuments: string[];
  
  // === CONDITIONS DE TRAVAIL ===
  workSchedule: string; // Horaire de travail (ex: "8h-17h")
  workLocation: string; // Lieu de travail
  remoteWork: boolean; // Télétravail autorisé
  overtimePolicy: string; // Politique des heures supplémentaires
  leavePolicy: string; // Politique des congés
  confidentialityClause: boolean; // Clause de confidentialité
  nonCompeteClause: boolean; // Clause de non-concurrence
  trainingRequirements: string; // Exigences de formation
  performanceExpectations: string; // Attentes de performance
  
  // === NOTES ===
  notes: string;
}

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contractData: ContractFormData) => void;
  contractData?: ContractFormData;
  isEdit?: boolean;
  isView?: boolean;
  employees?: Personnel[];
}

const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  onSave,
  contractData,
  isEdit = false,
  isView = false,
  employees = []
}) => {
  // Utiliser les données réelles du personnel
  const allEmployees = employees;

  // État pour gérer les onglets
  const [activeTab, setActiveTab] = useState<'basic' | 'remuneration' | 'benefits' | 'declarations' | 'work-conditions' | 'documents'>('basic');

  const [formData, setFormData] = useState<ContractFormData>({
    id: '',
    employeeId: '',
    employeeName: '',
    position: '',
    
    // === INFORMATIONS DE BASE DU CONTRAT ===
    contractType: 'permanent',
    contractDuration: 'CDI',
    workTimeType: 'plein-temps',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    
    // === RÉMUNÉRATION ===
    salaryType: 'fixe',
    salary: 0,
    baseSalary: 0,
    hourlyRate: 0,
    workingHours: 40,
    maxWorkingHours: 48,
    
    // === AVANTAGES CONTRACTUELS ===
    housingAllowance: 0,
    transportAllowance: 0,
    fixedBonuses: 0,
    benefits: '',
    
    // === DÉCLARATIONS SOCIALES ===
    cnssDeclaration: true,
    irppDeclaration: true,
    otherDeductions: '',
    
    // === INFORMATIONS CONTRACTUELLES ===
    probationPeriod: '3 mois',
    noticePeriod: '1 mois',
    renewalDate: '',
    signatureDate: new Date().toISOString().split('T')[0],
    specialClauses: '',
    
    // === INFORMATIONS BANCAIRES ===
    bankDetails: '',
    mobileMoneyType: 'MTN',
    mobileMoneyNumber: '',
    
    // === DOCUMENTS D'IDENTITÉ ===
    identityDocumentType: '',
    identityDocumentNumber: '',
    ifuNumber: '',
    uploadedDocuments: [],
    
    // === CONDITIONS DE TRAVAIL ===
    workSchedule: '8h-17h',
    workLocation: '',
    remoteWork: false,
    overtimePolicy: 'standard',
    leavePolicy: 'standard-25',
    confidentialityClause: true,
    nonCompeteClause: false,
    trainingRequirements: 'formation-initiale',
    performanceExpectations: 'standard',
    
    // === NOTES ===
    notes: ''
  });

  // Synchroniser les données du formulaire avec les données reçues
  useEffect(() => {
    if (isOpen) {
      if (contractData) {
        console.log('ContractModal: Mode édition - contractData reçu:', contractData);
        setFormData({
          id: contractData.id || `CONT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          employeeId: contractData.employeeId || '',
          employeeName: contractData.employeeName || '',
          position: contractData.position || '',
          
          // === INFORMATIONS DE BASE DU CONTRAT ===
          contractType: contractData.contractType || 'permanent',
          contractDuration: contractData.contractDuration || 'CDI',
          workTimeType: contractData.workTimeType || 'plein-temps',
          startDate: contractData.startDate || new Date().toISOString().split('T')[0],
          endDate: contractData.endDate || '',
          
          // === RÉMUNÉRATION ===
          salaryType: contractData.salaryType || 'fixe',
          salary: contractData.salary || 0,
          baseSalary: contractData.baseSalary || 0,
          hourlyRate: contractData.hourlyRate || 0,
          workingHours: contractData.workingHours || 40,
          maxWorkingHours: contractData.maxWorkingHours || 48,
          
          // === AVANTAGES CONTRACTUELS ===
          housingAllowance: contractData.housingAllowance || 0,
          transportAllowance: contractData.transportAllowance || 0,
          fixedBonuses: contractData.fixedBonuses || 0,
          benefits: contractData.benefits || '',
          
          // === DÉCLARATIONS SOCIALES ===
          cnssDeclaration: contractData.cnssDeclaration || true,
          irppDeclaration: contractData.irppDeclaration || true,
          otherDeductions: contractData.otherDeductions || '',
          
          // === INFORMATIONS CONTRACTUELLES ===
          probationPeriod: contractData.probationPeriod || '3 mois',
          noticePeriod: contractData.noticePeriod || '1 mois',
          renewalDate: contractData.renewalDate || '',
          signatureDate: contractData.signatureDate || new Date().toISOString().split('T')[0],
          specialClauses: contractData.specialClauses || '',
          
          // === INFORMATIONS BANCAIRES ===
          bankDetails: contractData.bankDetails || '',
          mobileMoneyType: contractData.mobileMoneyType || 'MTN',
          mobileMoneyNumber: contractData.mobileMoneyNumber || '',
          
          // === DOCUMENTS D'IDENTITÉ ===
          identityDocumentType: contractData.identityDocumentType || '',
          identityDocumentNumber: contractData.identityDocumentNumber || '',
          ifuNumber: contractData.ifuNumber || '',
          uploadedDocuments: contractData.uploadedDocuments || [],
          
          // === CONDITIONS DE TRAVAIL ===
          workSchedule: contractData.workSchedule || '8h-17h',
          workLocation: contractData.workLocation || '',
          remoteWork: contractData.remoteWork || false,
          overtimePolicy: contractData.overtimePolicy || 'standard',
          leavePolicy: contractData.leavePolicy || 'standard-25',
          confidentialityClause: contractData.confidentialityClause || true,
          nonCompeteClause: contractData.nonCompeteClause || false,
          trainingRequirements: contractData.trainingRequirements || 'formation-initiale',
          performanceExpectations: contractData.performanceExpectations || 'standard',
          
          // === NOTES ===
          notes: contractData.notes || ''
        });
      } else {
        console.log('ContractModal: Mode création - initialisation avec valeurs par défaut');
        setFormData({
          id: `CONT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          employeeId: '',
          employeeName: '',
          position: '',
          
          // === INFORMATIONS DE BASE DU CONTRAT ===
          contractType: 'permanent',
          contractDuration: 'CDI',
          workTimeType: 'plein-temps',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          
          // === RÉMUNÉRATION ===
          salaryType: 'fixe',
          salary: 0,
          baseSalary: 0,
          hourlyRate: 0,
          workingHours: 40,
          maxWorkingHours: 48,
          
          // === AVANTAGES CONTRACTUELS ===
          housingAllowance: 0,
          transportAllowance: 0,
          fixedBonuses: 0,
          benefits: '',
          
          // === DÉCLARATIONS SOCIALES ===
          cnssDeclaration: true,
          irppDeclaration: true,
          otherDeductions: '',
          
          // === INFORMATIONS CONTRACTUELLES ===
          probationPeriod: '3 mois',
          noticePeriod: '1 mois',
          renewalDate: '',
          signatureDate: new Date().toISOString().split('T')[0],
          specialClauses: '',
          
          // === INFORMATIONS BANCAIRES ===
          bankDetails: '',
          mobileMoneyType: 'MTN',
          mobileMoneyNumber: '',
          
          // === DOCUMENTS D'IDENTITÉ ===
          identityDocumentType: '',
          identityDocumentNumber: '',
          ifuNumber: '',
          uploadedDocuments: [],
          
          // === CONDITIONS DE TRAVAIL ===
          workSchedule: '8h-17h',
          workLocation: '',
          remoteWork: false,
          overtimePolicy: 'standard',
          leavePolicy: 'standard-25',
          confidentialityClause: true,
          nonCompeteClause: false,
          trainingRequirements: 'formation-initiale',
          performanceExpectations: 'standard',
          
          // === NOTES ===
          notes: ''
        });
      }
    }
  }, [isOpen, contractData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : 0) : value
    }));
  };




  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const employeeId = e.target.value;
    const employee = allEmployees.find(emp => emp.id === employeeId);
    
    if (employee) {
      setFormData(prev => ({
        ...prev,
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        position: employee.positionName || employee.positionId || 'Non spécifié'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        employeeId: '',
        employeeName: '',
        position: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('ContractModal: Données du formulaire:', formData);
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                <h2 className="text-2xl font-bold">
                  {isView ? 'Consultation du contrat' : isEdit ? 'Modifier le contrat' : 'Nouveau contrat'}
                  </h2>
                <p className="text-indigo-100">
                  {isView ? 'Détails du contrat' : isEdit ? 'Modifiez les informations du contrat' : 'Créez un nouveau contrat d\'emploi'}
                  </p>
                </div>
              </div>
          <button
            onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Fermer"
              >
              <XCircle className="w-6 h-6" />
          </button>
        </div>
          </div>

          {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation des onglets */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <nav className="flex space-x-8 px-6 py-4" aria-label="Tabs">
              {[
                { id: 'basic', name: 'Informations de base', icon: User },
                { id: 'remuneration', name: 'Rémunération', icon: DollarSign },
                { id: 'benefits', name: 'Avantages', icon: Building2 },
                { id: 'declarations', name: 'Déclarations', icon: FileCheck },
                { id: 'work-conditions', name: 'Conditions de travail', icon: Clock },
                { id: 'documents', name: 'Documents', icon: FileText }
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
      <form id="contract-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Onglet Informations de base */}
              {activeTab === 'basic' && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                      <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">Informations de base</h3>
                      <p className="text-blue-600 dark:text-blue-400">Données contractuelles essentielles</p>
                  </div>
                </div>
          
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sélection de l'employé */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                      <User className="inline-block w-4 h-4 mr-2" />
                        Employé
              </label>
              <select
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleEmployeeChange}
                        disabled={isView}
                        required
                        className={`w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-900 dark:text-blue-100 ${
                          isView 
                            ? 'bg-blue-100 dark:bg-blue-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-blue-700'
                        }`}
              >
                        <option value="">Sélectionnez un employé</option>
                        {allEmployees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.firstName} {employee.lastName} ({employee.positionName || 'Non spécifié'})
                          </option>
                ))}
              </select>
            </div>
            
                    {/* Type de contrat */}
                  <div>
                      <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                      <FileText className="inline-block w-4 h-4 mr-2" />
                        Type de contrat
              </label>
              <select
                id="contractType"
                name="contractType"
                value={formData.contractType}
                onChange={handleChange}
                      disabled={isView}
                        required
                        className={`w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-900 dark:text-blue-100 ${
                        isView 
                            ? 'bg-blue-100 dark:bg-blue-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-blue-700'
                      }`}
                    >
                      <option value="permanent">Permanent</option>
                      <option value="vacataire">Vacataire</option>
              </select>
            </div>
            
                    {/* Durée du contrat */}
            <div>
                      <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                        <Calendar className="inline-block w-4 h-4 mr-2" />
                        Durée du contrat
              </label>
              <select
                        id="contractDuration"
                        name="contractDuration"
                        value={formData.contractDuration}
                onChange={handleChange}
                      disabled={isView}
                        required
                        className={`w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-900 dark:text-blue-100 ${
                        isView 
                            ? 'bg-blue-100 dark:bg-blue-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-blue-700'
                        }`}
                      >
                        <option value="CDI">CDI (Contrat à Durée Indéterminée)</option>
                        <option value="CDD">CDD (Contrat à Durée Déterminée)</option>
                        <option value="mission-ponctuelle">Mission ponctuelle</option>
              </select>
        </div>
        
                    {/* Type de temps de travail */}
                  <div>
                      <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                        <Clock className="inline-block w-4 h-4 mr-2" />
                        Temps de travail
                      </label>
                      <select
                        id="workTimeType"
                        name="workTimeType"
                        value={formData.workTimeType}
                        onChange={handleChange}
                        disabled={isView}
                        required
                        className={`w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-900 dark:text-blue-100 ${
                          isView 
                            ? 'bg-blue-100 dark:bg-blue-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-blue-700'
                        }`}
                      >
                        <option value="plein-temps">Plein temps</option>
                        <option value="temps-partiel">Temps partiel</option>
                      </select>
                </div>
          
                    {/* Date de début */}
            <div>
                      <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                      <Calendar className="inline-block w-4 h-4 mr-2" />
                        Date de début
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                      disabled={isView}
                        required
                        className={`w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-900 dark:text-blue-100 ${
                        isView 
                            ? 'bg-blue-100 dark:bg-blue-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-blue-700'
                      }`}
              />
            </div>
            
                    {/* Date de fin */}
            <div>
                      <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                      <Calendar className="inline-block w-4 h-4 mr-2" />
                        Date de fin
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                      disabled={isView}
                        required={formData.contractDuration !== 'CDI'}
                        className={`w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-900 dark:text-blue-100 ${
                        isView 
                            ? 'bg-blue-100 dark:bg-blue-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-blue-700'
                      }`}
              />
            </div>
                  </div>
                </div>
              )}

              {/* Onglet Rémunération */}
              {activeTab === 'remuneration' && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
            <div>
                      <h3 className="text-xl font-bold text-green-900 dark:text-green-100">Rémunération</h3>
                      <p className="text-green-600 dark:text-green-400">Salaire et avantages financiers</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Type de salaire */}
                    <div>
                      <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                        <Calculator className="inline-block w-4 h-4 mr-2" />
                        Type de salaire
              </label>
                      <select
                        id="salaryType"
                        name="salaryType"
                        value={formData.salaryType}
                onChange={handleChange}
                      disabled={isView}
                        required
                        className={`w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-green-900 dark:text-green-100 ${
                        isView 
                            ? 'bg-green-100 dark:bg-green-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-green-700'
                      }`}
                      >
                        <option value="fixe">Fixe (mensuel)</option>
                        <option value="horaire">Horaire</option>
                      </select>
            </div>
            
                    {/* Salaire de base - seulement pour permanents */}
                    {formData.contractType === 'permanent' && (
            <div>
                        <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                          <DollarSign className="inline-block w-4 h-4 mr-2" />
                          Salaire de base (F CFA)
              </label>
              <input
                          type="number"
                          id="baseSalary"
                          name="baseSalary"
                          value={formData.baseSalary || ''}
                onChange={handleChange}
                      disabled={isView}
                          required
                          placeholder="0"
                          className={`w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-green-900 dark:text-green-100 ${
                        isView 
                              ? 'bg-green-100 dark:bg-green-800 cursor-not-allowed' 
                              : 'bg-white dark:bg-green-700'
                      }`}
                    />
                  </div>
                    )}

                    {/* Taux horaire */}
                  <div>
                      <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                      <Clock className="inline-block w-4 h-4 mr-2" />
                        Taux horaire (F CFA/h)
                        {formData.contractType === 'vacataire' && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                        type="number"
                        id="hourlyRate"
                        name="hourlyRate"
                        value={formData.hourlyRate || ''}
                onChange={handleChange}
                      disabled={isView}
                        required={formData.contractType === 'vacataire'}
                        placeholder="0"
                        className={`w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-green-900 dark:text-green-100 ${
                        isView 
                            ? 'bg-green-100 dark:bg-green-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-green-700'
                      }`}
              />
            </div>
                  
                    {/* Heures de travail par semaine */}
            <div>
                      <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                        <Clock className="inline-block w-4 h-4 mr-2" />
                        Heures/semaine
              </label>
              <input
                type="number"
                        id="workingHours"
                        name="workingHours"
                        value={formData.workingHours || ''}
                onChange={handleChange}
                      disabled={isView}
                        required
                        placeholder="40"
                        className={`w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-green-900 dark:text-green-100 ${
                        isView 
                            ? 'bg-green-100 dark:bg-green-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-green-700'
                      }`}
              />
            </div>
            
                    {/* Heures maximum par semaine */}
            <div>
                      <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                      <Clock className="inline-block w-4 h-4 mr-2" />
                        Heures max/semaine
              </label>
              <input
                type="number"
                        id="maxWorkingHours"
                        name="maxWorkingHours"
                        value={formData.maxWorkingHours || ''}
                onChange={handleChange}
                      disabled={isView}
                        placeholder="48"
                        className={`w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-green-900 dark:text-green-100 ${
                        isView 
                            ? 'bg-green-100 dark:bg-green-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-green-700'
                      }`}
              />
            </div>
                </div>
              </div>
              )}

              {/* Onglet Avantages */}
              {activeTab === 'benefits' && (
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                      <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-100">Avantages</h3>
                      <p className="text-yellow-600 dark:text-yellow-400">Indemnités et avantages contractuels</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Indemnité logement */}
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                        Indemnité logement (F CFA)
                      </label>
                      <input
                        type="number"
                        id="housingAllowance"
                        name="housingAllowance"
                        value={formData.housingAllowance || ''}
                        onChange={handleChange}
                        disabled={isView}
                        placeholder="0"
                        className={`w-full px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-yellow-900 dark:text-yellow-100 ${
                          isView 
                            ? 'bg-yellow-100 dark:bg-yellow-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-yellow-700'
                        }`}
                      />
                </div>
                
                    {/* Indemnité transport */}
                  <div>
                      <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                        Indemnité transport (F CFA)
                    </label>
                    <input
                        type="number"
                        id="transportAllowance"
                        name="transportAllowance"
                        value={formData.transportAllowance || ''}
                      onChange={handleChange}
                      disabled={isView}
                        placeholder="0"
                        className={`w-full px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-yellow-900 dark:text-yellow-100 ${
                        isView 
                            ? 'bg-yellow-100 dark:bg-yellow-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-yellow-700'
                      }`}
                    />
                  </div>

                    {/* Primes fixes */}
                  <div>
                      <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                        Primes fixes (F CFA)
                    </label>
                    <input
                        type="number"
                        id="fixedBonuses"
                        name="fixedBonuses"
                        value={formData.fixedBonuses || ''}
                      onChange={handleChange}
                      disabled={isView}
                        placeholder="0"
                        className={`w-full px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-yellow-900 dark:text-yellow-100 ${
                        isView 
                            ? 'bg-yellow-100 dark:bg-yellow-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-yellow-700'
                      }`}
                    />
                  </div>

                    {/* Autres avantages */}
                  <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                        Autres avantages
                      </label>
                      <textarea
                        id="benefits"
                        name="benefits"
                        value={formData.benefits || ''}
                        onChange={handleChange}
                        disabled={isView}
                        placeholder="Ex: prise en charge communication, restauration..."
                        rows={4}
                        className={`w-full px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-yellow-900 dark:text-yellow-100 ${
                          isView 
                            ? 'bg-yellow-100 dark:bg-yellow-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-yellow-700'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Déclarations */}
              {activeTab === 'declarations' && (
                <div className="bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-sky-200 dark:border-sky-800">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                      <FileCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-sky-900 dark:text-sky-100">Déclarations</h3>
                      <p className="text-sky-600 dark:text-sky-400">Déclarations sociales et retenues</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CNSS */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="cnssDeclaration"
                        name="cnssDeclaration"
                        checked={!!formData.cnssDeclaration}
                        onChange={(e) => setFormData(prev => ({ ...prev, cnssDeclaration: e.target.checked }))}
                        disabled={isView}
                        className="w-5 h-5 text-sky-600 border-sky-300 rounded focus:ring-sky-500"
                      />
                      <label htmlFor="cnssDeclaration" className="text-sm font-medium text-sky-700 dark:text-sky-300">
                        Déclaré à la CNSS
                    </label>
                  </div>

                    {/* IRPP */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="irppDeclaration"
                        name="irppDeclaration"
                        checked={!!formData.irppDeclaration}
                        onChange={(e) => setFormData(prev => ({ ...prev, irppDeclaration: e.target.checked }))}
                        disabled={isView}
                        className="w-5 h-5 text-sky-600 border-sky-300 rounded focus:ring-sky-500"
                      />
                      <label htmlFor="irppDeclaration" className="text-sm font-medium text-sky-700 dark:text-sky-300">
                        Déclaré à l'IRPP
                    </label>
                    </div>

                    {/* Autres retenues */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-sky-700 dark:text-sky-300 mb-2">
                        Autres retenues
                      </label>
                      <textarea
                        id="otherDeductions"
                        name="otherDeductions"
                        value={formData.otherDeductions || ''}
                      onChange={handleChange}
                      disabled={isView}
                        placeholder="Décrivez les autres retenues (si applicable)"
                        rows={4}
                        className={`w-full px-3 py-2 border border-sky-300 dark:border-sky-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sky-900 dark:text-sky-100 ${
                        isView 
                            ? 'bg-sky-100 dark:bg-sky-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-sky-700'
                        }`}
                      />
                  </div>
                  </div>
                </div>
              )}

              {/* Onglet Conditions de travail */}
              {activeTab === 'work-conditions' && (
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-rose-200 dark:border-rose-800">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  <div>
                      <h3 className="text-xl font-bold text-rose-900 dark:text-rose-100">Conditions de travail</h3>
                      <p className="text-rose-600 dark:text-rose-400">Période d'essai et préavis</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Période d'essai */}
                    <div>
                      <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-2">
                        Période d'essai
                    </label>
                      <input
                        type="text"
                        id="probationPeriod"
                        name="probationPeriod"
                        value={formData.probationPeriod || ''}
                      onChange={handleChange}
                      disabled={isView}
                        placeholder="Ex: 3 mois"
                        className={`w-full px-3 py-2 border border-rose-300 dark:border-rose-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-rose-900 dark:text-rose-100 ${
                        isView 
                            ? 'bg-rose-100 dark:bg-rose-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-rose-700'
                        }`}
                      />
                  </div>

                    {/* Préavis */}
                  <div>
                      <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-2">
                        Préavis
                    </label>
                    <input
                      type="text"
                      id="noticePeriod"
                      name="noticePeriod"
                        value={formData.noticePeriod || ''}
                      onChange={handleChange}
                      disabled={isView}
                        placeholder="Ex: 1 mois"
                        className={`w-full px-3 py-2 border border-rose-300 dark:border-rose-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-rose-900 dark:text-rose-100 ${
                        isView 
                            ? 'bg-rose-100 dark:bg-rose-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-rose-700'
                      }`}
                    />
                  </div>
                  </div>
                </div>
              )}

              {/* Onglet Documents */}
              {activeTab === 'documents' && (
                <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Documents</h3>
                      <p className="text-slate-600 dark:text-slate-400">Informations bancaires et d'identité</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Coordonnées bancaires */}
                  <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Coordonnées bancaires
                      </label>
                      <textarea
                        id="bankDetails"
                        name="bankDetails"
                        value={formData.bankDetails || ''}
                        onChange={handleChange}
                          disabled={isView}
                        placeholder="Banque, RIB/IBAN, agence..."
                        rows={3}
                        className={`w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 dark:text-slate-100 ${
                          isView 
                            ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-slate-700'
                        }`}
                      />
                  </div>

                    {/* Type Mobile Money */}
                  <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Type Mobile Money
                    </label>
                    <select
                        id="mobileMoneyType"
                        name="mobileMoneyType"
                        value={formData.mobileMoneyType || ''}
                      onChange={handleChange}
                      disabled={isView}
                        className={`w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 dark:text-slate-100 ${
                        isView 
                            ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-slate-700'
                        }`}
                      >
                        <option value="">Sélectionnez</option>
                        <option value="MTN">MTN</option>
                        <option value="Moov">Moov</option>
                        <option value="Celtiis">Celtiis</option>
                    </select>
                  </div>

                    {/* Numéro Mobile Money */}
                  <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Numéro Mobile Money
                    </label>
                      <input
                        type="text"
                        id="mobileMoneyNumber"
                        name="mobileMoneyNumber"
                        value={formData.mobileMoneyNumber || ''}
                      onChange={handleChange}
                      disabled={isView}
                        placeholder="Ex: 97 00 00 00"
                        className={`w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 dark:text-slate-100 ${
                        isView 
                            ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' 
                            : 'bg-white dark:bg-slate-700'
                        }`}
                      />
              </div>

                  {/* Type de pièce d'identité */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Type de pièce d'identité
                    </label>
                    <select
                      id="identityDocumentType"
                      name="identityDocumentType"
                        value={formData.identityDocumentType || ''}
                      onChange={handleChange}
                      disabled={isView}
                      className={`w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 dark:text-slate-100 ${
                        isView 
                          ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' 
                          : 'bg-white dark:bg-slate-700'
                      }`}
                    >
                        <option value="">Sélectionnez</option>
                        <option value="Carte d'Identification Personnelle (CIP)">Carte d'Identification Personnelle (CIP)</option>
                        <option value="Carte biométrique">Carte biométrique</option>
                        <option value="Passeport">Passeport</option>
                    </select>
                  </div>

                    {/* N° de la pièce d'identité */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        N° de la pièce d'identité
                    </label>
                    <input
                      type="text"
                      id="identityDocumentNumber"
                      name="identityDocumentNumber"
                        value={formData.identityDocumentNumber || ''}
                      onChange={handleChange}
                      disabled={isView}
                        placeholder="Ex: CIP0123456789"
                      className={`w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 dark:text-slate-100 ${
                        isView 
                          ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' 
                          : 'bg-white dark:bg-slate-700'
                      }`}
                    />
                  </div>

                    {/* N° IFU */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        N° IFU
                    </label>
                    <input
                      type="text"
                      id="ifuNumber"
                      name="ifuNumber"
                        value={formData.ifuNumber || ''}
                      onChange={handleChange}
                      disabled={isView}
                        placeholder="Ex: IFU-1234567890123"
                      className={`w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 dark:text-slate-100 ${
                        isView 
                          ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' 
                          : 'bg-white dark:bg-slate-700'
                      }`}
                    />
                    </div>
                  </div>

                  {/* Upload de documents */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Joindre des documents (PDF, images)
                    </label>
                    {!isView && (
                        <input
                          type="file"
                          multiple
                        accept=".pdf,image/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            const fileNames = files.map(file => file.name);
                            setFormData(prev => ({ ...prev, uploadedDocuments: [...prev.uploadedDocuments, ...fileNames] }));
                          }}
                        className="block w-full text-sm text-slate-700 dark:text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 dark:file:bg-slate-700 dark:file:text-slate-200"
                      />
                    )}

                    {/* Aide types */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      CV, lettre de demande d'emploi, diplôme/attestation, CIP/Carte biométrique/Passeport, acte de naissance sécurisé, attestation IFU
                    </p>

                    {/* Liste des fichiers */}
                    {formData.uploadedDocuments?.length > 0 && (
                      <div className="mt-4 space-y-2">
                          {formData.uploadedDocuments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                            <div className="text-sm text-slate-700 dark:text-slate-300 truncate mr-2">{file}</div>
                              {!isView && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newFiles = [...formData.uploadedDocuments];
                                    newFiles.splice(index, 1);
                                    setFormData(prev => ({ ...prev, uploadedDocuments: newFiles }));
                                  }}
                                className="text-red-600 dark:text-red-400 hover:underline text-sm"
                                title="Retirer le fichier"
                                >
                                Supprimer
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                        </div>
                      )}

              {/* Autres onglets à implémenter... */}
            </form>
          </div>
          </div>
          
          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex justify-end space-x-3">
              {isView ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  Fermer
                </button>
              ) : (
                <>
            <button
              type="button"
                    onClick={onClose}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    form="contract-form"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl font-medium"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isEdit ? "Mettre à jour" : "Enregistrer"}
            </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default ContractModal;
