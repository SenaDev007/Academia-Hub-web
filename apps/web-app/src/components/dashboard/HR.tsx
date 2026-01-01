import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Users,
  Award,
  Eye,
  Edit,
  BarChart3,
  Target,
  CheckCircle,
  Building,
  UserPlus,
  FileSpreadsheet,
  Presentation,
  PieChart,
  Shield,
  Trash2,
  RefreshCw,
  RotateCcw,
  ArrowUpRight,
  XCircle,
  AlertCircle,
  Info,
  Settings,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  GraduationCap,
  Briefcase,
  Building2,
  BookOpen,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2,
  Plus,
  FileText,
  DollarSign,
  FileCheck
} from 'lucide-react';
import { 
  TeacherModal, 
  EvaluationModal, 
  TrainingModal, 
  ContractModal, 
  ConfirmModal,
  DeleteConfirmModal
} from '../modals';
import { Personnel, Contract, Training, Evaluation } from '../../services/hrService';

interface ContractFormData {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  contractType: string;
  startDate: string;
  endDate: string;
  salary: number;
  workingHours: number;
  maxWorkingHours: number;
  hourlyRate: number;
  probationPeriod: string;
  benefits: string;
  specialClauses: string;
  renewalDate: string;
  signatureDate: string;
  bankDetails: string;
  mobileMoneyType: string;
  mobileMoneyNumber: string;
  identityDocumentType: string;
  identityDocumentNumber: string;
  ifuNumber: string;
  notes: string;
  // Nouvelles conditions de travail
  workSchedule: string;
  workLocation: string;
  remoteWork: boolean;
  overtimePolicy: string;
  leavePolicy: string;
  noticePeriod: string;
  confidentialityClause: boolean;
  nonCompeteClause: boolean;
  trainingRequirements: string;
  performanceExpectations: string;
}
import { useHRData } from '../../hooks/useHRData';
import { hrTabs } from '../../config/hrTabs';
import PayrollPreview from './PayrollPreview';
import { useNavigate } from 'react-router-dom'; // Added useNavigate import

