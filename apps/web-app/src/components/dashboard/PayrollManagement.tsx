import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Download,
  FileText,
  Users,
  Calendar,
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  TrendingUp,
  Building,
  UserCheck,
  Calculator,
  RefreshCw
} from 'lucide-react';
import { 
  PayrollModal, 
  PayrollBatchModal, 
  PayrollReportModal, 
  PayrollDeclarationModal, 
  PayrollSettingsModal,
  ConfirmModal,
  AlertModal
} from '../modals';
import { hrService } from '../../services/hrService';
import { financeService } from '../../services/financeService';

const PayrollManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('payslips');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedEmployeeType, setSelectedEmployeeType] = useState('all');
  
  // Data states
  const [payroll, setPayroll] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  
  // Modals state
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isPayrollBatchModalOpen, setIsPayrollBatchModalOpen] = useState(false);
  const [isPayrollReportModalOpen, setIsPayrollReportModalOpen] = useState(false);
  const [isPayrollDeclarationModalOpen, setIsPayrollDeclarationModalOpen] = useState(false);
  const [isPayrollSettingsModalOpen, setIsPayrollSettingsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Formatage des montants en F CFA
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Fonctions de chargement des données
  const loadPayroll = async () => {
    try {
      const payrollData = await financeService.getPayroll('school-1', {});
      setPayroll(payrollData || []);
    } catch (error) {
      console.error('Error loading payroll:', error);
      setPayroll([]);
    }
  };

  const loadTeachers = async () => {
    try {
      // Utiliser le service HR pour récupérer tous les employés
      const employees = await hrService.getEmployees('school-1');
      setTeachers(employees);
      console.log('✅ Employés chargés depuis HR:', employees.length);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des employés depuis HR:', error);
      setTeachers([]);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadPayroll();
    loadTeachers();
  }, []);

  // Fonction pour recharger les données (utile après insertion de nouvelles données)
  const refreshData = () => {
    loadPayroll();
    loadTeachers();
  };

  // Validation des données HR pour la paie
  const validateEmployeeForPayroll = (employee: any) => {
    const errors = [];
    
    if (!employee.name) {
      errors.push('Nom de l\'employé manquant');
    }
    if (!employee.position) {
      errors.push('Fonction de l\'employé manquante');
    }
    if (!employee.contractType) {
      errors.push('Type de contrat non défini');
    }
    if (!employee.baseSalary || employee.baseSalary <= 0) {
      errors.push('Salaire de base non défini ou invalide');
    }
    if (employee.contractType === 'permanent' && !employee.bankDetails) {
      errors.push('Coordonnées bancaires manquantes pour un employé permanent');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Alertes de trésorerie spécifiques au Bénin
  const treasuryAlerts = (() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthPayroll = payroll.filter(p => p.payPeriod?.startsWith(currentMonth));
    const totalPayroll = monthPayroll.reduce((sum, p) => sum + (p.grossSalary || 0), 0);
    
    // Simulation du solde de trésorerie disponible (à connecter avec le module Trésorerie)
    const availableFunds = 5000000; // À remplacer par la vraie valeur de trésorerie
    const deficit = totalPayroll - availableFunds;
    
    const alerts = [];
    
    if (deficit > 0) {
      alerts.push({
        type: 'error',
        title: 'Déficit de trésorerie',
        message: `Les fonds disponibles (${formatAmount(availableFunds)} F CFA) sont insuffisants pour couvrir la masse salariale (${formatAmount(totalPayroll)} F CFA). Déficit: ${formatAmount(deficit)} F CFA`,
        icon: AlertTriangle
      });
    }
    
    // Alerte pour les déclarations CNSS (échéance le 15 du mois suivant)
    const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1));
    const cnssDueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15);
    const daysUntilDue = Math.ceil((cnssDueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 7) {
      alerts.push({
        type: 'warning',
        title: 'Échéance CNSS proche',
        message: `La déclaration CNSS est due dans ${daysUntilDue} jour(s) (${cnssDueDate.toLocaleDateString('fr-FR')})`,
        icon: Calendar
      });
    }
    
    return alerts;
  })();

  // Statistiques de paie calculées dynamiquement
  const payrollStats = (() => {
    const thisMonth = new Date().toISOString().substring(0, 7);
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().substring(0, 7);
    
    const monthPayroll = payroll.filter(p => p.payPeriod?.startsWith(thisMonth));
    const lastMonthPayroll = payroll.filter(p => p.payPeriod?.startsWith(lastMonth));
    
    // Calculs pour la masse salariale
    const currentSalary = monthPayroll.reduce((sum, p) => sum + (p.grossSalary || 0), 0);
    const lastSalary = lastMonthPayroll.reduce((sum, p) => sum + (p.grossSalary || 0), 0);
    const salaryChange = lastSalary > 0 ? ((currentSalary - lastSalary) / lastSalary * 100) : 0;
    
    // Calculs pour les charges sociales
    const currentDeductions = monthPayroll.reduce((sum, p) => {
      const deductions = p.deductions || {};
      return sum + (deductions.cnss || 0) + (deductions.irpp || 0);
    }, 0);
    const lastDeductions = lastMonthPayroll.reduce((sum, p) => {
      const deductions = p.deductions || {};
      return sum + (deductions.cnss || 0) + (deductions.irpp || 0);
    }, 0);
    const deductionsChange = lastDeductions > 0 ? ((currentDeductions - lastDeductions) / lastDeductions * 100) : 0;
    
    // Calcul de la prochaine échéance CNSS (15 du mois suivant)
    const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1));
    const nextDueDate = nextMonth.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    
    return [
      {
        title: 'Masse salariale mensuelle',
        value: `${currentSalary.toLocaleString()} F CFA`,
        change: salaryChange !== 0 ? `${salaryChange > 0 ? '+' : ''}${salaryChange.toFixed(1)}%` : 'Nouveau',
        icon: DollarSign,
        color: 'from-green-600 to-green-700'
      },
      {
        title: 'Employés actifs',
        value: teachers.length.toString(),
        change: teachers.length > 0 ? `${teachers.length} employé${teachers.length > 1 ? 's' : ''}` : 'Aucun',
        icon: Users,
        color: 'from-blue-600 to-blue-700'
      },
      {
        title: 'Charges sociales',
        value: `${currentDeductions.toLocaleString()} F CFA`,
        change: deductionsChange !== 0 ? `${deductionsChange > 0 ? '+' : ''}${deductionsChange.toFixed(1)}%` : 'Nouveau',
        icon: Building,
        color: 'from-purple-600 to-purple-700'
      },
      {
        title: 'Prochaine échéance',
        value: nextDueDate,
        change: 'CNSS',
        icon: Calendar,
        color: 'from-orange-600 to-orange-700'
      }
    ];
  })();

  // Utiliser les vraies données de paie avec classification Bénin
  const payslips = payroll.map(pay => {
    // Récupérer les données employé depuis teachers
    const employee = teachers.find(emp => emp.id === pay.employeeId);
    
    return {
    id: pay.id,
      employeeName: pay.employeeName || employee?.name || 'Employé inconnu',
    employeeId: pay.employeeId,
      employeeType: employee?.contractType || pay.employeeType || 'permanent',
      department: employee?.department || 'Enseignement',
      position: employee?.position || 'Enseignant',
      seniority: employee?.seniority || 0, // Ancienneté en années
    period: pay.payPeriod || 'Non défini',
    grossSalary: pay.grossSalary || 0,
    netSalary: pay.netSalary || 0,
    paymentDate: pay.paymentDate || null,
      paymentMethod: pay.paymentMethod || 'bank_transfer',
      bankDetails: employee?.bankDetails || '',
      mobileMoneyDetails: employee?.mobileMoneyDetails || '',
      status: pay.status || 'draft',
      cnssDeclared: employee?.cnssDeclared || false, // Déclaré CNSS ou non
      cnssEmployee: pay.deductions?.cnss || 0,
      irpp: pay.deductions?.irpp || 0
    };
  });

  // Calculer les déclarations à partir des données de paie (spécifique Bénin)
  const declarations = (() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const currentMonthName = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    
    // Séparer les employés permanents (CNSS) des non-permanents
    const monthPayroll = payroll.filter(p => p.payPeriod?.startsWith(currentMonth));
    const permanentEmployees = monthPayroll.filter(p => {
      const employee = teachers.find(emp => emp.id === p.employeeId);
      return employee?.contractType === 'permanent' || p.employeeType === 'permanent';
    });
    // const nonPermanentEmployees = monthPayroll.filter(p => {
    //   const employee = teachers.find(emp => emp.id === p.employeeId);
    //   return employee?.contractType !== 'permanent' && p.employeeType !== 'permanent';
    // });
    
    // Calcul CNSS (seulement pour les permanents)
    const totalCNSS = permanentEmployees.reduce((sum, p) => {
      const deductions = p.deductions || {};
      return sum + (deductions.cnss || 0);
    }, 0);
    // Calcul IRPP (pour tous les employés)
    const totalIRPP = monthPayroll.reduce((sum, p) => {
      const deductions = p.deductions || {};
      return sum + (deductions.irpp || 0);
    }, 0);
    
    // Calculs séparés pour les rapports (pour usage futur)
    // const permanentGrossSalary = permanentEmployees.reduce((sum, p) => sum + (p.grossSalary || 0), 0);
    // const nonPermanentGrossSalary = nonPermanentEmployees.reduce((sum, p) => sum + (p.grossSalary || 0), 0);
    
    const declarations = [];
    
    // Déclaration CNSS du mois courant
    if (totalCNSS > 0) {
      declarations.push({
        id: `DEC-CNSS-${currentMonth.replace('-', '-')}`,
        type: 'CNSS',
        period: currentMonthName,
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15).toISOString().split('T')[0],
        amount: totalCNSS,
        status: 'pending',
        submissionDate: null,
        paymentDate: null,
        reference: null
      });
    }
    
    // Déclaration IRPP du mois courant
    if (totalIRPP > 0) {
      declarations.push({
        id: `DEC-IRPP-${currentMonth.replace('-', '-')}`,
        type: 'IRPP',
        period: currentMonthName,
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 10).toISOString().split('T')[0],
        amount: totalIRPP,
        status: 'pending',
        submissionDate: null,
        paymentDate: null,
        reference: null
      });
    }
    
    return declarations;
  })();

  // Filtrage des bulletins de paie
  const filteredPayslips = payslips.filter(payslip => {
    const matchesSearch = 
      payslip.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payslip.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payslip.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedEmployeeType === 'all' || payslip.employeeType === selectedEmployeeType;
    
    // Pour la période, on pourrait ajouter une logique plus complexe
    // Ici on simplifie en supposant que 'current' correspond à Janvier 2024
    const matchesPeriod = selectedPeriod === 'all' || 
      (selectedPeriod === 'current' && payslip.period === 'Janvier 2024');
    
    return matchesSearch && matchesType && matchesPeriod;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getDeclarationStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'late': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Handlers pour les modales
  const handleNewPayroll = () => {
    setIsEditMode(false);
    setSelectedPayroll(null);
    setIsPayrollModalOpen(true);
  };

  const handleEditPayroll = (payroll: any) => {
    setIsEditMode(true);
    setSelectedPayroll(payroll);
    setIsPayrollModalOpen(true);
  };

  const handleDeletePayroll = (payroll: any) => {
    setSelectedPayroll(payroll);
    setIsConfirmModalOpen(true);
  };

  const handleSavePayroll = (payrollData: any) => {
    console.log('Saving payroll:', payrollData);
    setIsAlertModalOpen(true);
  };

  const handleSaveBatch = (batchData: any) => {
    console.log('Processing batch:', batchData);
    setIsAlertModalOpen(true);
  };

  const handleGenerateReport = (reportOptions: any) => {
    console.log('Generating report with options:', reportOptions);
    setIsAlertModalOpen(true);
  };

  const handleGenerateDeclaration = (declarationOptions: any) => {
    console.log('Generating declaration with options:', declarationOptions);
    setIsAlertModalOpen(true);
  };

  const handleSaveSettings = (settings: any) => {
    console.log('Saving settings:', settings);
    setIsAlertModalOpen(true);
  };

  const confirmDeletePayroll = () => {
    console.log('Deleting payroll:', selectedPayroll);
    setIsConfirmModalOpen(false);
    setIsAlertModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold mb-2">Gestion de la Paie</h1>
              <p className="text-emerald-100">
                Traitement des salaires et déclarations sociales
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={refreshData}
                className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
              >
                <Clock className="w-4 h-4 mr-2" />
                Actualiser
              </button>
              <button 
                onClick={() => setIsPayrollSettingsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
              >
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </button>
              <button 
                onClick={handleNewPayroll}
                className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle paie
              </button>
            </div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full"></div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {payrollStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stat.value}</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{stat.title}</h4>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alertes de trésorerie spécifiques au Bénin */}
      {treasuryAlerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Alertes importantes</h3>
          {treasuryAlerts.map((alert, index) => {
            const Icon = alert.icon;
            return (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                alert.type === 'error' 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600' 
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-600'
              }`}>
                <div className="flex items-start">
                  <Icon className={`w-5 h-5 mt-0.5 mr-3 ${
                    alert.type === 'error' 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`} />
                  <div>
                    <h4 className={`font-semibold ${
                      alert.type === 'error' 
                        ? 'text-red-800 dark:text-red-200' 
                        : 'text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {alert.title}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      alert.type === 'error' 
                        ? 'text-red-700 dark:text-red-300' 
                        : 'text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button 
          onClick={() => setIsPayrollBatchModalOpen(true)}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow flex flex-col items-center justify-center"
        >
          <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
          <span className="text-gray-900 dark:text-gray-100 font-medium">Traitement par lot</span>
        </button>
        
        <button 
          onClick={() => setIsPayrollReportModalOpen(true)}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow flex flex-col items-center justify-center"
        >
          <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
          <span className="text-gray-900 dark:text-gray-100 font-medium">Rapports de paie</span>
        </button>
        
        <button 
          onClick={() => setIsPayrollDeclarationModalOpen(true)}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow flex flex-col items-center justify-center"
        >
          <Building className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
          <span className="text-gray-900 dark:text-gray-100 font-medium">Déclarations sociales</span>
        </button>
        
        <button className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow flex flex-col items-center justify-center">
          <Calculator className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" />
          <span className="text-gray-900 dark:text-gray-100 font-medium">Simulateur de paie</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
            {[
              { id: 'payslips', label: 'Bulletins de paie', icon: FileText },
              { id: 'declarations', label: 'Déclarations sociales', icon: Building },
              { id: 'employees', label: 'Employés', icon: UserCheck },
              { id: 'history', label: 'Historique', icon: Clock },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'payslips' && (
            <div className="space-y-6">
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Rechercher un employé..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    title="Sélectionner la période d'affichage"
                    aria-label="Période d'affichage des bulletins de paie"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="current">Période courante</option>
                    <option value="previous">Période précédente</option>
                    <option value="all">Toutes les périodes</option>
                  </select>
                  
                  <select
                    value={selectedEmployeeType}
                    onChange={(e) => setSelectedEmployeeType(e.target.value)}
                    title="Sélectionner le type d'employé"
                    aria-label="Type d'employé pour le filtrage"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="all">Tous les employés</option>
                    <option value="permanent">Personnel permanent</option>
                    <option value="vacataire">Personnel vacataire</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtres avancés
                  </button>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </button>
                </div>
              </div>

              {/* Payslips Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Employé
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Référence
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Période
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Salaire brut
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        CNSS
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        IRPP
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Salaire net
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Mode paiement
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPayslips.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12">
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl flex items-center justify-center mb-6">
                              <FileText className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                              Aucun bulletin de paie trouvé
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md text-center">
                              {payroll.length === 0 
                                ? "Aucun bulletin de paie n'a encore été créé. Commencez par ajouter votre premier bulletin de paie."
                                : "Aucun bulletin de paie ne correspond aux critères de recherche et de filtrage."
                              }
                            </p>
                            <button
                              onClick={handleNewPayroll}
                              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                              <Plus className="w-5 h-5 mr-2" />
                              Nouveau bulletin de paie
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredPayslips.map((payslip) => (
                        <tr key={payslip.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {payslip.employeeName.split(' ').map((n: string) => n[0]).join('')}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {payslip.employeeName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {payslip.position}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {payslip.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {payslip.period}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {formatAmount(payslip.grossSalary)} F CFA
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {payslip.cnssDeclared ? formatAmount(payslip.cnssEmployee) : 'Non déclaré'} F CFA
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {formatAmount(payslip.irpp)} F CFA
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                            {formatAmount(payslip.netSalary)} F CFA
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            <div className="flex items-center">
                              {payslip.paymentMethod === 'bank_transfer' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  Virement
                                </span>
                              )}
                              {payslip.paymentMethod === 'cash' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  Espèces
                                </span>
                              )}
                              {payslip.paymentMethod === 'mobile_money' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                  Mobile Money
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {payslip.paymentDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payslip.status)}`}>
                              {payslip.status === 'paid' ? 'Payé' : 
                               payslip.status === 'pending' ? 'En attente' : 'Annulé'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button 
                                title="Voir le bulletin de paie"
                                aria-label="Voir le bulletin de paie"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEditPayroll(payslip)}
                                title="Modifier le bulletin de paie"
                                aria-label="Modifier le bulletin de paie"
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeletePayroll(payslip)}
                                title="Supprimer le bulletin de paie"
                                aria-label="Supprimer le bulletin de paie"
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'declarations' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Déclarations sociales et fiscales</h3>
                <button 
                  onClick={() => setIsPayrollDeclarationModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle déclaration
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Référence
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Période
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Montant
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date d'échéance
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {declarations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12">
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mb-6">
                              <Building className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                              Aucune déclaration sociale trouvée
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md text-center">
                              {payroll.length === 0 
                                ? "Aucune déclaration sociale n'a encore été générée. Les déclarations sont créées automatiquement à partir des bulletins de paie."
                                : "Aucune déclaration sociale n'est disponible pour la période sélectionnée."
                              }
                            </p>
                            <button
                              onClick={() => setIsPayrollDeclarationModalOpen(true)}
                              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                              <Plus className="w-5 h-5 mr-2" />
                              Nouvelle déclaration
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      declarations.map((declaration) => (
                        <tr key={declaration.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {declaration.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {declaration.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {declaration.period}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {formatAmount(declaration.amount)} F CFA
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {declaration.dueDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDeclarationStatusColor(declaration.status)}`}>
                              {declaration.status === 'paid' ? 'Payé' : 
                               declaration.status === 'pending' ? 'À payer' : 'En retard'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button 
                                title="Voir la déclaration"
                                aria-label="Voir la déclaration"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                title="Télécharger la déclaration"
                                aria-label="Télécharger la déclaration"
                                className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              {declaration.status === 'pending' && (
                                <button 
                                  title="Marquer comme payé"
                                  aria-label="Marquer comme payé"
                                  className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">Échéances à venir</h5>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      N'oubliez pas de soumettre votre déclaration IRPP avant le 10/02/2024 et votre déclaration CNSS avant le 15/02/2024.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Employés pour la paie</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => window.open('/hr', '_blank')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800"
                  >
                  <Plus className="w-4 h-4 mr-2" />
                    Gérer dans HR
                  </button>
                  <button 
                    onClick={loadTeachers}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualiser
                </button>
                </div>
              </div>

              {/* Statistiques des employés */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                  <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total employés</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{teachers.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Déclarés CNSS</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {teachers.filter(emp => emp.contractType === 'permanent').length}
                    </p>
                  </div>
                </div>
              </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Vacataires</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {teachers.filter(emp => emp.contractType === 'vacataire').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des employés avec informations de paie */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Liste des employés</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Employé
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Fonction
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type contrat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Salaire base
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          CNSS
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {teachers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12">
                            <div className="flex flex-col items-center">
                              <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Aucun employé trouvé
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                                Aucun employé n'a été trouvé dans le module HR. 
                                <button 
                                  onClick={() => window.open('/hr', '_blank')}
                                  className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
                                >
                                  Créer un employé
                                </button>
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        teachers.map((employee) => (
                          <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">
                                    {employee.name?.split(' ').map((n: string) => n[0]).join('') || 'E'}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {employee.name || 'Nom non défini'}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {employee.email || 'Email non défini'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {employee.position || 'Fonction non définie'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                employee.contractType === 'permanent' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {employee.contractType === 'permanent' ? 'Permanent' : 'Vacataire'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {formatAmount(employee.baseSalary || 0)} F CFA
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {employee.contractType === 'permanent' ? 'Oui' : 'Non'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => {
                                  const validation = validateEmployeeForPayroll(employee);
                                  if (validation.isValid) {
                                    setSelectedPayroll({ 
                                      employeeId: employee.id, 
                                      employeeName: employee.name,
                                      employeeData: employee
                                    });
                                    setIsPayrollModalOpen(true);
                                  } else {
                                    // Afficher les erreurs de validation
                                    alert(`Impossible de créer la paie :\n${validation.errors.join('\n')}\n\nVeuillez compléter les informations dans le module HR.`);
                                  }
                                }}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                              >
                                Créer paie
                              </button>
                              <button 
                                onClick={() => window.open(`/hr/employees/${employee.id}`, '_blank')}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                              >
                                Voir profil
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Historique des opérations de paie</h3>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter l'historique
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Journal des opérations</h4>
                </div>
                <div className="p-4 space-y-4">
                  {payroll.length === 0 ? (
                    <div className="flex flex-col items-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mb-6">
                        <Clock className="w-10 h-10 text-gray-600 dark:text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Aucun historique disponible
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md text-center">
                        L'historique des opérations de paie sera affiché ici une fois que des bulletins de paie auront été créés.
                      </p>
                    </div>
                  ) : (
                    payroll
                      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                      .slice(0, 10) // Limiter à 10 entrées récentes
                      .map((pay, index) => {
                        const createdDate = new Date(pay.createdAt || new Date());
                        const isRecent = index < 3;
                        
                        return (
                          <div key={pay.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="flex-shrink-0">
                              <div className={`w-10 h-10 ${isRecent ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'} rounded-full flex items-center justify-center`}>
                                <CheckCircle className={`w-5 h-5 ${isRecent ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {pay.status === 'paid' ? 'Paiement effectué' : 
                                   pay.status === 'pending' ? 'Paiement en attente' : 'Bulletin créé'}
                                </h5>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {createdDate.toLocaleDateString('fr-FR')} {createdDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {pay.employeeName} - {pay.payPeriod || 'Période non définie'} - {formatAmount(pay.grossSalary || 0)} F CFA
                              </p>
                              <div className="mt-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  pay.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                  pay.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {pay.status === 'paid' ? 'Payé' : 
                                   pay.status === 'pending' ? 'En attente' : 'Brouillon'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Analytics de paie</h3>
              
              {payroll.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mb-6">
                    <BarChart3 className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Aucune donnée d'analytics disponible
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md text-center">
                    Les analytics de paie seront disponibles une fois que des bulletins de paie auront été créés.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                        Répartition de la masse salariale
                      </h4>
                      <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Répartition par statut</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            Payé
                          </span>
                          <span>{Math.round((payroll.filter(p => p.status === 'paid').length / payroll.length) * 100)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            En attente
                          </span>
                          <span>{Math.round((payroll.filter(p => p.status === 'pending').length / payroll.length) * 100)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                            Brouillon
                          </span>
                          <span>{Math.round((payroll.filter(p => p.status === 'draft').length / payroll.length) * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                    Évolution de la masse salariale
                  </h4>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Données actuelles</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total actuel</span>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            {formatAmount(payroll.reduce((sum, p) => sum + (p.grossSalary || 0), 0))} F CFA
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Moyenne par employé</span>
                          <span className="font-bold">
                            {formatAmount(payroll.reduce((sum, p) => sum + (p.grossSalary || 0), 0) / payroll.length)} F CFA
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Nombre d'employés</span>
                          <span className="font-bold">{payroll.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Répartition par statut</h4>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {payroll.filter(p => p.status === 'paid').length}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Payés</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {payroll.filter(p => p.status === 'pending').length}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">En attente</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                        {payroll.filter(p => p.status === 'draft').length}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Brouillons</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Charges sociales</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">CNSS</span>
                      <span className="font-bold">
                        {formatAmount(payroll.reduce((sum, p) => {
                          const deductions = p.deductions || {};
                          return sum + (deductions.cnss || 0);
                        }, 0))} F CFA
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">IRPP</span>
                      <span className="font-bold">
                        {formatAmount(payroll.reduce((sum, p) => {
                          const deductions = p.deductions || {};
                          return sum + (deductions.irpp || 0);
                        }, 0))} F CFA
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Total</span>
                      <span className="font-bold text-lg">
                        {formatAmount(payroll.reduce((sum, p) => {
                          const deductions = p.deductions || {};
                          return sum + (deductions.cnss || 0) + (deductions.irpp || 0);
                        }, 0))} F CFA
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Statistiques clés</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Salaire moyen</span>
                      <span className="font-bold">
                        {formatAmount(payroll.reduce((sum, p) => sum + (p.grossSalary || 0), 0) / payroll.length)} F CFA
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Salaire net moyen</span>
                      <span className="font-bold">
                        {formatAmount(payroll.reduce((sum, p) => sum + (p.netSalary || 0), 0) / payroll.length)} F CFA
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Total brut</span>
                      <span className="font-bold">
                        {formatAmount(payroll.reduce((sum, p) => sum + (p.grossSalary || 0), 0))} F CFA
                      </span>
                    </div>
                  </div>
                </div>
              </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PayrollModal
        isOpen={isPayrollModalOpen}
        onClose={() => setIsPayrollModalOpen(false)}
        onSave={handleSavePayroll}
        employeeData={selectedPayroll}
        isEdit={isEditMode}
      />

      <PayrollBatchModal
        isOpen={isPayrollBatchModalOpen}
        onClose={() => setIsPayrollBatchModalOpen(false)}
        onSave={handleSaveBatch}
      />

      <PayrollReportModal
        isOpen={isPayrollReportModalOpen}
        onClose={() => setIsPayrollReportModalOpen(false)}
        onGenerate={handleGenerateReport}
      />

      <PayrollDeclarationModal
        isOpen={isPayrollDeclarationModalOpen}
        onClose={() => setIsPayrollDeclarationModalOpen(false)}
        onGenerate={handleGenerateDeclaration}
      />

      <PayrollSettingsModal
        isOpen={isPayrollSettingsModalOpen}
        onClose={() => setIsPayrollSettingsModalOpen(false)}
        onSave={handleSaveSettings}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeletePayroll}
        title="Supprimer cette fiche de paie ?"
        message={`Êtes-vous sûr de vouloir supprimer la fiche de paie de ${selectedPayroll?.employeeName} pour la période ${selectedPayroll?.period} ? Cette action est irréversible.`}
        type="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
      />

      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title="Opération réussie"
        message="L'opération a été effectuée avec succès."
        type="success"
      />
    </div>
  );
};


export default PayrollManagement;