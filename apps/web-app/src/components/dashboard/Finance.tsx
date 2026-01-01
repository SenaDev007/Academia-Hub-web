import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { useAcademicYear } from '../../hooks/useAcademicYear';
import { useAcademicYearState } from '../../hooks/useAcademicYearState';
import { useFeeConfigurations } from '../../hooks/useFeeConfigurations';
import { usePayments } from '../../hooks/usePayments';
import { useExpenses } from '../../hooks/useExpenses';
import { useRevenues } from '../../hooks/useRevenues-simple';
import FeeConfigurationList from './FeeConfigurationList';
import FeeConfigurationModal from '../modals/FeeConfigurationModal';
import FeeConfigurationViewModal from '../modals/FeeConfigurationViewModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import { useTuitionControl } from '../../hooks/useTuitionControl';
import { usePlanningData } from '../../hooks/usePlanningData';
import { studentService } from '../../services/studentService';
import { financeService } from '../../services/financeService';
import { studentsService } from '../../services/studentsService';
import { planningService } from '../../services/planningService';
import { useToast } from '../../hooks/useToast';
import { useUser } from '../../contexts/UserContext';
import { hrService } from '../../services/hrService';
import { treasuryService } from '../../services/treasuryService';
import { generateAutoSequenceReceiptNumber } from '../../utils/receiptNameGenerator';
import { api } from '../../lib/api/client';

// Fonction pour générer un numéro de reçu basé sur la base de données
const generateReceiptNumberFromDB = async (academicYear: string = '2025-2026', className: string = 'CI', revenueType?: string) => {
  try {
    // Récupérer les paiements existants depuis l'API
    const response = await api.finance.getPayments();
    const existingPayments = response.data || [];
    
    // Filtrer les paiements de l'année scolaire et classe en cours
    const yearCode = academicYear.replace('-', '');
    const classKey = className.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Obtenir la première lettre du type de recette
    const typeLetter = revenueType ? revenueType.charAt(0).toUpperCase() : 'A';
    
    const currentYearPayments = existingPayments.filter((payment: any) => {
      if (payment.receiptNumber) {
        // Pour les recettes d'élèves, vérifier aussi le type
        if (revenueType && ['uniforme', 'fournitures', 'cantine'].includes(revenueType)) {
          return payment.receiptNumber.includes(yearCode) && 
                 payment.receiptNumber.includes(classKey) &&
                 payment.receiptNumber.includes(`-${typeLetter}`);
        }
        return payment.receiptNumber.includes(yearCode) && payment.receiptNumber.includes(classKey);
      }
      return false;
    });
    
    // Le prochain numéro d'ordre sera le nombre d'enregistrements + 1
    const nextOrderNumber = (currentYearPayments.length + 1).toString().padStart(4, '0');
    
    // Formater l'année scolaire (ex: 2025-2026 -> 025026)
    const years = academicYear.split('-');
    const year1 = years[0].slice(-3).padStart(3, '0');
    const year2 = years[1].slice(-3).padStart(3, '0');
    const academicYearCode = `${year1}${year2}`;
    
    // Nettoyer le nom de la classe
    let cleanClassName = className.toUpperCase();
    if (cleanClassName.includes('MATERNELLE')) {
      const match = cleanClassName.match(/MATERNELLE\s*(\d+)/);
      if (match) {
        cleanClassName = `MAT${match[1]}`;
      } else {
        cleanClassName = 'MAT';
      }
    } else {
      cleanClassName = cleanClassName
        .replace(/1ÈRE/g, '1ERE')
        .replace(/2NDE/g, '2NDE')
        .replace(/TLE/g, 'TLE')
        .replace(/ème/g, 'EME')
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 10);
    }
    
    // Format pour les recettes d'élèves : REC-025026-A0001-MAT1
    if (revenueType && ['uniforme', 'fournitures', 'cantine'].includes(revenueType)) {
      return `REC-${academicYearCode}-${typeLetter}${nextOrderNumber}-${cleanClassName}`;
    }
    
    // Format standard pour les autres recettes
    return `REC-${academicYearCode}-${nextOrderNumber}-${cleanClassName}`;
  } catch (error) {
    console.error('Erreur lors de la génération du numéro de reçu:', error);
    // Fallback vers l'ancienne méthode
    return generateAutoSequenceReceiptNumber(academicYear, className);
  }
};
import SchoolFeesPaymentModal from '../modals/SchoolFeesPaymentModal';
import ReceiptModal from '../modals/ReceiptModal';
import ClassPaymentSummaryModal from '../modals/ClassPaymentSummaryModal';
import RevenuePrintModal from '../modals/RevenuePrintModal';
import PayrollManagement from './PayrollManagement';
import FinanceOverview from './FinanceOverview';
import ExpensePrintModal from '../modals/ExpensePrintModal';
import DailyClosureModal from '../modals/DailyClosureModal';
import ToastContainer from '../ui/ToastContainer';
import { 
  BarChart3, 
  CreditCard, 
  Receipt, 
  Settings, 
  TrendingUp, 
  DollarSign,
  Users,
  Calendar,
  FileText,
  Clock,
  Plus,
  Minus,
  ChevronDown,
  Search,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Edit,
  X,
  Trash2,
  XCircle,
  AlertTriangle,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Smartphone,
  Award,
  Hash,
  Shirt,
  BookOpen,
  Utensils,
  Heart,
  Building2,
  RotateCcw,
  Coins,
  Printer,
  Eye,
  Wallet,
  Calculator,
  ArrowLeftRight,
  FileSpreadsheet
} from 'lucide-react';

// Types de base

// Fonction utilitaire pour formater les montants
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount);
};

// Configuration des onglets
const tabs = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
  { id: 'payments', label: 'Encaissements', icon: CreditCard },
  { id: 'payment-summary', label: 'Bilan des encaissements', icon: BarChart3 },
  { id: 'tuition-control', label: 'Contrôle scolarité', icon: GraduationCap },
  { id: 'revenues', label: 'Recettes', icon: TrendingUp },
  { id: 'expenses', label: 'Dépenses', icon: Minus },
  { id: 'payroll', label: 'Gestion de la Paie', icon: DollarSign },
  { id: 'daily-closure', label: 'Clôture journalière', icon: Clock },
  { id: 'treasury', label: 'Trésorerie', icon: Wallet },
  { id: 'fee-config', label: 'Paramétrage frais', icon: Settings },
];