// Composant Toast simple
const Toast: React.FC<{
  isVisible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}> = ({ isVisible, message, type, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const icon = type === 'success' ? <CheckCircle className="w-5 h-5" /> : type === 'error' ? <XCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center space-x-2 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out`}>
      {icon}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded-full p-1" title="Fermer">
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  );
};

const HR: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);
  
  
  // Hook RH pour les vraies données
  const {
    teachers,
    contracts,
    evaluations,
    trainings,
    stats,
    loading,
    error,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    refreshData,
    createContract,
    updateContract,
    deleteContract
  } = useHRData();
  

  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  
  const [selectedItem, setSelectedItem] = useState<Personnel | Contract | Training | Evaluation | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; name: string; id: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  


  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');


  // Hook de navigation inter-modules
  const navigate = useNavigate(); // Initialize useNavigate

  // Données par défaut pour les postes (même structure que dans TeacherModal)
  const defaultPositions = [
    // 1. Département Pédagogique (Maternelle & Primaire)
    { id: 'POS-001', name: 'Enseignant(e) Maternelle', department: 'Département Pédagogique (Maternelle & Primaire)' },
    { id: 'POS-002', name: 'Enseignant(e) Primaire', department: 'Département Pédagogique (Maternelle & Primaire)' },
    
    // 2. Département Pédagogique (Collège & Lycée)
    { id: 'POS-003', name: 'Professeur', department: 'Département Pédagogique (Collège & Lycée)' },
    
    // 3. Département Administratif (M&P)
    { id: 'POS-004', name: 'Directeur(trice) M&P', department: 'Département Administratif (M&P)' },
    { id: 'POS-005', name: 'Secrétaire', department: 'Département Administratif (M&P)' },
    { id: 'POS-006', name: 'Comptable', department: 'Département Administratif (M&P)' },
    { id: 'POS-007', name: 'Secrétaire-Comptable', department: 'Département Administratif (M&P)' },
    
    // 4. Département Administratif (C&L)
    { id: 'POS-008', name: 'Directeur(trice)', department: 'Département Administratif (C&L)' },
    { id: 'POS-009', name: 'Secrétaire', department: 'Département Administratif (C&L)' },
    { id: 'POS-010', name: 'Comptable', department: 'Département Administratif (C&L)' },
    { id: 'POS-011', name: 'Secrétaire-Comptable', department: 'Département Administratif (C&L)' },
    { id: 'POS-012', name: 'Censeur', department: 'Département Administratif (C&L)' },
    { id: 'POS-013', name: 'Surveillant(e)', department: 'Département Administratif (C&L)' },
    
    // 5. Département Technique
    { id: 'POS-014', name: 'Technicien informatique', department: 'Département Technique' },
    
    // 6. Département Hygiène & Sécurité
    { id: 'POS-015', name: 'Agent de sécurité', department: 'Département Hygiène & Sécurité' },
    { id: 'POS-016', name: 'Agent d\'entretien', department: 'Département Hygiène & Sécurité' }
  ];

  // Fonction pour mapper l'ID du poste vers le nom
  const getPositionName = (positionId: string): string => {
    const position = defaultPositions.find(pos => pos.id === positionId);
    return position ? position.name : positionId;
  };

  // Fonction pour mapper l'ID du département vers le nom
  const getDepartmentName = (departmentId: string): string => {
    const departments = [
      { id: 'Département Pédagogique (Maternelle & Primaire)', name: 'Département Pédagogique (Maternelle & Primaire)' },
      { id: 'Département Pédagogique (Collège & Lycée)', name: 'Département Pédagogique (Collège & Lycée)' },
      { id: 'Département Administratif (M&P)', name: 'Département Administratif (M&P)' },
      { id: 'Département Administratif (C&L)', name: 'Département Administratif (C&L)' },
      { id: 'Département Technique', name: 'Département Technique' },
      { id: 'Département Hygiène & Sécurité', name: 'Département Hygiène & Sécurité' }
    ];
    const department = departments.find(dept => dept.id === departmentId);
    return department ? department.name : departmentId;
  };


  // États pour la recherche et le filtrage
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
  // États pour la hiérarchisation par département
  const [expandedDepartments, setExpandedDepartments] = useState<{ [key: string]: boolean }>({});

  // Fonctions pour gérer l'expansion des départements
  const toggleDepartment = (department: string) => {
    setExpandedDepartments(prev => ({
      ...prev,
      [department]: !prev[department]
    }));
  };

  const expandAllDepartments = () => {
    const departments = Array.from(new Set(filteredPersonnel.map(person => person.department || 'Non défini')));
    const expanded: { [key: string]: boolean } = {};
    departments.forEach(dept => {
      expanded[dept] = true;
    });
    setExpandedDepartments(expanded);
  };

  const collapseAllDepartments = () => {
    setExpandedDepartments({});
  };




  // Fonction de gestion du changement d'onglet avec navigation externe
  const handleTabChange = (tabId: string) => {
    if (tabId === 'payroll') {
      // Navigation vers le module Finance avec activation de l'onglet payroll
      navigate('/dashboard/finance?tab=payroll');
      return; // Ne pas changer l'onglet actif
    }
    setActiveTab(tabId);
  };

  // Fonctions de navigation pour les onglets
  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 200;
      const currentScroll = tabsContainerRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      tabsContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  // Vérifier si on peut faire défiler
  const checkScrollButtons = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Effet pour vérifier les boutons de défilement
  React.useEffect(() => {
    checkScrollButtons();
    const container = tabsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

  // Effet pour recalculer les boutons lors du redimensionnement
  React.useEffect(() => {
    const handleResize = () => {
      setTimeout(checkScrollButtons, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Utiliser les vraies données des enseignants
  
  
  // Transformation des données pour l'affichage
  type UIEmployee = {
    id: string;
    matricule: string;
    name: string;
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    nationality: string;
    photo: string | null;
    phone: string;
    email: string;
    address: string;
    emergencyContact: string;
    department: string;
    departmentId: string;
    departmentName: string;
    position: string;
    positionCategory?: string;
    subject?: string;
    hireDate: string;
    experienceYears: number;
    qualifications: string;
    description: string;
    status: string;
    performance: number;
    lastEvaluation: string;
  };

  const personnel: UIEmployee[] = Array.isArray(teachers) ? teachers.map(teacher => {
    // Debug: Afficher les données brutes de l'enseignant (commenté pour les performances)
    // console.log('🔍 Données brutes de l\'enseignant:', {
    //   id: teacher.id,
    //   firstName: teacher.firstName,
    //   lastName: teacher.lastName,
    //   departmentId: teacher.departmentId,
    //   departmentName: teacher.departmentName,
    //   positionId: teacher.positionId,
    //   positionName: teacher.positionName
    // });
    
    const transformed = {
    id: teacher.id,
      matricule: teacher.matricule || 'Non défini',
      
      // Informations personnelles
      name: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Nom manquant',
      firstName: teacher.firstName || 'Prénom manquant',
      lastName: teacher.lastName || 'Nom manquant',
      gender: teacher.gender || 'Non défini',
      dateOfBirth: teacher.dateOfBirth || 'Date non définie',
      nationality: teacher.nationality || 'Nationalité non définie',
      photo: teacher.photo || null,
      
      // Contact
      phone: teacher.phone || 'Téléphone manquant',
      email: teacher.email || 'Email manquant',
      address: teacher.address || 'Adresse manquante',
      emergencyContact: teacher.emergencyContact || 'Contact manquant',
      
    // Professionnel
    department: teacher.departmentName || teacher.departmentId || 'Non assigné',
    departmentId: teacher.departmentId || 'Non assigné',
    departmentName: teacher.departmentName || teacher.departmentId || 'Non assigné',
    position: teacher.positionName || teacher.positionId || 'Non assigné',
    positionId: teacher.positionId || 'Non assigné',
      positionCategory: (teacher as unknown as { positionCategory?: string }).positionCategory || 'Non définie',
      subject: teacher.subjectName || teacher.subjectId || 'Non assigné',
      hireDate: teacher.hireDate || 'Date non définie',
      
      // Professionnel
      experienceYears: teacher.experienceYears || 0,
      qualifications: teacher.qualifications || 'Non défini',
      description: teacher.description || 'Aucune description',
      
      // Champs calculés
      status: 'active', // Tous les enseignants sont considérés comme actifs
      performance: 4.5, // TODO: Calculer depuis les évaluations
      lastEvaluation: '2024-01-15' // TODO: Récupérer depuis les évaluations
    };
    
    
    return transformed;
  }) : [];

  const employeeOptions = Array.isArray(personnel) ? personnel.map(p => ({
    id: p.id,
    matricule: p.matricule,
    firstName: p.firstName,
    lastName: p.lastName,
    gender: p.gender,
    dateOfBirth: p.dateOfBirth,
    nationality: p.nationality,
    address: p.address,
    phone: p.phone,
    email: p.email,
    departmentId: '',
    departmentName: p.department,
    positionId: '',
    positionName: p.position,
    subjectId: '',
    subjectName: p.subject,
    hireDate: p.hireDate,
    salary: 0,
    status: p.status,
    photo: p.photo,
    description: p.description,
    performance: p.performance,
    qualifications: '',
    experienceYears: 0,
    emergencyContact: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schoolId: 'default-school-id'
  } as Personnel)) : [];
  
  

  // Utiliser les vraies données des contrats
  const contractsData: Contract[] = Array.isArray(contracts) ? contracts.map(contract => ({
    id: contract.id,
    employeeId: contract.employeeId,
    employeeName: contract.employeeName,
    position: contract.position,
    
    // === INFORMATIONS DE BASE DU CONTRAT ===
    contractType: contract.contractType,
    contractDuration: contract.contractDuration,
    workTimeType: contract.workTimeType,
    startDate: contract.startDate,
    endDate: contract.endDate,
    
    // === RÉMUNÉRATION ===
    salaryType: contract.salaryType,
    baseSalary: contract.baseSalary,
    hourlyRate: contract.hourlyRate,
    workingHours: contract.workingHours,
    maxWorkingHours: contract.maxWorkingHours,
    
    // === AVANTAGES CONTRACTUELS ===
    housingAllowance: contract.housingAllowance,
    transportAllowance: contract.transportAllowance,
    fixedBonuses: contract.fixedBonuses,
    benefits: contract.benefits,
    
    // === DÉCLARATIONS SOCIALES ===
    cnssDeclaration: contract.cnssDeclaration,
    irppDeclaration: contract.irppDeclaration,
    otherDeductions: contract.otherDeductions,
    
    // === INFORMATIONS CONTRACTUELLES ===
    probationPeriod: contract.probationPeriod,
    noticePeriod: contract.noticePeriod,
    renewalDate: contract.renewalDate,
    signatureDate: contract.signatureDate,
    status: contract.status || 'active',
    specialClauses: contract.specialClauses,
    
    // === INFORMATIONS BANCAIRES ===
    bankDetails: contract.bankDetails,
    mobileMoneyType: contract.mobileMoneyType,
    mobileMoneyNumber: contract.mobileMoneyNumber,
    
    // === DOCUMENTS D'IDENTITÉ ===
    identityDocumentType: contract.identityDocumentType,
    identityDocumentNumber: contract.identityDocumentNumber,
    ifuNumber: contract.ifuNumber,
    uploadedDocuments: contract.uploadedDocuments,
    
    // === CONDITIONS DE TRAVAIL ===
    workSchedule: contract.workSchedule,
    workLocation: contract.workLocation,
    remoteWork: contract.remoteWork,
    overtimePolicy: contract.overtimePolicy,
    leavePolicy: contract.leavePolicy,
    confidentialityClause: contract.confidentialityClause,
    nonCompeteClause: contract.nonCompeteClause,
    trainingRequirements: contract.trainingRequirements,
    performanceExpectations: contract.performanceExpectations,
    
    // === MÉTADONNÉES ===
    createdAt: contract.createdAt,
    updatedAt: contract.updatedAt,
    schoolId: contract.schoolId,
    
    // === NOTES ===
    notes: contract.notes || ''
  })) : [];

  // Utiliser les vraies données des formations
  const trainingsData = Array.isArray(trainings) ? trainings.map(training => ({
    id: training.id,
    title: training.title,
    category: training.category,
    instructor: training.instructor,
    startDate: training.startDate,
    endDate: training.endDate,
    duration: training.duration,
    participants: training.participants,
    cost: training.cost
  })) : [];

  // Utiliser les vraies données des évaluations
  const evaluationsData = Array.isArray(evaluations) ? evaluations.map(evaluation => ({
    id: evaluation.id,
    employeeName: evaluation.employeeName,
    position: evaluation.position,
    evaluationDate: evaluation.evaluationDate,
    evaluator: evaluation.evaluator,
    overallScore: evaluation.overallScore,
    criteria: evaluation.criteria,
    objectives: evaluation.objectives,
    nextEvaluation: evaluation.nextEvaluation
  })) : [];


  const getContractColor = (contractType: string) => {
    switch (contractType) {
      case 'CDI': return 'bg-green-100 text-green-800';
      case 'CDD': return 'bg-blue-100 text-blue-800';
      case 'Stage': return 'bg-purple-100 text-purple-800';
      case 'Freelance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 4.0) return 'text-blue-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Handlers pour les modals
  const handleNewTeacher = () => {
    setIsEditMode(false);
    setIsViewMode(false);
    setSelectedItem(null);
    setIsTeacherModalOpen(true);
  };

  const handleEditTeacher = (teacher: Personnel) => {
    console.log('Editing teacher (données transformées):', teacher);
    
    // Trouver les données brutes correspondantes dans teachers
    const rawTeacher = teachers.find(t => t.id === teacher.id);
    // console.log('Données brutes trouvées:', rawTeacher);
    
    // Créer une nouvelle référence pour forcer la re-initialisation du modal
    const teacherDataForEdit = rawTeacher ? { ...rawTeacher } : { ...teacher };
    console.log('Données pour édition (nouvelle référence):', teacherDataForEdit);
    
    setIsEditMode(true);
    setIsViewMode(false);
    setSelectedItem(teacherDataForEdit);
    setIsTeacherModalOpen(true);
  };

  const handleDeleteTeacher = (teacher: Personnel) => {
    setSelectedItem(teacher);
    setIsConfirmModalOpen(true);
  };

  const handleViewTeacher = (teacher: Personnel) => {
    console.log('Viewing teacher (données transformées):', teacher);
    
    // Trouver les données brutes correspondantes dans teachers
    const rawTeacher = teachers.find(t => t.id === teacher.id);
    // console.log('Données brutes trouvées pour visualisation:', rawTeacher);
    
    setSelectedItem(rawTeacher || teacher); // Utiliser les données brutes si disponibles
    setIsViewMode(true);
    setIsEditMode(false);
    setIsTeacherModalOpen(true);
  };

  const handleNewEvaluation = () => {
    setIsEditMode(false);
    setSelectedItem(null);
    setIsEvaluationModalOpen(true);
  };

  const handleNewTraining = () => {
    setIsEditMode(false);
    setSelectedItem(null);
    setIsTrainingModalOpen(true);
  };

  const handleNewContract = () => {
    console.log('=== Nouveau contrat ===');
    setIsEditMode(false);
    setIsViewMode(false);
    setSelectedItem(null);
    setIsContractModalOpen(true);
  };

  const handleEditContract = (contract: Contract) => {
    console.log('=== Édition contrat ===');
    console.log('Contrat sélectionné:', contract);
    setIsEditMode(true);
    setIsViewMode(false);
    setSelectedItem(contract);
    setIsContractModalOpen(true);
  };

  const handleViewContract = (contract: Contract) => {
    console.log('=== Consultation contrat ===');
    console.log('Contrat sélectionné:', contract);
    setIsEditMode(false);
    setIsViewMode(true);
    setSelectedItem(contract);
    setIsContractModalOpen(true);
  };

  const handleDeleteContract = (contract: Contract) => {
    setItemToDelete({
      type: 'contrat',
      name: contract.employeeName,
      id: contract.id
    });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteContract(itemToDelete.id);
      setToastMessage(`Le contrat de ${itemToDelete.name} a été supprimé avec succès.`);
      setToastType('success');
      setShowToast(true);
      refreshData(); // Rafraîchir les données
    } catch (error) {
      console.error('Erreur lors de la suppression du contrat:', error);
      setToastMessage('Erreur lors de la suppression du contrat.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    setIsDeleting(false);
  };

  const handleSaveTeacher = async (teacherData: Personnel) => {
    console.log('=== DEBUG handleSaveTeacher ===');
    console.log('isEditMode:', isEditMode);
    console.log('selectedItem:', selectedItem);
    console.log('teacherData reçu:', teacherData);
    console.log('positionId dans teacherData:', teacherData.positionId);
    console.log('departmentId dans teacherData:', teacherData.departmentId);
    
    try {
      if (isEditMode) {
        console.log('Mode édition - appel updateTeacher');
        await updateTeacher((selectedItem as Personnel)?.id || '', teacherData);
        setToastMessage(`Les informations de ${teacherData.firstName} ${teacherData.lastName} ont été mises à jour avec succès.`);
        setToastType('success');
        setShowToast(true);
      } else {
        console.log('Mode création - appel createTeacher');
        await createTeacher(teacherData);
        setToastMessage(`${teacherData.firstName} ${teacherData.lastName} a été ajouté(e) avec succès.`);
        setToastType('success');
        setShowToast(true);
      }
      

      setIsTeacherModalOpen(false);
      
      // Rafraîchir les données
      refreshData();
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setToastMessage('Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleSaveEvaluation = (evaluationData: Evaluation) => {
    console.log('Saving evaluation:', evaluationData);
    setToastMessage(isEditMode ? `L'évaluation de ${evaluationData.employeeName} a été mise à jour avec succès.` : `L'évaluation de ${evaluationData.employeeName} a été ajoutée avec succès.`);
    setToastType('success');
    setShowToast(true);
  };

  const handleSaveTraining = (trainingData: Training) => {
    console.log('Saving training:', trainingData);
    setToastMessage(isEditMode ? `La formation "${trainingData.title}" a été mise à jour avec succès.` : `La formation "${trainingData.title}" a été ajoutée avec succès.`);
    setToastType('success');
    setShowToast(true);
  };

  // Interface étendue pour ContractFormData avec tous les champs nécessaires
  interface ExtendedContractFormData {
    id: string;
    employeeId: string;
    employeeName: string;
    position: string;
    contractType: 'permanent' | 'vacataire';
    contractDuration?: 'CDI' | 'CDD' | 'mission-ponctuelle';
    workTimeType?: 'plein-temps' | 'temps-partiel';
    startDate: string;
    endDate: string;
    salaryType?: 'fixe' | 'horaire';
    salary?: number;
    baseSalary?: number;
    hourlyRate?: number;
    workingHours?: number;
    maxWorkingHours?: number;
    housingAllowance?: number;
    transportAllowance?: number;
    fixedBonuses?: number;
    benefits?: string;
    cnssDeclaration?: boolean;
    irppDeclaration?: boolean;
    otherDeductions?: string;
    probationPeriod?: string;
    noticePeriod?: string;
    renewalDate?: string;
    signatureDate?: string;
    specialClauses?: string;
    bankDetails?: string;
    mobileMoneyType?: string;
    mobileMoneyNumber?: string;
    identityDocumentType?: string;
    identityDocumentNumber?: string;
    ifuNumber?: string;
    uploadedDocuments?: string[];
    workSchedule?: string;
    workLocation?: string;
    remoteWork?: boolean;
    overtimePolicy?: string;
    leavePolicy?: string;
    confidentialityClause?: boolean;
    nonCompeteClause?: boolean;
    trainingRequirements?: string;
    performanceExpectations?: string;
    notes?: string;
  }

  // Fonction pour convertir ContractFormData en Contract
  const transformContractFormDataToContract = (formData: ExtendedContractFormData): Omit<Contract, 'id' | 'createdAt' | 'updatedAt'> => {
    return {
      employeeId: formData.employeeId,
      employeeName: formData.employeeName,
      position: formData.position,
      contractType: formData.contractType as 'permanent' | 'vacataire',
      contractDuration: formData.contractDuration || 'CDI',
      workTimeType: formData.workTimeType || 'plein-temps',
      startDate: formData.startDate,
      endDate: formData.endDate,
      salaryType: formData.salaryType || 'fixe',
      baseSalary: formData.baseSalary || 0,
      hourlyRate: formData.hourlyRate || 0,
      workingHours: formData.workingHours || 40,
      maxWorkingHours: formData.maxWorkingHours || 48,
      housingAllowance: formData.housingAllowance || 0,
      transportAllowance: formData.transportAllowance || 0,
      fixedBonuses: formData.fixedBonuses || 0,
      benefits: formData.benefits || '',
      cnssDeclaration: formData.cnssDeclaration || true,
      irppDeclaration: formData.irppDeclaration || true,
      otherDeductions: formData.otherDeductions || '',
      probationPeriod: formData.probationPeriod || '3 mois',
      noticePeriod: formData.noticePeriod || '1 mois',
      renewalDate: formData.renewalDate || '',
      signatureDate: formData.signatureDate || new Date().toISOString().split('T')[0],
      status: 'active' as const,
      specialClauses: formData.specialClauses || '',
      bankDetails: formData.bankDetails || '',
      mobileMoneyType: formData.mobileMoneyType || 'MTN',
      mobileMoneyNumber: formData.mobileMoneyNumber || '',
      identityDocumentType: formData.identityDocumentType || '',
      identityDocumentNumber: formData.identityDocumentNumber || '',
      ifuNumber: formData.ifuNumber || '',
      uploadedDocuments: formData.uploadedDocuments || [],
      workSchedule: formData.workSchedule || '8h-17h',
      workLocation: formData.workLocation || '',
      remoteWork: formData.remoteWork || false,
      overtimePolicy: formData.overtimePolicy || 'standard',
      leavePolicy: formData.leavePolicy || 'standard-25',
      confidentialityClause: formData.confidentialityClause || true,
      nonCompeteClause: formData.nonCompeteClause || false,
      trainingRequirements: formData.trainingRequirements || 'formation-initiale',
      performanceExpectations: formData.performanceExpectations || 'standard',
      schoolId: 'school-1', // TODO: Utiliser le schoolId de l'utilisateur connecté
      notes: formData.notes || ''
    };
  };

  const handleSaveContract = async (contractFormData: ContractFormData) => {
    console.log('=== DEBUG handleSaveContract ===');
    console.log('isEditMode:', isEditMode);
    console.log('selectedItem:', selectedItem);
    console.log('contractFormData reçu:', contractFormData);
    
    try {
      const contractData = transformContractFormDataToContract(contractFormData as ExtendedContractFormData);
      
      if (isEditMode) {
        console.log('Mode édition - appel updateContract');
        await updateContract((selectedItem as Contract)?.id || '', contractData);
      } else {
        console.log('Mode création - appel createContract');
        await createContract(contractData);
      }
      
      // Rafraîchir les données pour afficher le nouveau contrat puis basculer vers l'onglet contrats
      await refreshData();
      setActiveTab('contracts');

      setToastMessage(isEditMode ? `Le contrat de ${contractFormData.employeeName} a été mis à jour avec succès.` : `Le contrat de ${contractFormData.employeeName} a été ajouté avec succès.`);
    setToastType('success');
    setShowToast(true);
      
      // Fermer le modal
      setIsContractModalOpen(false);
      setSelectedItem(null);
      setIsEditMode(false);
      setIsViewMode(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du contrat:', error);
      setToastMessage('Erreur lors de la sauvegarde du contrat');
      setToastType('error');
      setShowToast(true);
    }
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    
    try {
      console.log('Deleting teacher:', selectedItem);
      await deleteTeacher(selectedItem.id);
      
      setToastMessage(`${(selectedItem as Personnel)?.firstName} ${(selectedItem as Personnel)?.lastName} a été supprimé(e) avec succès.`);
      setToastType('success');
      setShowToast(true);
      
    setIsConfirmModalOpen(false);
      setSelectedItem(null);
      
      // Rafraîchir les données
      refreshData();
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setToastMessage('Une erreur est survenue lors de la suppression. Veuillez réessayer.');
      setToastType('error');
      setShowToast(true);
    }
  };

  // Fonction de filtrage du personnel
  const filteredPersonnel = personnel.filter(person => {
    const matchesSearch = searchTerm === '' || 
      person.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === '' || person.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });





  // Fonction de gestion de la navigation vers la paie
  const handlePayrollNavigation = () => {
    // Navigation vers le module Finance avec activation de l'onglet payroll
    navigate('/dashboard/finance?tab=payroll');
  };



  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
  };

  // Calcul des statistiques par type de personnel
  const pedagogicalPersonnel = personnel.filter(p => 
    p.departmentId === 'DEPT-001' ||
    p.departmentName?.includes('Pédagogique') || 
    p.departmentName?.includes('pédagogique') ||
    p.departmentName?.includes('Maternelle') ||
    p.departmentName?.includes('Primaire')
  );

  const administrativePersonnel = personnel.filter(p => 
    p.departmentId === 'DEPT-003' ||
    p.departmentName?.includes('Administratif') || 
    p.departmentName?.includes('administratif')
  );

    // Debug des statistiques (commenté pour les performances)
    // console.log('📊 Debug statistiques:');
    // console.log('📊 Total personnel:', personnel.length);
    // console.log('📊 Personnel pédagogique:', pedagogicalPersonnel.length);
    // console.log('📊 Personnel administratif:', administrativePersonnel.length);


  // Gestion des erreurs
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center">
            <Shield className="w-12 h-12 text-red-500 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Erreur lors du chargement des données RH
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">{error}</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={refreshData}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              title="Actualiser les données"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              title="Recharger la page"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Actualiser
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section Moderne */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl shadow-2xl">
        {/* Pattern de fond */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative z-10 p-8">
          {/* Section principale */}
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
            
            {/* Informations principales */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Ressources Humaines</h1>
                  <p className="text-blue-200 text-lg">Gestion complète du personnel et développement RH</p>
                </div>
              </div>
            </div>
            
            {/* Contrôles et actions */}
            <div className="flex flex-col space-y-4 min-w-[320px]">
              
              {/* Actions principales */}
              <div className="flex justify-center">
              <button 
                onClick={refreshData}
                  className="group flex items-center justify-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                  title="Actualiser les données"
              >
                  <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-sm font-medium">Actualiser</span>
              </button>
        </div>
              
        </div>
          </div>
      </div>

        {/* Éléments décoratifs */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-pink-500/20 rounded-full blur-xl"></div>
      </div>


      {/* Tabs Header Moderne */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Barre de statut */}
        {loading && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-blue-700 dark:text-blue-300 font-medium">Chargement des données RH...</span>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 px-6 py-4 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300 font-medium">Erreur: {error}</span>
                <button 
                  onClick={refreshData}
                  className="ml-4 px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors text-sm font-medium"
                  title="Réessayer"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation des onglets moderne */}
        <div className="relative">
          {/* Fond dégradé pour l'en-tête */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10"></div>
          
          {/* Barre de navigation */}
          <nav className="relative px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Gestion RH</h2>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Module de ressources humaines</p>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">En ligne</span>
                  </div>
                </div>
              </div>
              </div>
              
            </div>


            {/* Onglets avec design moderne */}
            <div className="relative">
              {/* Flèches de navigation */}
              {canScrollLeft && (
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-800 to-transparent z-10 flex items-center">
          <button 
                    onClick={() => scrollTabs('left')}
                    className="p-1 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Faire défiler vers la gauche"
                  >
                    <ArrowUpRight className="w-4 h-4 text-gray-600 dark:text-gray-400 rotate-180" />
                  </button>
                </div>
              )}
              {canScrollRight && (
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-800 to-transparent z-10 flex items-center justify-end">
                  <button 
                    onClick={() => scrollTabs('right')}
                    className="p-1 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Faire défiler vers la droite"
                  >
                    <ArrowUpRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              )}
              
              <div 
                ref={tabsContainerRef}
                className="flex space-x-1 overflow-x-auto pb-2 px-10" 
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none'
                }}
              >
              {hrTabs.map((tab) => {
                // Obtenir le compteur approprié pour chaque onglet
                const getTabCount = (tabId: string) => {
                  switch (tabId) {
                    case 'overview': return null;
                    case 'personnel': return personnel.length;
                    case 'contracts': return contractsData.length;
                    case 'paystates': return 0;
                    case 'training': return trainingsData.length;
                    case 'vacatairesState': return 0;
                    case 'evaluations': return evaluationsData.length;
                    case 'leaves': return 0;
                    case 'reports': return 0;
                    case 'payroll': return null;
                    case 'analytics': return null;
                    default: return null;
                  }
                };
                
                const tabCount = getTabCount(tab.id);
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    title={`Ouvrir l'onglet ${tab.label}`}
                    className={`group relative flex items-center px-6 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md'
                    }`}
                  >
                    {/* Indicateur de sélection */}
                    {isActive && (
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
                    )}
                    
                    {/* Icône avec animation */}
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20 backdrop-blur-sm' 
                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                    }`}>
                      <Icon className={`w-4 h-4 transition-all duration-300 ${
                        isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                      }`} />
                    </div>
                    
                    {/* Label */}
                    <span className="mr-2 font-semibold">{tab.label}</span>
                    
                    {/* Indicateur externe */}
                    {tab.isExternal && (
                      <span className="text-xs opacity-75">→ Finance</span>
                    )}
                    
                    {/* Compteur avec animation */}
                    {tabCount !== null && (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                        isActive
                          ? 'bg-white/20 text-white backdrop-blur-sm'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 group-hover:bg-gray-300 dark:group-hover:bg-gray-500'
                      }`}>
                        {tabCount}
                      </span>
                    )}
                    
                    {/* Effet de survol */}
                    <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 opacity-0 group-hover:opacity-100'
                    }`} style={{ zIndex: -1 }}></div>
                  </button>
                );
              })}
              </div>
            </div>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Header Section Vue d'ensemble */}
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 rounded-3xl p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-600/20 to-gray-600/20"></div>
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-6 lg:mb-0">
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-gray-500 rounded-2xl flex items-center justify-center shadow-lg mr-4">
                          <BarChart3 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold mb-2">Vue d'ensemble RH</h3>
                          <p className="text-slate-200 text-lg">
                            Tableau de bord et statistiques générales
                          </p>
                        </div>
                      </div>
                    </div>
          </div>
        </div>
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-slate-400/20 to-gray-400/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-gray-400/20 to-slate-400/20 rounded-full blur-xl"></div>
      </div>

              {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Skeleton loading pour les statistiques
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>
            </div>
          ))
        ) : error ? (
          // Affichage d'erreur
          <div className="col-span-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Erreur de chargement</h3>
                <p className="text-red-600 dark:text-red-300">{error}</p>
                <button 
                  onClick={refreshData}
                  className="mt-2 inline-flex items-center px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                  title="Réessayer"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        ) : (
                  <>
                    {/* Total Personnel */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Personnel</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{personnel.length}</p>
                  <div className="flex items-center mt-2">
                            <Users className="w-4 h-4 text-blue-500 dark:text-blue-400 mr-1" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Employés actifs
                    </span>
                  </div>
                </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                          <Users className="w-6 h-6 text-white" />
                </div>
                      </div>
                    </div>

                    {/* Contrats actifs */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contrats Actifs</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{contractsData.length}</p>
                          <div className="flex items-center mt-2">
                            <FileSpreadsheet className="w-4 h-4 text-green-500 dark:text-green-400 mr-1" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              En cours
                            </span>
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
                          <FileSpreadsheet className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Formations en cours */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Formations</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{trainingsData.length}</p>
                          <div className="flex items-center mt-2">
                            <Presentation className="w-4 h-4 text-purple-500 dark:text-purple-400 mr-1" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Programmes
                            </span>
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600">
                          <Presentation className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Évaluations */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Évaluations</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{evaluationsData.length}</p>
                          <div className="flex items-center mt-2">
                            <Award className="w-4 h-4 text-orange-500 dark:text-orange-400 mr-1" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Réalisées
                            </span>
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Graphiques et analyses */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Répartition par département */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Répartition par Département</h3>
                  <div className="space-y-4">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="flex items-center justify-between mb-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      ))
                    ) : (
                      Array.from(new Set(personnel.map(p => p.department))).map(dept => {
                        const count = personnel.filter(p => p.department === dept).length;
                        const percentage = personnel.length > 0 ? Math.round((count / personnel.length) * 100) : 0;
                        return (
                          <div key={dept} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{dept}</span>
                              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{count}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
              </div>
            </div>
          );
          })
        )}
                  </div>
      </div>

                {/* Performance moyenne */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Performance Moyenne</h3>
                  <div className="text-center">
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
            </div>
                    ) : (
                      <>
                        <div className="relative w-32 h-32 mx-auto mb-4">
                          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              className="text-gray-200 dark:text-gray-700"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${(personnel.reduce((acc, p) => acc + p.performance, 0) / personnel.length) * 25.13} 251.3`}
                              className="text-green-500 dark:text-green-400"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              {personnel.length > 0 ? Math.round(personnel.reduce((acc, p) => acc + p.performance, 0) / personnel.length * 10) / 10 : 0}
                            </span>
          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">sur 5.0</p>
                      </>
        )}
            </div>
          </div>
              </div>

              {/* Actions rapides */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Actions Rapides</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                    onClick={handleNewTeacher}
                    className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-900/40 transition-all duration-200 border border-blue-200 dark:border-blue-700"
                    title="Ajouter un nouveau personnel"
                  >
                    <UserPlus className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                    <div className="text-left">
                      <p className="font-semibold text-blue-900 dark:text-blue-100">Nouveau Personnel</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Ajouter un employé</p>
                  </div>
                </button>

                  <button 
                    onClick={handleNewContract}
                    className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-xl hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-900/40 transition-all duration-200 border border-green-200 dark:border-green-700"
                    title="Créer un nouveau contrat"
                  >
                    <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
                    <div className="text-left">
                      <p className="font-semibold text-green-900 dark:text-green-100">Nouveau Contrat</p>
                      <p className="text-sm text-green-600 dark:text-green-400">Créer un contrat</p>
        </div>
                  </button>

                  <button 
                    onClick={handleNewTraining}
                    className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-xl hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/30 dark:hover:to-purple-900/40 transition-all duration-200 border border-purple-200 dark:border-purple-700"
                    title="Planifier une formation"
                  >
                    <Presentation className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
                    <div className="text-left">
                      <p className="font-semibold text-purple-900 dark:text-purple-100">Nouvelle Formation</p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Planifier une formation</p>
                    </div>
                  </button>

                  <button 
                    onClick={handleNewEvaluation}
                    className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 rounded-xl hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/30 dark:hover:to-orange-900/40 transition-all duration-200 border border-orange-200 dark:border-orange-700"
                    title="Créer une évaluation"
                  >
                    <Award className="w-6 h-6 text-orange-600 dark:text-orange-400 mr-3" />
                    <div className="text-left">
                      <p className="font-semibold text-orange-900 dark:text-orange-100">Nouvelle Évaluation</p>
                      <p className="text-sm text-orange-600 dark:text-orange-400">Évaluer un employé</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'paystates' && (
            <div className="space-y-8">
              {/* Header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-6 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">États des paiements</h3>
                      <p className="text-emerald-100">Tableaux des paiements pour personnels permanents et vacataires</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sous-onglets */}
              <PaystatesTabs />
            </div>
          )}

          {activeTab === 'vacatairesState' && (
            <div className="space-y-8">
              {/* Header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-sky-600 rounded-2xl p-6 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-1">État des vacataires</h3>
                  <p className="text-teal-100">Conforme au modèle (AIB, IFU, retenues et net à payer)</p>
                </div>
              </div>

              {/* Tableau dédié vacataires */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 overflow-auto">
                <table className="min-w-[1200px] w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 px-2 whitespace-nowrap">Nom et Prénoms</th>
                      <th className="py-2 px-2 whitespace-nowrap">Salaire Indiciaire</th>
                      <th className="py-2 px-2 whitespace-nowrap">Mois perçus / arriéré</th>
                      <th className="py-2 px-2 whitespace-nowrap">Gratifications et étrennes</th>
                      <th className="py-2 px-2 whitespace-nowrap">Indemnités</th>
                      <th className="py-2 px-2 whitespace-nowrap">Prime de Salissures</th>
                      <th className="py-2 px-2 whitespace-nowrap">Salaire Brut</th>
                      <th className="py-2 px-2 whitespace-nowrap">Salaire Brut Imposable</th>
                      <th className="py-2 px-2 whitespace-nowrap">AIB</th>
                      <th className="py-2 px-2 whitespace-nowrap">Avance sur salaire</th>
                      <th className="py-2 px-2 whitespace-nowrap">Opposition/ Assurance</th>
                      <th className="py-2 px-2 whitespace-nowrap">Taxes Radio/Télé</th>
                      <th className="py-2 px-2 whitespace-nowrap">Net à payer</th>
                      <th className="py-2 px-2 whitespace-nowrap">CIN°</th>
                      <th className="py-2 px-2 whitespace-nowrap">Signature</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-100 dark:border-gray-700">
                      <td className="py-2 px-2" colSpan={15}>Données à venir…</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 dark:border-gray-700 font-semibold">
                      <td className="py-2 px-2">TOTAL</td>
                      {Array.from({ length: 13 }).map((_, i) => (
                        <td key={i} className="py-2 px-2 text-right">0</td>
                      ))}
                      <td className="py-2 px-2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'personnel' && (
            <div className="space-y-8">
              {/* États de chargement et d'erreur */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Chargement du personnel...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                  <button 
                    onClick={refreshData}
                    className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                    title="Réessayer"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Réessayer
                  </button>
                </div>
              ) : personnel.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Aucun personnel trouvé</p>
                  <button 
                    onClick={handleNewTeacher}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Ajouter un nouveau personnel"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Ajouter le premier personnel
                  </button>
                </div>
              ) : (
                <>
                  {/* En-tête inspiré du module finance */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="mb-4 lg:mb-0">
                          <h3 className="text-2xl font-bold mb-2">Gestion du Personnel</h3>
                          <p className="text-blue-100">Annuaire et suivi des membres du personnel</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
                    <input
                      type="text"
                              placeholder="Rechercher un membre du personnel..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 pr-4 py-2 bg-white/15 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-white/70"
                            />
                  </div>
                        </div>
                      </div>
                </div>
              </div>

                  {/* Statistiques */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-blue-600">{personnel.length}</span>
                        </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Total Personnel</h4>
                      <p className="text-sm text-gray-600">Nombre total de membres enregistrés</p>
                      </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-green-600">{pedagogicalPersonnel.length}</span>
                        </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Personnel Pédagogique</h4>
                      <p className="text-sm text-gray-600">Enseignants et formateurs</p>
                      </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-purple-600">{administrativePersonnel.length}</span>
                        </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Personnel Administratif</h4>
                      <p className="text-sm text-gray-600">Gestion et administration</p>
                      </div>

                  </div>

                  {/* Tableau */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900">Liste du personnel</h4>
                          <div className="flex items-center space-x-3">
                          {(searchTerm || selectedDepartment) && (
                            <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                              <Search className="w-4 h-4" />
                              <span>{filteredPersonnel.length} résultat{filteredPersonnel.length > 1 ? 's' : ''}</span>
                              <button onClick={resetFilters} className="text-blue-400 hover:text-blue-600 ml-2" title="Effacer les filtres">✕</button>
                          </div>
                          )}
                          <button
                            onClick={expandAllDepartments}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                          >
                            <Maximize2 className="w-4 h-4" />
                            <span className="text-sm font-medium">Tout développer</span>
                          </button>
                          <button
                            onClick={collapseAllDepartments}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                          >
                            <Minimize2 className="w-4 h-4" />
                            <span className="text-sm font-medium">Tout réduire</span>
                          </button>
                          <button
                            onClick={handleNewTeacher}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                            title="Ajouter un nouveau personnel"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span className="text-sm font-medium">Nouveau</span>
                          </button>
                        </div>
                                  </div>
                                </div>
                    <div className="p-6">
                      <div className="overflow-x-auto">
                        <div className="space-y-4">
                          {(() => {
                            // Grouper le personnel par département
                            const groupedPersonnel = personnel.reduce((acc, person) => {
                              const department = person.department || 'Non défini';
                              console.log('🔍 Groupement - Personne:', person.firstName, person.lastName, 'Département:', department);
                              if (!acc[department]) {
                                acc[department] = [];
                              }
                              acc[department].push(person);
                              return acc;
                            }, {} as { [key: string]: UIEmployee[] });
                            
                            console.log('🔍 Groupement final:', Object.keys(groupedPersonnel));

                            // Trier les départements par ordre alphabétique
                            const sortedDepartments = Object.keys(groupedPersonnel).sort();

                            return sortedDepartments.map((department) => {
                              const departmentPersonnel = groupedPersonnel[department];
                              const isExpanded = expandedDepartments[department];
                              const totalCount = departmentPersonnel.length;
                              const departmentDisplayName = getDepartmentName(department);

                            return (
                              <div key={department} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {/* En-tête du département */}
                                <div 
                                  className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 px-6 py-4 cursor-pointer hover:from-slate-100 hover:to-gray-100 dark:hover:from-slate-700 dark:hover:to-gray-700 transition-all duration-200"
                                  onClick={() => toggleDepartment(department)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                                        <Building2 className="w-5 h-5 text-white" />
                                </div>
                                      <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{departmentDisplayName}</h3>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                          <div className="flex items-center space-x-1">
                                            <Users className="w-4 h-4" />
                                            <span>{totalCount} membre{totalCount > 1 ? 's' : ''}</span>
                                  </div>
                              </div>
                            </div>
                        </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="text-right">
                  </div>
                                      <div className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                                        {isExpanded ? (
                                          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        ) : (
                                          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        )}
                            </div>
                            </div>
                            </div>
                        </div>
                          
                                {/* Contenu du département */}
                                {isExpanded && (
                          <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 dark:from-slate-800 dark:via-gray-800 dark:to-slate-800">
                                <tr>
                                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            <div className="flex items-center space-x-2">
                                              <User className="w-4 h-4" />
                                      <span>Personnel</span>
                                    </div>
                                  </th>
                                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            <div className="flex items-center space-x-2">
                                              <Briefcase className="w-4 h-4" />
                                              <span>Poste</span>
                                    </div>
                                  </th>
                                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            <div className="flex items-center space-x-2">
                                              <Info className="w-4 h-4" />
                                              <span>Informations</span>
                                      </div>
                                          </th>
                                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            <div className="flex items-center space-x-2">
                                              <Phone className="w-4 h-4" />
                                      <span>Contact</span>
                                    </div>
                                  </th>
                                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            <div className="flex items-center space-x-2">
                                              <Settings className="w-4 h-4" />
                                      <span>Actions</span>
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {departmentPersonnel.map((person: UIEmployee, index: number) => (
                                          <tr key={person.id} className={`hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 dark:hover:from-slate-800/50 dark:hover:to-gray-800/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/30 dark:bg-slate-800/30'}`}>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center space-x-4">
                                                <div className="relative">
                                                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden ring-2 ring-blue-100 dark:ring-blue-900/30">
                                                {person.photo ? (
                                                      <img src={person.photo} alt={`${person.firstName} ${person.lastName}`} className="w-12 h-12 rounded-2xl object-cover" />
                                                    ) : (
                                                      (person.firstName || '?').charAt(0).toUpperCase()
                                                    )}
                                                  </div>
                                              </div>
                                              <div className="min-w-0 flex-1">
                                                  <div className="flex items-center space-x-2 mb-1">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{person.matricule || '—'}</div>
                                                </div>
                                                  <div className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                    {person.gender || '—'} {person.firstName || 'Prénom'} {person.lastName || 'Nom'}
                                                </div>
                                                  <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center space-x-1">
                                                      <Calendar className="w-3 h-3" />
                                                      <span>
                                                  {person.dateOfBirth && person.dateOfBirth !== 'Date non définie' ? 
                                                          `${Math.floor((new Date().getTime() - new Date(person.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))} ans` : 
                                                    'Âge non renseigné'
                                                  }
                                                      </span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                      <Building2 className="w-3 h-3" />
                                                      <span>{person.nationality || '—'}</span>
                                                    </div>
                                                </div>
                                              </div>
                                            </div>
                                          </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="space-y-2">
                                              <div className="flex items-center space-x-2">
                                                  <Briefcase className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{getPositionName(person.positionId) || person.positionId || '—'}</div>
                                              </div>
                                                {person.description && person.description !== 'Aucune description' && (
                                                  <div className="flex items-start space-x-2">
                                                    <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                    <div className="text-xs text-gray-500 truncate max-w-48" title={person.description}>
                                                      {person.description}
                                                    </div>
                                                </div>
                                              )}
                                                {(() => {
                                                  // Pour les postes administratifs, afficher "Administration"
                                                  const isAdministrativePosition = person.positionId && (
                                                    person.positionId === 'POS-004' || // Directeur(trice) M&P
                                                    person.positionId === 'POS-005' || // Secrétaire
                                                    person.positionId === 'POS-006' || // Comptable
                                                    person.positionId === 'POS-007' || // Secrétaire-Comptable
                                                    person.positionId === 'POS-008' || // Directeur(trice)
                                                    person.positionId === 'POS-009' || // Secrétaire
                                                    person.positionId === 'POS-010' || // Comptable
                                                    person.positionId === 'POS-011' || // Secrétaire-Comptable
                                                    person.positionId === 'POS-012' || // Censeur
                                                    person.positionId === 'POS-013' || // Surveillant(e)
                                                    person.positionId === 'POS-014' || // Technicien informatique
                                                    person.positionId === 'POS-015' || // Agent de sécurité
                                                    person.positionId === 'POS-016'    // Agent d'entretien
                                                  );
                                                  
                                                  if (isAdministrativePosition) {
                                                    return (
                                                      <div className="flex items-center space-x-2">
                                                        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        <div className="text-xs text-blue-600 dark:text-blue-400">Matière: Aucune matière (Administration)</div>
                                                      </div>
                                                    );
                                                  } else if (person.subject && person.subject !== 'Non assigné') {
                                                    return (
                                                      <div className="flex items-center space-x-2">
                                                        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        <div className="text-xs text-blue-600 dark:text-blue-400">Matière: {person.subject}</div>
                                                      </div>
                                                    );
                                                  }
                                                  return null;
                                                })()}
                                            </div>
                                          </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                              <div className="space-y-3">
                                              <div className="flex items-center space-x-2">
                                                  <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                  <div className="text-sm">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Embauche:</span>
                                                    <span className="ml-1 text-gray-900 dark:text-gray-100">{person.hireDate ? new Date(person.hireDate).toLocaleDateString('fr-FR') : '—'}</span>
                                              </div>
                                              </div>
                                                <div className="flex items-center space-x-2">
                                                  <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                  <div className="text-sm">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Diplôme:</span>
                                                    <span className="ml-1 text-gray-900 dark:text-gray-100">{person.qualifications || '—'}</span>
                                                </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                                  <div className="text-sm">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Expérience:</span>
                                                    <span className="ml-1 text-gray-900 dark:text-gray-100">{person.experienceYears || 0} an{(person.experienceYears || 0) > 1 ? 's' : ''}</span>
                                                </div>
                                                </div>
                                            </div>
                                          </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                              <div className="space-y-3">
                                                <div className="flex items-center space-x-2">
                                                  <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{person.phone || '—'}</div>
                                              </div>
                                                <div className="flex items-center space-x-2">
                                                  <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                  <div className="text-sm text-gray-700 dark:text-gray-300">{person.email || '—'}</div>
                                              </div>
                                                {person.address && person.address !== 'Adresse manquante' && (
                                                  <div className="flex items-start space-x-2">
                                                    <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-40" title={person.address}>
                                                      {person.address}
                                                    </div>
                                                  </div>
                                                )}
                                                {person.emergencyContact && person.emergencyContact !== 'Contact manquant' && (
                                              <div className="flex items-center space-x-2">
                                                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                    <div className="text-xs text-red-600 dark:text-red-400">
                                                      {person.emergencyContact}
                                              </div>
                                            </div>
                                                )}
                                            </div>
                                          </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                                              <div className="flex items-center space-x-2">
                                              <button
                                                  onClick={() => handleViewTeacher(person as unknown as Personnel)}
                                                  className="group flex items-center justify-center w-10 h-10 text-blue-600 hover:text-white hover:bg-blue-600 rounded-xl border border-blue-200 hover:border-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
                                                title="Consulter"
                                              >
                                                  <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                              </button>
                                              <button
                                                  onClick={() => handleEditTeacher(person as unknown as Personnel)}
                                                  className="group flex items-center justify-center w-10 h-10 text-green-600 hover:text-white hover:bg-green-600 rounded-xl border border-green-200 hover:border-green-600 transition-all duration-200 shadow-sm hover:shadow-md"
                                                title="Modifier"
                                              >
                                                  <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                              </button>
                                              <button
                                                  onClick={() => handleDeleteTeacher(person as unknown as Personnel)}
                                                  className="group flex items-center justify-center w-10 h-10 text-red-600 hover:text-white hover:bg-red-600 rounded-xl border border-red-200 hover:border-red-600 transition-all duration-200 shadow-sm hover:shadow-md"
                                                title="Supprimer"
                                              >
                                                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                              </tbody>
                            </table>
                          </div>
                                )}
                        </div>
                            );
                            });
                          })()}
                    </div>
                      </div>
                    </div>
              </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-4 lg:mb-0">
                      <h3 className="text-2xl font-bold mb-2">Gestion des Contrats</h3>
                      <p className="text-green-100">
                        {contractsData.length} contrat{contractsData.length > 1 ? 's' : ''} enregistré{contractsData.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleNewContract}
                        className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Nouveau contrat
                </button>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full"></div>
              </div>

              {contractsData.length === 0 ? (
                /* État vide - Aucun contrat */
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="relative mb-8">
                    <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center shadow-lg">
                      <FileSpreadsheet className="w-16 h-16 text-green-500 dark:text-green-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <div className="text-center max-w-md">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                      Aucun contrat enregistré
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                      Commencez par créer votre premier contrat de travail pour gérer efficacement 
                      les relations contractuelles avec vos employés.
                    </p>
                    
                    <div className="space-y-4">
                      <button 
                        onClick={handleNewContract}
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg"
                      >
                        <FileSpreadsheet className="w-5 h-5 mr-3" />
                        Créer le premier contrat
                      </button>
                      
                    </div>
                  </div>
                </div>
              ) : (
                /* Liste des contrats */
              <div className="grid gap-6">
                {contractsData.map((contract) => (
                  <div key={contract.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200">
                      {/* Header avec informations principales */}
                      <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                            <FileSpreadsheet className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{contract.employeeName}</h4>
                            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">{contract.position}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">ID: {contract.id}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getContractColor(contract.contractType)}`}>
                                {contract.contractType === 'permanent' ? 'Permanent' : contract.contractType === 'vacataire' ? 'Vacataire' : contract.contractType}
                              </span>
                            </div>
                        </div>
                      </div>
                      
                        <div className="text-right">
                          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {contract.contractType === 'vacataire' 
                              ? `${contract.hourlyRate?.toLocaleString() || 0} F CFA/h`
                              : `${contract.baseSalary?.toLocaleString() || 0} F CFA`
                            }
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            {contract.contractType === 'vacataire' ? 'Taux horaire' : 'Salaire mensuel'}
                          </p>
                          <div className="flex space-x-2 mt-4">
                            <button 
                              onClick={() => handleViewContract(contract)}
                              className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl text-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-200 flex items-center shadow-sm hover:shadow-md"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Voir
                            </button>
                            <button 
                              onClick={() => handleEditContract(contract)}
                              className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 flex items-center shadow-sm hover:shadow-md"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </button>
                            <button
                              onClick={() => navigate(`/dashboard/planning?employeeId=${encodeURIComponent(contract.employeeId)}&contractId=${encodeURIComponent(contract.id)}&tab=schedule`)}
                              className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all duration-200 flex items-center shadow-sm hover:shadow-md"
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Voir Planning
                            </button>
                            <button
                              onClick={() => {
                                const now = new Date();
                                const y = now.getFullYear();
                                const m = now.getMonth() + 1;
                                navigate(`/dashboard/finance/payroll?employeeId=${encodeURIComponent(contract.employeeId)}&contractId=${encodeURIComponent(contract.id)}&tab=payslips&year=${y}&month=${m}`);
                              }}
                              className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all duration-200 flex items-center shadow-sm hover:shadow-md"
                            >
                              <DollarSign className="w-4 h-4 mr-2" />
                              Voir Paie
                            </button>
                            <button
                              onClick={() => handleDeleteContract(contract)}
                              className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200 flex items-center shadow-sm hover:shadow-md"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </button>
                          </div>
                        </div>
                        </div>
                        
                      {/* Informations détaillées */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Période du contrat */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center mb-2">
                            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                            <h5 className="font-semibold text-blue-900 dark:text-blue-100">Période</h5>
                          </div>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Du {new Date(contract.startDate).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {contract.endDate ? `Au ${new Date(contract.endDate).toLocaleDateString('fr-FR')}` : 'Contrat permanent'}
                          </p>
                          {contract.renewalDate && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              Renouvellement: {new Date(contract.renewalDate).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            <strong>Durée:</strong> {contract.contractDuration}
                          </p>
                        </div>

                        {/* Conditions contractuelles */}
                        <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-rose-200 dark:border-rose-800">
                          <div className="flex items-center mb-2">
                            <Clock className="w-5 h-5 text-rose-600 dark:text-rose-400 mr-2" />
                            <h5 className="font-semibold text-rose-900 dark:text-rose-100">Conditions</h5>
                          </div>
                          <div className="space-y-1">
                            {contract.probationPeriod && (
                              <p className="text-xs text-rose-700 dark:text-rose-300">
                                <strong>Essai:</strong> {contract.probationPeriod}
                              </p>
                            )}
                            {contract.noticePeriod && (
                              <p className="text-xs text-rose-700 dark:text-rose-300">
                                <strong>Préavis:</strong> {contract.noticePeriod}
                              </p>
                            )}
                            <p className="text-xs text-rose-700 dark:text-rose-300">
                              <strong>Temps:</strong> {contract.workTimeType === 'plein-temps' ? 'Plein temps' : 'Temps partiel'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Conditions de travail */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center mb-2">
                            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                            <h5 className="font-semibold text-purple-900 dark:text-purple-100">Horaires</h5>
                          </div>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            {contract.workSchedule || 'Non défini'}
                          </p>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            {contract.workingHours}h/semaine
                          </p>
                          {contract.remoteWork && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 mt-1">
                              Télétravail autorisé
                          </span>
                          )}
                        </div>

                        {/* Lieu de travail */}
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                          <div className="flex items-center mb-2">
                            <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                            <h5 className="font-semibold text-orange-900 dark:text-orange-100">Lieu</h5>
                          </div>
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            {contract.workLocation || 'Non défini'}
                          </p>
                      </div>
                      
                        {/* Politiques */}
                        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-teal-200 dark:border-teal-800">
                          <div className="flex items-center mb-2">
                            <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-2" />
                            <h5 className="font-semibold text-teal-900 dark:text-teal-100">Politiques</h5>
                          </div>
                          <p className="text-xs text-teal-700 dark:text-teal-300 mb-1">
                            <strong>Heures sup:</strong> {contract.overtimePolicy || 'Non défini'}
                          </p>
                          <p className="text-xs text-teal-700 dark:text-teal-300">
                            <strong>Congés:</strong> {contract.leavePolicy || 'Non défini'}
                          </p>
                        </div>

                        {/* Formation et performance */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
                          <div className="flex items-center mb-2">
                            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                            <h5 className="font-semibold text-indigo-900 dark:text-indigo-100">Formation</h5>
                          </div>
                          <p className="text-xs text-indigo-700 dark:text-indigo-300">
                            {contract.trainingRequirements || 'Non défini'}
                          </p>
                        </div>

                        {/* Clauses */}
                        <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                          <div className="flex items-center mb-2">
                            <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                            <h5 className="font-semibold text-gray-900 dark:text-gray-100">Clauses</h5>
                          </div>
                          <div className="space-y-1">
                            {contract.confidentialityClause && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                Confidentialité
                              </span>
                            )}
                            {contract.nonCompeteClause && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                Non-concurrence
                              </span>
                            )}
                            {contract.specialClauses && (
                              <p className="text-xs text-gray-700 dark:text-gray-300 mt-2">
                                <strong>Spéciales:</strong> {contract.specialClauses.substring(0, 40)}...
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Notes et attentes */}
                        <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center mb-2">
                            <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400 mr-2" />
                            <h5 className="font-semibold text-slate-900 dark:text-slate-100">Notes</h5>
                          </div>
                          <div className="space-y-1">
                            {contract.performanceExpectations && (
                              <p className="text-xs text-slate-700 dark:text-slate-300">
                                <strong>Performance:</strong> {contract.performanceExpectations}
                              </p>
                            )}
                            {contract.notes && (
                              <p className="text-xs text-slate-700 dark:text-slate-300">
                                <strong>Notes:</strong> {contract.notes.substring(0, 50)}...
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Rémunération détaillée */}
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                          <div className="flex items-center mb-2">
                            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-2" />
                            <h5 className="font-semibold text-emerald-900 dark:text-emerald-100">Rémunération</h5>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-emerald-700 dark:text-emerald-300">
                              <strong>Type:</strong> {contract.salaryType === 'fixe' ? 'Fixe' : 'Horaire'}
                            </p>
                            {contract.contractType === 'permanent' && contract.baseSalary && (
                              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                <strong>Base:</strong> {contract.baseSalary.toLocaleString()} F CFA
                              </p>
                            )}
                            {contract.contractType === 'vacataire' && contract.hourlyRate && (
                              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                <strong>Horaire:</strong> {contract.hourlyRate.toLocaleString()} F CFA/h
                              </p>
                            )}
                            <p className="text-xs text-emerald-700 dark:text-emerald-300">
                              <strong>Heures/sem:</strong> {contract.workingHours}h
                            </p>
                          </div>
                        </div>

                        {/* Avantages */}
                        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-center mb-2">
                            <Building2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                            <h5 className="font-semibold text-yellow-900 dark:text-yellow-100">Avantages</h5>
                          </div>
                          <div className="space-y-1">
                            {contract.housingAllowance > 0 && (
                              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                <strong>Logement:</strong> {contract.housingAllowance.toLocaleString()} F CFA
                              </p>
                            )}
                            {contract.transportAllowance > 0 && (
                              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                <strong>Transport:</strong> {contract.transportAllowance.toLocaleString()} F CFA
                              </p>
                            )}
                            {contract.fixedBonuses > 0 && (
                              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                <strong>Primes:</strong> {contract.fixedBonuses.toLocaleString()} F CFA
                              </p>
                            )}
                            {contract.benefits && (
                              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                <strong>Autres:</strong> {contract.benefits.substring(0, 30)}...
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Déclarations sociales */}
                        <div className="bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-sky-200 dark:border-sky-800">
                          <div className="flex items-center mb-2">
                            <FileCheck className="w-5 h-5 text-sky-600 dark:text-sky-400 mr-2" />
                            <h5 className="font-semibold text-sky-900 dark:text-sky-100">Déclarations</h5>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className={`w-2 h-2 rounded-full ${contract.cnssDeclaration ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              <p className="text-xs text-sky-700 dark:text-sky-300">CNSS</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`w-2 h-2 rounded-full ${contract.irppDeclaration ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              <p className="text-xs text-sky-700 dark:text-sky-300">IRPP</p>
                            </div>
                            {contract.otherDeductions && (
                              <p className="text-xs text-sky-700 dark:text-sky-300">
                                <strong>Autres:</strong> {contract.otherDeductions.substring(0, 20)}...
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Informations bancaires */}
                        <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-violet-200 dark:border-violet-800">
                          <div className="flex items-center mb-2">
                            <DollarSign className="w-5 h-5 text-violet-600 dark:text-violet-400 mr-2" />
                            <h5 className="font-semibold text-violet-900 dark:text-violet-100">Paiement</h5>
                          </div>
                          <div className="space-y-1">
                            {contract.mobileMoneyType && (
                              <p className="text-xs text-violet-700 dark:text-violet-300">
                                <strong>Mobile Money:</strong> {contract.mobileMoneyType}
                              </p>
                            )}
                            {contract.mobileMoneyNumber && (
                              <p className="text-xs text-violet-700 dark:text-violet-300">
                                <strong>N°:</strong> {contract.mobileMoneyNumber}
                              </p>
                            )}
                            {contract.bankDetails && (
                              <p className="text-xs text-violet-700 dark:text-violet-300">
                                <strong>Banque:</strong> {contract.bankDetails.substring(0, 25)}...
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Documents */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                          <div className="flex items-center mb-2">
                            <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
                            <h5 className="font-semibold text-amber-900 dark:text-amber-100">Documents</h5>
                          </div>
                          <div className="space-y-1">
                            {contract.identityDocumentType && (
                              <p className="text-xs text-amber-700 dark:text-amber-300">
                                <strong>Pièce d'identité:</strong> {contract.identityDocumentType}
                              </p>
                            )}
                            {contract.identityDocumentNumber && (
                              <p className="text-xs text-amber-700 dark:text-amber-300">
                                <strong>N°:</strong> {contract.identityDocumentNumber}
                              </p>
                            )}
                            {contract.ifuNumber && (
                              <p className="text-xs text-amber-700 dark:text-amber-300">
                                <strong>IFU:</strong> {contract.ifuNumber}
                              </p>
                            )}
                            {contract.uploadedDocuments && contract.uploadedDocuments.length > 0 && (
                              <p className="text-xs text-amber-700 dark:text-amber-300">
                                <strong>Fichiers:</strong> {contract.uploadedDocuments.length} document(s)
                              </p>
                            )}
                          </div>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          {activeTab === 'training' && (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-pink-600 rounded-2xl p-6 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-4 lg:mb-0">
                      <h3 className="text-2xl font-bold mb-2">Formation Continue</h3>
                      <p className="text-purple-100">
                        {trainingsData.length} formation{trainingsData.length > 1 ? 's' : ''} enregistrée{trainingsData.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleNewTraining}
                        className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                >
                  <Presentation className="w-4 h-4 mr-2" />
                  Nouvelle formation
                </button>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full"></div>
              </div>

              <div className="grid gap-6">
                {trainingsData.map((training) => (
                  <div key={training.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Presentation className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{training.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{training.category} • {training.id}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">Formateur: {training.instructor}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            Du {training.startDate} au {training.endDate} • {training.duration}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6 text-center">
                        <div className="bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900/50 dark:to-purple-900/20 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">Participants</p>
                          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{training.participants}</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-gray-50 to-pink-50 dark:from-gray-900/50 dark:to-pink-900/20 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">Coût</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            {training.cost === 0 ? 'Gratuit' : `${training.cost} F CFA`}
                          </p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-gray-50 to-violet-50 dark:from-gray-900/50 dark:to-violet-900/20 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">Statut</p>
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Planifiée
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all duration-200 flex items-center shadow-sm hover:shadow-md">
                          <Eye className="w-4 h-4 mr-2" />
                          Détails
                        </button>
                        <button className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 flex items-center shadow-sm hover:shadow-md">
                          <Users className="w-4 h-4 mr-2" />
                          Participants
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'evaluations' && (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-4 lg:mb-0">
                      <h3 className="text-2xl font-bold mb-2">Évaluations et Développement</h3>
                      <p className="text-orange-100">
                        {evaluationsData.length} évaluation{evaluationsData.length > 1 ? 's' : ''} enregistrée{evaluationsData.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleNewEvaluation}
                        className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Nouvelle évaluation
                </button>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full"></div>
              </div>

              <div className="grid gap-6">
                {evaluationsData.map((evaluation) => (
                  <div key={evaluation.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Award className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{evaluation.employeeName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{evaluation.position} • {evaluation.id}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            Évalué le {evaluation.evaluationDate} par {evaluation.evaluator}
                          </p>
                          
                          <div className="mt-4 grid md:grid-cols-2 gap-6">
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Critères d'évaluation:</h5>
                              <div className="space-y-2">
                                {evaluation.criteria && typeof evaluation.criteria === 'object' ? Object.entries(evaluation.criteria).map(([criterion, score]) => (
                                  <div key={criterion} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                      {criterion === 'pedagogy' ? 'Pédagogie' :
                                       criterion === 'communication' ? 'Communication' :
                                       criterion === 'teamwork' ? 'Travail d\'équipe' : 'Innovation'}
                                    </span>
                                    <span className={`text-sm font-bold ${getPerformanceColor(score as number)}`}>
                                      {score}/5
                                    </span>
                                  </div>
                                )) : (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Aucun critère disponible</p>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Objectifs:</h5>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                {evaluation.objectives && Array.isArray(evaluation.objectives) ? evaluation.objectives.map((objective, index) => (
                                  <li key={index}>{objective}</li>
                                )) : (
                                  <li className="text-gray-500 dark:text-gray-400">Aucun objectif défini</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-center mb-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Note globale</p>
                          <p className={`text-3xl font-bold ${getPerformanceColor(evaluation.overallScore)}`}>
                            {evaluation.overallScore}/5
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Prochaine évaluation: {evaluation.nextEvaluation}
                        </p>
                        <div className="flex space-x-2">
                          <button className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-xl text-sm hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-all duration-200 flex items-center shadow-sm hover:shadow-md">
                            <Eye className="w-4 h-4 mr-2" />
                            Voir détails
                          </button>
                          <button className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 flex items-center shadow-sm hover:shadow-md">
                            <Target className="w-4 h-4 mr-2" />
                            Plan développement
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payroll' && (
            <PayrollPreview
              onNavigateToFinance={handlePayrollNavigation}
              personnelCount={personnel.length}
              totalSalary={stats.totalSalary || 0}
            />
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-4 lg:mb-0">
                      <h3 className="text-2xl font-bold mb-2">Analytics RH</h3>
                      <p className="text-violet-100">
                        Tableaux de bord et analyses des ressources humaines
                      </p>
              </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Exporter rapport
                      </button>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full"></div>
              </div>

              {/* Analytics Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Personnel Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{personnel.length}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Total Personnel</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Employés actifs</p>
                </div>

                {/* Department Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {new Set(personnel.map(p => p.department)).size}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Départements</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unités organisationnelles</p>
                </div>

                {/* Average Performance */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">4.2</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Performance Moy.</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Note sur 5</p>
                </div>

                {/* Training Completion */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Presentation className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">78%</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Formations</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Taux de completion</p>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Distribution Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Répartition par Département</h4>
                    <PieChart className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    {Object.entries(
                      personnel.reduce((acc, p) => {
                        acc[p.department] = (acc[p.department] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([department, count]) => (
                      <div key={department} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{department}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Trends */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tendances de Performance</h4>
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Excellent (5/5)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="w-3/5 h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">32%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Très bien (4/5)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="w-4/5 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">45%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Bien (3/5)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="w-1/5 h-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full"></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">18%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">À améliorer (2/5)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="w-1/10 h-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-full"></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coming Soon Section */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <PieChart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Analytics Avancées
              </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Fonctionnalités d'analyse avancées en cours de développement
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-sm font-medium">
                    Prédictions RH
                  </span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                    Analyse de rétention
                  </span>
                  <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-sm font-medium">
                    Rapports personnalisés
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TeacherModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onSave={handleSaveTeacher}
        teacherData={selectedItem}
        isEdit={isEditMode}
        isView={isViewMode}
      />

      <EvaluationModal
        isOpen={isEvaluationModalOpen}
        onClose={() => setIsEvaluationModalOpen(false)}
        onSave={handleSaveEvaluation}
        evaluationData={selectedItem}
        isEdit={isEditMode}
        employees={employeeOptions}
      />

      <TrainingModal
        isOpen={isTrainingModalOpen}
        onClose={() => setIsTrainingModalOpen(false)}
        onSave={handleSaveTraining}
        trainingData={selectedItem}
        isEdit={isEditMode}
        employees={employeeOptions}
      />

      <ContractModal
        isOpen={isContractModalOpen}
        onClose={() => {
          setIsContractModalOpen(false);
          setSelectedItem(null);
          setIsEditMode(false);
          setIsViewMode(false);
        }}
        onSave={async (contractData) => {
          await handleSaveContract(contractData);
        }}
        contractData={selectedItem ? {
          id: (selectedItem as Contract).id || '',
          employeeId: (selectedItem as Contract).employeeId || '',
          employeeName: (selectedItem as Contract).employeeName || '',
          position: (selectedItem as Contract).position || '',
          contractType: (selectedItem as Contract).contractType || 'permanent',
          contractDuration: (selectedItem as Contract).contractDuration || 'CDI',
          workTimeType: (selectedItem as Contract).workTimeType || 'plein-temps',
          startDate: (selectedItem as Contract).startDate || '',
          endDate: (selectedItem as Contract).endDate || '',
          salaryType: (selectedItem as Contract).salaryType || 'fixe',
          baseSalary: (selectedItem as Contract).baseSalary || 0,
          hourlyRate: (selectedItem as Contract).hourlyRate || 0,
          workingHours: (selectedItem as Contract).workingHours || 0,
          maxWorkingHours: (selectedItem as Contract).maxWorkingHours || 0,
          housingAllowance: (selectedItem as Contract).housingAllowance || 0,
          transportAllowance: (selectedItem as Contract).transportAllowance || 0,
          fixedBonuses: (selectedItem as Contract).fixedBonuses || 0,
          benefits: (selectedItem as Contract).benefits || '',
          cnssDeclaration: (selectedItem as Contract).cnssDeclaration || true,
          irppDeclaration: (selectedItem as Contract).irppDeclaration || true,
          otherDeductions: (selectedItem as Contract).otherDeductions || '',
          probationPeriod: (selectedItem as Contract).probationPeriod?.toString() || '',
          noticePeriod: (selectedItem as Contract).noticePeriod?.toString() || '',
          specialClauses: (selectedItem as Contract).specialClauses || '',
          renewalDate: (selectedItem as Contract).renewalDate || '',
          signatureDate: '',
          bankDetails: (selectedItem as Contract & Partial<ContractFormData>).bankDetails || '',
          mobileMoneyType: (selectedItem as Contract & Partial<ContractFormData>).mobileMoneyType || '',
          mobileMoneyNumber: (selectedItem as Contract & Partial<ContractFormData>).mobileMoneyNumber || '',
          identityDocumentType: (selectedItem as Contract & Partial<ContractFormData>).identityDocumentType || '',
          identityDocumentNumber: (selectedItem as Contract & Partial<ContractFormData>).identityDocumentNumber || '',
          ifuNumber: (selectedItem as Contract & Partial<ContractFormData>).ifuNumber || '',
          uploadedDocuments: (selectedItem as Contract & Partial<ContractFormData>).uploadedDocuments || [],
          salary: (selectedItem as Contract).baseSalary || 0,
          // Nouvelles conditions de travail
          workSchedule: (selectedItem as Contract & Partial<ContractFormData>).workSchedule || '8h-17h',
          workLocation: (selectedItem as Contract & Partial<ContractFormData>).workLocation || '',
          remoteWork: (selectedItem as Contract & Partial<ContractFormData>).remoteWork || false,
          overtimePolicy: (selectedItem as Contract & Partial<ContractFormData>).overtimePolicy || 'standard',
          leavePolicy: (selectedItem as Contract & Partial<ContractFormData>).leavePolicy || 'standard-25',
          confidentialityClause: (selectedItem as Contract & Partial<ContractFormData>).confidentialityClause || true,
          nonCompeteClause: (selectedItem as Contract & Partial<ContractFormData>).nonCompeteClause || false,
          trainingRequirements: (selectedItem as Contract & Partial<ContractFormData>).trainingRequirements || 'formation-initiale',
          performanceExpectations: (selectedItem as Contract & Partial<ContractFormData>).performanceExpectations || 'standard',
          
          // === NOTES ===
          notes: (selectedItem as Contract).notes || ''
        } : undefined}
        isEdit={isEditMode}
        isView={isViewMode}
        employees={employeeOptions}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Supprimer le contrat"
        message={`Vous êtes sur le point de supprimer définitivement le contrat de ${itemToDelete?.name}.`}
        itemName={itemToDelete?.name || ''}
        itemType={itemToDelete?.type || ''}
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message={selectedItem ? `Êtes-vous sûr de vouloir supprimer ${(selectedItem as Personnel)?.firstName} ${(selectedItem as Personnel)?.lastName} ? Cette action est irréversible.` : "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."}
        type="danger"
      />

      <Toast
        isVisible={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />


    </div>
  );
};

// Composant des sous-onglets et des tableaux d'états de paiements
const PaystatesTabs: React.FC = () => {
  const [subTab, setSubTab] = React.useState<'permanents' | 'vacataires'>('permanents');

  const TableShell: React.FC<{ type: 'permanents' | 'vacataires' }> = ({ type }) => {
    const isVacataire = type === 'vacataires';
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 overflow-auto">
        <table className="min-w-[1000px] w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 px-2 whitespace-nowrap">Nom et Prénoms</th>
              <th className="py-2 px-2 whitespace-nowrap">Situation/Matricule</th>
              <th className="py-2 px-2 whitespace-nowrap">Date de recrutement</th>
              <th className="py-2 px-2 whitespace-nowrap">Salaire indiciaire</th>
              {/* Avantages */}
              <th className="py-2 px-2 whitespace-nowrap">Mois perçus/arriéré</th>
              <th className="py-2 px-2 whitespace-nowrap">Gratifications et étrennes</th>
              <th className="py-2 px-2 whitespace-nowrap">Indemnités</th>
              <th className="py-2 px-2 whitespace-nowrap">Prime de salissures</th>
              {/* Calculs salariaux */}
              <th className="py-2 px-2 whitespace-nowrap">Salaire Brut</th>
              <th className="py-2 px-2 whitespace-nowrap">Salaire Brut Imposable</th>
              {/* Retenues */}
              {isVacataire ? (
                <th className="py-2 px-2 whitespace-nowrap">AIB</th>
              ) : (
                <th className="py-2 px-2 whitespace-nowrap">IRPP Brut</th>
              )}
              <th className="py-2 px-2 whitespace-nowrap">IRPP Net</th>
              <th className="py-2 px-2 whitespace-nowrap">CNSS</th>
              {!isVacataire && <th className="py-2 px-2 whitespace-nowrap">CNSS Patronale</th>}
              <th className="py-2 px-2 whitespace-nowrap">VPS</th>
              <th className="py-2 px-2 whitespace-nowrap">Avance sur salaire</th>
              <th className="py-2 px-2 whitespace-nowrap">Opposition/Assurance</th>
              <th className="py-2 px-2 whitespace-nowrap">Taxes Radio/Télé</th>
              <th className="py-2 px-2 whitespace-nowrap">Net à payer</th>
              {isVacataire && <th className="py-2 px-2 whitespace-nowrap">si IFU 1 sinon 0</th>}
            </tr>
          </thead>
          <tbody>
            {/* Lignes de données - à connecter au service de paie */}
            <tr className="border-t border-gray-100 dark:border-gray-700">
              <td className="py-2 px-2" colSpan={isVacataire ? 18 : 18}>
                Données à venir…
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 dark:border-gray-700 font-semibold">
              <td className="py-2 px-2">TOTAL</td>
              {/* Colonnes numériques totalisées */}
              {Array.from({ length: isVacataire ? 17 : 17 }).map((_, i) => (
                <td key={i} className="py-2 px-2 text-right">0</td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <button
          onClick={() => setSubTab('permanents')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${subTab === 'permanents' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
        >
          Personnels permanents
        </button>
        <button
          onClick={() => setSubTab('vacataires')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${subTab === 'vacataires' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
        >
          Personnels vacataires
        </button>
      </div>

      {subTab === 'permanents' ? (
        <TableShell type="permanents" />
      ) : (
        <TableShell type="vacataires" />
      )}
    </div>
  );
};

export default HR;