const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { 
    academicYears: rawAcademicYears,
    getAcademicYearOptions
  } = useAcademicYear();
  const { currentAcademicYear } = useAcademicYearState();
  const { 
    selectedAcademicYear: selectedSchoolYear, 
    setSelectedAcademicYear: setSelectedSchoolYear 
  } = useAcademicYearState('finance');

  // Fallback pour les années scolaires si elles ne sont pas chargées
  const academicYears = useMemo(() => {
    if (rawAcademicYears && rawAcademicYears.length > 0) {
      return rawAcademicYears;
    }
    
    // Retourner un tableau vide si aucune donnée n'est disponible
    return [];
  }, [rawAcademicYears]);
  
  const { 
    feeConfigurations, 
    loading: feeConfigLoading, 
    error: feeConfigError,
    createFeeConfiguration,
    updateFeeConfiguration,
    deleteFeeConfiguration,
    fetchFeeConfigurations
  } = useFeeConfigurations();
  
  const { 
    payments,
    deletePayment,
    refreshData: refreshPaymentsHook
  } = usePayments();
  
  // Utiliser le nouveau hook des recettes
  const { 
    revenues,
    loading: revenuesLoading,
    createRevenue,
    updateRevenue,
    deleteRevenue,
    syncTuitionPayments,
    fetchRevenues
  } = useRevenues();
  
  // États pour les vues des onglets
  const [feeConfigViewMode] = useState<'list' | 'create' | 'templates' | 'export'>('list');
  
  // États pour les modals
  const [isFeeConfigurationModalOpen, setIsFeeConfigurationModalOpen] = useState(false);
  const [isFeeConfigurationViewModalOpen, setIsFeeConfigurationViewModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFeeConfiguration, setSelectedFeeConfiguration] = useState<any>(null);
  const [confirmationData, setConfirmationData] = useState<{
    type: 'delete' | 'edit' | 'view' | 'warning';
    item: any;
    action: () => void;
    title?: string;
    message?: string;
    itemName?: string;
    details?: {
      label: string;
      value: string | number;
      icon?: React.ReactNode;
    }[];
    warningMessage?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
  } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // États pour la clôture journalière
  const [dailyClosures, setDailyClosures] = useState<any[]>([]);
  const [dailyClosureLoading, setDailyClosureLoading] = useState(false);
  const [dailyClosureError, setDailyClosureError] = useState<string | null>(null);
  const [selectedClosureDate, setSelectedClosureDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isDailyClosureModalOpen, setIsDailyClosureModalOpen] = useState(false);
  const [selectedDailyClosure, setSelectedDailyClosure] = useState<any>(null);
  const [isEditClosureMode, setIsEditClosureMode] = useState(false);
  
  // États pour la validation et rapprochement
  const [openingCashAmount, setOpeningCashAmount] = useState<number>(0);
  const [currentCashAmount, setCurrentCashAmount] = useState<number>(0);
  const [cashVariance, setCashVariance] = useState<number>(0);
  const [varianceJustification, setVarianceJustification] = useState<string>('');
  const [isVarianceJustified, setIsVarianceJustified] = useState<boolean>(false);
  
  // États pour les rapports
  const [dailyStats, setDailyStats] = useState<any>(null);
  
  // États pour les données filtrées par date
  const [dailyRevenues, setDailyRevenues] = useState<any[]>([]);
  const [dailyExpenses, setDailyExpenses] = useState<any[]>([]);
  
  // États pour les données réelles des sections avancées
  const [closureHistory, setClosureHistory] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [nextDayProjection, setNextDayProjection] = useState<number>(0);
  
  // États pour le nom du comptable (comme PDFReceipt)
  const [accountantName, setAccountantName] = useState('Comptable');
  const [isAccountantLoaded, setIsAccountantLoaded] = useState(false);
  const [accountantFirstName, setAccountantFirstName] = useState('Comptable');
  
  // États pour l'onglet Trésorerie
  const [treasuryAccounts, setTreasuryAccounts] = useState<any[]>([]);
  const [treasuryOperations, setTreasuryOperations] = useState<any[]>([]);
  const [treasuryHeritage, setTreasuryHeritage] = useState<any[]>([]);
  const [treasuryStats, setTreasuryStats] = useState<any>(null);
  const [workingCapital, setWorkingCapital] = useState<any>(null);
  const [treasuryHistory, setTreasuryHistory] = useState<any[]>([]);
  const [selectedTreasuryPeriod, setSelectedTreasuryPeriod] = useState<string>('month');
  const [treasuryLoading, setTreasuryLoading] = useState(false);
  const [treasuryError, setTreasuryError] = useState<string | null>(null);
  
  // États pour les données de paie
  const [payroll, setPayroll] = useState<any[]>([]);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [payrollError, setPayrollError] = useState<string | null>(null);
  
  // Fonction pour synchroniser les frais de scolarité vers les recettes
  const handleSyncTuitionPayments = async () => {
    try {
      console.log('🔄 Synchronisation des frais de scolarité...');
      const result = await syncTuitionPayments();
      
      if (result.success) {
        showSuccess(
          'Synchronisation réussie', 
          `${result.synced} recettes synchronisées avec succès`
        );
        
        if (result.errors.length > 0) {
          console.warn('Erreurs lors de la synchronisation:', result.errors);
        }
      } else {
        showError('Erreur de synchronisation', 'Impossible de synchroniser les frais de scolarité');
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      showError('Erreur', 'Erreur lors de la synchronisation des frais de scolarité');
    }
  };

  // Fonctions pour l'impression
  const handlePrintRevenues = useCallback((viewMode: 'list' | 'summary') => {
    setRevenuePrintViewMode(viewMode);
    setIsRevenuePrintModalOpen(true);
  }, []);

  const handleCloseRevenuePrintModal = useCallback(() => {
    setIsRevenuePrintModalOpen(false);
  }, []);

  // Handlers pour les configurations de frais
  const handleNewFeeConfiguration = () => {
    setIsEditMode(false);
    setSelectedFeeConfiguration(null);
    setIsFeeConfigurationModalOpen(true);
  };

  const handleEditFeeConfiguration = (config: any) => {
    setIsEditMode(true);
    setSelectedFeeConfiguration(config);
    setIsFeeConfigurationModalOpen(true);
  };

  const handleDeleteFeeConfiguration = (config: any) => {
    setSelectedFeeConfiguration(config);
    setIsActionLoading(false); // S'assurer que l'état de chargement est réinitialisé
    
    // Formater les détails de la configuration
    const formatFeeAmount = (amount: number) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0
      }).format(amount);
    };

    const formatAcademicYear = (academicYearId: string) => {
      // Chercher d'abord le pattern academic-year-YYYY-YYYY
      const match = academicYearId.match(/academic-year-(\d{4}-\d{4})/);
      if (match) {
        return match[1];
      }
      
      // Si c'est un UUID, chercher l'année académique correspondante dans la liste
      if (academicYears && academicYears.length > 0) {
        const year = academicYears.find(y => (y as any).id === academicYearId);
        if (year && (year as any).name) {
          return (year as any).name;
        }
      }
      
      // Fallback : retourner l'ID tel quel
      return academicYearId;
    };

    const getLevelDisplayName = (level: string) => {
      const levelNames: { [key: string]: string } = {
        'maternelle': 'Maternelle',
        'primaire': 'Primaire',
        'college': 'Collège',
        'lycee': 'Lycée'
      };
      return levelNames[level] || level;
    };

    const details = [
      {
        label: 'Année scolaire',
        value: formatAcademicYear(config.academicYearId),
        icon: <Calendar className="w-4 h-4" />
      },
      {
        label: 'Niveau',
        value: getLevelDisplayName(config.level),
        icon: <BookOpen className="w-4 h-4" />
      },
      {
        label: 'Frais d\'inscription',
        value: formatFeeAmount(config.inscriptionFee || 0),
        icon: <DollarSign className="w-4 h-4" />
      },
      {
        label: 'Frais de réinscription',
        value: formatFeeAmount(config.reinscriptionFee || 0),
        icon: <DollarSign className="w-4 h-4" />
      },
      {
        label: 'Frais de scolarité',
        value: formatFeeAmount(
          Array.isArray(config.tuitionFees) && config.tuitionFees.length > 0 
            ? config.tuitionFees.reduce((sum: number, amount: number) => sum + amount, 0)
            : (config.tuitionFee || 0)
        ),
        icon: <DollarSign className="w-4 h-4" />
      }
    ];

    setConfirmationData({
      type: 'delete',
      item: config,
      action: () => handleConfirmDeleteFeeConfiguration(),
      title: 'Supprimer la configuration de frais',
      message: 'Cette action supprimera définitivement la configuration de frais et toutes les données associées.',
      itemName: `Configuration ${getLevelDisplayName(config.level)} - ${formatAcademicYear(config.academicYearId)}`,
      details: details,
      warningMessage: 'Cette action est irréversible. Tous les paiements liés à cette configuration seront également supprimés.',
      confirmButtonText: 'Supprimer définitivement',
      cancelButtonText: 'Annuler'
    });
    setIsConfirmationModalOpen(true);
  };

  const handleViewFeeConfiguration = async (config: any) => {
    try {
      // Récupérer la configuration complète avec le nom de l'école
      await fetchFeeConfigurations((selectedSchoolYear as any)?.id);
      setSelectedFeeConfiguration(config);
      setIsFeeConfigurationViewModalOpen(true);
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration:', error);
      // Fallback sur la configuration partielle
      setSelectedFeeConfiguration(config);
      setIsFeeConfigurationViewModalOpen(true);
    }
  };

  const handleSaveFeeConfiguration = async (configData: any) => {
    try {
      console.log('=== DEBUG handleSaveFeeConfiguration ===');
      console.log('configData reçu:', configData);
      console.log('isEditMode:', isEditMode);
      
      if (isEditMode && selectedFeeConfiguration) {
        // Mode édition
        console.log('Mode édition - mise à jour de la configuration');
        await updateFeeConfiguration((selectedFeeConfiguration as any).id, configData);
        showSuccess(
          'Configuration modifiée',
          'La configuration de frais a été modifiée avec succès.'
        );
      } else {
        // Mode création - Nouvelle approche simplifiée
        console.log('Mode création - création de nouvelles configurations');
        
        // Validation des données requises
        if (!configData.academicYearId) {
          throw new Error('L\'année académique est requise');
        }
        if (!configData.effectiveDate) {
          throw new Error('La date d\'application est requise');
        }

        // Créer les configurations
        await createFeeConfiguration(configData);
        
        showSuccess(
          'Configuration créée',
          'La configuration de frais a été créée avec succès.'
        );
      }
      
      // Fermer le modal
      setIsFeeConfigurationModalOpen(false);
      setSelectedFeeConfiguration(null);
      setIsEditMode(false);
      
      // Recharger les données
      await loadFeeStructures();
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
      showError(
        'Erreur',
        error instanceof Error ? error.message : 'Une erreur est survenue lors de la sauvegarde de la configuration.'
      );
    }
  };

  const handleConfirmDeleteFeeConfiguration = async () => {
    if (!selectedFeeConfiguration) return;

    try {
      setIsActionLoading(true);
        await deleteFeeConfiguration((selectedFeeConfiguration as any).id);
      
      // Fermer le modal de confirmation
      setIsConfirmationModalOpen(false);
      setConfirmationData(null);
      setSelectedFeeConfiguration(null);
      setIsActionLoading(false);
      
      // Afficher un toast de succès
      showSuccess(
        'Configuration supprimée',
        'La configuration de frais a été supprimée avec succès.'
      );
      
      // Recharger les données directement
      if ((selectedSchoolYear as any)?.id) {
        await fetchFeeConfigurations((selectedSchoolYear as any).id);
      }
      
    } catch (error) {
      console.error('Erreur lors de la suppression de la configuration:', error);
      showError(
        'Erreur',
        'Une erreur est survenue lors de la suppression de la configuration.'
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // Fonction pour charger les structures de frais
  const loadFeeStructures = async () => {
    try {
      if ((selectedSchoolYear as any)?.id) {
        await fetchFeeConfigurations((selectedSchoolYear as any).id);
      }
    } catch (error) {
      console.error('Error loading fee structures:', error);
    }
  };

  // Fonctions pour la clôture journalière
  const fetchDailyClosures = async (filters?: any) => {
    const schoolId = user?.schoolId || getCurrentSchoolId();
    if (!schoolId) {
      console.warn('School ID not available for fetching daily closures');
      return;
    }

    try {
      setDailyClosureLoading(true);
      setDailyClosureError(null);
      
      console.log('🔍 Chargement des clôtures journalières...', { schoolId, filters });
      
      const closuresData = await api.finance.getDailyClosures(schoolId, {
        ...filters,
        academicYearId: filters?.academicYearId || currentAcademicYear?.id
      });
      
      console.log('✅ Clôtures journalières chargées:', closuresData);
      
      if (closuresData && closuresData.success && Array.isArray(closuresData.data)) {
        setDailyClosures(closuresData.data);
      } else if (Array.isArray(closuresData)) {
        setDailyClosures(closuresData);
      } else {
        setDailyClosures([]);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des clôtures journalières:', err);
      setDailyClosureError(err instanceof Error ? err.message : 'Erreur lors du chargement des clôtures journalières');
    } finally {
      setDailyClosureLoading(false);
    }
  };

  const createDailyClosure = async (closureData: any) => {
    if (!user?.schoolId) {
      throw new Error('Aucun établissement sélectionné');
    }
    
    try {
      console.log('=== DEBUG createDailyClosure ===');
      console.log('closureData:', closureData);
      
      const result = await api.finance.createDailyClosure({
        ...closureData,
        schoolId: user.schoolId,
        academicYearId: currentAcademicYear?.id,
        createdBy: user.id
      });
      
      console.log('Résultat createDailyClosure:', result);
      
      if (result && result.success) {
        showSuccess('Clôture créée', 'La clôture journalière a été créée avec succès');
        await fetchDailyClosures();
      } else {
        throw new Error(result?.error || 'Erreur lors de la création de la clôture');
      }
    } catch (err) {
      console.error('Erreur lors de la création de la clôture:', err);
      showError('Erreur', 'Erreur lors de la création de la clôture journalière');
      throw err;
    }
  };

  const updateDailyClosure = async (id: string, closureData: any) => {
    try {
      console.log('=== DEBUG updateDailyClosure ===');
      console.log('id:', id, 'closureData:', closureData);
      
      const result = await api.finance.updateDailyClosure(id, closureData);
      console.log('Résultat updateDailyClosure:', result);
      
      if (result && result.success) {
        showSuccess('Clôture mise à jour', 'La clôture journalière a été mise à jour avec succès');
        await fetchDailyClosures();
      } else {
        throw new Error(result?.error || 'Erreur lors de la mise à jour de la clôture');
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la clôture:', err);
      showError('Erreur', 'Erreur lors de la mise à jour de la clôture journalière');
      throw err;
    }
  };

  const deleteDailyClosure = async (id: string) => {
    try {
      console.log('=== DEBUG deleteDailyClosure ===');
      console.log('id:', id);
      
      const result = await api.finance.deleteDailyClosure(id);
      console.log('Résultat deleteDailyClosure:', result);
      
      if (result && result.success) {
        showSuccess('Clôture supprimée', 'La clôture journalière a été supprimée avec succès');
        await fetchDailyClosures();
      } else {
        throw new Error(result?.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la clôture:', error);
      showError('Erreur', 'Erreur lors de la suppression de la clôture journalière');
      throw error;
    }
  };


  const handleCreateDailyClosure = () => {
    setSelectedDailyClosure(null);
    setIsEditClosureMode(false);
    setIsDailyClosureModalOpen(true);
  };

  const handleViewDailyClosure = (closure: any) => {
    setSelectedDailyClosure(closure);
    setIsEditClosureMode(false);
    setIsDailyClosureModalOpen(true);
  };

  const handleSaveDailyClosure = async (closureData: any) => {
    if (isEditClosureMode && selectedDailyClosure) {
      await updateDailyClosure(selectedDailyClosure.id, closureData);
    } else {
      await createDailyClosure(closureData);
    }
  };

  const handleCloseDailyClosureModal = () => {
    setIsDailyClosureModalOpen(false);
    setSelectedDailyClosure(null);
    setIsEditClosureMode(false);
  };

  // Fonction pour ouvrir le modal d'édition d'une clôture
  const handleEditDailyClosure = (closure: any) => {
    setSelectedDailyClosure(closure);
    setIsEditClosureMode(true);
    setIsDailyClosureModalOpen(true);
  };

  // Fonction pour supprimer une clôture
  const handleDeleteDailyClosure = (closureId: string) => {
    setConfirmationData({
      type: 'delete',
      item: { id: closureId },
      action: () => deleteDailyClosure(closureId),
      title: 'Supprimer la clôture',
      message: 'Supprimer cette clôture ?'
    });
    setIsConfirmationModalOpen(true);
  };

  // Fonction pour enregistrer la justification de l'écart
  const handleSaveVarianceJustification = async () => {
    try {
      if (!varianceJustification.trim()) {
        showError('Justification requise', 'Veuillez saisir une justification pour l\'écart de caisse');
        return;
      }

      // Marquer la justification comme enregistrée
      setIsVarianceJustified(true);
      
      // Optionnel : Sauvegarder en base de données si nécessaire
      // Ici on pourrait créer une table pour stocker les justifications d'écarts
      
      showSuccess('Justification enregistrée', 'La justification de l\'écart a été enregistrée avec succès');
      
      console.log('Justification enregistrée:', {
        variance: cashVariance,
        justification: varianceJustification,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la justification:', error);
      showError('Erreur', 'Erreur lors de l\'enregistrement de la justification');
    }
  };

  // Fonction pour modifier la justification
  const handleEditVarianceJustification = () => {
    setIsVarianceJustified(false);
    showSuccess('Modification activée', 'Vous pouvez maintenant modifier la justification');
  };

  // Fonctions pour la validation et rapprochement
  const calculateCashVariance = () => {
    const dailyBalance = dailyClosures?.reduce((sum, closure) => sum + (closure.netBalance || 0), 0) || 0;
    const expectedCash = openingCashAmount + dailyBalance;
    const variance = currentCashAmount - expectedCash;
    setCashVariance(variance);
    
    // Réinitialiser la justification si l'écart change
    if (isVarianceJustified && Math.abs(variance) !== Math.abs(cashVariance)) {
      setIsVarianceJustified(false);
      setVarianceJustification('');
    }
    
    return variance;
  };

  const handleValidateClosure = async () => {
    try {
      const variance = calculateCashVariance();
      
      if (Math.abs(variance) > 0 && !isVarianceJustified) {
        showError('Écart de caisse', 'Veuillez justifier l\'écart de caisse avant de valider la clôture. Utilisez le bouton "Enregistrer la justification" après avoir saisi votre explication.');
        return;
      }

      // Vérifier que la justification n'est pas vide si il y a un écart
      if (Math.abs(variance) > 0 && !varianceJustification.trim()) {
        showError('Justification requise', 'Veuillez saisir une justification pour l\'écart de caisse avant de valider la clôture');
        return;
      }

      // Créer la clôture avec validation
      const closureData = {
        date: selectedClosureDate || new Date().toISOString().split('T')[0],
        totalIncome: dailyStats?.totalIncome || 0,
        totalExpenses: dailyStats?.totalExpenses || 0,
        netBalance: dailyStats?.netBalance || 0,
        cashOnHand: currentCashAmount,
        bankDeposits: 0, // À implémenter
        pendingPayments: 0, // À implémenter
        pendingExpenses: 0, // À implémenter
        notes: varianceJustification || '',
        status: 'completed',
        createdBy: user?.id || 'system'
      };

      await createDailyClosure(closureData);
      showSuccess('Clôture validée', 'La clôture journalière a été validée et verrouillée avec succès');
    } catch (error) {
      console.error('Erreur lors de la validation de la clôture:', error);
      showError('Erreur', 'Erreur lors de la validation de la clôture');
    }
  };

  const handleGenerateReport = (type: 'pdf' | 'excel' | 'email') => {
    // Implémentation de la génération de rapports
    console.log(`Génération du rapport ${type}`);
    showSuccess('Rapport généré', `Le rapport ${type.toUpperCase()} a été généré avec succès`);
  };

  // Fonction pour filtrer les données par date
  const filterDataByDate = (targetDate: string) => {
    const date = targetDate || new Date().toISOString().split('T')[0];
    
    // Filtrer les recettes par date
    const filteredRevenues = revenues?.filter(revenue => {
      const revenueDate = new Date(revenue.date).toISOString().split('T')[0];
      return revenueDate === date;
    }) || [];
    
    // Filtrer les dépenses par date (exclure les dépenses rejetées)
    const filteredExpenses = expenses?.filter(expense => {
      const expenseDate = new Date(expense.date).toISOString().split('T')[0];
      return expenseDate === date && expense.status !== 'rejected';
    }) || [];
    
    setDailyRevenues(filteredRevenues);
    setDailyExpenses(filteredExpenses);
    
    return { filteredRevenues, filteredExpenses };
  };

  const loadDailyStats = async () => {
    const targetDate = selectedClosureDate || new Date().toISOString().split('T')[0];
    const { filteredRevenues, filteredExpenses } = filterDataByDate(targetDate);
    
    // Calculer les statistiques de la journée avec les données filtrées
    const totalIncome = filteredRevenues?.reduce((sum, revenue) => sum + (revenue.amount || 0), 0) || 0;
    const totalExpenses = filteredExpenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
    const netBalance = totalIncome - totalExpenses;
    
    // Calculer les statistiques par type de recette
    const tuitionIncome = filteredRevenues?.filter(r => 
      r.type === 'inscription_fee' || r.type === 'reinscription_fee' || r.type === 'tuition_fee'
    ).reduce((sum, revenue) => sum + (revenue.amount || 0), 0) || 0;
    
    const tuitionPercentage = totalIncome > 0 ? Math.round((tuitionIncome / totalIncome) * 100) : 0;
    
    // Calculer les modes de paiement
    const paymentMethods = filteredRevenues?.reduce((acc, revenue) => {
      const method = getPaymentMethodLabel(revenue.paymentMethod || '') || 'Non spécifié';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number }) || {};

    setDailyStats({
      totalIncome,
      totalExpenses,
      netBalance,
      tuitionPercentage,
      averagePayment: filteredRevenues?.length > 0 ? Math.round(totalIncome / filteredRevenues.length) : 0,
      paymentMethods,
      totalTransactions: (filteredRevenues?.length || 0) + (filteredExpenses?.length || 0)
    });
  };

  // Fonction pour charger l'historique des clôtures
  const loadClosureHistory = async () => {
    try {
      if (currentAcademicYear?.id && user?.schoolId) {
        const closures = await (window as any).electronAPI?.finance?.getDailyClosures(user?.schoolId, {
          academicYearId: currentAcademicYear.id,
          limit: 10,
          orderBy: 'date',
          order: 'desc'
        });
        
        if (closures && closures.success) {
          setClosureHistory(closures.data || []);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique des clôtures:', error);
    }
  };

  // Fonction pour calculer les statistiques hebdomadaires
  const calculateWeeklyStats = async () => {
    try {
      if (currentAcademicYear?.id && user?.schoolId) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        // Récupérer les clôtures de la semaine
        const weeklyClosures = await (window as any).electronAPI?.finance?.getDailyClosures(user?.schoolId, {
          academicYearId: currentAcademicYear.id,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        });

        if (weeklyClosures && weeklyClosures.success) {
          const closures = weeklyClosures.data || [];
          const totalIncome = closures.reduce((sum: number, closure: any) => sum + (closure.totalIncome || 0), 0);
          const totalExpenses = closures.reduce((sum: number, closure: any) => sum + (closure.totalExpenses || 0), 0);
          const netBalance = totalIncome - totalExpenses;
          const daysCount = closures.length || 1;

          setWeeklyStats({
            averageDailyIncome: Math.round(totalIncome / daysCount),
            averageDailyExpenses: Math.round(totalExpenses / daysCount),
            averageDailyBalance: Math.round(netBalance / daysCount),
            totalDays: daysCount
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques hebdomadaires:', error);
    }
  };

  // Fonction pour calculer la projection du lendemain
  const calculateNextDayProjection = () => {
    if (dailyStats?.netBalance) {
      setNextDayProjection(dailyStats.netBalance);
    }
  };

  // Fonction pour générer les alertes
  const generateAlerts = async () => {
    const alertsList = [];
    
    try {
      if (currentAcademicYear?.id) {
        // Vérifier les clôtures manquantes
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const yesterdayClosure = await (window as any).electronAPI?.finance?.getDailyClosures(user?.schoolId, {
          academicYearId: currentAcademicYear.id,
          date: yesterday.toISOString().split('T')[0]
        });

        if (!yesterdayClosure?.success || !yesterdayClosure.data?.length) {
          alertsList.push({
            type: 'missing_closure',
            message: `Clôture manquante pour le ${yesterday.toLocaleDateString('fr-FR')}`,
            severity: 'warning'
          });
        }

        // Vérifier les écarts de caisse non justifiés
        if (Math.abs(cashVariance) > 0 && !isVarianceJustified) {
          alertsList.push({
            type: 'unjustified_variance',
            message: `Écart de caisse de ${Math.abs(cashVariance).toLocaleString()} F CFA non justifié`,
            severity: 'error'
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la génération des alertes:', error);
    }

    setAlerts(alertsList);
  };

  // Fonction pour charger les informations du comptable (comme PDFReceipt)
  const loadAccountantInfo = async () => {
    if (isAccountantLoaded) return;
    
    try {
      console.log('🔍 Finance - Récupération des informations du comptable...');
      const schoolId = currentAcademicYear?.schoolId || 'school-1';
      const accountantInfo = await hrService.getAccountantInfo(schoolId);
      if (accountantInfo?.name) {
        setAccountantName(accountantInfo.name);
        // Extraire le prénom pour la signature
        const firstName = accountantInfo.name.split(' ')[0] || accountantInfo.name;
        setAccountantFirstName(firstName);
        console.log('✅ Finance - Nom du comptable récupéré:', accountantInfo.name);
      } else {
        console.log('⚠️ Finance - Aucun comptable trouvé, utilisation du nom par défaut');
        // Utiliser l'utilisateur connecté comme fallback
        const fallbackName = user?.name || 'Utilisateur';
        setAccountantName(fallbackName);
        // Extraire le prénom pour la signature
        const firstName = fallbackName.split(' ')[0] || fallbackName;
        setAccountantFirstName(firstName);
      }
      setIsAccountantLoaded(true);
    } catch (error) {
      console.error('❌ Finance - Erreur lors de la récupération du comptable:', error);
      // En cas d'erreur, utiliser l'utilisateur connecté
      const fallbackName = user?.name || 'Utilisateur';
      setAccountantName(fallbackName);
      setAccountantInfo({
        name: fallbackName,
        position: 'Comptable'
      });
      // Extraire le prénom pour la signature
      const firstName = fallbackName.split(' ')[0] || fallbackName;
      setAccountantFirstName(firstName);
      setIsAccountantLoaded(true);
    }
  };

  // ===== FONCTIONS POUR L'ONGLET TRÉSORERIE =====

  // Fonction pour charger les comptes de trésorerie
  const loadTreasuryAccounts = async () => {
    try {
      setTreasuryLoading(true);
      const schoolId = currentAcademicYear?.schoolId || 'school-1';
      const accounts = await treasuryService.getTreasuryAccounts(schoolId);
      setTreasuryAccounts(accounts);
      console.log('✅ Comptes de trésorerie chargés:', accounts.length);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des comptes de trésorerie:', error);
      setTreasuryError('Erreur lors du chargement des comptes de trésorerie');
    } finally {
      setTreasuryLoading(false);
    }
  };

  // Fonction pour charger les statistiques de trésorerie
  const loadTreasuryStats = async () => {
    try {
      setTreasuryLoading(true);
      const schoolId = currentAcademicYear?.schoolId || 'school-1';
      const stats = await treasuryService.getTreasuryStats(schoolId, selectedTreasuryPeriod);
      setTreasuryStats(stats);
      console.log('✅ Statistiques de trésorerie chargées:', stats);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des statistiques de trésorerie:', error);
      setTreasuryError('Erreur lors du chargement des statistiques de trésorerie');
    } finally {
      setTreasuryLoading(false);
    }
  };

  // Fonction pour calculer le fond de roulement
  const calculateWorkingCapital = async () => {
    try {
      setTreasuryLoading(true);
      const schoolId = currentAcademicYear?.schoolId || 'school-1';
      const workingCapitalData = await treasuryService.getWorkingCapital(schoolId);
      setWorkingCapital(workingCapitalData);
      console.log('✅ Fond de roulement calculé:', workingCapitalData);
    } catch (error) {
      console.error('❌ Erreur lors du calcul du fond de roulement:', error);
      setTreasuryError('Erreur lors du calcul du fond de roulement');
    } finally {
      setTreasuryLoading(false);
    }
  };

  // Fonction pour charger l'historique de trésorerie
  const loadTreasuryHistory = async () => {
    try {
      setTreasuryLoading(true);
      const schoolId = currentAcademicYear?.schoolId || 'school-1';
      const filters = {
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      };
      const operations = await treasuryService.getTreasuryOperations(schoolId, filters);
      setTreasuryOperations(operations);
      
      // Transformer les opérations en historique pour l'affichage
      const history = operations.map(op => ({
        id: op.id,
        date: op.created_at,
        type: op.type,
        description: op.description,
        amount: op.amount,
        account: treasuryAccounts.find(acc => acc.id === op.account_id)?.name || 'Compte inconnu',
        user: op.created_by
      }));
      
      setTreasuryHistory(history);
      console.log('✅ Historique de trésorerie chargé:', history.length, 'opérations');
    } catch (error) {
      console.error('❌ Erreur lors du chargement de l\'historique de trésorerie:', error);
      setTreasuryError('Erreur lors du chargement de l\'historique de trésorerie');
    } finally {
      setTreasuryLoading(false);
    }
  };

  // Fonction pour charger le patrimoine
  const loadTreasuryHeritage = async () => {
    try {
      setTreasuryLoading(true);
      const schoolId = currentAcademicYear?.schoolId || 'school-1';
      const heritage = await treasuryService.getTreasuryHeritage(schoolId);
      setTreasuryHeritage(heritage);
      console.log('✅ Patrimoine chargé:', heritage.length, 'éléments');
    } catch (error) {
      console.error('❌ Erreur lors du chargement du patrimoine:', error);
      setTreasuryError('Erreur lors du chargement du patrimoine');
    } finally {
      setTreasuryLoading(false);
    }
  };

  // Fonction pour charger toutes les données de trésorerie
  const loadTreasuryData = async () => {
    await Promise.all([
      loadTreasuryAccounts(),
      loadTreasuryStats(),
      calculateWorkingCapital(),
      loadTreasuryHistory(),
      loadTreasuryHeritage()
    ]);
  };

  // Fonction pour charger les données de paie
  const loadPayrollData = async () => {
    try {
      setPayrollLoading(true);
      setPayrollError(null);
      
      const payrollData = await financeService.getPayroll('school-1', {});
      setPayroll(payrollData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données de paie:', error);
      setPayrollError('Erreur lors du chargement des données de paie');
      setPayroll([]);
    } finally {
      setPayrollLoading(false);
    }
  };

  const {
    expenses,
    expenseCategories,
    loading: expensesLoading,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
    refreshData: refreshExpenses
  } = useExpenses();
  const { 
    tuitionLevels,
    tuitionStats,
    tuitionLoading,
    tuitionError,
    loadTuitionData
  } = useTuitionControl();
  const { classes, loading: classesLoading } = usePlanningData();
  const { showSuccess, showError } = useToast();
  const { user } = useUser();

  // États pour les modals de paiements
  const [isSchoolFeesPaymentModalOpen, setIsSchoolFeesPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // États pour les modals de confirmation (déjà déclarés plus haut)

  // États pour le bilan des encaissements
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentsInClass, setStudentsInClass] = useState<any[]>([]);
  const [studentPayments, setStudentPayments] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // États pour les paiements
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);

  // États pour les totaux de scolarité calculés
  const [calculatedTuitionTotals, setCalculatedTuitionTotals] = useState({
    totalExpected: 0,
    totalPaid: 0,
    totalRemaining: 0
  });
  const [totalsLoading, setTotalsLoading] = useState(false);

  // États pour le contrôle de scolarité
  const [tuitionSearchTerm, setTuitionSearchTerm] = useState('');
  const [tuitionFilterStatus, setTuitionFilterStatus] = useState('all');
  const [isClassPaymentSummaryModalOpen, setIsClassPaymentSummaryModalOpen] = useState(false);
  const [selectedClassForSummary, setSelectedClassForSummary] = useState<any>(null);

  // États pour l'expansion des niveaux et classes (comme dans Students.tsx)
  const [expandedLevels, setExpandedLevels] = useState<{ [key: string]: boolean }>({});
  const [expandedClasses, setExpandedClasses] = useState<{ [key: string]: boolean }>({});

  // Les statistiques des recettes sont maintenant gérées par le hook useRevenues
  const [selectedRevenuePeriod, setSelectedRevenuePeriod] = useState('all');
  const [selectedRevenueType, setSelectedRevenueType] = useState('all');
  const [selectedRevenueYear, setSelectedRevenueYear] = useState<any>(null);
  const [revenueSearchTerm, setRevenueSearchTerm] = useState('');
  const [editingRevenue, setEditingRevenue] = useState<any>(null);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line' | 'area'>('bar');
  const [isRevenuePrintModalOpen, setIsRevenuePrintModalOpen] = useState(false);
  const [revenuePrintViewMode, setRevenuePrintViewMode] = useState<'list' | 'summary'>('list');
  const [revenueFormData, setRevenueFormData] = useState({
    type: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    studentName: '',
    className: '',
    paymentMethod: 'Espèces',
    status: 'completed',
    reference: '',
    name: '' // Pour les types Don, Subvention, Autre
  });
  
  // États pour les données de classes et étudiants
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [isAddRevenueModalOpen, setIsAddRevenueModalOpen] = useState(false);
  // const [userSelectedYear, setUserSelectedYear] = useState<boolean>(false); // Plus utilisé
  
  // États pour les actions sur les recettes
  const [deletingRevenueId, setDeletingRevenueId] = useState<string | null>(null);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);

  // États pour les dépenses
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isExpenseEditModalOpen, setIsExpenseEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [expenseFormData, setExpenseFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    subcategory: '',
    vendor: '',
    paymentMethod: 'cash',
    receiptNumber: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
  const [expenseFilterCategory, setExpenseFilterCategory] = useState('');
  const [expenseFilterStatus, setExpenseFilterStatus] = useState('');
  const [expenseFilterStartDate, setExpenseFilterStartDate] = useState('');
  const [expenseFilterEndDate, setExpenseFilterEndDate] = useState('');
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [expenseToReject, setExpenseToReject] = useState<any>(null);
  const [isExpensePrintModalOpen, setIsExpensePrintModalOpen] = useState(false);
  const [expensePrintViewMode, setExpensePrintViewMode] = useState<'list' | 'summary'>('list');

  // Charger les classes et étudiants disponibles
  useEffect(() => {
    const loadClassesAndStudents = async () => {
      try {
        // Charger les classes
        const classes = await planningService.getClasses(user?.schoolId || 'school-1');
        setAvailableClasses(classes);
        
        // Charger les étudiants
        const students = await studentsService.getStudents(user?.schoolId || 'school-1');
        setAvailableStudents(students);
        setFilteredStudents(students);
      } catch (error) {
        console.error('Erreur lors du chargement des classes et étudiants:', error);
      }
    };
    
    if (user?.schoolId) {
      loadClassesAndStudents();
    }
  }, [user?.schoolId]);
  
  // Filtrer les étudiants par classe
  useEffect(() => {
    if (revenueFormData.className && availableStudents.length > 0) {
      const filtered = availableStudents.filter(student => 
        student.className === revenueFormData.className
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(availableStudents);
    }
  }, [revenueFormData.className, availableStudents]);
  
  // La référence est maintenant générée au moment de la sauvegarde pour avoir un ordre séquentiel correct

  // États manquants pour les vues
  const [revenueViewMode, setRevenueViewMode] = useState<'grid' | 'list' | 'chart' | 'table' | 'summary' | 'export'>('table');

  // Fonctions pour le contrôle de scolarité
  const filterStudents = (students: any[]) => {
    return students.filter(student => {
      // Filtre par terme de recherche
      const searchMatch = !tuitionSearchTerm || 
        student.studentName?.toLowerCase().includes(tuitionSearchTerm.toLowerCase()) ||
        student.className?.toLowerCase().includes(tuitionSearchTerm.toLowerCase()) ||
        student.level?.toLowerCase().includes(tuitionSearchTerm.toLowerCase());
      
      // Filtre par statut
      const statusMatch = tuitionFilterStatus === 'all' || student.status === tuitionFilterStatus;
      
      return searchMatch && statusMatch;
    });
  };

  const filterLevelsAndClasses = (levels: any[]) => {
    return levels.map(level => ({
      ...level,
      classes: level.classes.map((classItem: any) => ({
        ...classItem,
        students: filterStudents(classItem.students)
      })).filter((classItem: any) => classItem.students.length > 0)
    })).filter(level => level.classes.length > 0);
  };

  const sortLevels = (levels: any[]) => {
    const levelOrder = ['maternelle', 'primaire', '1er-cycle-secondaire', '2nd-cycle-secondaire'];
    return levels.sort((a, b) => {
      const aIndex = levelOrder.indexOf(a.name.toLowerCase());
      const bIndex = levelOrder.indexOf(b.name.toLowerCase());
      return aIndex - bIndex;
    });
  };

  const deduplicateClasses = (levels: any[]) => {
    return levels.map(level => ({
      ...level,
      classes: level.classes.filter((classItem: any, index: number, self: any[]) => 
        index === self.findIndex(c => c.id === classItem.id)
      )
    }));
  };


  const calculateFilteredStats = (levels: any[]) => {
    const filteredLevels = filterLevelsAndClasses(levels);
    let totalStudents = 0;
    let completedPayments = 0;
    let partialPayments = 0;
    let notStartedPayments = 0;

    filteredLevels.forEach(level => {
      level.classes.forEach((classItem: any) => {
        classItem.students.forEach((student: any) => {
          totalStudents++;
          if (student.status === 'completed') completedPayments++;
          else if (student.status === 'partial') partialPayments++;
          else if (student.status === 'not_started') notStartedPayments++;
        });
      });
    });

    return {
      totalStudents,
      completedPayments,
      partialPayments,
      notStartedPayments
    };
  };

  // Calculer les statistiques filtrées
  const filteredStats = calculateFilteredStats(tuitionLevels);

  // Fonction pour afficher le récapitulatif global de tous les élèves
  const handleShowGlobalPaymentSummary = () => {
    // Collecter tous les élèves de tous les niveaux et classes
    const allStudents: any[] = [];
    tuitionLevels.forEach(level => {
      level.classes.forEach((classItem: any) => {
        classItem.students.forEach((student: any) => {
          allStudents.push({
            ...student,
            level: level.name,
            className: classItem.name
          });
        });
      });
    });

    const globalData = {
      id: 'global',
      name: 'Tous les élèves',
      level: 'Tous les niveaux',
      students: allStudents
    };
    
    setSelectedClassForSummary(globalData);
    setIsClassPaymentSummaryModalOpen(true);
  };

  // Fonctions pour le contrôle de scolarité (comme dans Students.tsx)
  const toggleLevel = (levelId: string) => {
    setExpandedLevels(prev => ({
      ...prev,
      [levelId]: !prev[levelId]
    }));
  };

  const toggleClass = (levelId: string, classId: string) => {
    const classKey = `${levelId}-${classId}`;
    setExpandedClasses(prev => ({
      ...prev,
      [classKey]: !prev[classKey]
    }));
  };

  // Informations des niveaux (comme dans Students.tsx)
  const getLevelInfo = (level: string) => {
    const levelInfo: Record<string, {
      icon: React.ComponentType<any>;
      description: string;
      color: string;
      bgColor: string;
      textColor: string;
    }> = {
      'maternelle': {
        icon: GraduationCap,
        description: 'Éducation préscolaire (3-6 ans)',
        color: 'from-pink-500 to-pink-600',
        bgColor: 'from-pink-50 to-pink-100',
        textColor: 'text-pink-700'
      },
      'primaire': {
        icon: GraduationCap,
        description: 'Enseignement primaire (6-12 ans)',
        color: 'from-blue-500 to-blue-600',
        bgColor: 'from-blue-50 to-blue-100',
        textColor: 'text-blue-700'
      },
      '1er-cycle-secondaire': {
        icon: GraduationCap,
        description: '1er cycle secondaire (12-15 ans)',
        color: 'from-green-500 to-green-600',
        bgColor: 'from-green-50 to-green-100',
        textColor: 'text-green-700'
      },
      '2nd-cycle-secondaire': {
        icon: GraduationCap,
        description: '2nd cycle secondaire (15-18 ans)',
        color: 'from-purple-500 to-purple-600',
        bgColor: 'from-purple-50 to-purple-100',
        textColor: 'text-purple-700'
      }
    };
    
    return levelInfo[level] || {
      icon: GraduationCap,
      description: 'Niveau scolaire',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'from-gray-50 to-gray-100',
      textColor: 'text-gray-700'
    };
  };

  // Capitaliser le niveau scolaire (comme dans Students.tsx)
  const capitalizeLevel = (level: string) => {
    const levelMap: Record<string, string> = {
      'maternelle': 'Maternelle',
      'primaire': 'Primaire',
      '1er-cycle-secondaire': '1er Cycle Secondaire',
      '2nd-cycle-secondaire': '2nd Cycle Secondaire'
    };
    return levelMap[level] || level;
  };

  const getStatusColor = (status: 'not_started' | 'partial' | 'completed') => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partial':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'not_started':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: 'not_started' | 'partial' | 'completed') => {
    switch (status) {
      case 'completed':
        return 'Soldé';
      case 'partial':
        return 'Partiellement soldé';
      case 'not_started':
        return 'Non soldé';
      default:
        return 'Inconnu';
    }
  };

  // Fonction pour afficher le récapitulatif des paiements d'une classe
  const handleShowClassPaymentSummary = (classItem: any, level: any) => {
    const classData = {
      id: classItem.id,
      name: classItem.name,
      level: level.name,
      students: classItem.students
    };
    setSelectedClassForSummary(classData);
    setIsClassPaymentSummaryModalOpen(true);
  };

  // Fonction pour envoyer un rappel
  const handleSendReminder = (student: any, type: 'call' | 'sms') => {
    console.log(`Envoi d'un rappel ${type} à ${student.studentName}`);
    // TODO: Implémenter l'envoi de rappel
  };

  // Fonction pour gérer l'ouverture du modal d'ajout de recette
  // La génération de référence est maintenant faite directement dans handleSaveRevenue

  // Fonctions pour gérer les actions sur les recettes
  const handleEditRevenue = (revenue: any) => {
    setEditingRevenue(revenue);
    setRevenueFormData({
      type: revenue.type || '',
      description: revenue.description || '',
      amount: revenue.amount?.toString() || '',
      date: revenue.date || new Date().toISOString().split('T')[0],
      studentName: revenue.studentName || '',
      className: revenue.className || '',
      paymentMethod: revenue.paymentMethod === 'Mobile Money' ? 'Mobile Money' : 
                    revenue.paymentMethod === 'Carte' ? 'Carte' : 'Espèces',
      status: revenue.status || 'completed',
      reference: revenue.reference || '',
      name: revenue.studentName || '' // Pour les types Don, Subvention, Autre
    });
    setIsAddRevenueModalOpen(true);
  };

  const handleDeleteRevenue = (revenue: any) => {
    setDeletingRevenueId(revenue.id);
    setIsDeleteConfirmModalOpen(true);
  };

  const confirmDeleteRevenue = async () => {
    if (!deletingRevenueId) return;

    try {
      // Supprimer de la base de données
      await deleteRevenue(deletingRevenueId);
      
      showSuccess('Suppression réussie', 'Recette supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showError('Erreur', 'Erreur lors de la suppression de la recette');
    } finally {
      setDeletingRevenueId(null);
      setIsDeleteConfirmModalOpen(false);
    }
  };

  const handleAddRevenue = () => {
    setEditingRevenue(null);
    setRevenueFormData({
      type: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      studentName: '',
      className: '',
      paymentMethod: 'Espèces',
      status: 'completed',
      reference: '', // La référence sera générée au moment de la sauvegarde
      name: '' // Pour les types Don, Subvention, Autre
    });
    setIsAddRevenueModalOpen(true);
  };

  // Fonction pour sauvegarder une nouvelle recette
  const handleSaveRevenue = async () => {
    if (!revenueFormData.description || !revenueFormData.amount || !revenueFormData.type) {
      showError('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Validation conditionnelle selon le type de recette
    if (['uniforme', 'fournitures', 'cantine'].includes(revenueFormData.type)) {
      if (!revenueFormData.className || !revenueFormData.studentName) {
        showError('Erreur', 'Veuillez sélectionner une classe et un élève pour ce type de recette');
        return;
      }
    } else if (['don', 'subvention', 'autre'].includes(revenueFormData.type)) {
      if (!revenueFormData.name) {
        showError('Erreur', 'Veuillez saisir un nom pour ce type de recette');
        return;
      }
    }

    const academicYearId = selectedRevenueYear?.id || (currentAcademicYear as any)?.id || (academicYears?.[0]?.id);
    if (!academicYearId) {
      showError('Erreur', 'Aucune année scolaire sélectionnée. Veuillez sélectionner une année scolaire.');
      return;
    }

    try {
      // Générer la référence au moment de la sauvegarde pour avoir un ordre séquentiel correct
      const currentYear = selectedRevenueYear || currentAcademicYear || academicYears?.[0];
      const academicYear = currentYear?.name || '2025-2026';
      const className = revenueFormData.className || '';

      let autoReference = '';
      if (className && className.trim() !== '') {
        autoReference = await generateReceiptNumberFromDB(academicYear, className, revenueFormData.type);
      } else {
        const fullReference = await generateReceiptNumberFromDB(academicYear, 'GEN', revenueFormData.type);
        autoReference = fullReference.replace(/-GEN$/, '');
      }

      // Mettre à jour la référence dans le formulaire
      setRevenueFormData(prev => ({ ...prev, reference: autoReference }));

      // Récupérer des IDs valides de la base de données
      let validStudentId = editingRevenue?.studentId;
      let validClassId = editingRevenue?.classId;
      
      // Si pas d'ID valide, récupérer le premier élève et la première classe disponibles
      if (!validStudentId) {
        try {
          // Récupérer le premier élève disponible
          const students = await studentsService.getStudents(user?.schoolId || 'school-1');
          if (students.length > 0) {
            validStudentId = students[0].id;
            console.log('✅ ID d\'élève valide trouvé:', validStudentId);
          } else {
            console.warn('⚠️ Aucun élève trouvé, utilisation d\'un ID par défaut');
            validStudentId = 'default-student-id';
          }
        } catch (error) {
          console.warn('⚠️ Impossible de récupérer les élèves:', error);
          validStudentId = 'default-student-id';
        }
      }
      
      if (!validClassId) {
        try {
          // Récupérer la première classe disponible
          const classes = await planningService.getClasses(user?.schoolId || 'school-1');
          if (classes.length > 0) {
            validClassId = classes[0].id;
            console.log('✅ ID de classe valide trouvé:', validClassId);
          } else {
            console.warn('⚠️ Aucune classe trouvée, utilisation d\'un ID par défaut');
            validClassId = 'default-class-id';
          }
        } catch (error) {
          console.warn('⚠️ Impossible de récupérer les classes:', error);
          validClassId = 'default-class-id';
        }
      }

      // Déterminer le nom à utiliser selon le type de recette
      let displayName = '';
      if (['don', 'subvention', 'autre'].includes(revenueFormData.type)) {
        displayName = revenueFormData.name || 'Général';
      } else {
        displayName = revenueFormData.studentName || 'Général';
      }

      // Cette variable n'est plus utilisée, les données sont préparées directement dans revenueDataToSave

      // Préparer les données de recette pour le nouveau service
      const revenueDataToSave = {
        studentId: validStudentId,
        studentName: displayName,
        classId: validClassId,
        className: revenueFormData.className || 'Général',
        academicYearId: academicYearId,
        amount: parseFloat(revenueFormData.amount),
        type: revenueFormData.type,
        description: revenueFormData.description || '',
        paymentMethod: revenueFormData.paymentMethod || 'Espèces',
        method: (revenueFormData.paymentMethod === 'Espèces' ? 'cash' : 
                revenueFormData.paymentMethod === 'Mobile Money' ? 'mobile_money' : 
                revenueFormData.paymentMethod === 'Carte' ? 'card' : 'cash') as 'mobile_money' | 'card' | 'cash',
          reference: autoReference,
          receiptNumber: autoReference,
        status: (revenueFormData.status || 'completed') as 'completed' | 'pending' | 'cancelled',
        date: revenueFormData.date || new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        schoolId: user?.schoolId || 'school-1',
        isManualRevenue: true,
        sourceType: 'manual' as const
        };

      if (editingRevenue) {
        // Mise à jour d'une recette existante
        await updateRevenue(editingRevenue.id, revenueDataToSave);
        showSuccess('Modification réussie', 'Recette modifiée avec succès');
        
        // Fermer le modal et réinitialiser
        setIsAddRevenueModalOpen(false);
        setEditingRevenue(null);
        setRevenueFormData({ type: '', description: '', amount: '', date: new Date().toISOString().split('T')[0], studentName: '', className: '', name: '', paymentMethod: 'Espèces', status: 'completed', reference: '' });
      } else {
        // Ajout d'une nouvelle recette
        console.log('💾 Sauvegarde de la nouvelle recette:', revenueDataToSave);
        
        await createRevenue(revenueDataToSave);
        console.log('✅ Recette sauvegardée en base');
        
        showSuccess('Ajout réussi', 'Recette ajoutée avec succès');
        
        // Fermer le modal et réinitialiser
        setIsAddRevenueModalOpen(false);
        setRevenueFormData({ type: '', description: '', amount: '', date: new Date().toISOString().split('T')[0], studentName: '', className: '', name: '', paymentMethod: 'Espèces', status: 'completed', reference: '' });
      }

      setIsAddRevenueModalOpen(false);
      setEditingRevenue(null);
      
      // Pas besoin de recharger les données car on a déjà mis à jour l'état local
      // await loadRevenueData();
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de la recette:', error);
      showError('Erreur', 'Erreur lors de la sauvegarde de la recette');
    }
  };

  // Les fonctions de chargement des recettes sont maintenant gérées par le hook useRevenues

  // Fonction pour obtenir l'icône et la couleur d'un type de recette
  const getRevenueTypeInfo = (type: string) => {
    switch (type) {
      // Types de recettes manuelles
      case 'uniforme':
        return { 
          icon: <Shirt className="w-5 h-5" />, 
          color: 'text-purple-600', 
          bgColor: 'bg-purple-100' 
        };
      case 'fournitures':
        return { 
          icon: <BookOpen className="w-5 h-5" />, 
          color: 'text-orange-600', 
          bgColor: 'bg-orange-100' 
        };
      case 'cantine':
        return { 
          icon: <Utensils className="w-5 h-5" />, 
          color: 'text-red-600', 
          bgColor: 'bg-red-100' 
        };
      case 'don':
        return { 
          icon: <Heart className="w-5 h-5" />, 
          color: 'text-pink-600', 
          bgColor: 'bg-pink-100' 
        };
      case 'subvention':
        return { 
          icon: <Building2 className="w-5 h-5" />, 
          color: 'text-indigo-600', 
          bgColor: 'bg-indigo-100' 
        };
      // Types d'encaissements
      case 'scolarite':
        return { 
          icon: <GraduationCap className="w-5 h-5" />, 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-100' 
        };
      case 'inscription':
        return { 
          icon: <FileText className="w-5 h-5" />, 
          color: 'text-green-600', 
          bgColor: 'bg-green-100' 
        };
      case 'reinscription':
        return { 
          icon: <RotateCcw className="w-5 h-5" />, 
          color: 'text-teal-600', 
          bgColor: 'bg-teal-100' 
        };
      // Types de recettes synchronisées
      case 'inscription_fee':
      case 'reinscription_fee':
      case 'tuition_fee':
        return { 
          icon: <GraduationCap className="w-5 h-5" />, 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-100' 
        };
      case 'autre':
        return { 
          icon: <Coins className="w-5 h-5" />, 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-100' 
        };
      default:
        return { 
          icon: <Coins className="w-5 h-5" />, 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-100' 
        };
    }
  };

  // Fonction pour obtenir la description correcte d'une recette
  const getRevenueDescription = (revenue: any) => {
    // Pour les recettes synchronisées (frais de scolarité), afficher "Paiement frais scolaires"
    if (revenue.type === 'inscription_fee' || revenue.type === 'reinscription_fee' || revenue.type === 'tuition_fee') {
      return 'Paiement frais scolaires';
    }
    
    // Pour les recettes manuelles, utiliser la description stockée
    return revenue.description || 'N/A';
  };

  // Fonction pour filtrer les recettes
  const filteredRevenueData = useMemo(() => {
    return revenues.filter(item => {
      // Filtre par terme de recherche
      if (revenueSearchTerm) {
        const searchLower = revenueSearchTerm.toLowerCase();
        if (!(item.description || '').toLowerCase().includes(searchLower) &&
            !(item.studentName || '').toLowerCase().includes(searchLower) &&
            !(item.className || '').toLowerCase().includes(searchLower) &&
            !(item.reference || '').toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      // Filtre par type
      if (selectedRevenueType !== 'all') {
        if (selectedRevenueType === 'inscription_scolarite') {
          // Filtrer les recettes d'inscription et de scolarité (synchronisées)
          if (!['inscription_fee', 'reinscription_fee', 'tuition_fee'].includes((item as any).type)) {
            return false;
          }
        } else {
        if ((item as any).type !== selectedRevenueType) {
          return false;
          }
        }
      }
      
      // Filtre par période
      if (selectedRevenuePeriod !== 'all') {
        const itemDate = new Date(item.date);
        const currentDate = new Date();
        
        switch (selectedRevenuePeriod) {
          case 'current':
            // Mois en cours
            if (itemDate.getMonth() !== currentDate.getMonth() || itemDate.getFullYear() !== currentDate.getFullYear()) {
              return false;
            }
            break;
            
          case 'last':
            // Mois précédent
            const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            if (itemDate.getMonth() !== lastMonth.getMonth() || itemDate.getFullYear() !== lastMonth.getFullYear()) {
              return false;
            }
            break;
            
          case 'year':
            // Année en cours
            if (itemDate.getFullYear() !== currentDate.getFullYear()) {
              return false;
            }
            break;
        }
      }
      
      return true;
    });
  }, [revenues, revenueSearchTerm, selectedRevenueType, selectedRevenuePeriod]);

  // Fonction pour actualiser les paiements
  const refreshPayments = () => {
    setPaymentsLoading(true);
    setPaymentsError(null);
    // Utiliser le hook pour actualiser
    if (refreshPaymentsHook) {
      refreshPaymentsHook();
    }
    // Simuler un rechargement
    setTimeout(() => {
      setPaymentsLoading(false);
    }, 1000);
  };

  // Utiliser les vraies données de paiements (exclure les recettes manuelles)
  const recentPayments = useMemo(() => {
    return payments
    .filter(payment => {
      const isManual = (payment as any).isManualRevenue;
      return !isManual; // Exclure les recettes manuelles
    })
    .slice(0, 10); // Afficher seulement les 10 premiers paiements
  }, [payments]);


  // Fonction pour obtenir le label de la méthode de paiement
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Espèces';
      case 'card': return 'Carte';
      case 'bank_transfer': return 'Virement';
      case 'check': return 'Chèque';
      case 'mobile_money': return 'Mobile Money';
      default: return method;
    }
  };

  // Fonction pour gérer l'édition d'un élément
  const handleEditItem = (item: any, type: string = 'payment') => {
    try {
      console.log('=== handleEditItem appelé ===');
      console.log('Item reçu:', item);
      console.log('Type:', type);
      
      switch (type) {
        case 'payment':
          // Pour l'édition des paiements, utiliser le modal de paiement des frais scolaires
          const paymentData = {
            id: item.id || item._id,
            studentName: item.studentName,
            studentId: item.studentId,
            className: item.className || item.classId,
            parentName: item.parentName,
            parentPhone: item.parentPhone,
            parentEmail: item.parentEmail,
            address: item.address,
            amount: item.amount,
            method: item.method,
            status: item.status,
            date: item.date,
            inscriptionFee: item.inscriptionFee,
            reinscriptionFee: item.reinscriptionFee,
            tuitionFee: item.tuitionFee,
            totalSchoolFees: item.totalSchoolFees,
            totalExpected: item.totalExpected,
            totalPaid: item.totalPaid,
            totalRemaining: item.totalRemaining,
            reduction: item.reduction,
            change: item.change
          };
          console.log('PaymentData préparé pour édition:', paymentData);
          setSelectedItem(paymentData);
          setIsSchoolFeesPaymentModalOpen(true);
          break;
          
        default:
          console.warn('Type d\'élément non supporté:', type);
      }
    } catch (error) {
      console.error('Erreur lors de la préparation de l\'édition:', error);
      showError('Erreur', 'Impossible de préparer l\'édition de cet élément');
    }
  };

  // Fonction pour gérer la suppression d'un élément
  const handleDeleteItem = (payment: any) => {

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const getPaymentTypeDisplay = (type: string) => {
      const typeNames: { [key: string]: string } = {
        'inscription': 'Inscription',
        'scolarite': 'Scolarité',
        'transport': 'Transport',
        'cantine': 'Cantine',
        'autre': 'Autre'
      };
      return typeNames[type] || type;
    };

    const details = [
      {
        label: 'Étudiant',
        value: payment.studentName || 'Non spécifié',
        icon: <Users className="w-4 h-4" />
      },
      {
        label: 'Type de paiement',
        value: getPaymentTypeDisplay(payment.type),
        icon: <DollarSign className="w-4 h-4" />
      },
      {
        label: 'Montant',
        value: formatAmount(payment.amount || 0),
        icon: <DollarSign className="w-4 h-4" />
      },
      {
        label: 'Date de paiement',
        value: formatDate(payment.paymentDate || payment.createdAt),
        icon: <Calendar className="w-4 h-4" />
      }
    ];

    setConfirmationData({
      type: 'delete',
      item: payment,
      action: async () => {
        try {
          setIsActionLoading(true);
          await deletePayment(payment.id);
          showSuccess('Paiement supprimé', 'Le paiement a été supprimé avec succès');
          setIsConfirmationModalOpen(false);
          setConfirmationData(null);
          // Actualiser les paiements après suppression
          refreshPayments();
          // Actualiser les recettes après suppression du paiement
          fetchRevenues(selectedRevenueYear?.id);
          // Recalculer les totaux après suppression
          setTimeout(() => {
            calculateAllStudentsTotals();
          }, 1000);
        } catch (error) {
          showError('Erreur', 'Erreur lors de la suppression du paiement');
        } finally {
          setIsActionLoading(false);
        }
      },
      title: 'Supprimer le paiement',
      message: 'Cette action supprimera définitivement le paiement de la base de données.',
      itemName: `Paiement de ${payment.studentName} - ${formatAmount(payment.amount || 0)}`,
      details: details,
      warningMessage: 'Cette action est irréversible. Le paiement sera définitivement supprimé.',
      confirmButtonText: 'Supprimer définitivement',
      cancelButtonText: 'Annuler'
    });
    setIsConfirmationModalOpen(true);
  };

  // Fonction pour afficher le reçu
  const handleShowReceipt = (payment: any) => {
    setSelectedReceipt(payment);
    setIsReceiptModalOpen(true);
  };

  // Handlers pour les modals
  const handleNewPayment = () => {
    setSelectedItem(null);
    setIsSchoolFeesPaymentModalOpen(true);
  };

  const handleNewExpense = () => {
    setActiveTab('expenses');
  };

  const handleNewRevenue = () => {
    setActiveTab('revenues');
  };

  const handlePaymentSuccess = () => {
    console.log('🎉 handlePaymentSuccess appelé - rechargement des paiements...');
    // Recharger les paiements après une sauvegarde réussie avec un petit délai
    setTimeout(() => {
      console.log('⏰ Délai écoulé - rechargement des paiements...');
      refreshPayments();
      // Actualiser les recettes après modification du paiement
      fetchRevenues(selectedRevenueYear?.id);
      // Recalculer les totaux après rechargement
      setTimeout(() => {
        calculateAllStudentsTotals();
      }, 1000);
    }, 500);
    setIsSchoolFeesPaymentModalOpen(false);
  };

  // ========================================
  // FONCTIONS POUR LA GESTION DES DÉPENSES
  // ========================================

  // Fonction pour ouvrir le modal de création d'une dépense
  const handleAddExpense = () => {
    setSelectedExpense(null);
    setExpenseFormData({
      title: '',
      description: '',
      amount: '',
      category: '',
      subcategory: '',
      vendor: '',
      paymentMethod: 'cash',
      receiptNumber: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsExpenseModalOpen(true);
  };

  // Fonction pour ouvrir le modal d'édition d'une dépense
  const handleEditExpense = (expense: any) => {
    setSelectedExpense(expense);
    setExpenseFormData({
      title: expense.title || '',
      description: expense.description || '',
      amount: expense.amount?.toString() || '',
      category: expense.category || '',
      subcategory: expense.subcategory || '',
      vendor: expense.vendor || '',
      paymentMethod: expense.paymentMethod || 'cash',
      receiptNumber: expense.receiptNumber || '',
      date: expense.date || new Date().toISOString().split('T')[0]
    });
    setIsExpenseEditModalOpen(true);
  };

  // Fonction pour sauvegarder une dépense
  const handleSaveExpense = async () => {
    if (!expenseFormData.title || !expenseFormData.amount || !expenseFormData.category) {
      showError('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const paymentMethod = expenseFormData.paymentMethod as 'cash' | 'bank_transfer' | 'check' | 'mobile_money';
      
      // Debug: vérifier les données avant envoi
      console.log('🔍 Données de la dépense avant envoi:', {
        title: expenseFormData.title,
        date: expenseFormData.date,
        amount: expenseFormData.amount,
        category: expenseFormData.category
      });
      
      const expenseData = {
        title: expenseFormData.title,
        description: expenseFormData.description,
        amount: parseFloat(expenseFormData.amount),
        category: expenseFormData.category,
        subcategory: expenseFormData.subcategory,
        vendor: expenseFormData.vendor,
        paymentMethod,
        receiptNumber: expenseFormData.receiptNumber,
        date: expenseFormData.date,
        status: 'pending' as const,
        schoolId: user?.schoolId || 'school-1',
        academicYearId: currentAcademicYear?.id
      };

      if (selectedExpense) {
        // Modification
        await updateExpense(selectedExpense.id, expenseData);
        showSuccess('Modification réussie', 'Dépense modifiée avec succès');
        setIsExpenseEditModalOpen(false);
      } else {
        // Création
        await createExpense(expenseData);
        showSuccess('Création réussie', 'Dépense créée avec succès');
        setIsExpenseModalOpen(false);
      }

      // Recharger les données
      refreshExpenses();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showError('Erreur', 'Erreur lors de la sauvegarde de la dépense');
    }
  };

  // Fonction pour supprimer une dépense
  const handleDeleteExpense = (expense: any) => {
    setSelectedExpense(expense);
    setDeletingExpenseId(expense.id);
    setIsDeleteConfirmModalOpen(true);
  };

  // Fonction pour confirmer la suppression d'une dépense
  const confirmDeleteExpense = async () => {
    if (!deletingExpenseId) return;

    try {
      await deleteExpense(deletingExpenseId);
      showSuccess('Suppression réussie', 'Dépense supprimée avec succès');
      refreshExpenses();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showError('Erreur', 'Erreur lors de la suppression de la dépense');
    } finally {
      setDeletingExpenseId(null);
      setIsDeleteConfirmModalOpen(false);
    }
  };

  // Fonction pour approuver une dépense
  const handleApproveExpense = async (expense: any) => {
    try {
      await approveExpense(expense.id, user?.name || 'Administrateur');
      showSuccess('Approbation réussie', 'Dépense approuvée avec succès');
      refreshExpenses();
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      showError('Erreur', 'Erreur lors de l\'approbation de la dépense');
    }
  };

  // Fonction pour ouvrir le modal de rejet
  const handleRejectExpense = (expense: any) => {
    setExpenseToReject(expense);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  // Fonction pour confirmer le rejet d'une dépense
  const confirmRejectExpense = async () => {
    if (!expenseToReject) return;

    try {
      await rejectExpense(expenseToReject.id, user?.name || 'Administrateur', rejectReason);
      showSuccess('Rejet réussi', 'Dépense rejetée avec succès');
      refreshExpenses();
      setIsRejectModalOpen(false);
      setExpenseToReject(null);
      setRejectReason('');
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      showError('Erreur', 'Erreur lors du rejet de la dépense');
    }
  };

  // Fonctions pour l'impression des dépenses
  const handlePrintExpenses = useCallback(() => {
    setExpensePrintViewMode('summary');
    setIsExpensePrintModalOpen(true);
  }, []);

  const handleCloseExpensePrintModal = useCallback(() => {
    setIsExpensePrintModalOpen(false);
  }, []);


  // Fonction pour calculer le total des dépenses approuvées (exclut les rejetées)
  const calculateApprovedExpensesTotal = useMemo(() => {
    return (expenses || [])
      .filter(expense => expense.status !== 'rejected')
      .reduce((sum, expense) => sum + (expense.amount || 0), 0);
  }, [expenses]);


  // Fonction pour filtrer les dépenses
  const filteredExpenses = useMemo(() => {
    let filtered = expenses || [];

    // Filtre par terme de recherche
    if (expenseSearchTerm) {
      filtered = filtered.filter(expense => 
        expense.title?.toLowerCase().includes(expenseSearchTerm.toLowerCase()) ||
        expense.description?.toLowerCase().includes(expenseSearchTerm.toLowerCase()) ||
        expense.vendor?.toLowerCase().includes(expenseSearchTerm.toLowerCase())
      );
    }

    // Filtre par catégorie
    if (expenseFilterCategory) {
      filtered = filtered.filter(expense => expense.category === expenseFilterCategory);
    }

    // Filtre par statut
    if (expenseFilterStatus) {
      filtered = filtered.filter(expense => expense.status === expenseFilterStatus);
    }

    // Filtre par période (dates)
    if (expenseFilterStartDate) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        const startDate = new Date(expenseFilterStartDate);
        return expenseDate >= startDate;
      });
    }

    if (expenseFilterEndDate) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        const endDate = new Date(expenseFilterEndDate);
        return expenseDate <= endDate;
      });
    }

    return filtered;
  }, [expenses, expenseSearchTerm, expenseFilterCategory, expenseFilterStatus, expenseFilterStartDate, expenseFilterEndDate]);

  // Fonction pour charger les élèves d'une classe ou tous les élèves de l'année
  const loadStudentsInClass = useCallback(async (classId: string, academicYearId: string) => {
    console.log('🚀 loadStudentsInClass appelée avec:', { classId, academicYearId });
    if (!academicYearId) {
      console.log('❌ academicYearId manquant, arrêt du chargement');
      return;
    }
    
    try {
      setLoadingStudents(true);
      
      console.log('🔍 Chargement des élèves pour l\'année:', academicYearId, classId ? `et classe: ${classId}` : '(tous les élèves)');
      
      // Charger les élèves de l'année depuis la base de données
      const allStudents = await studentService.getAllStudents();
      
      // Filtrer côté frontend si le backend ne filtre pas correctement
      const studentsInClass = allStudents.filter(student => {
        const yearMatch = student.academicYearId === academicYearId;
        const classMatch = !classId || student.classId === classId;
        return yearMatch && classMatch;
      });
      
      console.log('📋 Tous les élèves récupérés:', allStudents.length, 'élèves');
      console.log('🎯 Élèves filtrés pour l\'année', academicYearId, classId ? `et classe ${classId}` : '(tous)', ':', studentsInClass.length, 'élèves');
      console.log('👥 Premiers élèves filtrés:', studentsInClass.slice(0, 3));
      
      if (studentsInClass && studentsInClass.length > 0) {
        console.log('🎓 Élèves inscrits pour l\'année', academicYearId, ':', studentsInClass.length, 'élèves');
        
        if (studentsInClass.length > 0) {
          // Charger les paiements pour calculer le bilan de chaque élève
          const studentsWithBalance = await Promise.all(
            studentsInClass.map(async (student) => {
              try {
                // Utiliser la même méthode que le tableau "Liste des encaissements"
                const balanceResult = await api.finance.getStudentBalance(student.id, academicYearId);
                console.log(`💰 Bilan pour ${student.firstName} ${student.lastName}:`, balanceResult);
                
                if (balanceResult && balanceResult.success) {
                  const balance = balanceResult.data;
                  const studentWithBalance = {
                    ...student,
                    totalExpected: balance.totalExpected || 0,
                    totalPaid: balance.totalPaid || 0,
                    totalRemaining: balance.totalRemaining || 0
                  };
                  
                  return studentWithBalance;
                } else {
                  console.warn(`⚠️ Erreur pour l'élève ${student.firstName} ${student.lastName}:`, balanceResult?.error);
                  return {
                    ...student,
                    totalExpected: 0,
                    totalPaid: 0,
                    totalRemaining: 0
                  };
                }
              } catch (error) {
                console.error(`Error calculating balance for student ${student.id}:`, error);
                return {
                  ...student,
                  totalExpected: 0,
                  totalPaid: 0,
                  totalRemaining: 0
                };
              }
            })
          );
          
          setStudentsInClass(studentsWithBalance);
        } else {
          setStudentsInClass([]);
        }
      } else {
        console.log('❌ Aucun élève trouvé pour l\'année', academicYearId, classId ? `et classe ${classId}` : '(tous)');
        setStudentsInClass([]);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des élèves:', error);
      showError('Erreur', 'Impossible de charger les élèves');
      setStudentsInClass([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [showError]);

  // Fonction pour charger les paiements d'un élève
  const loadStudentPayments = async (studentId: string, academicYearId: string) => {
    if (!studentId || !academicYearId) return;
    
    try {
      setLoadingPayments(true);
      
      // Filtrer les paiements existants pour cet élève (exclure les recettes manuelles)
      const studentPayments = payments.filter(payment => 
        payment.studentId === studentId && 
        payment.academicYearId === academicYearId &&
        !(payment as any).isManualRevenue
      );
      
      setStudentPayments(studentPayments);
      console.log('💰 Paiements chargés pour l\'élève:', studentPayments.length, 'paiements');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des paiements:', error);
      setStudentPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Fonction pour gérer la sélection d'un élève
  const handleStudentSelect = (student: any) => {
    setSelectedStudentId(student.id);
    // selectedSchoolYear est déjà l'ID de l'année académique
    loadStudentPayments(student.id, currentAcademicYear?.id || '');
  };

  // Fonction pour trier les classes selon l'ordre spécifié
  const sortClassesByOrder = useCallback((classes: any[]) => {
    const classOrder = [
      'Maternelle', 'CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2',
      '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Tle'
    ];
    
    return classes.sort((a: any, b: any) => {
      const indexA = classOrder.findIndex(order => (a as any).name.includes(order));
      const indexB = classOrder.findIndex(order => (b as any).name.includes(order));
      
      // Si les deux classes sont trouvées dans l'ordre, trier selon l'ordre
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // Si une seule classe est trouvée, la mettre en premier
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // Sinon, trier alphabétiquement
      return (a as any).name.localeCompare((b as any).name);
    });
  }, []);

  // Fonction pour calculer les totaux de scolarité de tous les élèves
  const calculateAllStudentsTotals = useCallback(async () => {
    if (!currentAcademicYear?.id) {
      console.warn('Aucune année scolaire sélectionnée pour calculer les totaux');
      return;
    }

    setTotalsLoading(true);
    try {
      console.log('🚀 Calcul des totaux de scolarité pour l\'année:', currentAcademicYear.id);
      
      // Récupérer tous les élèves
      console.log('📋 Récupération de tous les élèves...');
      const allStudents = await studentService.getAllStudents();
      console.log('📋 Élèves récupérés:', allStudents.length, 'élèves');
      console.log('📊 Calcul des totaux pour', allStudents.length, 'élèves');
      console.log('👥 Premiers élèves:', allStudents.slice(0, 3));
      
      let totalExpected = 0;
      let totalPaid = 0;
      let totalRemaining = 0;
      
      // Calculer le bilan pour chaque élève
      for (let i = 0; i < allStudents.length; i++) {
        const student = allStudents[i];
        console.log(`🔄 Calcul du bilan pour l'élève ${i + 1}/${allStudents.length}:`, student.id, student.firstName, student.lastName);
        
        try {
          const balanceResult = await api.finance.getStudentBalance(student.id, currentAcademicYear.id);
          console.log(`💰 Bilan pour ${student.firstName} ${student.lastName}:`, balanceResult);
          
          if (balanceResult && balanceResult.success) {
            const balance = balanceResult.data;
            console.log(`📊 Détails du bilan:`, balance);
            
            totalExpected += balance.totalExpected || 0;
            totalPaid += balance.totalPaid || 0;
            totalRemaining += balance.totalRemaining || 0;
            
            console.log(`📈 Totaux partiels:`, { totalExpected, totalPaid, totalRemaining });
          } else {
            console.warn(`⚠️ Erreur pour l'élève ${student.firstName} ${student.lastName}:`, balanceResult?.error);
            // En cas d'erreur, utiliser les paiements directs comme fallback (exclure les recettes manuelles)
            const studentPayments = payments.filter(p => 
              p.studentId === student.id && !(p as any).isManualRevenue
            );
            const studentPaid = studentPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
            totalPaid += studentPaid;
          }
        } catch (error) {
          console.warn('❌ Erreur lors du calcul du bilan pour l\'élève', student.id, error);
          // En cas d'erreur, utiliser les paiements directs comme fallback (exclure les recettes manuelles)
          const studentPayments = payments.filter(p => 
            p.studentId === student.id && !(p as any).isManualRevenue
          );
          const studentPaid = studentPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
          totalPaid += studentPaid;
        }
      }
      
      const totals = {
        totalExpected,
        totalPaid,
        totalRemaining
      };
      
      console.log('✅ Totaux finaux calculés:', totals);
      setCalculatedTuitionTotals(totals);
    } catch (error) {
      console.error('❌ Erreur lors du calcul des totaux:', error);
      showError('Erreur', 'Impossible de calculer les totaux de scolarité');
    } finally {
      setTotalsLoading(false);
    }
  }, [currentAcademicYear, payments, showSuccess, showError]);

  // Calculer les totaux au chargement du composant
  useEffect(() => {
    if (currentAcademicYear?.id && payments.length > 0) {
      calculateAllStudentsTotals();
    }
  }, [currentAcademicYear, payments, calculateAllStudentsTotals]);

  // Recalculer les totaux quand les paiements changent
  useEffect(() => {
    if (currentAcademicYear?.id && payments.length > 0) {
      console.log('🔄 Recalcul des totaux suite à un changement de paiements...');
      calculateAllStudentsTotals();
    }
  }, [payments.length, payments, currentAcademicYear, calculateAllStudentsTotals]);

  // Calculer les totaux quand l'onglet encaissements est actif
  useEffect(() => {
    if (activeTab === 'payments' && currentAcademicYear?.id) {
      console.log('🔄 Calcul des totaux de scolarité pour tous les élèves...');
      calculateAllStudentsTotals();
    }
  }, [activeTab, currentAcademicYear, calculateAllStudentsTotals]);

  // Charger tous les élèves de l'année par défaut
  useEffect(() => {
    if (selectedSchoolYear && !selectedClassId) {
      console.log('🔄 Chargement de tous les élèves de l\'année:', selectedSchoolYear);
      loadStudentsInClass('', selectedSchoolYear);
    }
  }, [selectedSchoolYear, loadStudentsInClass]);

  // Charger les élèves quand la classe ou l'année scolaire change
  useEffect(() => {
    if (selectedSchoolYear) {
      console.log('🔄 Rechargement des élèves pour l\'année:', selectedSchoolYear, selectedClassId ? `et classe: ${selectedClassId}` : '(tous les élèves)');
      console.log('📊 Configurations de frais disponibles:', feeConfigurations.length);
      // selectedSchoolYear est déjà l'ID de l'année académique
      loadStudentsInClass(selectedClassId || '', selectedSchoolYear);
      setSelectedStudentId(''); // Reset selection
      setStudentPayments([]); // Clear payments
    } else {
      setStudentsInClass([]);
    }
  }, [selectedClassId, selectedSchoolYear, feeConfigurations, loadStudentsInClass]);

  // Charger les données de paiements quand l'onglet "Bilan des encaissements" est actif
  useEffect(() => {
    if (activeTab === 'payment-summary') {
      console.log('📊 Onglet Bilan des encaissements activé, chargement des données...');
      // Réinitialiser les sélections
      setSelectedStudentId('');
      setStudentPayments([]);
      
      // Sélectionner automatiquement la première classe disponible
      if (selectedSchoolYear && classes.length > 0) {
        const sortedClasses = sortClassesByOrder(classes);
        const firstClass = sortedClasses[0];
        console.log('🎯 Sélection automatique de la première classe:', firstClass.name);
        setSelectedClassId(firstClass.id);
        // Charger les élèves de cette classe
        loadStudentsInClass(firstClass.id, selectedSchoolYear);
      } else if (selectedSchoolYear) {
        console.log('❌ Aucune classe disponible pour l\'année sélectionnée');
        setSelectedClassId('');
      } else {
        console.log('❌ Aucune année scolaire sélectionnée, impossible de charger les élèves');
        setSelectedClassId('');
      }
    }
  }, [activeTab, selectedSchoolYear, loadStudentsInClass, classes, sortClassesByOrder]);

  // Charger les élèves quand l'année scolaire change et que l'onglet est actif
  useEffect(() => {
    if (activeTab === 'payment-summary' && selectedSchoolYear && classes.length > 0) {
      console.log('🔄 Rechargement des élèves suite au changement d\'année scolaire');
      const sortedClasses = sortClassesByOrder(classes);
      const firstClass = sortedClasses[0];
      console.log('🎯 Sélection automatique de la première classe après changement d\'année:', firstClass.name);
      setSelectedClassId(firstClass.id);
      loadStudentsInClass(firstClass.id, selectedSchoolYear);
    }
  }, [selectedSchoolYear, activeTab, loadStudentsInClass, classes, sortClassesByOrder]);

  // Charger les élèves quand la classe sélectionnée change
  useEffect(() => {
    if (activeTab === 'payment-summary' && selectedSchoolYear && selectedClassId) {
      console.log('🔄 Changement de classe détecté:', selectedClassId);
      // Délai pour éviter les appels multiples
      const timeoutId = setTimeout(() => {
        loadStudentsInClass(selectedClassId, selectedSchoolYear);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedClassId, activeTab, selectedSchoolYear, loadStudentsInClass]);

  // Debug: Afficher les élèves chargés
  useEffect(() => {
    console.log('👥 Élèves dans l\'état studentsInClass:', studentsInClass.length, 'élèves');
    if (studentsInClass.length > 0) {
      console.log('📋 Premiers élèves avec bilans:', studentsInClass.slice(0, 3).map(s => ({
        name: `${s.firstName} ${s.lastName}`,
        classId: s.classId,
        totalExpected: s.totalExpected,
        totalPaid: s.totalPaid,
        totalRemaining: s.totalRemaining,
        hasBalanceData: !!(s.totalExpected || s.totalPaid || s.totalRemaining)
      })));
      
      // Vérifier si tous les élèves ont des données de bilan
      const studentsWithoutBalance = studentsInClass.filter(s => !s.totalExpected && !s.totalPaid && !s.totalRemaining);
      if (studentsWithoutBalance.length > 0) {
        console.warn('⚠️ Élèves sans données de bilan:', studentsWithoutBalance.map(s => `${s.firstName} ${s.lastName}`));
      }
    }
  }, [studentsInClass]);

  // Charger les données de scolarité quand l'onglet est actif
  useEffect(() => {
    if (activeTab === 'tuition-control') {
      console.log('🔄 Chargement des données de contrôle de scolarité...');
      loadTuitionData();
    }
  }, [activeTab, loadTuitionData]);

  // Debug: Afficher les données de contrôle de scolarité
  useEffect(() => {
    console.log('🔍 Données de contrôle de scolarité mises à jour:', {
      levels: tuitionLevels.length,
      loading: tuitionLoading,
      error: tuitionError,
      stats: tuitionStats
    });
  }, [tuitionLevels, tuitionLoading, tuitionError, tuitionStats]);

  // Initialiser l'année scolaire sélectionnée pour les recettes
  useEffect(() => {
    if (activeTab === 'revenues' && !selectedRevenueYear) {
      setSelectedRevenueYear(selectedSchoolYear || currentAcademicYear);
    }
  }, [activeTab, selectedSchoolYear, currentAcademicYear, selectedRevenueYear]);

  // Recharger les recettes quand l'année scolaire sélectionnée change
  useEffect(() => {
    if (activeTab === 'revenues' && selectedRevenueYear?.id) {
      console.log('🔄 Rechargement des recettes pour l\'année:', selectedRevenueYear.id);
      fetchRevenues(selectedRevenueYear.id);
    }
  }, [activeTab, selectedRevenueYear, fetchRevenues]);

  // Initialiser l'année scolaire quand on clique sur l'onglet dépenses
  useEffect(() => {
    if (activeTab === 'expenses' && !selectedSchoolYear && currentAcademicYear) {
      console.log('🔄 Initialisation de l\'année scolaire pour les dépenses:', currentAcademicYear);
      setSelectedSchoolYear(currentAcademicYear.id);
    }
  }, [activeTab, selectedSchoolYear, currentAcademicYear, setSelectedSchoolYear]);

  // Recharger les dépenses quand l'année scolaire sélectionnée change
  useEffect(() => {
    if (activeTab === 'expenses' && selectedSchoolYear) {
      const academicYearId = selectedSchoolYear as string;
      console.log('🔄 Rechargement des dépenses pour l\'année:', academicYearId);
      fetchExpenses({ academicYearId });
    }
  }, [activeTab, selectedSchoolYear, fetchExpenses]);

  // Charger les clôtures journalières quand l'onglet est actif
  useEffect(() => {
    if (activeTab === 'daily-closure' && currentAcademicYear?.id) {
      console.log('🔄 Chargement des clôtures journalières...');
      fetchDailyClosures({ academicYearId: currentAcademicYear.id });
      loadDailyStats();
      loadClosureHistory();
      calculateWeeklyStats();
      generateAlerts();
      loadAccountantInfo();
    }
  }, [activeTab, currentAcademicYear?.id]);

  // Charger les données de trésorerie quand l'onglet est actif
  useEffect(() => {
    if (activeTab === 'treasury' && currentAcademicYear?.id) {
      console.log('🔄 Chargement des données de trésorerie...');
      loadTreasuryData();
    }
  }, [activeTab, currentAcademicYear?.id]);

  // Charger les données de paie quand l'onglet overview est actif
  useEffect(() => {
    if (activeTab === 'overview') {
      console.log('🔄 Chargement des données de paie pour la vue d\'ensemble...');
      loadPayrollData();
    }
  }, [activeTab]);

  // Recharger les données quand la date de clôture change
  useEffect(() => {
    if (activeTab === 'daily-closure') {
      loadDailyStats();
    }
  }, [selectedClosureDate, revenues, expenses, activeTab]);

  // Recalculer les écarts de caisse quand les montants changent
  useEffect(() => {
    if (activeTab === 'daily-closure') {
      calculateCashVariance();
      calculateNextDayProjection();
    }
  }, [openingCashAmount, currentCashAmount, dailyClosures, dailyStats, activeTab]);

  // Les useEffect pour les recettes sont maintenant gérés par le hook useRevenues

  // Initialiser l'année scolaire sélectionnée avec l'année courante si elle n'est pas définie
  useEffect(() => {
    if (!selectedSchoolYear && currentAcademicYear) {
      console.log('🔄 Initialisation de l\'année scolaire sélectionnée avec l\'année courante:', currentAcademicYear);
      setSelectedSchoolYear(currentAcademicYear.id);
    }
  }, [selectedSchoolYear, currentAcademicYear, setSelectedSchoolYear]);

  // Recharger les configurations de frais quand l'année scolaire change
  useEffect(() => {
    if (selectedSchoolYear) {
      console.log('🔄 Rechargement des configurations de frais pour l\'année:', selectedSchoolYear);
      fetchFeeConfigurations(selectedSchoolYear);
    }
  }, [selectedSchoolYear, fetchFeeConfigurations]);

  // Rendu des onglets
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <FinanceOverview
            payments={payments}
            paymentsLoading={paymentsLoading}
            calculatedTuitionTotals={calculatedTuitionTotals}
            expenses={expenses}
            expensesLoading={expensesLoading}
            calculateApprovedExpensesTotal={calculateApprovedExpensesTotal}
            revenues={revenues}
            revenuesLoading={revenuesLoading}
            payroll={payroll}
            payrollLoading={payrollLoading}
            treasuryStats={treasuryStats}
            treasuryLoading={treasuryLoading}
            dailyClosures={dailyClosures}
            dailyClosureLoading={dailyClosureLoading}
            feeConfigurations={feeConfigurations}
            feeConfigurationsLoading={feeConfigLoading}
            classes={classes}
            classesLoading={classesLoading}
            onNavigateToTab={setActiveTab}
            onNewPayment={handleNewPayment}
            onNewExpense={handleNewExpense}
            onNewRevenue={handleNewRevenue}
            onNewPayroll={() => setActiveTab('payroll')}
          />
        );

      case 'payments':
        return (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h3 className="text-2xl font-bold mb-2">Système d'Encaissement</h3>
                    <p className="text-green-100">
                      Gestion des paiements et encaissements des frais scolaires
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={handleNewPayment}
                      className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nouvel encaissement
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full"></div>
            </div>


            {/* Payments Table */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Header avec gradient moderne */}
              <div className="relative bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Liste des Encaissements</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Gestion et suivi des paiements des frais scolaires
                </p>
              </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Scolarité attendue: {totalsLoading ? (
                            <span className="flex items-center">
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Calcul...
                            </span>
                          ) : calculatedTuitionTotals.totalExpected.toLocaleString('fr-FR')} F CFA
                  </span>
                </div>
              </div>
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          Scolarité versée: {totalsLoading ? (
                            <span className="flex items-center">
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Calcul...
                            </span>
                          ) : calculatedTuitionTotals.totalPaid.toLocaleString('fr-FR')} F CFA
                  </span>
                </div>
              </div>
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-red-700 dark:text-red-300">
                          Scolarité restante: {totalsLoading ? (
                            <span className="flex items-center">
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Calcul...
                            </span>
                          ) : calculatedTuitionTotals.totalRemaining.toLocaleString('fr-FR')} F CFA
                  </span>
                </div>
              </div>
                  </div>
                </div>
              </div>

              {/* États de chargement et d'erreur */}
              {paymentsLoading && (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center animate-spin">
                      <RefreshCw className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Chargement des paiements...
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Veuillez patienter pendant le chargement des paiements.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentsError && (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Erreur de chargement
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {paymentsError}
                      </p>
                      <button
                        onClick={() => refreshPayments()}
                        className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Réessayer
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!paymentsLoading && !paymentsError && payments.length === 0 && (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
                      <Receipt className="w-10 h-10 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Aucun paiement trouvé
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Aucun paiement n'a encore été enregistré dans le système.
                      </p>
                      <button
                        onClick={handleNewPayment}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Nouvel Encaissement
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!paymentsLoading && !paymentsError && payments.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 dark:from-slate-800 dark:via-gray-800 dark:to-slate-800">
                      <tr>
                        <th className="px-8 py-6 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                              <Receipt className="w-4 h-4 text-white" />
                          </div>
                            <span>N° Reçu</span>
                          </div>
                        </th>
                        <th className="px-8 py-6 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <span>Élève</span>
                          </div>
                        </th>
                        <th className="px-8 py-6 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap min-w-[200px] border-r border-slate-200 dark:border-slate-700">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <span>Parent</span>
                          </div>
                        </th>
                        <th className="px-8 py-6 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap min-w-[180px] border-r border-slate-200 dark:border-slate-700">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-sm">
                              <DollarSign className="w-4 h-4 text-white" />
                            </div>
                            <span>Frais Scolaires</span>
                          </div>
                        </th>
                        <th className="px-8 py-6 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap min-w-[160px] border-r border-slate-200 dark:border-slate-700">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-sm">
                              <BarChart3 className="w-4 h-4 text-white" />
                            </div>
                            <span>Bilan</span>
                          </div>
                        </th>
                        <th className="px-8 py-6 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap min-w-[180px] border-r border-slate-200 dark:border-slate-700">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <span>Paiement</span>
                          </div>
                        </th>
                        <th className="px-8 py-6 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm">
                              <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <span>Date</span>
                          </div>
                        </th>
                        <th className="px-8 py-6 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                              <CreditCard className="w-4 h-4 text-white" />
                            </div>
                            <span>Méthode</span>
                          </div>
                        </th>
                        <th className="px-8 py-6 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl flex items-center justify-center shadow-sm">
                              <Settings className="w-4 h-4 text-white" />
                            </div>
                            <span>Actions</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                      {recentPayments.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-8 py-16">
                            <div className="flex flex-col items-center">
                              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
                                <CreditCard className="w-12 h-12 text-green-600 dark:text-green-400" />
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Aucun paiement trouvé
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md text-center text-lg">
                                {payments.length === 0 
                                  ? "Aucun paiement n'a encore été enregistré dans le système."
                                  : "Aucun paiement ne correspond aux critères de recherche et de filtrage."
                                }
                              </p>
                              <button
                                onClick={handleNewPayment}
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                              >
                                <Plus className="w-6 h-6 mr-3" />
                                <span className="font-semibold">Nouvel encaissement</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        recentPayments.map((payment, index) => (
                          <tr key={payment.id} className={`group hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 dark:hover:from-slate-800/50 dark:hover:to-gray-800/50 transition-all duration-300 border-b border-gray-100 dark:border-gray-700 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/30 dark:bg-slate-800/30'}`}>
                            <td className="px-8 py-6 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                              <div className="text-center">
                                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{payment.receiptNumber || payment.id}</div>
                              </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                              <div className="min-w-0 flex-1">
                                {payment.educmasterNumber && (
                                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate mb-1">
                                    N° Educmaster: {payment.educmasterNumber}
                                </div>
                                )}
                                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{payment.studentName || 'N/A'}</div>
                                <div className="text-xs text-slate-600 dark:text-slate-400 truncate">{payment.className || payment.classLevel || 'N/A'}</div>
                              </div>
                            </td>
                            {/* Informations parent */}
                            <td className="px-8 py-6 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                              <div className="space-y-2">
                                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{payment.parentName || 'N/A'}</div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{payment.parentPhone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{payment.parentEmail || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{payment.address || 'N/A'}</span>
                                </div>
                              </div>
                            </td>
                            {/* Frais scolaires */}
                            <td className="px-8 py-6 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500 dark:text-slate-400">Inscription: </span>
                                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{payment.inscriptionFee || 0} F</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500 dark:text-slate-400">Réinscription: </span>
                                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{payment.reinscriptionFee || 0} F</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500 dark:text-slate-400">Scolarité: </span>
                                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{payment.tuitionFee || 0} F</span>
                                </div>
                                <div className="border-t border-slate-200 dark:border-slate-600 pt-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">Total: </span>
                                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{payment.totalSchoolFees || 0} F CFA</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            {/* Bilan scolarité */}
                            <td className="px-8 py-6 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500 dark:text-slate-400">Attendu: </span>
                                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{payment.totalExpected || 0} F</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-green-600 dark:text-green-400">Versé: </span>
                                  <span className="text-xs font-bold text-green-600 dark:text-green-400">{payment.totalPaid || 0} F</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-red-600 dark:text-red-400">Restant: </span>
                                  <span className="text-xs font-bold text-red-600 dark:text-red-400">{payment.totalRemaining || 0} F</span>
                                </div>
                              </div>
                            </td>
                            {/* Récapitulatif paiement */}
                            <td className="px-8 py-6 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                              <div className="space-y-2">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{payment.amount || 0} F CFA</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">Montant payé</div>
                                </div>
                                {payment.method === 'cash' && (
                                  <>
                                    <div className="flex justify-between items-center bg-orange-50 dark:bg-orange-900/20 rounded-lg px-2 py-1">
                                      <span className="text-xs text-orange-600 dark:text-orange-400">Somme remise: </span>
                                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{(payment.amount || 0) + (payment.change || 0)} F CFA</span>
                                    </div>
                                    {(payment.change || 0) > 0 && (
                                      <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 rounded-lg px-2 py-1">
                                        <span className="text-xs text-blue-600 dark:text-blue-400">Reliquat: </span>
                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{payment.change} F CFA</span>
                                      </div>
                                    )}
                                  </>
                                )}
                                {payment.method !== 'cash' && (payment.reduction || 0) > 0 && (
                                    <div className="flex justify-between items-center bg-orange-50 dark:bg-orange-900/20 rounded-lg px-2 py-1">
                                      <span className="text-xs text-orange-600 dark:text-orange-400">Somme remise: </span>
                                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{payment.reduction} F CFA</span>
                                    </div>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                              <div className="text-center">
                                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{payment.date}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{payment.time || 'N/A'}</div>
                              </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">
                              <div className="flex items-center justify-center">
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{getPaymentMethodLabel(payment.method)}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="flex items-center justify-center space-x-3">
                                <button 
                                  onClick={() => handleShowReceipt(payment)}
                                  className="p-3 rounded-2xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-300 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                                  data-tooltip="Voir le reçu"
                                  title="Voir le reçu"
                                >
                                  <Receipt size={18} />
                                </button>
                                <button 
                                  onClick={() => handleEditItem(payment, 'payment')}
                                  className="p-3 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                                  data-tooltip="Modifier"
                                  title="Modifier"
                                >
                                  <Edit size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteItem(payment)}
                                  className="p-3 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                                  data-tooltip="Supprimer"
                                  title="Supprimer"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Footer du tableau */}
              {!paymentsLoading && !paymentsError && payments.length > 0 && (
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 px-8 py-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Scolarité attendue: {totalsLoading ? (
                            <span className="flex items-center">
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Calcul...
                            </span>
                          ) : calculatedTuitionTotals.totalExpected.toLocaleString('fr-FR')} F CFA
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Scolarité versée: {totalsLoading ? (
                            <span className="flex items-center">
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Calcul...
                            </span>
                          ) : calculatedTuitionTotals.totalPaid.toLocaleString('fr-FR')} F CFA
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Scolarité restante: {totalsLoading ? (
                            <span className="flex items-center">
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Calcul...
                            </span>
                          ) : calculatedTuitionTotals.totalRemaining.toLocaleString('fr-FR')} F CFA
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Total: {payments.length} Encaissements
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
                      </div>
                      <button
                        onClick={() => refreshPayments()}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualiser
                      </button>
                      <button
                        onClick={() => calculateAllStudentsTotals()}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                        disabled={totalsLoading}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${totalsLoading ? 'animate-spin' : ''}`} />
                        {totalsLoading ? 'Calcul...' : 'Recalculer totaux'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'payment-summary':
        return (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h3 className="text-2xl font-bold mb-2">Bilan des Encaissements</h3>
                    <p className="text-indigo-100">
                      Suivi des paiements de scolarité par classe et élève
                    </p>
                  </div>
                  
                  {/* Sélecteurs compacts sur la même ligne */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Sélecteur Année Scolaire */}
                    <div className="w-48">
                      <label className="block text-xs font-semibold text-white/90 mb-1">
                        Année Scolaire
                      </label>
                      <select
                        value={selectedSchoolYear || ''}
                        onChange={(e) => setSelectedSchoolYear(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-white/20 rounded-md focus:ring-1 focus:ring-white/30 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
                        aria-label="Sélectionner une année scolaire"
                      >
                        <option value="">Sélectionner une année</option>
                        {getAcademicYearOptions().map((year) => (
                          <option key={year.value} value={year.value} className="text-gray-900">
                            {year.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sélecteur Classe */}
                    <div className="w-40">
                      <label className="block text-xs font-semibold text-white/90 mb-1">
                        Classe
                      </label>
                      <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        disabled={!selectedSchoolYear}
                        className="w-full px-2 py-1.5 text-xs border border-white/20 rounded-md focus:ring-1 focus:ring-white/30 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-white/70 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Sélectionner une classe"
                      >
                        {sortClassesByOrder(classes).map((cls: any) => (
                          <option key={cls.id} value={cls.id} className="text-gray-900">
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full"></div>
            </div>

            {/* États de chargement */}
            {loadingStudents && (
              <div className="p-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center animate-spin">
                    <RefreshCw className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Chargement des élèves...
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Veuillez patienter pendant le chargement des élèves de la classe.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tableaux côte à côte */}
            {!loadingStudents && selectedSchoolYear && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Tableau Bilan Scolarité */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
                  {/* Header moderne avec gradient */}
                  <div className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-6">
                    <div className="absolute inset-0 bg-black/5"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                          <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white">Bilan Scolarité</h4>
                          <p className="text-indigo-100 text-sm">Suivi financier des élèves</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-white font-medium">
                          {studentsInClass.length} élève{studentsInClass.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 dark:from-slate-800 dark:via-gray-800 dark:to-slate-800">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <span>N° Educmaster</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                                <Users className="w-4 h-4 text-white" />
                              </div>
                              <span>Nom et prénoms</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm">
                                <BarChart3 className="w-4 h-4 text-white" />
                              </div>
                              <span>Bilan Financier</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                        {studentsInClass.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center justify-center space-y-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-3xl flex items-center justify-center shadow-lg">
                                  <GraduationCap className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="text-center">
                                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    Aucun élève trouvé
                                  </h3>
                                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                                    Aucun élève inscrit dans cette classe pour cette année scolaire.
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          studentsInClass.map((student, index) => (
                            <tr 
                              key={student.id} 
                              className={`group hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 dark:hover:from-slate-800/50 dark:hover:to-gray-800/50 transition-all duration-300 cursor-pointer ${
                                selectedStudentId === student.id 
                                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500 shadow-lg' 
                                  : 'hover:shadow-md'
                              } ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/30 dark:bg-slate-800/30'}`}
                              onClick={() => handleStudentSelect(student)}
                            >
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl flex items-center justify-center shadow-sm">
                                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                    {student.educmasterNumber || student.matricule || 'N/A'}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="space-y-1">
                                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {student.firstName} {student.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full inline-block">
                                    {student.className || 'N/A'}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Attendu: </span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                      {(student.totalExpected || 0).toLocaleString()} F CFA
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                                    <span className="text-xs font-medium text-green-600 dark:text-green-400">Versé: </span>
                                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                      {(student.totalPaid || 0).toLocaleString()} F CFA
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                                    <span className="text-xs font-medium text-red-600 dark:text-red-400">Restant: </span>
                                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                      {(student.totalRemaining || 0).toLocaleString()} F CFA
                                    </span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tableau Historique Paiement */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
                  {/* Header moderne avec gradient */}
                  <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-8 py-6">
                    <div className="absolute inset-0 bg-black/5"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                          <Receipt className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white">Historique Paiement</h4>
                          <p className="text-emerald-100 text-sm">
                            {selectedStudentId ? 'Paiements de l\'élève' : 'Sélectionnez un élève'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-white font-medium">
                          {studentPayments.length} paiement{studentPayments.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 dark:from-slate-800 dark:via-gray-800 dark:to-slate-800">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                                <Receipt className="w-4 h-4 text-white" />
                              </div>
                              <span>N° Reçu</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-sm">
                                <Minus className="w-4 h-4 text-white" />
                              </div>
                              <span>Somme remise</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                                <DollarSign className="w-4 h-4 text-white" />
                              </div>
                              <span>Montant payé</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm">
                                <Plus className="w-4 h-4 text-white" />
                              </div>
                              <span>Reliquat</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-sm">
                                <CreditCard className="w-4 h-4 text-white" />
                              </div>
                              <span>Méthode</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                                <Calendar className="w-4 h-4 text-white" />
                              </div>
                              <span>Date et heure</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <span>Parent et contact</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                        {!selectedStudentId ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center justify-center space-y-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-3xl flex items-center justify-center shadow-lg">
                                  <Receipt className="w-10 h-10 text-emerald-500" />
                                </div>
                                <div className="text-center">
                                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    Sélectionnez un élève
                                  </h3>
                                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                                    Cliquez sur un élève dans le tableau de gauche pour voir son historique de paiement.
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : loadingPayments ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center justify-center space-y-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center animate-spin shadow-lg">
                                  <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Chargement des paiements...</p>
                              </div>
                            </td>
                          </tr>
                        ) : studentPayments.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center justify-center space-y-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-3xl flex items-center justify-center shadow-lg">
                                  <Receipt className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="text-center">
                                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    Aucun paiement
                                  </h3>
                                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                                    Aucun paiement enregistré pour cet élève.
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          studentPayments.map((payment, index) => (
                            <tr key={payment.id} className={`group hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 dark:hover:from-slate-800/50 dark:hover:to-gray-800/50 transition-all duration-300 hover:shadow-md ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/30 dark:bg-slate-800/30'}`}>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl flex items-center justify-center shadow-sm">
                                    <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                    {(payment as any).receiptNumber || payment.id}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg px-3 py-2">
                                  <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                    {(() => {
                                      const method = (payment as any).method;
                                      if (method === 'cash') {
                                        return ((payment.amount || 0) + ((payment as any).change || 0)).toLocaleString();
                                      } else {
                                        return ((payment as any).reduction || 0).toLocaleString();
                                      }
                                    })()} F CFA
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                                  <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                    {(payment.amount || 0).toLocaleString()} F CFA
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg px-3 py-2">
                                  <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                    {(() => {
                                      const method = (payment as any).method;
                                      if (method === 'cash') {
                                        return ((payment as any).change || 0).toLocaleString();
                                      } else {
                                        return 0; // Pas de reliquat pour les autres méthodes
                                      }
                                    })()} F CFA
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg px-3 py-2">
                                  <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
                                    {getPaymentMethodLabel((payment as any).method)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-3 py-2">
                                  <div className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                    {(payment as any).date || payment.paymentDate}
                                  </div>
                                  {(payment as any).time && (
                                    <div className="text-xs text-indigo-500 dark:text-indigo-400">
                                      {(payment as any).time}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg px-3 py-2 space-y-1">
                                  <div className="text-sm font-medium text-rose-700 dark:text-rose-300">
                                    {(payment as any).parentName || 'N/A'}
                                  </div>
                                  <div className="text-xs text-rose-500 dark:text-rose-400">
                                    {(payment as any).parentPhone || 'N/A'}
                                  </div>
                                </div>
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
          </div>
        );

      case 'tuition-control':
        return (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h3 className="text-2xl font-bold mb-2">Contrôle de Scolarité</h3>
                    <p className="text-blue-100">
                      Suivi des paiements de scolarité par niveau et classe
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
                      <input
                        type="text"
                        placeholder="Rechercher un élève..."
                        value={tuitionSearchTerm}
                        onChange={(e) => setTuitionSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white/15 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-white/70"
                      />
                    </div>
                    <select
                      value={tuitionFilterStatus}
                      onChange={(e) => setTuitionFilterStatus(e.target.value)}
                      className="px-4 py-2 bg-white/15 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      aria-label="Filtrer par statut"
                    >
                      <option value="all" className="text-gray-900">Tous les statuts</option>
                      <option value="completed" className="text-gray-900">Soldé</option>
                      <option value="partial" className="text-gray-900">Partiellement soldé</option>
                      <option value="not_started" className="text-gray-900">Non soldé</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {filteredStats.totalStudents}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Total Élèves</h4>
                <p className="text-sm text-gray-600">
                  {tuitionSearchTerm || tuitionFilterStatus !== 'all' 
                    ? `Élèves correspondant aux critères` 
                    : 'Nombre total d\'élèves inscrits'
                  }
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {filteredStats.completedPayments}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Soldés</h4>
                <p className="text-sm text-gray-600">Élèves ayant soldé leur scolarité</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-orange-600">
                    {filteredStats.partialPayments}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Partiellement soldés</h4>
                <p className="text-sm text-gray-600">Élèves avec paiements partiels</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {filteredStats.notStartedPayments}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Non soldés</h4>
                <p className="text-sm text-gray-600">Élèves n'ayant pas commencé à payer</p>
              </div>
            </div>

            {/* Tableau hiérarchisé */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">Liste des élèves par niveau et classe</h4>
                  <div className="flex items-center space-x-3">
                    {/* Bouton récapitulatif global */}
                    <button
                      onClick={handleShowGlobalPaymentSummary}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Voir le récapitulatif de tous les élèves"
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      Voir le récapitulatif des paiements
                    </button>
                    
                    {(tuitionSearchTerm || tuitionFilterStatus !== 'all') && (
                      <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        <Search className="w-4 h-4" />
                        <span>
                          {filteredStats.totalStudents} résultat{filteredStats.totalStudents > 1 ? 's' : ''} trouvé{filteredStats.totalStudents > 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => {
                            setTuitionSearchTerm('');
                            setTuitionFilterStatus('all');
                          }}
                          className="text-blue-400 hover:text-blue-600 ml-2"
                          title="Effacer les filtres"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6">
                {tuitionLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                    <span className="ml-2 text-gray-600">Chargement des données...</span>
                  </div>
                ) : tuitionError ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{tuitionError}</p>
                    <button
                      onClick={loadTuitionData}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Réessayer
                    </button>
                  </div>
                ) : tuitionLevels.length === 0 ? (
                  <div className="text-center py-12">
                    <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Aucune donnée de scolarité disponible</p>
                    <button
                      onClick={loadTuitionData}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Charger les données
                    </button>
                  </div>
                ) : filterLevelsAndClasses(tuitionLevels).length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Aucun élève ne correspond aux critères de recherche</p>
                    <button
                      onClick={() => {
                        setTuitionSearchTerm('');
                        setTuitionFilterStatus('all');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Effacer les filtres
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortLevels(deduplicateClasses(filterLevelsAndClasses(tuitionLevels))).map((level, index) => {
                      const levelInfoData = getLevelInfo(level.name.toLowerCase());
                      const Icon = levelInfoData.icon;
                      
                      return (
                        <div key={`level-${level.id}-${index}`} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                          {/* En-tête du niveau (comme Students.tsx) */}
                          <div 
                            className={`px-6 py-4 bg-gradient-to-r ${levelInfoData.bgColor} dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-all duration-200`}
                            onClick={() => toggleLevel(level.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 bg-gradient-to-br ${levelInfoData.color} rounded-lg flex items-center justify-center shadow-sm`}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className={`text-lg font-semibold ${levelInfoData.textColor} dark:text-gray-100`}>
                                    {capitalizeLevel(level.name.toLowerCase())}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {levelInfoData.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {level.totalStudents} élève{level.totalStudents > 1 ? 's' : ''} • {level.classes.length} classe{level.classes.length > 1 ? 's' : ''}
                                </p>
                                <button
                                  className={`p-2 rounded-lg transition-all duration-200 hover:bg-white/20 ${levelInfoData.textColor}`}
                                  aria-label={expandedLevels[level.id] ? 'Fermer le niveau' : 'Ouvrir le niveau'}
                                >
                                  <ChevronDown 
                                    className={`w-5 h-5 transition-transform duration-200 ${
                                      expandedLevels[level.id] ? 'rotate-180' : ''
                                    }`} 
                                  />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Classes du niveau */}
                          {expandedLevels[level.id] && (
                            <div className="p-6 space-y-4">
                              {level.classes.map((classItem: any, classIndex: number) => (
                                <div key={`class-${level.id}-${classItem.id}-${classIndex}`} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                  {/* En-tête de la classe (comme Students.tsx) */}
                                  <div 
                                    className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-600 rounded-t-lg cursor-pointer hover:opacity-90 transition-all duration-200"
                                    onClick={() => toggleClass(level.id, classItem.id)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                                          <Users className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                          <h5 className="text-md font-semibold text-blue-700 dark:text-blue-300">
                                            {classItem.name}
                                          </h5>
                                          <p className="text-sm text-blue-600 dark:text-blue-400">
                                            {classItem.totalStudents} élève{classItem.totalStudents > 1 ? 's' : ''}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleShowClassPaymentSummary(classItem, level);
                                          }}
                                          className="p-2 rounded-lg transition-all duration-200 hover:bg-green-100 dark:hover:bg-green-800/30 text-green-600 dark:text-green-400"
                                          title="Voir le récapitulatif des paiements"
                                        >
                                          <Receipt className="w-4 h-4" />
                                        </button>
                                        <button
                                          className="p-2 rounded-lg transition-all duration-200 hover:bg-blue-100 dark:hover:bg-blue-800/30 text-blue-600 dark:text-blue-400"
                                          aria-label={expandedClasses[`${level.id}-${classItem.id}`] ? 'Fermer la classe' : 'Ouvrir la classe'}
                                        >
                                          <ChevronDown 
                                            className={`w-4 h-4 transition-transform duration-200 ${
                                              expandedClasses[`${level.id}-${classItem.id}`] ? 'rotate-180' : ''
                                            }`} 
                                          />
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Élèves de la classe */}
                                  {expandedClasses[`${level.id}-${classItem.id}`] && (
                                    <div>
                                      <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                          <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                              <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                                                Informations de l'élève
                                              </th>
                                              <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                                                Scolarité attendue
                                              </th>
                                              <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                                                Scolarité versée
                                              </th>
                                              <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                                                Scolarité restante
                                              </th>
                                              <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                                                Statut
                                              </th>
                                              <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                                                Actions
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {classItem.students.map((student: any, studentIndex: number) => (
                                              <tr 
                                                key={`student-${level.id}-${classItem.id}-${student.id}-${studentIndex}`}
                                                className={`hover:bg-gray-50 transition-colors ${
                                                  student.status === 'completed' ? 'bg-green-50' :
                                                  student.status === 'partial' ? 'bg-orange-50' :
                                                  'bg-red-50'
                                                }`}
                                              >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                  <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                                                      {student.studentPhoto ? (
                                                        <img 
                                                          src={student.studentPhoto} 
                                                          alt={student.studentName || 'Photo étudiant'}
                                                          className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                      ) : (
                                                        student.studentName ? student.studentName.charAt(0).toUpperCase() : '?'
                                                      )}
                                                    </div>
                                                    <div className="ml-4">
                                                      <div className="text-sm font-medium text-gray-900">
                                                        {student.studentName || 'Nom non disponible'}
                                                      </div>
                                                      <div className="text-sm text-gray-500">
                                                        {student.level} - {student.className}
                                                      </div>
                                                      {student.phoneNumber && (
                                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                                          <Phone className="w-3 h-3" />
                                                          {student.phoneNumber}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                  <div className="text-sm font-medium text-gray-900">
                                                    {student.expectedTuition?.toLocaleString() || 0} F CFA
                                                  </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                  <div className="text-sm font-medium text-green-600">
                                                    {student.paidTuition?.toLocaleString() || 0} F CFA
                                                  </div>
                                                  {student.lastPaymentDate && (
                                                    <div className="text-xs text-gray-500">
                                                      Dernier paiement: {new Date(student.lastPaymentDate).toLocaleDateString('fr-FR')}
                                                    </div>
                                                  )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                  <div className="text-sm font-medium text-red-600">
                                                    {student.remainingTuition?.toLocaleString() || 0} F CFA
                                                  </div>
                                                  {student.nextDueDate && (
                                                    <div className="text-xs text-gray-500">
                                                      Échéance: {new Date(student.nextDueDate).toLocaleDateString('fr-FR')}
                                                    </div>
                                                  )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(student.status)}`}>
                                                    {getStatusText(student.status)}
                                                  </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                  <div className="flex items-center gap-2">
                                                    <button
                                                      onClick={() => handleSendReminder(student, 'call')}
                                                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                                                      title="Appeler"
                                                    >
                                                      <Phone className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                      onClick={() => handleSendReminder(student, 'sms')}
                                                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                                                      title="Envoyer SMS"
                                                    >
                                                      <Smartphone className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                      onClick={() => handleSendReminder(student, 'sms')}
                                                      className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors"
                                                      title="Envoyer email"
                                                    >
                                                      <Mail className="w-4 h-4" />
                                                    </button>
                                                  </div>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'revenues':
        return (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-2">Gestion des Recettes</h2>
                    <p className="text-green-100 text-lg">Suivi et analyse des revenus de l'école</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* Sélecteur d'année scolaire */}
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedRevenueYear?.id || ''}
                        onChange={(e) => {
                          const year = academicYears.find(y => y.id === e.target.value);
                          setSelectedRevenueYear(year);
                        }}
                        className="px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-green-200 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                        aria-label="Sélectionner une année scolaire"
                      >
                        {academicYears && academicYears.length > 0 ? (
                          academicYears.map((year) => (
                            <option key={year.id} value={year.id} className="text-gray-900">
                              {year.name}
                            </option>
                          ))
                        ) : (
                          <option value="" className="text-gray-900">Aucune année disponible</option>
                        )}
                      </select>
                    </div>
                    
                    {/* Boutons d'action */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleAddRevenue}
                        className="px-4 py-2.5 text-sm font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl hover:bg-white/30 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter une recette</span>
                      </button>
                      <button
                        onClick={handleSyncTuitionPayments}
                        disabled={revenuesLoading}
                        title="Synchroniser les frais de scolarité"
                        className="p-2.5 text-sm font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl hover:bg-white/30 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className={`w-5 h-5 ${revenuesLoading ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => setRevenueViewMode('table')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          revenueViewMode === 'table' 
                            ? 'bg-white/20 text-white' 
                            : 'text-green-100 hover:bg-white/10'
                        }`}
                      >
                        Tableau
                      </button>
                      <button
                        onClick={() => setRevenueViewMode('chart')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          revenueViewMode === 'chart' 
                            ? 'bg-white/20 text-white' 
                            : 'text-green-100 hover:bg-white/10'
                        }`}
                      >
                        Graphique
                      </button>
                      <button
                        onClick={() => setRevenueViewMode('summary')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          revenueViewMode === 'summary' 
                            ? 'bg-white/20 text-white' 
                            : 'text-green-100 hover:bg-white/10'
                        }`}
                      >
                        Résumé
                      </button>
                      <button
                        onClick={() => handlePrintRevenues('list')}
                        className="px-4 py-2 text-sm font-medium text-green-100 hover:bg-white/10 rounded-lg transition-colors flex items-center space-x-2"
                        title="Exporter les recettes"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Exporter</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="space-y-6">
              {/* Statistiques des recettes */}
              {(() => {
                // Calculer les statistiques directement à partir du tableau revenues
                const total = revenues.reduce((sum, r) => sum + (r.amount || 0), 0);
                const tuitionRevenue = revenues
                  .filter(r => ['inscription_fee', 'reinscription_fee', 'tuition_fee'].includes(r.type))
                  .reduce((sum, r) => sum + (r.amount || 0), 0);
                const otherRevenue = revenues
                  .filter(r => !['inscription_fee', 'reinscription_fee', 'tuition_fee'].includes(r.type))
                  .reduce((sum, r) => sum + (r.amount || 0), 0);
                
                // Calculer les recettes du mois en cours
                const currentMonth = new Date().toISOString().substring(0, 7);
                const monthly = revenues
                  .filter(r => r.date?.startsWith(currentMonth))
                  .reduce((sum, r) => sum + (r.amount || 0), 0);
                
                console.log('📊 Statistiques calculées:', { total, tuitionRevenue, otherRevenue, monthly });
                
                return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                      <span className="text-2xl font-bold text-green-600">
                            {total.toLocaleString()} F CFA
                      </span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Total Recettes</h4>
                  <p className="text-sm text-gray-600">Toutes les recettes</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                          {tuitionRevenue.toLocaleString()} F CFA
                    </span>
                  </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Scolarité Encaissée</h4>
                      <p className="text-sm text-gray-600">Frais d'inscription et scolarité</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Coins className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-orange-600">
                          {otherRevenue.toLocaleString()} F CFA
                    </span>
                  </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Autres Recettes</h4>
                      <p className="text-sm text-gray-600">Uniforme, fournitures, dons, etc.</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-purple-600">
                          {monthly.toLocaleString()} F CFA
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Ce mois</h4>
                  <p className="text-sm text-gray-600">Recettes du mois</p>
                </div>
              </div>
                );
              })()}

              {/* Contenu selon le mode de vue */}
              {revenueViewMode === 'table' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
                  {/* Header moderne avec gradient */}
                  <div className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 p-6">
                    <div className="absolute inset-0 bg-black/5"></div>
                    <div className="relative z-10">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">Tableau des Recettes</h3>
                          <p className="text-green-100 text-sm">Gestion et suivi des encaissements</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Rechercher une recette..."
                              value={revenueSearchTerm}
                              onChange={(e) => setRevenueSearchTerm(e.target.value)}
                              className="w-64 px-4 py-2.5 pl-10 text-sm bg-white/20 backdrop-blur-sm text-white placeholder-green-100 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-100" />
                          </div>
                          <select
                            value={selectedRevenueType}
                            onChange={(e) => setSelectedRevenueType(e.target.value)}
                            title="Filtrer par type de recette"
                            className="px-4 py-2.5 text-sm bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                          >
                            <option value="all" className="text-gray-900">Tous les types</option>
                            <option value="inscription_scolarite" className="text-gray-900">Inscription et scolarité</option>
                            <option value="uniforme" className="text-gray-900">Uniforme</option>
                            <option value="fournitures" className="text-gray-900">Fournitures</option>
                            <option value="cantine" className="text-gray-900">Cantine</option>
                            <option value="don" className="text-gray-900">Don</option>
                            <option value="subvention" className="text-gray-900">Subvention</option>
                            <option value="autre" className="text-gray-900">Autre</option>
                          </select>
                          <select
                            value={selectedRevenuePeriod}
                            onChange={(e) => setSelectedRevenuePeriod(e.target.value)}
                            title="Filtrer par période"
                            className="px-4 py-2.5 text-sm bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                          >
                            <option value="all" className="text-gray-900">Toutes les périodes</option>
                            <option value="current" className="text-gray-900">Ce mois</option>
                            <option value="last" className="text-gray-900">Mois dernier</option>
                            <option value="year" className="text-gray-900">Cette année</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tableau moderne */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Hash className="w-4 h-4 text-white" />
                              </div>
                              <span>Référence</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                              </div>
                              <span>Description</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <span>Élève</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <GraduationCap className="w-4 h-4 text-white" />
                              </div>
                              <span>Classe</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-4 h-4 text-white" />
                              </div>
                              <span>Montant</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-4 h-4 text-white" />
                              </div>
                              <span>Méthode</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-white" />
                              </div>
                              <span>Date</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                                <Settings className="w-4 h-4 text-white" />
                              </div>
                              <span>Actions</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {revenuesLoading ? (
                          <tr>
                            <td colSpan={8} className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="relative">
                                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200"></div>
                                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent absolute top-0 left-0"></div>
                                </div>
                                <div className="text-center">
                                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Chargement des recettes</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Veuillez patienter...</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : filteredRevenueData.length > 0 ? (
                          filteredRevenueData.map((revenue, index) => (
                            <tr key={revenue.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 transition-all duration-300 group">
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <Hash className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                      {revenue.reference}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      #{index + 1}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="max-w-xs">
                                  <div className="flex items-center space-x-2">
                                    <div className={`p-1 rounded-lg ${getRevenueTypeInfo((revenue as any).type).bgColor}`}>
                                      <div className={getRevenueTypeInfo((revenue as any).type).color}>
                                        {getRevenueTypeInfo((revenue as any).type).icon}
                                      </div>
                                    </div>
                                    <div>
                                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                    {getRevenueDescription(revenue)}
                                  </div>
                                      <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${getRevenueTypeInfo((revenue as any).type).bgColor} ${getRevenueTypeInfo((revenue as any).type).color}`}>
                                        {(revenue as any).type === 'uniforme' ? 'Uniforme' :
                                         (revenue as any).type === 'fournitures' ? 'Fournitures' :
                                         (revenue as any).type === 'cantine' ? 'Cantine' :
                                         (revenue as any).type === 'don' ? 'Don' :
                                         (revenue as any).type === 'subvention' ? 'Subvention' :
                                         (revenue as any).type === 'scolarite' ? 'Scolarité' :
                                         (revenue as any).type === 'inscription' ? 'Inscription' :
                                         (revenue as any).type === 'reinscription' ? 'Réinscription' :
                                         (revenue as any).type === 'inscription_fee' ? 'Inscription & Scolarité' :
                                         (revenue as any).type === 'reinscription_fee' ? 'Inscription & Scolarité' :
                                         (revenue as any).type === 'tuition_fee' ? 'Inscription & Scolarité' :
                                         'Autre'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                      {revenue.studentName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                                  <GraduationCap className="w-3 h-3 mr-1" />
                                  {revenue.className}
                                </span>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {(revenue.amount || 0).toLocaleString()} F CFA
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Montant
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30 rounded-lg flex items-center justify-center">
                                    <CreditCard className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {revenue.paymentMethod}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-3 h-3 text-pink-600 dark:text-pink-400" />
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {new Date(revenue.date).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleEditRevenue(revenue)}
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 dark:text-blue-300 rounded-lg transition-colors duration-200"
                                    title="Modifier la recette"
                                  >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Modifier
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRevenue(revenue)}
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 dark:text-red-300 rounded-lg transition-colors duration-200"
                                    title="Supprimer la recette"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Supprimer
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
                                  <FileText className="w-8 h-8 text-gray-400" />
                                </div>
                                <div className="text-center">
                                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Aucune recette trouvée</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Ajustez vos filtres pour voir plus de résultats</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer moderne avec statistiques */}
                  {filteredRevenueData.length > 0 && (
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {filteredRevenueData.length} recette{filteredRevenueData.length > 1 ? 's' : ''} trouvée{filteredRevenueData.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {filteredRevenueData.filter(r => r.status === 'completed').length} encaissée{filteredRevenueData.filter(r => r.status === 'completed').length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                              {filteredRevenueData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()} F CFA
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Total des recettes
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {revenueViewMode === 'chart' && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Analyse des Recettes</h3>
                        <p className="text-sm text-gray-600 mt-1">Visualisation professionnelle des revenus</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Type de graphique :</span>
                        <select
                          value={chartType}
                          onChange={(e) => setChartType(e.target.value as 'bar' | 'pie' | 'line' | 'area')}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          title="Sélectionner le type de graphique"
                        >
                          <option value="bar">Barres</option>
                          <option value="pie">Secteurs</option>
                          <option value="line">Ligne</option>
                          <option value="area">Aire</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {(() => {
                      // Calculer les données pour le graphique
                      const chartData = revenues.reduce((acc, revenue) => {
                        const type = (revenue as any).type;
                        const typeLabel = type === 'uniforme' ? 'Uniforme' :
                                        type === 'fournitures' ? 'Fournitures' :
                                        type === 'cantine' ? 'Cantine' :
                                        type === 'don' ? 'Don' :
                                        type === 'subvention' ? 'Subvention' :
                                        type === 'scolarite' ? 'Scolarité' :
                                        type === 'inscription' ? 'Inscription' :
                                        type === 'reinscription' ? 'Réinscription' :
                                        type === 'inscription_fee' ? 'Inscription & Scolarité' :
                                        type === 'reinscription_fee' ? 'Inscription & Scolarité' :
                                        type === 'tuition_fee' ? 'Inscription & Scolarité' :
                                        'Autre';
                        
                        if (!acc[typeLabel]) {
                          acc[typeLabel] = 0;
                        }
                        acc[typeLabel] += revenue.amount || 0;
                        return acc;
                      }, {} as { [key: string]: number });

                      const chartEntries = Object.entries(chartData)
                        .map(([name, value]) => ({ name, value }))
                        .sort((a, b) => b.value - a.value);

                      // Couleurs professionnelles pour les graphiques
                      const COLORS = [
                        '#3B82F6', // Blue
                        '#10B981', // Emerald
                        '#8B5CF6', // Violet
                        '#F59E0B', // Amber
                        '#EF4444', // Red
                        '#06B6D4', // Cyan
                        '#84CC16', // Lime
                        '#F97316', // Orange
                        '#EC4899', // Pink
                        '#6366F1'  // Indigo
                      ];

                      if (chartEntries.length === 0) {
                        return (
                    <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <BarChart3 className="w-8 h-8 text-purple-600" />
                      </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Aucune donnée</h4>
                            <p className="text-gray-600">Aucune recette trouvée pour cette période</p>
                    </div>
                        );
                      }

                      // Configuration du tooltip personnalisé
                      const CustomTooltip = ({ active, payload, label }: any) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                              <p className="font-semibold text-gray-900">{label}</p>
                              <p className="text-blue-600 font-medium">
                                {payload[0].value.toLocaleString()} F CFA
                              </p>
                            </div>
                          );
                        }
                        return null;
                      };

                      return (
                        <div className="space-y-6">
                          {/* Graphique principal */}
                          <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                              <div>
                              {chartType === 'bar' && (
                                <BarChart data={chartEntries} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                  <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                  />
                                  <YAxis 
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                                  />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend />
                                  <Bar 
                                    dataKey="value" 
                                    fill="#3B82F6" 
                                    radius={[4, 4, 0, 0]}
                                    name="Montant (F CFA)"
                                  />
                                </BarChart>
                              )}
                              
                              {chartType === 'pie' && (
                                <PieChart>
                                  <Pie
                                    data={chartEntries}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                  >
                                    {chartEntries.map((_, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend />
                                </PieChart>
                              )}
                              
                              {chartType === 'line' && (
                                <LineChart data={chartEntries} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                  <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                  />
                                  <YAxis 
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                                  />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend />
                                  <Line 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#3B82F6" 
                                    strokeWidth={3}
                                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                                    name="Montant (F CFA)"
                                  />
                                </LineChart>
                              )}
                              
                              {chartType === 'area' && (
                                <AreaChart data={chartEntries} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                  <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                  />
                                  <YAxis 
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                                  />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend />
                                  <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#3B82F6" 
                                    fill="#3B82F6"
                                    fillOpacity={0.3}
                                    strokeWidth={2}
                                    name="Montant (F CFA)"
                                  />
                                </AreaChart>
                              )}
                              </div>
                            </ResponsiveContainer>
                          </div>
                          
                          {/* Statistiques résumées */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {revenues.reduce((sum, r) => sum + (r.amount || 0), 0).toLocaleString()} F CFA
                              </div>
                              <div className="text-sm text-gray-600">Total Recettes</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {chartEntries.length}
                              </div>
                              <div className="text-sm text-gray-600">Types de Recettes</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {chartEntries.length > 0 ? chartEntries[0].value.toLocaleString() : 0} F CFA
                              </div>
                              <div className="text-sm text-gray-600">Plus Élevé</div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {revenueViewMode === 'summary' && (
                <div className="space-y-6">
                  {/* Résumé exécutif */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                  <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Résumé Exécutif</h3>
                      <p className="text-sm text-gray-600 mt-1">Vue d'ensemble des performances financières</p>
                  </div>
                  <div className="p-6">
                      {(() => {
                        const total = revenues.reduce((sum, r) => sum + (r.amount || 0), 0);
                        const tuitionRevenue = revenues
                          .filter(r => ['inscription_fee', 'reinscription_fee', 'tuition_fee'].includes(r.type))
                          .reduce((sum, r) => sum + (r.amount || 0), 0);
                        const otherRevenue = revenues
                          .filter(r => !['inscription_fee', 'reinscription_fee', 'tuition_fee'].includes(r.type))
                          .reduce((sum, r) => sum + (r.amount || 0), 0);
                        
                        const currentMonth = new Date().toISOString().substring(0, 7);
                        const monthly = revenues
                          .filter(r => r.date?.startsWith(currentMonth))
                          .reduce((sum, r) => sum + (r.amount || 0), 0);
                        
                        const tuitionPercentage = total > 0 ? (tuitionRevenue / total) * 100 : 0;
                        const otherPercentage = total > 0 ? (otherRevenue / total) * 100 : 0;

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-green-600 mb-2">
                                {total.toLocaleString()} F CFA
                              </div>
                              <div className="text-sm text-gray-600">Total des Recettes</div>
                              <div className="text-xs text-gray-500 mt-1">Toutes sources confondues</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-blue-600 mb-2">
                                {tuitionRevenue.toLocaleString()} F CFA
                              </div>
                              <div className="text-sm text-gray-600">Scolarité Encaissée</div>
                              <div className="text-xs text-gray-500 mt-1">{tuitionPercentage.toFixed(1)}% du total</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-orange-600 mb-2">
                                {otherRevenue.toLocaleString()} F CFA
                              </div>
                              <div className="text-sm text-gray-600">Autres Recettes</div>
                              <div className="text-xs text-gray-500 mt-1">{otherPercentage.toFixed(1)}% du total</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-purple-600 mb-2">
                                {monthly.toLocaleString()} F CFA
                              </div>
                              <div className="text-sm text-gray-600">Ce Mois</div>
                              <div className="text-xs text-gray-500 mt-1">Recettes du mois en cours</div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Analyse par type de recette */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Analyse par Type de Recette</h3>
                      <p className="text-sm text-gray-600 mt-1">Répartition détaillée des revenus par catégorie</p>
                    </div>
                    <div className="p-6">
                      {(() => {
                        const typeAnalysis = revenues.reduce((acc, revenue) => {
                          const type = (revenue as any).type;
                          const typeLabel = type === 'uniforme' ? 'Uniforme' :
                                          type === 'fournitures' ? 'Fournitures' :
                                          type === 'cantine' ? 'Cantine' :
                                          type === 'don' ? 'Don' :
                                          type === 'subvention' ? 'Subvention' :
                                          type === 'scolarite' ? 'Scolarité' :
                                          type === 'inscription' ? 'Inscription' :
                                          type === 'reinscription' ? 'Réinscription' :
                                          type === 'inscription_fee' ? 'Inscription & Scolarité' :
                                          type === 'reinscription_fee' ? 'Inscription & Scolarité' :
                                          type === 'tuition_fee' ? 'Inscription & Scolarité' :
                                          'Autre';
                          
                          if (!acc[typeLabel]) {
                            acc[typeLabel] = { count: 0, total: 0, type: type };
                          }
                          acc[typeLabel].count += 1;
                          acc[typeLabel].total += revenue.amount || 0;
                          return acc;
                        }, {} as { [key: string]: { count: number; total: number; type: string } });

                        const total = revenues.reduce((sum, r) => sum + (r.amount || 0), 0);
                        const sortedTypes = Object.entries(typeAnalysis)
                          .map(([label, data]) => ({ label, ...data }))
                          .sort((a, b) => b.total - a.total);

                        if (sortedTypes.length === 0) {
                          return (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Receipt className="w-8 h-8 text-gray-400" />
                              </div>
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">Aucune donnée</h4>
                              <p className="text-gray-600">Aucune recette trouvée pour cette période</p>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-4">
                            {sortedTypes.map((item) => {
                              const percentage = total > 0 ? (item.total / total) * 100 : 0;
                              const isTuition = ['inscription_fee', 'reinscription_fee', 'tuition_fee'].includes(item.type);
                              
                              return (
                                <div key={item.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                  <div className="flex items-center space-x-4">
                                    <div className={`w-3 h-3 rounded-full ${isTuition ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                    <div>
                                      <h4 className="font-medium text-gray-900">{item.label}</h4>
                                      <p className="text-sm text-gray-600">{item.count} transaction{item.count > 1 ? 's' : ''}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-semibold text-gray-900">
                                      {item.total.toLocaleString()} F CFA
                                    </div>
                                    <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Analyse temporelle */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Analyse Temporelle</h3>
                      <p className="text-sm text-gray-600 mt-1">Évolution des recettes dans le temps</p>
                    </div>
                    <div className="p-6">
                      {(() => {
                        // Calculer les mois de l'année scolaire (septembre à juillet)
                        const monthlyData = [];
                        const academicYearMonths = [
                          { name: 'Septembre', number: 8 }, // Septembre = 8 (index JavaScript)
                          { name: 'Octobre', number: 9 },   // Octobre = 9 (index JavaScript)
                          { name: 'Novembre', number: 10 }, // Novembre = 10 (index JavaScript)
                          { name: 'Décembre', number: 11 }, // Décembre = 11 (index JavaScript)
                          { name: 'Janvier', number: 0 },   // Janvier = 0 (index JavaScript)
                          { name: 'Février', number: 1 },   // Février = 1 (index JavaScript)
                          { name: 'Mars', number: 2 },      // Mars = 2 (index JavaScript)
                          { name: 'Avril', number: 3 },     // Avril = 3 (index JavaScript)
                          { name: 'Mai', number: 4 },       // Mai = 4 (index JavaScript)
                          { name: 'Juin', number: 5 },      // Juin = 5 (index JavaScript)
                          { name: 'Juillet', number: 6 }    // Juillet = 6 (index JavaScript)
                        ];
                        
                        // Année académique 2025-2026 (septembre 2025 à juillet 2026)
                        const academicYearStart = 2025;
                        
                        for (const monthInfo of academicYearMonths) {
                          // Déterminer l'année pour chaque mois de l'année académique 2025-2026
                          let year = academicYearStart;
                          if (monthInfo.number >= 8) {
                            // Septembre à Décembre : 2025
                            year = academicYearStart;
                          } else {
                            // Janvier à Juillet : 2026
                            year = academicYearStart + 1;
                          }
                          
                          // Utiliser le format YYYY-MM avec le mois correct (1-12)
                          const monthKey = `${year}-${String(monthInfo.number + 1).padStart(2, '0')}`;
                          const monthName = `${monthInfo.name} ${year}`;
                          
                          const monthRevenue = revenues
                            .filter(r => r.date?.startsWith(monthKey))
                            .reduce((sum, r) => sum + (r.amount || 0), 0);
                          
                          
                          // Afficher tous les mois de l'année académique
                          monthlyData.push({
                            month: monthName,
                            amount: monthRevenue,
                            key: monthKey
                          });
                        }

                        const totalAcademicYear = monthlyData.reduce((sum, item) => sum + item.amount, 0);
                        const averageMonthly = totalAcademicYear / monthlyData.length;

                        return (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                  {totalAcademicYear.toLocaleString()} F CFA
                                </div>
                                <div className="text-sm text-gray-600">Année Scolaire</div>
                                <div className="text-xs text-gray-500 mt-1">Septembre à Juillet</div>
                              </div>
                              <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                  {averageMonthly.toLocaleString()} F CFA
                                </div>
                                <div className="text-sm text-gray-600">Moyenne Mensuelle</div>
                                <div className="text-xs text-gray-500 mt-1">Sur l'année scolaire</div>
                              </div>
                              <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                  {monthlyData.length}
                                </div>
                                <div className="text-sm text-gray-600">Mois Scolaires</div>
                                <div className="text-xs text-gray-500 mt-1">Septembre à Juillet</div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <h4 className="font-medium text-gray-900">Détail Mensuel - Année Scolaire</h4>
                              {monthlyData.map((item) => (
                                <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <span className="font-medium text-gray-700">{item.month}</span>
                                  <span className="font-semibold text-gray-900">
                                    {item.amount.toLocaleString()} F CFA
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Indicateurs de performance */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Indicateurs de Performance</h3>
                      <p className="text-sm text-gray-600 mt-1">Métriques clés pour l'analyse financière</p>
                    </div>
                    <div className="p-6">
                      {(() => {
                        const total = revenues.reduce((sum, r) => sum + (r.amount || 0), 0);
                        const tuitionRevenue = revenues
                          .filter(r => ['inscription_fee', 'reinscription_fee', 'tuition_fee'].includes(r.type))
                          .reduce((sum, r) => sum + (r.amount || 0), 0);
                        
                        const currentDate = new Date();
                        const currentMonth = currentDate.getMonth();
                        const currentYear = currentDate.getFullYear();
                        
                        // Calculer la moyenne des 3 derniers mois
                        const last3Months = [];
                        for (let i = 2; i >= 0; i--) {
                          const date = new Date(currentYear, currentMonth - i, 1);
                          const monthKey = date.toISOString().substring(0, 7);
                          const monthRevenue = revenues
                            .filter(r => r.date?.startsWith(monthKey))
                            .reduce((sum, r) => sum + (r.amount || 0), 0);
                          last3Months.push(monthRevenue);
                        }
                        
                        const avg3Months = last3Months.reduce((sum, amount) => sum + amount, 0) / 3;
                        const currentMonthRevenue = last3Months[2] || 0;
                        const growthRate = avg3Months > 0 ? ((currentMonthRevenue - avg3Months) / avg3Months) * 100 : 0;
                        
                        const tuitionRatio = total > 0 ? (tuitionRevenue / total) * 100 : 0;
                        const revenueCount = revenues.length;
                        const avgTransaction = revenueCount > 0 ? total / revenueCount : 0;

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600 mb-2">
                                {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                              </div>
                              <div className="text-sm text-gray-600">Croissance</div>
                              <div className="text-xs text-gray-500 mt-1">vs moyenne 3 mois</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                              <div className="text-2xl font-bold text-green-600 mb-2">
                                {tuitionRatio.toFixed(1)}%
                              </div>
                              <div className="text-sm text-gray-600">Ratio Scolarité</div>
                              <div className="text-xs text-gray-500 mt-1">Part des frais scolaires</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600 mb-2">
                                {avgTransaction.toLocaleString()} F CFA
                              </div>
                              <div className="text-sm text-gray-600">Ticket Moyen</div>
                              <div className="text-xs text-gray-500 mt-1">Par transaction</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                              <div className="text-2xl font-bold text-orange-600 mb-2">
                                {revenueCount}
                              </div>
                              <div className="text-sm text-gray-600">Transactions</div>
                              <div className="text-xs text-gray-500 mt-1">Total enregistrées</div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'expenses':
        return (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600 rounded-2xl p-6 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-2">Gestion des Dépenses</h2>
                    <p className="text-red-100 text-lg">Suivi et contrôle des dépenses de l'école</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* Sélecteur d'année scolaire */}
                    <div className="flex items-center space-x-2">
                      <select
                        value={(selectedSchoolYear as string) || currentAcademicYear?.id || ''}
                        onChange={(e) => {
                          const year = academicYears?.find(y => y.id === e.target.value);
                          if (year) {
                            // Mettre à jour l'année scolaire sélectionnée
                            setSelectedSchoolYear(year.id);
                            // Recharger les dépenses pour la nouvelle année
                            fetchExpenses({ academicYearId: year.id });
                          }
                        }}
                        className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:ring-2 focus:ring-white/50"
                        aria-label="Sélectionner l'année scolaire"
                        title="Sélectionner l'année scolaire"
                      >
                        {academicYears?.map((year) => (
                          <option key={year.id} value={year.id} className="text-gray-900">
                            {year.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleAddExpense}
                      className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Nouvelle dépense
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Minus className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {expenses?.length || 0}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Total Dépenses</h4>
                <p className="text-sm text-gray-600">Toutes les dépenses</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-orange-600">
                    {expenses?.filter(e => e.status === 'pending').length || 0}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">En attente</h4>
                <p className="text-sm text-gray-600">Dépenses non approuvées</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {expenses?.filter(e => e.status === 'approved').length || 0}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Approuvées</h4>
                <p className="text-sm text-gray-600">Dépenses validées</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {expenses?.filter(e => e.status === 'rejected').length || 0}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Rejetées</h4>
                <p className="text-sm text-gray-600">Dépenses rejetées</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {calculateApprovedExpensesTotal.toLocaleString()} FCFA
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Montant total approuvées</h4>
                <p className="text-sm text-gray-600">Somme des dépenses approuvées</p>
              </div>
            </div>


            {/* Liste des dépenses - Design moderne */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
              {/* Header moderne avec gradient */}
              <div className="relative overflow-hidden bg-gradient-to-r from-red-500 via-red-600 to-red-700 p-6">
                <div className="absolute inset-0 bg-black/5"></div>
                <div className="relative z-10">
                  <div className="space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Tableau des Dépenses</h3>
                        <p className="text-red-100 text-sm">Gestion et suivi des dépenses de l'école</p>
                      </div>
                    </div>
                    
                    {/* Champ de recherche */}
                    <div className="flex justify-end">
                      <div className="relative w-full max-w-md">
                        <input
                          type="text"
                          placeholder="Rechercher une dépense..."
                          value={expenseSearchTerm}
                          onChange={(e) => setExpenseSearchTerm(e.target.value)}
                          className="w-full px-4 py-2.5 pl-10 text-sm bg-white/20 backdrop-blur-sm text-white placeholder-red-100 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-100" />
                      </div>
                    </div>
                    
                    {/* Filtres et boutons d'action */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                      <select
                        value={expenseFilterStatus}
                        onChange={(e) => setExpenseFilterStatus(e.target.value)}
                        title="Filtrer par statut"
                        className="px-4 py-2.5 text-sm bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                      >
                        <option value="" className="text-gray-900">Tous les statuts</option>
                        <option value="pending" className="text-gray-900">En attente</option>
                        <option value="approved" className="text-gray-900">Approuvée</option>
                        <option value="rejected" className="text-gray-900">Rejetée</option>
                      </select>
                      <select
                        value={expenseFilterCategory}
                        onChange={(e) => setExpenseFilterCategory(e.target.value)}
                        title="Filtrer par catégorie"
                        className="px-4 py-2.5 text-sm bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                      >
                        <option value="" className="text-gray-900">Toutes les catégories</option>
                        {expenseCategories?.map((category) => (
                          <option key={category.id} value={category.id} className="text-gray-900">
                            {category.name}
                          </option>
                        ))}
                      </select>
                      
                      {/* Filtre par date de début */}
                      <input
                        type="date"
                        value={expenseFilterStartDate}
                        onChange={(e) => setExpenseFilterStartDate(e.target.value)}
                        title="Date de début"
                        className="px-4 py-2.5 text-sm bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                        placeholder="Date de début"
                      />
                      
                      {/* Filtre par date de fin */}
                      <input
                        type="date"
                        value={expenseFilterEndDate}
                        onChange={(e) => setExpenseFilterEndDate(e.target.value)}
                        title="Date de fin"
                        className="px-4 py-2.5 text-sm bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                        placeholder="Date de fin"
                      />
                      
                      {/* Boutons d'action */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setExpenseSearchTerm('');
                            setExpenseFilterCategory('');
                            setExpenseFilterStatus('');
                            setExpenseFilterStartDate('');
                            setExpenseFilterEndDate('');
                          }}
                          className="inline-flex items-center justify-center px-3 py-2.5 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl hover:bg-white/30 transition-all duration-200"
                          title="Effacer tous les filtres"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={refreshExpenses}
                          className="inline-flex items-center justify-center px-3 py-2.5 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl hover:bg-white/30 transition-all duration-200"
                          title="Actualiser les données"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={handlePrintExpenses}
                          className="inline-flex items-center justify-center px-3 py-2.5 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl hover:bg-white/30 transition-all duration-200"
                          title="Exporter les dépenses"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {expensesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-100 mx-auto mb-6"></div>
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-red-500 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chargement des dépenses</h3>
                    <p className="text-gray-600">Récupération des données en cours...</p>
                    <div className="mt-4 w-48 bg-gray-200 rounded-full h-2 mx-auto">
                      <div className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Minus className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune dépense trouvée</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Commencez par ajouter une nouvelle dépense pour suivre les coûts de votre établissement
                  </p>
                  <button
                    onClick={handleAddExpense}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Ajouter une dépense
                  </button>
                </div>
              ) : (
                <div className="overflow-hidden">
                  {/* Tableau moderne */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-white" />
                              </div>
                              <span>Date</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                              </div>
                              <span>Titre</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <Hash className="w-4 h-4 text-white" />
                              </div>
                              <span>Catégorie</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-white" />
                              </div>
                              <span>Fournisseur</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-4 h-4 text-white" />
                              </div>
                              <span>Montant</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-4 h-4 text-white" />
                              </div>
                              <span>Méthode</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                              <span>Statut</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                                <Settings className="w-4 h-4 text-white" />
                              </div>
                              <span>Actions</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredExpenses.map((expense) => (
                          <tr 
                            key={expense.id} 
                            className="hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 transition-all duration-300 group"
                          >
                            {/* Date */}
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                  <Calendar className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                                </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {expense.date ? new Date(expense.date).toLocaleDateString('fr-FR') : 'N/A'}
                                </div>
                              </div>
                              </div>
                            </td>

                            {/* Titre */}
                            <td className="px-6 py-5">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {expense.title}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                    {expense.description}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Catégorie */}
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                  <Hash className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">
                                  {expenseCategories.find(cat => cat.id === expense.category)?.name || expense.category}
                                </span>
                              </div>
                            </td>

                            {/* Fournisseur */}
                            <td className="px-6 py-5">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                  <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {expense.vendor || ' - '}
                                </div>
                              </div>
                            </td>

                            {/* Montant */}
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {expense.amount.toLocaleString()} F CFA
                                </div>
                              </div>
                            </td>

                            {/* Méthode de paiement */}
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {getPaymentMethodLabel(expense.paymentMethod)}
                                </div>
                              </div>
                            </td>

                            {/* Statut */}
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                  <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                </div>
                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                  expense.status === 'approved'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : expense.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                  {expense.status === 'approved' ? 'Approuvée' :
                                   expense.status === 'pending' ? 'En attente' :
                                   expense.status === 'rejected' ? 'Rejetée' : 'Payée'}
                                </span>
                              </div>
                            </td>
                            {/* Actions */}
                            <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                {expense.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveExpense(expense.id)}
                                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
                                      title="Approuver cette dépense"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleRejectExpense(expense.id)}
                                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                                      title="Rejeter cette dépense"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleEditExpense(expense)}
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                                  title="Modifier cette dépense"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteExpense(expense.id)}
                                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                                  title="Supprimer cette dépense"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer du tableau */}
                  <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span>Affichage de {filteredExpenses.length} dépense(s)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Approuvées: {filteredExpenses.filter(e => e.status === 'approved').length}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span>En attente: {filteredExpenses.filter(e => e.status === 'pending').length}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>Rejetées: {filteredExpenses.filter(e => e.status === 'rejected').length}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          Total approuvées: {calculateApprovedExpensesTotal.toLocaleString()} FCFA
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'payroll':
        return <PayrollManagement />;

      case 'daily-closure':
        return (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h3 className="text-2xl font-bold mb-2">Clôture Journalière</h3>
                    <p className="text-indigo-100">
                      Gestion des clôtures quotidiennes et bilans journaliers
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={handleCreateDailyClosure}
                      className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nouvelle clôture
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full"></div>
            </div>


            {/* Synthèse des opérations du jour */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="relative bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Synthèse des Opérations du Jour</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Récapitulatif des recettes et dépenses du {selectedClosureDate ? new Date(selectedClosureDate).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'jour'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="date"
                        value={selectedClosureDate}
                        onChange={(e) => setSelectedClosureDate(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Filtrer par date"
                      />
                    </div>
                    <button
                      onClick={() => fetchDailyClosures({ date: selectedClosureDate })}
                      className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                      title="Filtrer"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Récapitulatif des totaux du jour */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-lg font-semibold text-green-800 dark:text-green-200">Total Recettes</h5>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {dailyStats?.totalIncome?.toLocaleString() || 0} F CFA
                        </p>
                      </div>
                      <TrendingUp className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-lg font-semibold text-red-800 dark:text-red-200">Total Dépenses</h5>
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                          {dailyStats?.totalExpenses?.toLocaleString() || 0} F CFA
                        </p>
                      </div>
                      <Minus className="w-12 h-12 text-red-600 dark:text-red-400" />
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Solde du Jour</h5>
                        <p className={`text-3xl font-bold ${
                          (dailyStats?.netBalance || 0) >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {(dailyStats?.netBalance || 0).toLocaleString()} F CFA
                        </p>
                      </div>
                      <DollarSign className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                {/* Détail des recettes et dépenses côte à côte */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Colonne des Recettes */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h6 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                        <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
                        Recettes Encaissées
                      </h6>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {dailyRevenues?.length || 0} opérations
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                      {dailyRevenues && dailyRevenues.length > 0 ? (
                        <div className="space-y-3">
                          {dailyRevenues.map((revenue) => (
                            <div key={revenue.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                  {revenue.type === 'inscription_fee' ? 'Frais d\'inscription' :
                                   revenue.type === 'reinscription_fee' ? 'Frais de réinscription' :
                                   revenue.type === 'tuition_fee' ? 'Frais de scolarité' :
                                   revenue.type === 'cantine' ? 'Cantine' :
                                   revenue.type === 'fournitures' ? 'Fournitures' :
                                   revenue.type === 'don' ? 'Don' :
                                   revenue.description || 'Autre recette'}
                                </div>
                                <span className="text-lg font-bold text-green-600">
                                  {revenue.amount?.toLocaleString()} F CFA
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>{revenue.studentName || 'Recette manuelle'}</span>
                                <span>{getPaymentMethodLabel(revenue.paymentMethod) || 'Non spécifié'}</span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {(() => {
                                  const date = new Date(revenue.date);
                                  const hasTime = revenue.date && revenue.date.includes('T');
                                  if (hasTime) {
                                    return `${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
                                  } else {
                                    return date.toLocaleDateString('fr-FR');
                                  }
                                })()}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Aucune recette enregistrée pour cette journée</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Colonne des Dépenses */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h6 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                        <Minus className="w-6 h-6 mr-2 text-red-600" />
                        Dépenses Effectuées
                      </h6>
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        {dailyExpenses?.length || 0} opérations
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                      {dailyExpenses && dailyExpenses.length > 0 ? (
                        <div className="space-y-3">
                          {dailyExpenses.map((expense) => (
                            <div key={expense.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                  {expense.title}
                                </div>
                                <span className="text-lg font-bold text-red-600">
                                  {expense.amount?.toLocaleString()} F CFA
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>{expenseCategories?.find(cat => cat.id === expense.category)?.name || expense.category}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  expense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {expense.status === 'approved' ? 'Approuvée' :
                                   expense.status === 'pending' ? 'En attente' :
                                   expense.status === 'rejected' ? 'Rejetée' : 'Payée'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {new Date(expense.date).toLocaleDateString('fr-FR')} • {getPaymentMethodLabel(expense.paymentMethod)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Minus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Aucune dépense enregistrée pour cette journée</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modes de paiement utilisés */}
                <div className="mt-8">
                  <h6 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
                    Modes de Paiement Utilisés
                  </h6>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {dailyStats?.paymentMethods ? 
                      Object.entries(dailyStats.paymentMethods).map(([method, count]) => {
                        const total = Object.values(dailyStats.paymentMethods).reduce((sum: number, c: any) => sum + Number(c), 0);
                        const percentage = total > 0 ? Math.round((Number(count) / total) * 100) : 0;
                        return (
                          <div key={method} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-indigo-600 mb-1">
                              {percentage}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{method}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {String(count)} transaction{Number(count) > 1 ? 's' : ''}
                            </div>
                          </div>
                        );
                      }) : 
                      ['Espèces', 'Mobile Money', 'Virement', 'Chèque'].map((method) => (
                        <div key={method} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-indigo-600 mb-1">0%</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{method}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Validation et rapprochement */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="relative bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Validation et Rapprochement</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Vérification de la trésorerie et gestion des écarts
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Fond de caisse de départ */}
                  <div className="space-y-4">
                    <h6 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-orange-600" />
                      Fond de Caisse de Départ
                    </h6>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center justify-between">
                        <span className="text-orange-800 dark:text-orange-200 font-medium">Espèces en caisse ce matin</span>
                        <input
                          type="number"
                          value={openingCashAmount}
                          onChange={(e) => setOpeningCashAmount(parseFloat(e.target.value) || 0)}
                          className="text-2xl font-bold text-orange-600 bg-transparent border-none outline-none w-32 text-right"
                          placeholder="0"
                        />
                      </div>
                      <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                        Montant de départ de la journée
                      </p>
                    </div>
                  </div>

                  {/* Trésorerie actuelle */}
                  <div className="space-y-4">
                    <h6 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                      Trésorerie Actuelle
                    </h6>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <span className="text-green-800 dark:text-green-200 font-medium">Espèces en caisse maintenant</span>
                        <input
                          type="number"
                          value={currentCashAmount}
                          onChange={(e) => setCurrentCashAmount(parseFloat(e.target.value) || 0)}
                          className="text-2xl font-bold text-green-600 bg-transparent border-none outline-none w-32 text-right"
                          placeholder="0"
                        />
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        Montant actuel en caisse
                      </p>
                    </div>
                  </div>
                </div>

                {/* Calcul des écarts */}
                <div className="mt-8">
                  <h6 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                    Calcul des Écarts de Caisse
                  </h6>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Écart calculé</div>
                      <div className={`text-2xl font-bold ${
                        cashVariance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {cashVariance.toLocaleString()} F CFA
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        (Trésorerie actuelle - Fond de départ - Solde du jour)
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <div className="text-sm text-green-600 dark:text-green-400 mb-2">Écart positif</div>
                      <div className="text-2xl font-bold text-green-600">
                        {cashVariance > 0 ? cashVariance.toLocaleString() : '0'} F CFA
                      </div>
                      <div className="text-xs text-green-500 dark:text-green-500 mt-1">
                        Excédent de caisse
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                      <div className="text-sm text-red-600 dark:text-red-400 mb-2">Écart négatif</div>
                      <div className="text-2xl font-bold text-red-600">
                        {cashVariance < 0 ? Math.abs(cashVariance).toLocaleString() : '0'} F CFA
                      </div>
                      <div className="text-xs text-red-500 dark:text-red-500 mt-1">
                        Manque de caisse
                      </div>
                    </div>
                  </div>
                </div>

                {/* Justification des écarts */}
                <div className="mt-8">
                  <h6 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Justification des Écarts
                  </h6>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Justification des écarts de caisse
                      </label>
                      {isVarianceJustified && (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">Justifiée</span>
                        </div>
                      )}
                    </div>
                    <textarea
                      value={varianceJustification}
                      onChange={(e) => setVarianceJustification(e.target.value)}
                      className={`w-full h-24 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white resize-none ${
                        isVarianceJustified 
                          ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Expliquez les écarts de caisse s'il y en a (ex: erreur de calcul, transaction non enregistrée, etc.)"
                      disabled={isVarianceJustified}
                    />
                    {isVarianceJustified && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        ✓ Justification enregistrée le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={handleSaveVarianceJustification}
                          disabled={!varianceJustification.trim() || isVarianceJustified}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            !varianceJustification.trim() || isVarianceJustified
                              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                              : 'bg-orange-600 text-white hover:bg-orange-700'
                          }`}
                          title={
                            isVarianceJustified 
                              ? 'Justification déjà enregistrée' 
                              : !varianceJustification.trim() 
                                ? 'Veuillez saisir une justification' 
                                : 'Enregistrer la justification'
                          }
                        >
                          {isVarianceJustified ? 'Justification enregistrée ✓' : 'Enregistrer la justification'}
                        </button>
                        
                        {isVarianceJustified && (
                          <button 
                            onClick={handleEditVarianceJustification}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title="Modifier la justification"
                          >
                            <Edit className="w-4 h-4 inline mr-1" />
                            Modifier
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clôture et verrouillage */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="relative bg-gradient-to-r from-red-50 via-pink-50 to-rose-50 dark:from-red-900/20 dark:via-pink-900/20 dark:to-rose-900/20 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Clôture et Verrouillage</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Finalisation et sécurisation des opérations de la journée
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Actions de clôture */}
                  <div className="space-y-6">
                    <h6 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-red-600" />
                      Actions de Clôture
                    </h6>
                    
                    <div className="space-y-4">
                      <button 
                        onClick={handleValidateClosure}
                        className="w-full p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                        title="Valider et clôturer la journée en cours"
                        aria-label="Valider et clôturer la journée en cours"
                        role="button"
                        tabIndex={0}
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Valider et Clôturer la Journée
                      </button>
                      
                      <button 
                        onClick={() => handleGenerateReport('pdf')}
                        className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <Printer className="w-5 h-5 mr-2" />
                        Générer le Journal de Caisse (PDF)
                      </button>
                      
                      <button 
                        onClick={() => handleGenerateReport('excel')}
                        className="w-full p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        Exporter en Excel
                      </button>
                    </div>
                  </div>

                  {/* Informations de sécurité */}
                  <div className="space-y-6">
                    <h6 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                      Informations de Sécurité
                    </h6>
                    
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div>
                          <div className="font-semibold text-orange-800 dark:text-orange-200">Attention !</div>
                          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                            Une fois la clôture validée, aucune modification des transactions du jour ne sera possible sans autorisation spéciale.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Agent responsable</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {accountantName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Date de clôture</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {new Date().toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Heure de clôture</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start space-x-3">
                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Signature numérique</div>
                          
                          {/* Signature du comptable */}
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                            <div className="text-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Signature de l'agent responsable</div>
                              <div 
                                className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2"
                                style={{ 
                                  fontFamily: '"Brush Script MT", "Lucida Handwriting", "Comic Sans MS", cursive',
                                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                  letterSpacing: '1px',
                                  fontStyle: 'italic',
                                  transform: 'rotate(-2deg)'
                                }}
                              >
                                {accountantFirstName}
                              </div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                            Signature numérique générée automatiquement pour assurer la traçabilité.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rapports et traçabilité */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="relative bg-gradient-to-r from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-indigo-900/20 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Rapports et Traçabilité</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Génération de rapports et suivi des clôtures journalières
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Génération de rapports */}
                  <div className="space-y-6">
                    <h6 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-purple-600" />
                      Génération de Rapports
                    </h6>
                    
                    <div className="space-y-4">
                      <button 
                        onClick={() => handleGenerateReport('pdf')}
                        className="w-full p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                      >
                        <Printer className="w-5 h-5 mr-2" />
                        Rapport Récapitulatif Journalier
                      </button>
                      
                      <button 
                        onClick={() => handleGenerateReport('excel')}
                        className="w-full p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                      >
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Statistiques de la Journée
                      </button>
                      
                      <button 
                        onClick={() => handleGenerateReport('email')}
                        className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <Mail className="w-5 h-5 mr-2" />
                        Envoyer par Email
                      </button>
                    </div>

                    {/* Statistiques de la journée */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 mb-3 block">Statistiques de la Journée</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Part de la scolarité dans les recettes</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {dailyStats?.tuitionPercentage || 0}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Moyenne des paiements</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {(dailyStats?.averagePayment || 0).toLocaleString()} F CFA
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Mode de paiement principal</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {dailyStats?.paymentMethods && Object.keys(dailyStats.paymentMethods).length > 0 ? 
                              Object.keys(dailyStats.paymentMethods).reduce((a, b) => 
                                dailyStats.paymentMethods[a] > dailyStats.paymentMethods[b] ? a : b
                              ) : 'Non spécifié'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Total des transactions</span>
                          <span className="font-medium text-green-600">
                            {dailyStats?.totalTransactions || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Historique et traçabilité */}
                  <div className="space-y-6">
                    <h6 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                      Historique et Traçabilité
                    </h6>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 mb-3 block">Dernières Clôtures</div>
                      <div className="space-y-3">
                        {closureHistory && closureHistory.length > 0 ? (
                          closureHistory.map((closure, index) => (
                            <div key={closure.id || index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  Clôture du {new Date(closure.date).toLocaleDateString('fr-FR')}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Agent: {closure.createdByName || closure.createdBy || 'Non défini'}
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div className={`text-sm font-medium ${(closure.netBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {(closure.netBalance || 0) >= 0 ? '+' : ''}{(closure.netBalance || 0).toLocaleString()} F CFA
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {closure.createdAt ? new Date(closure.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleEditDailyClosure(closure)}
                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                                    title="Modifier cette clôture"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDailyClosure(closure.id)}
                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                                    title="Supprimer cette clôture"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Aucune clôture enregistrée</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Alertes */}
                    {alerts && alerts.length > 0 && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div>
                            <div className="font-semibold text-yellow-800 dark:text-yellow-200">Alertes</div>
                            <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                              {alerts.map((alert, index) => (
                                <div key={index} className={`flex items-center space-x-2 ${
                                  alert.severity === 'error' ? 'text-red-600 dark:text-red-400' : 
                                  alert.severity === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 
                                  'text-blue-600 dark:text-blue-400'
                                }`}>
                                  <span>•</span>
                                  <span>{alert.message}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Fonctionnalités avancées */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="relative bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-900/20 dark:via-cyan-900/20 dark:to-blue-900/20 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fonctionnalités Avancées</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Outils avancés pour la gestion financière quotidienne
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Prévisions */}
                  <div className="space-y-6">
                    <h6 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-teal-600" />
                      Prévisions et Projections
                    </h6>
                    
                    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-teal-800 dark:text-teal-200">Solde d'ouverture prévu demain</span>
                        <span className="text-2xl font-bold text-teal-600">
                          {(nextDayProjection || 0).toLocaleString()} F CFA
                        </span>
                      </div>
                      <p className="text-sm text-teal-600 dark:text-teal-400">
                        Basé sur le solde de clôture d'aujourd'hui
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 mb-3 block">Tendances de la semaine</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Recettes moyennes/jour</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {(weeklyStats?.averageDailyIncome || 0).toLocaleString()} F CFA
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Dépenses moyennes/jour</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {(weeklyStats?.averageDailyExpenses || 0).toLocaleString()} F CFA
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Solde moyen/jour</span>
                          <span className={`font-medium ${(weeklyStats?.averageDailyBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(weeklyStats?.averageDailyBalance || 0) >= 0 ? '+' : ''}{(weeklyStats?.averageDailyBalance || 0).toLocaleString()} F CFA
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Jours analysés</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {weeklyStats?.totalDays || 0} jour{(weeklyStats?.totalDays || 0) > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Outils de gestion */}
                  <div className="space-y-6">
                    <h6 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-blue-600" />
                      Outils de Gestion
                    </h6>
                    
                    <div className="space-y-4">
                      <button className="w-full p-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Synchroniser avec la Trésorerie
                      </button>
                      
                      <button className="w-full p-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center justify-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Planifier les Clôtures
                      </button>
                      
                      <button className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                        <Users className="w-5 h-5 mr-2" />
                        Gérer les Agents
                      </button>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-semibold text-blue-800 dark:text-blue-200">Système de Sécurité</div>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Toutes les opérations sont tracées et horodatées pour garantir l'intégrité des données financières.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des clôtures */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="relative bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Historique des Clôtures</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Gestion et suivi des clôtures journalières
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {dailyClosureLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Chargement des clôtures...
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Veuillez patienter pendant le chargement des clôtures journalières.
                      </p>
                    </div>
                  </div>
                ) : dailyClosureError ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Erreur de chargement
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {dailyClosureError}
                    </p>
                    <button
                      onClick={() => fetchDailyClosures()}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Réessayer
                    </button>
                  </div>
                ) : dailyClosures.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Aucune clôture trouvée
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Aucune clôture journalière n'a encore été enregistrée.
                    </p>
                    <button
                      onClick={handleCreateDailyClosure}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Créer la première clôture
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dailyClosures.map((closure) => (
                      <div key={closure.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                              <Clock className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                              <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Clôture du {new Date(closure.date).toLocaleDateString('fr-FR')}
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Statut: <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  closure.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : closure.status === 'draft'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {closure.status === 'completed' ? 'Terminée' : 
                                   closure.status === 'draft' ? 'Brouillon' : 'En attente'}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDailyClosure(closure)}
                              className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                              title="Voir"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEditDailyClosure(closure)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(closure)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Recettes</p>
                            <p className="text-lg font-semibold text-green-600">
                              {(closure.totalIncome || 0).toLocaleString()} F CFA
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Dépenses</p>
                            <p className="text-lg font-semibold text-red-600">
                              {(closure.totalExpenses || 0).toLocaleString()} F CFA
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Solde Net</p>
                            <p className={`text-lg font-semibold ${
                              (closure.netBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {(closure.netBalance || 0).toLocaleString()} F CFA
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Espèces</p>
                            <p className="text-lg font-semibold text-blue-600">
                              {(closure.cashOnHand || 0).toLocaleString()} F CFA
                            </p>
                          </div>
                        </div>
                        
                        {closure.notes && (
                          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <strong>Notes:</strong> {closure.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'treasury':
        return (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Trésorerie</h2>
                    <p className="text-emerald-100 text-lg">
                      Gestion globale des flux financiers et des comptes
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {treasuryStats ? formatAmount(treasuryStats.net_balance) : '0 FCFA'}
                      </div>
                      <div className="text-emerald-200 text-sm">Solde global</div>
                    </div>
                    <Wallet className="w-12 h-12 text-emerald-200" />
                  </div>
                </div>
              </div>
            </div>

            {/* Graphiques évolutifs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Évolution des Flux Financiers</h3>
                <div className="flex items-center space-x-2">
                  <select 
                    value={selectedTreasuryPeriod} 
                    onChange={(e) => setSelectedTreasuryPeriod(e.target.value)}
                    title="Sélectionner la période d'analyse"
                    aria-label="Période d'analyse des flux"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                    <option value="quarter">Ce trimestre</option>
                    <option value="year">Cette année</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Graphique des recettes vs dépenses */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recettes vs Dépenses</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                        <span className="text-gray-700 dark:text-gray-300">Recettes</span>
                      </div>
                      <span className="font-semibold text-green-600">
                        {treasuryStats ? formatAmount(treasuryStats.total_revenues) : '0 FCFA'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                        <span className="text-gray-700 dark:text-gray-300">Dépenses</span>
                      </div>
                      <span className="font-semibold text-red-600">
                        {treasuryStats ? formatAmount(treasuryStats.total_expenses) : '0 FCFA'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                      <div className="flex h-3 rounded-full">
                        <div 
                          className="bg-green-500 rounded-l-full" 
                          style={{ 
                            width: treasuryStats && treasuryStats.total_revenues > 0 
                              ? `${Math.min((treasuryStats.total_revenues / (treasuryStats.total_revenues + treasuryStats.total_expenses)) * 100, 100)}%` 
                              : '0%' 
                          }}
                        ></div>
                        <div 
                          className="bg-red-500 rounded-r-full" 
                          style={{ 
                            width: treasuryStats && treasuryStats.total_expenses > 0 
                              ? `${Math.min((treasuryStats.total_expenses / (treasuryStats.total_revenues + treasuryStats.total_expenses)) * 100, 100)}%` 
                              : '0%' 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Répartition par compte */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Répartition par Compte</h4>
                  <div className="space-y-3">
                    {treasuryAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded mr-3" 
                            style={{ backgroundColor: account.color }}
                          ></div>
                          <span className="text-gray-700 dark:text-gray-300">{account.name}</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {formatAmount(account.balance)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Indicateurs de chargement et erreurs */}
            {treasuryLoading && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center">
                  <RefreshCw className="w-5 h-5 text-blue-600 mr-2 animate-spin" />
                  <span className="text-blue-800 dark:text-blue-200">Chargement des données de trésorerie...</span>
                </div>
              </div>
            )}

            {treasuryError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800 dark:text-red-200">{treasuryError}</span>
                </div>
              </div>
            )}

            {/* Tableau de bord de trésorerie */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Solde global */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Solde Global</h3>
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Solde Initial</span>
                    <span className="font-semibold text-blue-600">
                      {formatAmount(0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Recettes</span>
                    <span className="font-semibold text-green-600">
                      {treasuryStats ? formatAmount(treasuryStats.total_revenues) : '0 FCFA'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Dépenses</span>
                    <span className="font-semibold text-red-600">
                      {treasuryStats ? formatAmount(treasuryStats.total_expenses) : '0 FCFA'}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-900 dark:text-gray-100 font-semibold">Solde Net</span>
                      <span className={`font-bold text-lg ${
                        treasuryStats?.net_balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {treasuryStats ? formatAmount(treasuryStats.net_balance) : '0 FCFA'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Indicateurs clés */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Indicateurs Clés</h3>
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Frais de scolarité</span>
                      <span className="text-sm font-semibold">{Math.round(treasuryStats?.tuition_percentage || 0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${Math.round(treasuryStats?.tuition_percentage || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Salaires</span>
                      <span className="text-sm font-semibold">{Math.round(treasuryStats?.salary_percentage || 0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${Math.round(treasuryStats?.salary_percentage || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fond de roulement */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Fond de Roulement</h3>
                  <Calculator className="w-6 h-6 text-purple-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">FR</span>
                    <span className={`font-semibold ${
                      workingCapital?.fond_roulement >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {workingCapital ? formatAmount(workingCapital.fond_roulement) : '0 FCFA'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">BFR</span>
                    <span className="font-semibold text-blue-600">
                      {workingCapital ? formatAmount(workingCapital.besoin_fonds_roulement) : '0 FCFA'}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-900 dark:text-gray-100 font-semibold">Trésorerie Nette</span>
                      <span className={`font-bold ${
                        workingCapital?.tresorerie_nette >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {workingCapital ? formatAmount(workingCapital.tresorerie_nette) : '0 FCFA'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Alertes pour déséquilibres */}
                  {workingCapital && (
                    <div className="mt-4 space-y-2">
                      {workingCapital.fond_roulement < 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                          <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                            <span className="text-sm font-medium text-red-800 dark:text-red-200">
                              Déséquilibre structurel (FR &lt; 0)
                            </span>
                          </div>
                        </div>
                      )}
                      {workingCapital.tresorerie_nette < 0 && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                          <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                              Déficit de liquidité à court terme (TN &lt; 0)
                            </span>
                          </div>
                        </div>
                      )}
                      {workingCapital.fond_roulement >= 0 && workingCapital.tresorerie_nette >= 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                              Situation financière équilibrée
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Opérations de trésorerie */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Opérations de Trésorerie</h3>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <ArrowLeftRight className="w-4 h-4 mr-2 inline" />
                    Transfert
                  </button>
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                    <DollarSign className="w-4 h-4 mr-2 inline" />
                    Avance
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <TrendingUp className="w-4 h-4 mr-2 inline" />
                    Prévision
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Transferts entre comptes */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Transferts</h4>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Transferts entre comptes de trésorerie
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatAmount(0)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Aucun transfert ce mois
                    </div>
                  </div>
                </div>

                {/* Avances et régularisations */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Avances</h4>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Avances et régularisations de caisse
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatAmount(0)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Aucune avance ce mois
                    </div>
                  </div>
                </div>

                {/* Prévisions de trésorerie */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Prévisions</h4>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Prévisions de trésorerie
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatAmount(0)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Aucune prévision active
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comptes de trésorerie */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Comptes de Trésorerie</h3>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Nouveau Compte
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {treasuryAccounts.map((account) => (
                  <div key={account.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3" 
                          style={{ backgroundColor: account.color }}
                        ></div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{account.name}</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{account.type}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatAmount(account.balance)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Solde actuel</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rapports et analyses */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Rapports et Analyses</h3>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <FileSpreadsheet className="w-4 h-4 mr-2 inline" />
                    Export Excel
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    <FileText className="w-4 h-4 mr-2 inline" />
                    Export PDF
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <BarChart3 className="w-4 h-4 mr-2 inline" />
                    Analyse
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Rapport de trésorerie */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Rapport de Trésorerie</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Rapport complet des flux financiers
                  </div>
                  <button className="w-full px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm">
                    Générer
                  </button>
                </div>

                {/* Courbes d'évolution */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Courbes d'Évolution</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Évolution des soldes et indicateurs
                  </div>
                  <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Visualiser
                  </button>
                </div>

                {/* Analyse des écarts */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Analyse des Écarts</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Comparaison prévisions vs réalisations
                  </div>
                  <button className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                    Analyser
                  </button>
                </div>

                {/* Audit log */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Audit Log</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Traçabilité des opérations
                  </div>
                  <button className="w-full px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm">
                    Consulter
                  </button>
                </div>
              </div>
            </div>

            {/* Historique des opérations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Historique des Opérations</h3>
                <div className="flex items-center space-x-2">
                  <select 
                    value={selectedTreasuryPeriod} 
                    onChange={(e) => setSelectedTreasuryPeriod(e.target.value)}
                    title="Sélectionner la période d'affichage"
                    aria-label="Période d'affichage de l'historique"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                    <option value="quarter">Ce trimestre</option>
                    <option value="year">Cette année</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Description</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Compte</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treasuryHistory.map((operation) => (
                      <tr key={operation.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {new Date(operation.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            operation.type === 'revenue' ? 'bg-green-100 text-green-800' :
                            operation.type === 'expense' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {operation.type === 'revenue' ? 'Recette' :
                             operation.type === 'expense' ? 'Dépense' : 'Transfert'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{operation.description}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{operation.account}</td>
                        <td className={`py-3 px-4 text-right font-semibold ${
                          operation.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatAmount(Math.abs(operation.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'fee-config':
        return (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-2">Paramétrage des Frais</h2>
                    <p className="text-blue-100 text-lg">Configuration et gestion des frais scolaires</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* Sélecteur d'année scolaire */}
                    <div className="flex items-center space-x-2">
                      <label className="text-blue-100 text-sm font-medium">Année :</label>
                       <select
                         value={(selectedSchoolYear as any)?.id || (currentAcademicYear as any)?.id || ''}
                         onChange={async (e) => {
                           const year = academicYears.find(y => (y as any).id === e.target.value);
                           setSelectedSchoolYear(year as any);
                           // Recharger les configurations de frais pour la nouvelle année
                           if (year) {
                             await fetchFeeConfigurations((year as any).id);
                           }
                         }}
                         title="Sélectionner une année académique"
                         className="px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                       >
                        {academicYears && academicYears.length > 0 ? (
                          academicYears.map((year) => (
                            <option key={(year as any).id} value={(year as any).id} className="text-gray-900">
                              {(year as any).name || (year as any).id}
                            </option>
                          ))
                        ) : (
                          <option value="" className="text-gray-900">Aucune année disponible</option>
                        )}
                       </select>
                    </div>
                    
                    {/* Bouton Nouvelle configuration */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleNewFeeConfiguration}
                        className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nouvelle configuration
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Contenu selon le mode de vue */}
            {feeConfigViewMode === 'list' && (
              <FeeConfigurationList
                configurations={feeConfigurations || []}
                loading={feeConfigLoading}
                error={feeConfigError}
                onEdit={handleEditFeeConfiguration}
                onDelete={handleDeleteFeeConfiguration}
                onView={handleViewFeeConfiguration}
                onNew={handleNewFeeConfiguration}
                academicYearId={(selectedSchoolYear as any)?.id || currentAcademicYear?.id}
              />
            )}

            {feeConfigViewMode === 'create' && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Créer une Configuration</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600">Contenu du formulaire de création...</p>
                </div>
              </div>
            )}

            {feeConfigViewMode === 'templates' && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Modèles de Configuration</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600">Contenu des modèles de configuration...</p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Vue d'ensemble</h2>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <p className="text-gray-600">Sélectionnez un onglet pour commencer.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance</h1>
          <p className="text-gray-600">Gestion financière de l'établissement</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={currentAcademicYear?.id || ''}
            onChange={() => {}} // Fonction vide pour éviter le warning
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Sélectionner l'année scolaire"
          >
            {academicYears?.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2 inline" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>

      {/* Modals */}
      {isSchoolFeesPaymentModalOpen && (
        <SchoolFeesPaymentModal
          isOpen={isSchoolFeesPaymentModalOpen}
          onClose={() => setIsSchoolFeesPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
          amount={selectedItem?.amount || 0}
          studentData={selectedItem}
        />
      )}

      {isReceiptModalOpen && selectedReceipt && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          payment={selectedReceipt}
        />
      )}

      {isConfirmationModalOpen && confirmationData && (
        <ConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={() => {
            setIsConfirmationModalOpen(false);
            setConfirmationData(null);
            setIsActionLoading(false);
          }}
          onConfirm={confirmationData.action}
          title={confirmationData.title || "Confirmer l'action"}
          message={confirmationData.message || "Êtes-vous sûr de vouloir continuer ?"}
          type={confirmationData.type}
          itemName={confirmationData.itemName}
          details={confirmationData.details}
          warningMessage={confirmationData.warningMessage}
          confirmButtonText={confirmationData.confirmButtonText}
          cancelButtonText={confirmationData.cancelButtonText}
          isLoading={isActionLoading}
        />
      )}

      {/* ========================================
           MODALS POUR LA GESTION DES DÉPENSES
           ======================================== */}

      {/* Modal de création/édition d'une dépense */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header du modal */}
            <div className="bg-gradient-to-r from-red-500 via-orange-600 to-yellow-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Minus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Nouvelle dépense</h3>
                    <p className="text-red-100 text-sm">Ajouter une nouvelle dépense</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                  title="Fermer le modal"
                  aria-label="Fermer le modal"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Contenu du modal */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Titre */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Titre de la dépense *
                  </label>
                  <input
                    type="text"
                    value={expenseFormData.title}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ex: Achat de fournitures scolaires"
                    aria-label="Titre de la dépense"
                    title="Titre de la dépense"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={expenseFormData.description}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Détails de la dépense..."
                  />
                </div>

                {/* Montant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Montant (FCFA) *
                  </label>
                  <input
                    type="number"
                    value={expenseFormData.amount}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={expenseFormData.date}
                    title="Sélectionner la date de la dépense"
                    aria-label="Date de la dépense"
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={expenseFormData.category}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    aria-label="Sélectionner une catégorie"
                    title="Sélectionner une catégorie"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {expenseCategories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sous-catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sous-catégorie
                  </label>
                  <input
                    type="text"
                    value={expenseFormData.subcategory}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ex: Fournitures de bureau"
                  />
                </div>

                {/* Fournisseur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fournisseur
                  </label>
                  <input
                    type="text"
                    value={expenseFormData.vendor}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, vendor: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ex: Magasin ABC"
                  />
                </div>

                {/* Méthode de paiement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Méthode de paiement
                  </label>
                  <select
                    value={expenseFormData.paymentMethod}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    aria-label="Sélectionner une méthode de paiement"
                    title="Sélectionner une méthode de paiement"
                  >
                    <option value="cash">Espèces</option>
                    <option value="bank_transfer">Virement bancaire</option>
                    <option value="check">Chèque</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>

                {/* Numéro de reçu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Numéro de reçu
                  </label>
                  <input
                    type="text"
                    value={expenseFormData.receiptNumber}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, receiptNumber: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ex: R-2024-001"
                  />
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveExpense}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl hover:from-red-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg"
                >
                  Créer la dépense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition d'une dépense */}
      {isExpenseEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header du modal */}
            <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Edit className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Modifier la dépense</h3>
                    <p className="text-blue-100 text-sm">Modifier les informations de la dépense</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpenseEditModalOpen(false)}
                  className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                  title="Fermer le modal"
                  aria-label="Fermer le modal"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Contenu du modal (même structure que le modal de création) */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Titre */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Titre de la dépense *
                  </label>
                  <input
                    type="text"
                    value={expenseFormData.title}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Achat de fournitures scolaires"
                    aria-label="Titre de la dépense"
                    title="Titre de la dépense"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={expenseFormData.description}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Détails de la dépense..."
                  />
                </div>

                {/* Montant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Montant (FCFA) *
                  </label>
                  <input
                    type="number"
                    value={expenseFormData.amount}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={expenseFormData.date}
                    title="Sélectionner la date de la dépense"
                    aria-label="Date de la dépense"
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={expenseFormData.category}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Sélectionner une catégorie"
                    title="Sélectionner une catégorie"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {expenseCategories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sous-catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sous-catégorie
                  </label>
                  <input
                    type="text"
                    value={expenseFormData.subcategory}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Fournitures de bureau"
                  />
                </div>

                {/* Fournisseur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fournisseur
                  </label>
                  <input
                    type="text"
                    value={expenseFormData.vendor}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, vendor: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Magasin ABC"
                  />
                </div>

                {/* Méthode de paiement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Méthode de paiement
                  </label>
                  <select
                    value={expenseFormData.paymentMethod}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Sélectionner une méthode de paiement"
                    title="Sélectionner une méthode de paiement"
                  >
                    <option value="cash">Espèces</option>
                    <option value="bank_transfer">Virement bancaire</option>
                    <option value="check">Chèque</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>

                {/* Numéro de reçu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Numéro de reçu
                  </label>
                  <input
                    type="text"
                    value={expenseFormData.receiptNumber}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, receiptNumber: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: R-2024-001"
                  />
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsExpenseEditModalOpen(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveExpense}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg"
                >
                  Modifier la dépense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={[]} onRemoveToast={() => {}} />

      {/* Modal d'impression des recettes */}
      {isRevenuePrintModalOpen && (
        <RevenuePrintModal
          isOpen={isRevenuePrintModalOpen}
          onClose={handleCloseRevenuePrintModal}
          revenues={revenues.map(revenue => ({
            ...revenue,
            description: revenue.description || ''
          }))}
          academicYear={selectedRevenueYear?.id || currentAcademicYear?.id || ''}
          viewMode={revenuePrintViewMode}
        />
      )}

      {/* Modal d'impression des dépenses */}
      {isExpensePrintModalOpen && (
        <ExpensePrintModal
          isOpen={isExpensePrintModalOpen}
          onClose={handleCloseExpensePrintModal}
          expenses={filteredExpenses}
          academicYear={currentAcademicYear?.id || ''}
          viewMode={expensePrintViewMode}
          expenseCategories={expenseCategories}
          startDate={expenseFilterStartDate}
          endDate={expenseFilterEndDate}
        />
      )}

      {/* Modal de récapitulatif des paiements de classe */}
      {isClassPaymentSummaryModalOpen && selectedClassForSummary && (
        <ClassPaymentSummaryModal
          isOpen={isClassPaymentSummaryModalOpen}
          onClose={() => setIsClassPaymentSummaryModalOpen(false)}
          classData={selectedClassForSummary}
          academicYear={currentAcademicYear?.id || ''}
        />
      )}

      {/* Modal d'ajout de recette */}
      {isAddRevenueModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header du modal */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {editingRevenue ? 'Modifier la recette' : 'Ajouter une recette'}
                  </h3>
                  <p className="text-green-100 text-sm">
                    {editingRevenue ? 'Modifiez les informations de la recette' : 'Saisissez les informations de la nouvelle recette'}
                  </p>
                </div>
                <button
                  onClick={() => setIsAddRevenueModalOpen(false)}
                  title="Fermer le modal"
                  aria-label="Fermer le modal"
                  className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Contenu du modal */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Type de recette */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Type de recette *
                  </label>
                  <select
                    value={revenueFormData.type}
                    onChange={(e) => setRevenueFormData(prev => ({ ...prev, type: e.target.value }))}
                    title="Sélectionner le type de recette"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="uniforme">Uniforme</option>
                    <option value="fournitures">Fournitures</option>
                    <option value="cantine">Cantine</option>
                    <option value="don">Don</option>
                    <option value="subvention">Subvention</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                {/* Montant */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Montant (F CFA) *
                  </label>
                  <input
                    type="number"
                    value={revenueFormData.amount}
                    onChange={(e) => setRevenueFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0"
                    title="Montant de la recette en F CFA"
                    aria-label="Montant de la recette"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={revenueFormData.description}
                    onChange={(e) => setRevenueFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description de la recette..."
                    title="Description de la recette"
                    aria-label="Description de la recette"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={revenueFormData.date}
                    onChange={(e) => setRevenueFormData(prev => ({ ...prev, date: e.target.value }))}
                    title="Date de la recette"
                    aria-label="Date de la recette"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Méthode de paiement */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Méthode de paiement
                  </label>
                  <select
                    value={revenueFormData.paymentMethod}
                    onChange={(e) => setRevenueFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    title="Sélectionner la méthode de paiement"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Espèces">Espèces</option>
                    <option value="Virement">Virement bancaire</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Chèque">Chèque</option>
                  </select>
                </div>

                {/* Champs conditionnels selon le type de recette */}
                {['uniforme', 'fournitures', 'cantine'].includes(revenueFormData.type) ? (
                  <>
                    {/* Classe - pour uniforme, fournitures, cantine */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Classe *
                      </label>
                      <select
                        value={revenueFormData.className}
                        onChange={(e) => setRevenueFormData(prev => ({ ...prev, className: e.target.value, studentName: '' }))}
                        title="Sélectionner une classe"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Sélectionner une classe</option>
                        {availableClasses.map((cls) => (
                          <option key={cls.id} value={cls.name}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Élève - pour uniforme, fournitures, cantine */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Élève *
                      </label>
                      <select
                        value={revenueFormData.studentName}
                        onChange={(e) => setRevenueFormData(prev => ({ ...prev, studentName: e.target.value }))}
                        disabled={!revenueFormData.className}
                        title="Sélectionner un élève"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Sélectionner un élève</option>
                        {filteredStudents.map((student) => (
                          <option key={student.id} value={`${student.firstName} ${student.lastName}`}>
                            {student.firstName} {student.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : ['don', 'subvention', 'autre'].includes(revenueFormData.type) ? (
                  /* Nom - pour don, subvention, autre */
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={revenueFormData.name}
                      onChange={(e) => setRevenueFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nom du donateur, subventionnaire, etc."
                      title="Nom du donateur ou subventionnaire"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                ) : null}

                {/* Référence */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Référence <span className="text-green-600 text-xs">(Générée automatiquement à la sauvegarde)</span>
                  </label>
                  <div className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-mono text-sm">
                    {revenueFormData.reference || 'La référence sera générée lors de la sauvegarde'}
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setIsAddRevenueModalOpen(false)}
                  className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveRevenue}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg"
                >
                  {editingRevenue ? 'Modifier' : 'Ajouter'} la recette
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de rejet de dépense */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header du modal */}
            <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 p-6 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Rejeter la dépense</h3>
                  <p className="text-red-100 text-sm">Confirmer le rejet de cette dépense</p>
                </div>
              </div>
            </div>

            {/* Contenu du modal */}
            <div className="p-6">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {expenseToReject?.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Montant: {expenseToReject?.amount?.toLocaleString()} FCFA
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Raison du rejet (optionnel)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Expliquez pourquoi cette dépense est rejetée..."
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsRejectModalOpen(false);
                    setExpenseToReject(null);
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmRejectExpense}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Rejeter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {isDeleteConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header du modal */}
            <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 p-6 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Confirmer la suppression</h3>
                  <p className="text-red-100 text-sm">Cette action est irréversible</p>
                </div>
              </div>
            </div>

            {/* Contenu du modal */}
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {deletingExpenseId ? 'Supprimer cette dépense ?' : 'Supprimer cette recette ?'}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Êtes-vous sûr de vouloir supprimer {deletingExpenseId ? 'cette dépense' : 'cette recette'} ? Cette action ne peut pas être annulée.
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (deletingExpenseId) {
                      setDeletingExpenseId(null);
                    } else {
                    setDeletingRevenueId(null);
                    }
                    setIsDeleteConfirmModalOpen(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={deletingExpenseId ? confirmDeleteExpense : confirmDeleteRevenue}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isFeeConfigurationModalOpen && (
        <FeeConfigurationModal
          isOpen={isFeeConfigurationModalOpen}
          onClose={() => {
            setIsFeeConfigurationModalOpen(false);
            setSelectedFeeConfiguration(null);
            setIsEditMode(false);
          }}
          onSave={handleSaveFeeConfiguration}
          isEditMode={isEditMode}
          selectedConfiguration={selectedFeeConfiguration}
        />
      )}

      {isFeeConfigurationViewModalOpen && (
        <FeeConfigurationViewModal
          isOpen={isFeeConfigurationViewModalOpen}
          onClose={() => {
            setIsFeeConfigurationViewModalOpen(false);
            setSelectedFeeConfiguration(null);
          }}
          configuration={selectedFeeConfiguration}
        />
      )}

      {isConfirmationModalOpen && confirmationData && (
        <ConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={() => {
            setIsConfirmationModalOpen(false);
            setConfirmationData(null);
            setIsActionLoading(false);
          }}
          onConfirm={confirmationData.action}
          type={confirmationData.type}
          title={confirmationData.title || "Confirmer l'action"}
          message={confirmationData.message || "Êtes-vous sûr de vouloir continuer ?"}
          itemName={confirmationData.itemName}
          details={confirmationData.details}
          warningMessage={confirmationData.warningMessage}
          confirmButtonText={confirmationData.confirmButtonText}
          cancelButtonText={confirmationData.cancelButtonText}
          isLoading={isActionLoading}
        />
      )}

      {/* Modal de clôture journalière */}
      {isDailyClosureModalOpen && (
        <DailyClosureModal
          isOpen={isDailyClosureModalOpen}
          onClose={handleCloseDailyClosureModal}
          onSave={handleSaveDailyClosure}
          closure={selectedDailyClosure}
          isEditMode={isEditClosureMode}
          isLoading={isActionLoading}
        />
      )}
    </div>
  );
};

export default Finance;