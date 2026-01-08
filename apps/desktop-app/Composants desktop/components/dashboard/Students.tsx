import React, { useState, useEffect } from 'react';
import { useAcademicYear } from '../../hooks/useAcademicYear';
import { useAcademicYearState } from '../../hooks/useAcademicYearState';
import CurrentAcademicYearDisplay from '../common/CurrentAcademicYearDisplay';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  MoreHorizontal,
  Users,
  GraduationCap,
  Calendar,
  FileText,
  Camera,
  UserX,
  AlertTriangle,
  CheckCircle,
  Award,
  BookOpen,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Check,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

import StudentModal from '../modals/StudentModal';
import AbsenceModal from '../modals/AbsenceModal';
import ParentContactModal from '../modals/ParentContactModal';
import OptimizedImage from '../common/OptimizedImage';
import ClassTransferModal from '../modals/ClassTransferModal';
import DocumentGenerationModal from '../modals/DocumentGenerationModal';
import CertificateGenerationModal from '../modals/CertificateGenerationModal';
import AttestationGenerationModal from '../modals/AttestationGenerationModal';
import ListGenerationModal from '../modals/ListGenerationModal';
import ReportGenerationModal from '../modals/ReportGenerationModal';
import CardIdGenerationModal from '../modals/CardIdGenerationModal';
import TrombinoscopeModal from '../modals/TrombinoscopeModal';
import ConfirmModal from '../modals/ConfirmModal';
import AlertModal from '../modals/AlertModal';
import TransferDeleteConfirmationModal from '../modals/TransferDeleteConfirmationModal';
import AbsenceDeleteConfirmationModal from '../modals/AbsenceDeleteConfirmationModal';
import AbsenceReportModal from '../modals/AbsenceReportModal';

import { useStudentsData } from '../../hooks/useStudentsData';
import { useUser } from '../../contexts/UserContext';
import { reportService } from '../../services/reportService';

// Les interfaces sont maintenant importées depuis useStudentsData

const Students: React.FC = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [activeTab, setActiveTab] = useState('enrollment');
  
  // Service des années scolaires (même système que Finance)
  const { 
    loading: academicYearLoading,
    getAcademicYearOptions
  } = useAcademicYear();

  // État pour l'année scolaire sélectionnée avec persistance (même système que Finance)
  const { 
    selectedAcademicYear: selectedSchoolYear, 
    setSelectedAcademicYear: setSelectedSchoolYear 
  } = useAcademicYearState('students');
  
  // État pour le filtre de classe dans le trombinoscope
  const [trombinoscopeClassFilter, setTrombinoscopeClassFilter] = useState('all');
  
  // État pour les niveaux déroulés/fermés (tous fermés par défaut)
  const [expandedLevels, setExpandedLevels] = useState<{ [key: string]: boolean }>({
    'maternelle': false,
    'primaire': false,
    '1er-cycle-secondaire': false,
    '2nd-cycle-secondaire': false
  });
  
  // État pour les classes déroulées/fermées (toutes fermées par défaut)
  const [expandedClasses, setExpandedClasses] = useState<{ [key: string]: boolean }>({});
  
  // État pour la pagination par classe
  const [classPages, setClassPages] = useState<{ [key: string]: number }>({});
  
  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  
  // États pour les modals de génération de documents
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isAttestationModalOpen, setIsAttestationModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCardIdModalOpen, setIsCardIdModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isTransferDeleteModalOpen, setIsTransferDeleteModalOpen] = useState(false);
  const [transferToDelete, setTransferToDelete] = useState<any>(null);
  const [isDeletingTransfer, setIsDeletingTransfer] = useState(false);
  
  // États pour la suppression des absences
  const [isAbsenceDeleteModalOpen, setIsAbsenceDeleteModalOpen] = useState(false);
  const [absenceToDelete, setAbsenceToDelete] = useState<any>(null);
  const [isDeletingAbsence, setIsDeletingAbsence] = useState(false);
  
  // États pour le contact parent
  const [isParentContactModalOpen, setIsParentContactModalOpen] = useState(false);
  const [studentForContact, setStudentForContact] = useState<any>(null);
  const [absenceForContact, setAbsenceForContact] = useState<any>(null);
  
  // États pour les filtres d'absences
  const [absenceFilters, setAbsenceFilters] = useState({
    class: 'all',
    dateFrom: '',
    dateTo: '',
    period: 'all',
    justified: 'all'
  });
  
  // États pour les filtres de mouvements
  const [movementFilters, setMovementFilters] = useState({
    fromClass: 'all',
    toClass: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });
  
  // États pour les statistiques d'absences
  const [absenceStats, setAbsenceStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    justified: 0,
    unjustified: 0
  });
  
  // États pour le rapport d'assiduité
  const [isAbsenceReportModalOpen, setIsAbsenceReportModalOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isTrombinoscopeModalOpen, setIsTrombinoscopeModalOpen] = useState(false);
  
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' | 'info' | 'warning' });
  
  // États pour la suppression multiple des élèves
  const [selectedStudentsForDeletion, setSelectedStudentsForDeletion] = useState<Set<string>>(new Set());
  const [isDeleteMultipleStudentsModalOpen, setIsDeleteMultipleStudentsModalOpen] = useState(false);
  
  // Toast state (comme Planning)
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  // Hook pour les données des étudiants
  const {
    students,
    classes,
    absences,
    transfers,
    stats,
    loading,
    error,
    createStudent,
    updateStudent,
    deleteStudent,
    createAbsence,
    updateAbsence,
    deleteAbsence,
    createTransfer,
    deleteTransfer,
    approveTransfer,
    rejectTransfer,
    fetchTransfers,
    refreshData
  } = useStudentsData();

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.id?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClass === 'all' || student.className === selectedClass;
    
    return matchesSearch && matchesClass;
  });

  // États pour les filtres avancés
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [academicYearFilter, setAcademicYearFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  // Fonction de tri
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
        bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
        break;
      case 'class':
        aValue = a.className || '';
        bValue = b.className || '';
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'enrollmentDate':
        aValue = new Date(a.enrollmentDate || '');
        bValue = new Date(b.enrollmentDate || '');
        break;
      case 'dateOfBirth':
        aValue = new Date(a.dateOfBirth || '');
        bValue = new Date(b.dateOfBirth || '');
        break;
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
      default:
        aValue = a[sortBy as keyof typeof a];
        bValue = b[sortBy as keyof typeof b];
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Filtres avancés
  const applyAdvancedFilters = (students: any[]) => {
    return students.filter(student => {
      // Filtre par statut
      if (statusFilter !== 'all' && student.status !== statusFilter) {
        return false;
      }
      
      // Filtre par année scolaire
      if (academicYearFilter !== 'all' && student.enrollmentDate) {
        const enrollmentDate = new Date(student.enrollmentDate);
        const academicYear = parseInt(academicYearFilter);
        
        // Vérification précise : si l'inscription est entre septembre et août
        const septemberStart = new Date(academicYear, 8, 1); // Septembre de l'année de début
        const augustEnd = new Date(academicYear + 1, 7, 31); // Août de l'année suivante
        
        if (enrollmentDate < septemberStart || enrollmentDate > augustEnd) {
        return false;
        }
      }
      
      // Filtre par date d'inscription
      if (dateRange.start && student.enrollmentDate) {
        const enrollmentDate = new Date(student.enrollmentDate);
        const startDate = new Date(dateRange.start);
        if (enrollmentDate < startDate) return false;
      }
      
      if (dateRange.end && student.enrollmentDate) {
        const enrollmentDate = new Date(student.enrollmentDate);
        const endDate = new Date(dateRange.end);
        if (enrollmentDate > endDate) return false;
      }
      
      return true;
    });
  };

  const finalFilteredStudents = applyAdvancedFilters(sortedStudents);


  // Fonction pour gérer l'ouverture/fermeture des niveaux
  const toggleLevel = (level: string) => {
    setExpandedLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  // Fonction pour gérer l'ouverture/fermeture des classes
  const toggleClass = (level: string, className: string) => {
    const classKey = `${level}-${className}`;
    setExpandedClasses(prev => ({
      ...prev,
      [classKey]: !prev[classKey]
    }));
  };

  // Fonction pour gérer la pagination par classe
  const setClassPage = (level: string, className: string, page: number) => {
    const classKey = `${level}-${className}`;
    setClassPages(prev => ({
      ...prev,
      [classKey]: page
    }));
  };

  // Fonction pour obtenir la page actuelle d'une classe
  const getClassPage = (level: string, className: string) => {
    const classKey = `${level}-${className}`;
    return classPages[classKey] || 1;
  };

  // Fonction pour paginer les élèves d'une classe
  const paginateClassStudents = (students: any[], level: string, className: string) => {
    const currentPage = getClassPage(level, className);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
    return students.slice(startIndex, endIndex);
  };

  // Fonction pour calculer le nombre total de pages d'une classe
  const getClassTotalPages = (students: any[]) => {
    return Math.ceil(students.length / itemsPerPage);
  };

  // Fonction pour organiser les élèves par niveau puis par classe
  const groupStudentsByLevelAndClass = () => {
    const grouped: { [key: string]: { [key: string]: any[] } } = {};
    
    finalFilteredStudents.forEach(student => {
      const level = student.classLevel || 'Non défini';
      const className = student.className || 'Non défini';
      
      if (!grouped[level]) {
        grouped[level] = {};
      }
      if (!grouped[level][className]) {
        grouped[level][className] = [];
      }
      grouped[level][className].push(student);
    });
    
    // Définir l'ordre des niveaux
    const levelOrder = ['maternelle', 'primaire', '1er-cycle-secondaire', '2nd-cycle-secondaire'];
    
    // Créer un objet ordonné
    const orderedGrouped: { [key: string]: { [key: string]: any[] } } = {};
    
    // Ajouter les niveaux dans l'ordre souhaité
    levelOrder.forEach(level => {
      if (grouped[level]) {
        orderedGrouped[level] = grouped[level];
      }
    });
    
    // Ajouter les autres niveaux non définis à la fin
    Object.keys(grouped).forEach(level => {
      if (!levelOrder.includes(level)) {
        orderedGrouped[level] = grouped[level];
      }
    });
    
    return orderedGrouped;
  };

  // Informations des niveaux (comme Finance)
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
        color: 'from-pink-500 to-rose-600',
        bgColor: 'from-pink-50 to-rose-50',
        textColor: 'text-pink-700'
      },
      'primaire': {
        icon: BookOpen,
        description: 'Enseignement élémentaire (6-12 ans)',
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'from-blue-50 to-indigo-50',
        textColor: 'text-blue-700'
      },
      '1er-cycle-secondaire': {
        icon: GraduationCap,
        description: 'Premier cycle du secondaire (12-16 ans)',
        color: 'from-green-500 to-emerald-600',
        bgColor: 'from-green-50 to-emerald-50',
        textColor: 'text-green-700'
      },
      '2nd-cycle-secondaire': {
        icon: GraduationCap,
        description: 'Deuxième cycle du secondaire (16-19 ans)',
        color: 'from-purple-500 to-violet-600',
        bgColor: 'from-purple-50 to-violet-50',
        textColor: 'text-purple-700'
      }
    };
    
    return levelInfo[level] || {
      icon: Users,
      description: 'Niveau non défini',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'from-gray-50 to-gray-50',
      textColor: 'text-gray-700'
    };
  };

  // Capitaliser le niveau scolaire (comme Finance)
  const capitalizeLevel = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'maternelle': 'Maternelle',
      'primaire': 'Primaire',
      '1er-cycle-secondaire': '1er cycle secondaire',
      '2nd-cycle-secondaire': '2nd cycle secondaire'
    };
    return levelMap[level] || level;
  };

  // Fonction de tri des colonnes
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Fonction d'export
  const handleExport = () => {
    const csvContent = [
      ['N° Educmaster', 'Prénom', 'Nom', 'Date et lieu de naissance', 'Parent', 'Classe', 'Ancienneté', 'Frais d\'inscription', 'Frais de réinscription', 'Frais de scolarité', 'Total frais', 'Statut', 'Date d\'inscription'],
      ...finalFilteredStudents.map(student => [
        student.id,
        student.firstName,
        student.lastName,
        student.dateOfBirth && student.placeOfBirth ? 
          `${new Date(student.dateOfBirth).toLocaleDateString('fr-FR')} à ${student.placeOfBirth}` :
          student.dateOfBirth ? 
            new Date(student.dateOfBirth).toLocaleDateString('fr-FR') :
            student.placeOfBirth ? 
              student.placeOfBirth :
              '',
        student.parentName || '',
        student.className || 'Non assigné',
        student.seniority === 'new' ? 'Nouveau' : student.seniority === 'old' ? 'Ancien' : 'Non défini',
        student.inscriptionFee ? `${student.inscriptionFee.toLocaleString('fr-FR')} F CFA` : '-',
        student.reinscriptionFee ? `${student.reinscriptionFee.toLocaleString('fr-FR')} F CFA` : '-',
        student.tuitionFee ? `${student.tuitionFee.toLocaleString('fr-FR')} F CFA` : '-',
        student.totalSchoolFees ? `${student.totalSchoolFees.toLocaleString('fr-FR')} F CFA` : '-',
        student.status,
        student.enrollmentDate || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `eleves_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'transferred': return 'bg-blue-100 text-blue-800';
      case 'graduated': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 text-yellow-800';
      case 'major': return 'bg-red-100 text-red-800';
      case 'severe': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour afficher un toast (comme Planning)
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({
      show: true,
      message,
      type
    });

    // Auto-hide après 4 secondes
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Fonction pour traduire les périodes
  const translatePeriod = (period: string) => {
    const periodMap: { [key: string]: string } = {
      'morning': 'Matin',
      'afternoon': 'Après-midi',
      'full_day': 'Journée complète'
    };
    return periodMap[period] || period;
  };

  // Handlers pour les modals
  const handleNewStudent = () => {
    setIsEditMode(false);
    setSelectedStudent(null);
    setIsStudentModalOpen(true);
  };

  const handleEditStudent = (student: any) => {
    setIsEditMode(true);
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleDeleteStudent = (student: any) => {
    setSelectedStudent(student);
    setIsConfirmModalOpen(true);
  };

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setIsEditMode(false); // Mode lecture seule
    setIsStudentModalOpen(true);
  };

  const handleMoreActions = (student: any) => {
    setSelectedStudent(student);
    // Ici on pourrait ouvrir un menu contextuel ou un modal avec plus d'options
    // Pour l'instant, on peut afficher un toast avec les options disponibles
    showToast(`Actions disponibles pour ${student.firstName} ${student.lastName}`, 'info');
  };

  const handleNewAbsence = () => {
    setIsEditMode(false);
    setSelectedStudent(null);
    setIsAbsenceModalOpen(true);
  };


  const handleNewTransfer = () => {
    setIsEditMode(false);
    setSelectedStudent(null);
    setIsTransferModalOpen(true);
  };

  const handleGenerateDocument = () => {
    setIsDocumentModalOpen(true);
  };

  // Handlers pour les modals de génération de documents
  const handleGenerateCertificate = () => {
    setIsCertificateModalOpen(true);
  };

  const handleGenerateAttestation = () => {
    setIsAttestationModalOpen(true);
  };

  const handleGenerateList = () => {
    setIsListModalOpen(true);
  };

  const handleGenerateReport = () => {
    setIsReportModalOpen(true);
  };

  const handleGenerateCardId = () => {
    setIsCardIdModalOpen(true);
  };

  const handleSaveStudent = async (studentData: any) => {
    try {
      console.log('=== DEBUG handleSaveStudent ===');
      console.log('studentData reçu:', studentData);
      console.log('isEditMode:', isEditMode);
      
      if (isEditMode && selectedStudent) {
        // Mode édition
        console.log('Mode édition - mise à jour de l\'étudiant');
        await updateStudent(selectedStudent.id, studentData);
      } else {
        // Mode création
        console.log('Mode création - ajout d\'un nouvel étudiant');
        await createStudent(studentData);
      }
      
      // Fermer le modal
      setIsStudentModalOpen(false);
      setSelectedStudent(null);
      setIsEditMode(false);
      
      // Afficher le toast de succès (comme Planning)
      showToast(
        isEditMode 
        ? `Les informations de ${studentData.firstName} ${studentData.lastName} ont été mises à jour avec succès.`
        : `L'élève ${studentData.firstName} ${studentData.lastName} a été ajouté avec succès.`,
        'success'
      );
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'étudiant:', error);
      showToast('Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.', 'error');
    }
  };

  const handleSaveAbsence = async (absenceData: any) => {
    try {
      console.log('=== DEBUG handleSaveAbsence ===');
      console.log('absenceData reçu:', absenceData);
      
      // Mapper les données du modal vers le format attendu par le hook
      const mappedData = {
        studentId: absenceData.studentId,
        studentName: absenceData.studentName,
        class: absenceData.studentClass,
        date: absenceData.date,
        period: absenceData.period,
        reason: absenceData.reason,
        justified: absenceData.isJustified || false,
        parentNotified: absenceData.notifyParent || false,
        comments: absenceData.comments || ''
      };
      
      console.log('Données mappées:', mappedData);
      
      await createAbsence(mappedData);
      showToast('Absence enregistrée avec succès.', 'success');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'absence:', error);
      showToast('Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.', 'error');
    }
  };


  const handleSaveTransfer = async (transferData: any) => {
    try {
      console.log('=== DEBUG handleSaveTransfer ===');
      console.log('transferData reçu:', transferData);
      
      // Créer le transfert via le hook
      await createTransfer({
        studentId: transferData.studentId,
        fromClassId: transferData.fromClassId,
        toClassId: transferData.targetClassId,
        reason: transferData.reason,
        date: transferData.transferDate,
        status: 'pending',
        notes: transferData.comments
      });
      
      // Fermer le modal
      setIsTransferModalOpen(false);
      
      // Afficher le toast de succès
      showToast(
        `Le transfert de ${transferData.studentName} a été enregistré avec succès.`,
        'success'
      );
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du transfert:', error);
      showToast('Une erreur est survenue lors de la sauvegarde du transfert. Veuillez réessayer.', 'error');
    }
  };

  const handleApproveTransfer = async (transferId: string) => {
    try {
      console.log('=== DEBUG handleApproveTransfer ===');
      console.log('transferId:', transferId);
      console.log('Transfers avant approbation:', transfers);
      
      await approveTransfer(transferId, user?.name || 'Administrateur');
      
      console.log('Transfers après approbation:', transfers);
      showToast('Transfert approuvé et élève déplacé vers la nouvelle classe.', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'approbation du transfert:', error);
      showToast('Une erreur est survenue lors de l\'approbation. Veuillez réessayer.', 'error');
    }
  };

  const handleRejectTransfer = async (transferId: string) => {
    try {
      await rejectTransfer(transferId, user?.name || 'Administrateur', 'Rejeté par l\'administrateur');
      showToast('Transfert rejeté. L\'élève reste dans sa classe d\'origine.', 'success');
    } catch (error) {
      console.error('Erreur lors du rejet du transfert:', error);
      showToast('Une erreur est survenue lors du rejet. Veuillez réessayer.', 'error');
    }
  };


  const handleDeleteTransfer = (transferId: string) => {
    // Trouver le transfert pour afficher les détails dans la confirmation
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) {
      showToast('Transfert non trouvé.', 'error');
      return;
    }

    // Debug: vérifier les données du transfert
    console.log('=== DEBUG handleDeleteTransfer ===');
    console.log('Transfert trouvé:', transfer);
    console.log('studentName:', transfer.studentName);
    console.log('Toutes les clés:', Object.keys(transfer));

    // Ouvrir le modal de confirmation
    setTransferToDelete(transfer);
    setIsTransferDeleteModalOpen(true);
  };

  const confirmDeleteTransfer = async () => {
    if (!transferToDelete) return;

    try {
      setIsDeletingTransfer(true);
      console.log('=== DEBUG confirmDeleteTransfer ===');
      console.log('transferId:', transferToDelete.id);
      console.log('Transfert à supprimer:', transferToDelete);

      await deleteTransfer(transferToDelete.id);
      showToast('Transfert supprimé avec succès.', 'success');
      
      // Fermer le modal
      setIsTransferDeleteModalOpen(false);
      setTransferToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du transfert:', error);
      showToast('Une erreur est survenue lors de la suppression. Veuillez réessayer.', 'error');
    } finally {
      setIsDeletingTransfer(false);
    }
  };

  // Fonctions pour la suppression des absences
  const handleDeleteAbsence = (absence: any) => {
    console.log('=== DEBUG handleDeleteAbsence ===');
    console.log('Absence à supprimer:', absence);
    setAbsenceToDelete(absence);
    setIsAbsenceDeleteModalOpen(true);
  };

  // Fonctions pour la justification des absences
  const handleJustifyAbsence = async (absence: any) => {
    try {
      console.log('=== DEBUG handleJustifyAbsence ===');
      console.log('Absence à justifier:', absence);
      
      await updateAbsence(absence.id, { justified: true });
      console.log('Absence justifiée avec succès');
      
      showToast('Absence justifiée avec succès.', 'success');
    } catch (error) {
      console.error('Erreur lors de la justification de l\'absence:', error);
      showToast('Une erreur est survenue lors de la justification. Veuillez réessayer.', 'error');
    }
  };

  // Fonctions pour le contact des parents
  const handleContactParent = (absence: any) => {
    console.log('=== DEBUG handleContactParent ===');
    console.log('Absence pour contact parent:', absence);
    console.log('Toutes les clés de l\'absence:', Object.keys(absence));
    console.log('parentName:', absence.parentName);
    console.log('parentPhone:', absence.parentPhone);
    console.log('parentEmail:', absence.parentEmail);
    
    // Vérifier que l'absence existe
    if (!absence) {
      console.error('Absence non trouvée');
      showToast('Erreur: Absence non trouvée', 'error');
      return;
    }
    
    // Préparer les données de l'élève pour le modal
    const studentData = {
      id: absence.studentId || '',
      firstName: absence.firstName || absence.studentName?.split(' ')[0] || '',
      lastName: absence.lastName || absence.studentName?.split(' ').slice(1).join(' ') || '',
      parentName: absence.parentName || '',
      parentPhone: absence.parentPhone || '',
      parentEmail: absence.parentEmail || '',
      parentAddress: absence.parentAddress || '',
      parentProfession: absence.parentProfession || '',
      parentRelationship: absence.parentRelationship || ''
    };
    
    console.log('Données de l\'élève préparées:', studentData);
    console.log('parentName dans studentData:', studentData.parentName);
    console.log('parentPhone dans studentData:', studentData.parentPhone);
    console.log('parentEmail dans studentData:', studentData.parentEmail);
    
    // Préparer les données d'absence pour le modal
    const absenceData = {
      id: absence.id,
      date: absence.date,
      period: absence.period,
      reason: absence.reason,
      parentNotified: absence.parentNotified
    };
    
    setStudentForContact(studentData);
    setAbsenceForContact(absenceData);
    setIsParentContactModalOpen(true);
  };

  const handleParentContacted = async (absenceId: string) => {
    try {
      console.log('=== DEBUG handleParentContacted ===');
      console.log('ID de l\'absence à marquer comme contactée:', absenceId);
      
      await updateAbsence(absenceId, { parentNotified: true });
      console.log('Parent marqué comme contacté avec succès');
      
      showToast('Parent marqué comme contacté avec succès.', 'success');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de contact:', error);
      showToast('Une erreur est survenue lors de la mise à jour. Veuillez réessayer.', 'error');
    }
  };

  const handleParentNotContacted = async (absenceId: string) => {
    try {
      console.log('=== DEBUG handleParentNotContacted ===');
      console.log('ID de l\'absence à marquer comme non contactée:', absenceId);
      
      await updateAbsence(absenceId, { parentNotified: false });
      console.log('Parent marqué comme non contacté avec succès');
      
      showToast('Parent marqué comme non contacté.', 'info');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de contact:', error);
      showToast('Une erreur est survenue lors de la mise à jour. Veuillez réessayer.', 'error');
    }
  };

  // Fonctions pour les filtres d'absences
  const handleAbsenceFilterChange = (filterType: string, value: string) => {
    setAbsenceFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAbsenceFilters = () => {
    setAbsenceFilters({
      class: 'all',
      dateFrom: '',
      dateTo: '',
      period: 'all',
      justified: 'all'
    });
  };

  // Fonctions pour les filtres de mouvements
  const handleMovementFilterChange = (filterType: string, value: string) => {
    setMovementFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearMovementFilters = () => {
    setMovementFilters({
      fromClass: 'all',
      toClass: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: ''
    });
  };

  // Fonction pour filtrer les transferts
  const getFilteredTransfers = () => {
    let filtered = [...transfers];
    
    // Filtre par classe d'origine
    if (movementFilters.fromClass !== 'all') {
      filtered = filtered.filter(transfer => 
        transfer.fromClassName === movementFilters.fromClass
      );
    }
    
    // Filtre par classe de destination
    if (movementFilters.toClass !== 'all') {
      filtered = filtered.filter(transfer => 
        transfer.toClassName === movementFilters.toClass
      );
    }
    
    // Filtre par statut
    if (movementFilters.status !== 'all') {
      filtered = filtered.filter(transfer => transfer.status === movementFilters.status);
    }
    
    // Filtre par date de début
    if (movementFilters.dateFrom) {
      filtered = filtered.filter(transfer => transfer.date >= movementFilters.dateFrom);
    }
    
    // Filtre par date de fin
    if (movementFilters.dateTo) {
      filtered = filtered.filter(transfer => transfer.date <= movementFilters.dateTo);
    }
    
    return filtered;
  };

  // Fonction pour calculer les statistiques d'absences
  const calculateAbsenceStats = (absences: any[]) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisWeek = absences.filter(absence => {
      const absenceDate = new Date(absence.date);
      return absenceDate >= startOfWeek;
    }).length;
    
    const thisMonth = absences.filter(absence => {
      const absenceDate = new Date(absence.date);
      return absenceDate >= startOfMonth;
    }).length;
    
    const justified = absences.filter(absence => absence.justified).length;
    const unjustified = absences.filter(absence => !absence.justified).length;
    
    return {
      total: absences.length,
      thisWeek,
      thisMonth,
      justified,
      unjustified
    };
  };

  // Fonction pour filtrer les absences
  const getFilteredAbsences = () => {
    let filtered = [...absences];
    
    // Filtre par classe
    if (absenceFilters.class !== 'all') {
      filtered = filtered.filter(absence => 
        absence.className === absenceFilters.class || 
        absence.class === absenceFilters.class
      );
    }
    
    // Filtre par période
    if (absenceFilters.period !== 'all') {
      filtered = filtered.filter(absence => absence.period === absenceFilters.period);
    }
    
    // Filtre par statut de justification
    if (absenceFilters.justified !== 'all') {
      const isJustified = absenceFilters.justified === 'justified';
      
      filtered = filtered.filter(absence => {
        // Gérer tous les cas possibles : true, false, 1, 0, "true", "false", null, undefined
        const absenceJustified = Boolean(absence.justified) && absence.justified !== "false" && absence.justified !== "0";
        
        return absenceJustified === isJustified;
      });
    }
    
    // Filtre par date de début
    if (absenceFilters.dateFrom) {
      filtered = filtered.filter(absence => absence.date >= absenceFilters.dateFrom);
    }
    
    // Filtre par date de fin
    if (absenceFilters.dateTo) {
      filtered = filtered.filter(absence => absence.date <= absenceFilters.dateTo);
    }
    
    return filtered;
  };

  // Fonctions pour le rapport d'assiduité
  const handleGenerateAbsenceReport = async (options: {
    fromDate: string;
    toDate: string;
    classId: string;
    format: 'pdf' | 'excel' | 'csv';
    includeDetails: boolean;
  }) => {
    try {
      setIsGeneratingReport(true);
      
      console.log('Génération du rapport d\'assiduité avec les options:', options);
      console.log('API reports disponible:', !!(window as any).electronAPI?.reports);
      console.log('Méthodes disponibles:', (window as any).electronAPI?.reports ? Object.keys(api.reports) : 'N/A');
      
      // Vérifier que l'API est disponible
      if (!(window as any).electronAPI?.reports) {
        throw new Error('API de rapports non disponible. Veuillez redémarrer l\'application.');
      }
      
      // Appel du service de rapport
      const result = await reportService.generateAbsenceReport(user?.schoolId || '', options);
      
      if (result.success) {
        showToast('Rapport d\'assiduité généré avec succès !', 'success');
        
        // Ouvrir le dossier des rapports
        const openResult = await reportService.openReportFolder();
        if (openResult.success) {
          showToast('Dossier des rapports ouvert.', 'info');
        }
        
        setIsAbsenceReportModalOpen(false);
      } else {
        showToast(`Erreur: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      showToast('Erreur lors de la génération du rapport. Veuillez réessayer.', 'error');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleOpenAbsenceReport = () => {
    setIsAbsenceReportModalOpen(true);
  };

  // Effet pour calculer les statistiques d'absences
  useEffect(() => {
    if (absences.length > 0) {
      const stats = calculateAbsenceStats(absences);
      setAbsenceStats(stats);
    }
  }, [absences]);

  const confirmDeleteAbsence = async () => {
    if (!absenceToDelete) return;
    
    try {
      setIsDeletingAbsence(true);
      console.log('=== DEBUG confirmDeleteAbsence ===');
      console.log('Absence à supprimer:', absenceToDelete);
      
      await deleteAbsence(absenceToDelete.id);
      console.log('Absence supprimée avec succès');
      
      showToast('Absence supprimée avec succès.', 'success');
      setIsAbsenceDeleteModalOpen(false);
      setAbsenceToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'absence:', error);
      showToast('Une erreur est survenue lors de la suppression. Veuillez réessayer.', 'error');
    } finally {
      setIsDeletingAbsence(false);
    }
  };



  const handleGenerateDocumentSubmit = (documentData: any) => {
    console.log('Generating document:', documentData);
    setAlertMessage({
      title: 'Document généré',
      message: `Le document a été généré avec succès.`,
      type: 'success'
    });
    setIsAlertModalOpen(true);
  };

  const confirmDeleteStudent = async () => {
    try {
    console.log('Deleting student:', selectedStudent);
      await deleteStudent(selectedStudent.id);
    setIsConfirmModalOpen(false);
      showToast(`L'élève ${selectedStudent?.firstName} ${selectedStudent?.lastName} a été supprimé avec succès.`, 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'élève:', error);
      showToast('Erreur lors de la suppression de l\'élève. Veuillez réessayer.', 'error');
    }
  };

  // Fonctions pour la suppression multiple des élèves
  const toggleStudentForDeletion = (studentId: string) => {
    setSelectedStudentsForDeletion(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleDeleteMultipleStudents = () => {
    if (selectedStudentsForDeletion.size > 0) {
      setIsDeleteMultipleStudentsModalOpen(true);
    }
  };

  const handleConfirmDeleteMultipleStudents = async () => {
    if (selectedStudentsForDeletion.size === 0) return;

    try {
      const studentsToDelete = Array.from(selectedStudentsForDeletion);
      
      // Supprimer chaque élève
      for (const studentId of studentsToDelete) {
        await deleteStudent(studentId);
      }
      
      // Réinitialiser la sélection
      setSelectedStudentsForDeletion(new Set());
      setIsDeleteMultipleStudentsModalOpen(false);
      
      // Afficher un toast de succès
      showToast(`${studentsToDelete.length} élève(s) supprimé(s) avec succès !`, 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression multiple des élèves:', error);
      showToast('Erreur lors de la suppression des élèves. Veuillez réessayer.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Scolarité & Gestion des élèves</h1>
          <p className="text-gray-600 dark:text-gray-400">Dossiers complets et gestion administrative</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          {/* Affichage de l'année scolaire actuelle */}
          <CurrentAcademicYearDisplay variant="compact" />
          
          {/* Sélecteur d'année scolaire (style adapté au module Students) */}
          <div className="relative">
            <select 
              value={selectedSchoolYear || ''}
              onChange={(e) => setSelectedSchoolYear(e.target.value)}
              className="appearance-none px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 min-w-[200px]"
              aria-label="Sélectionner l'année scolaire"
              disabled={academicYearLoading}
            >
              {getAcademicYearOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} {option.isCurrent ? '(Actuelle)' : ''}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Élèves',
            value: stats?.totalStudents?.toString() || '0',
            change: stats?.totalStudents > 0 ? `${stats.totalStudents} élèves` : '0 élève',
            icon: Users,
            color: 'from-blue-600 to-blue-700'
          },
          {
            title: 'Présents aujourd\'hui',
            value: stats?.presentStudents?.toString() || '0',
            change: `${stats?.attendanceRate || 0}%`,
            icon: CheckCircle,
            color: 'from-green-600 to-green-700'
          },
          {
            title: 'Absents',
            value: stats?.absentStudents?.toString() || '0',
            change: stats?.totalStudents && stats?.absentStudents ? `${((stats.absentStudents / stats.totalStudents) * 100).toFixed(1)}%` : '0%',
            icon: UserX,
            color: 'from-red-600 to-red-700'
          },
          {
            title: 'Nouveaux cette semaine',
            value: stats?.newStudentsThisWeek?.toString() || '0',
            change: stats?.newStudentsThisWeek > 0 ? `+${stats.newStudentsThisWeek}` : '0',
            icon: GraduationCap,
            color: 'from-purple-600 to-purple-700'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
            {[
              { id: 'enrollment', label: 'Inscriptions', icon: FileText },
          { id: 'list', label: 'Liste des élèves', icon: Users },
          { id: 'trombinoscope', label: 'Trombinoscope', icon: Camera },
              { id: 'movements', label: 'Mouvements', icon: Calendar },
              { id: 'absences', label: 'Absences', icon: UserX },
              { id: 'documents', label: 'Documents', icon: BookOpen }
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
          {activeTab === 'list' && (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-8 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-6 lg:mb-0">
                      <h2 className="text-3xl font-bold mb-2">Liste des Élèves</h2>
                      <p className="text-emerald-100 text-lg">Gérez et consultez tous les dossiers d'élèves</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={handleNewStudent}
                        className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Nouvel Élève
                      </button>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
              </div>

              {/* Filters and Search */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Rechercher un élève..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-72 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                    />
                  </div>
                  
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm min-w-[200px]"
                  >
                    <option value="all">Toutes les classes</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.name}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                
                  <div className="flex items-center space-x-3">
                    {selectedStudentsForDeletion.size > 0 && (
                      <button 
                        onClick={handleDeleteMultipleStudents}
                        className="inline-flex items-center px-4 py-3 bg-red-600 dark:bg-red-700 text-white rounded-xl hover:bg-red-700 dark:hover:bg-red-800 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer ({selectedStudentsForDeletion.size})
                      </button>
                    )}
                  <button 
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className={`inline-flex items-center px-4 py-3 border rounded-xl text-sm font-medium transition-all duration-200 ${
                      showAdvancedFilters 
                          ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg' 
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtres avancés
                  </button>
                  <button 
                    onClick={handleExport}
                      className="inline-flex items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </button>
                  </div>
                </div>
              </div>

              {/* Filtres avancés */}
              {showAdvancedFilters && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mr-4">
                      <Filter className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filtres avancés</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Affinez votre recherche avec des critères spécifiques</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Statut
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      >
                        <option value="all">Tous les statuts</option>
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                        <option value="transferred">Transféré</option>
                        <option value="graduated">Diplômé</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Année scolaire
                      </label>
                      <select
                        value={academicYearFilter}
                        onChange={(e) => setAcademicYearFilter(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      >
                        <option value="all">Toutes les années</option>
                        <option value="2020">2020-2021</option>
                        <option value="2021">2021-2022</option>
                        <option value="2022">2022-2023</option>
                        <option value="2023">2023-2024</option>
                        <option value="2024">2024-2025</option>
                        <option value="2025">2025-2026</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date d'inscription (début)
                      </label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date d'inscription (fin)
                      </label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Hierarchical Students Table - Finance Style */}
              {finalFilteredStudents.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl flex items-center justify-center mb-6">
                      <Users className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Aucun élève trouvé
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md text-center">
                      {finalFilteredStudents.length === 0 && students.length > 0 
                        ? "Aucun élève ne correspond aux critères de recherche et de filtrage."
                        : "Aucun élève n'a encore été ajouté à la base de données."
                      }
                    </p>
                    <button
                      onClick={() => setIsStudentModalOpen(true)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Ajouter le premier élève
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupStudentsByLevelAndClass()).map(([level, levelData]: [string, { [key: string]: any[] }]) => {
                    const levelInfoData = getLevelInfo(level);
                    const Icon = levelInfoData.icon;
                    const totalStudentsInLevel = Object.values(levelData).reduce((sum, students) => sum + students.length, 0);
                    
                    return (
                      <div key={level} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        {/* En-tête du niveau (comme Finance) */}
                        <div className={`px-6 py-4 bg-gradient-to-r ${levelInfoData.bgColor} dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-700`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 bg-gradient-to-br ${levelInfoData.color} rounded-lg flex items-center justify-center shadow-sm`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className={`text-lg font-semibold ${levelInfoData.textColor} dark:text-gray-100`}>
                                  {capitalizeLevel(level)}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {levelInfoData.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {totalStudentsInLevel} élève{totalStudentsInLevel > 1 ? 's' : ''} • {Object.keys(levelData).length} classe{Object.keys(levelData).length > 1 ? 's' : ''}
                              </p>
                              <button
                                onClick={() => toggleLevel(level)}
                                className={`p-2 rounded-lg transition-all duration-200 hover:bg-white/20 ${levelInfoData.textColor}`}
                                aria-label={expandedLevels[level] ? 'Fermer le niveau' : 'Ouvrir le niveau'}
                              >
                                <ChevronDown 
                                  className={`w-5 h-5 transition-transform duration-200 ${
                                    expandedLevels[level] ? 'rotate-180' : ''
                                  }`} 
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Classes dans ce niveau */}
                        {expandedLevels[level] && (
                          <div className="p-6 space-y-4">
                            {Object.entries(levelData).map(([className, classStudents]: [string, any[]]) => {
                              const classKey = `${level}-${className}`;
                              const isClassExpanded = expandedClasses[classKey];
                              
                              return (
                                <div key={className} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                  {/* En-tête de la classe */}
                                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-600 rounded-t-lg">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                                          <Users className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                          <h5 className="text-md font-semibold text-blue-700 dark:text-blue-300">
                                            {className}
                                          </h5>
                                          <p className="text-sm text-blue-600 dark:text-blue-400">
                                            {classStudents.length} élève{classStudents.length > 1 ? 's' : ''}
                                          </p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => toggleClass(level, className)}
                                        className="p-2 rounded-lg transition-all duration-200 hover:bg-blue-100 dark:hover:bg-blue-800/30 text-blue-600 dark:text-blue-400"
                                        aria-label={isClassExpanded ? 'Fermer la classe' : 'Ouvrir la classe'}
                                      >
                                        <ChevronDown 
                                          className={`w-4 h-4 transition-transform duration-200 ${
                                            isClassExpanded ? 'rotate-180' : ''
                                          }`} 
                                        />
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {/* Tableau des élèves de cette classe */}
                                  {isClassExpanded && (
                                    <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                        <input
                          type="checkbox"
                                    checked={selectedStudentsForDeletion.size === classStudents.length && classStudents.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                                        const allStudentIds = new Set(classStudents.map((student: any) => student.id));
                              setSelectedStudentsForDeletion(allStudentIds);
                            } else {
                              setSelectedStudentsForDeletion(new Set());
                            }
                          }}
                          className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider whitespace-nowrap">
                        N° Educmaster
                      </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider w-80 whitespace-nowrap">
                        Nom et prénoms
                      </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider whitespace-nowrap">
                                  Classe
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider whitespace-nowrap">
                                  Ancienneté
                      </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider whitespace-nowrap">
                                  Frais d'inscription
                      </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider whitespace-nowrap">
                                  Frais de réinscription
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider whitespace-nowrap">
                                  Frais de scolarité
                      </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider whitespace-nowrap">
                                  Total frais
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider whitespace-nowrap">
                                  Statut
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                              {paginateClassStudents(classStudents, level, className).map((student: any) => (
                      <tr key={student.id} className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/10 dark:hover:to-teal-900/10 transition-all duration-200 group">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedStudentsForDeletion.has(student.id)}
                            onChange={() => toggleStudentForDeletion(student.id)}
                            className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {student.educmasterNumber || student.id || ''}
                            </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap w-80">
                          <div className="flex items-center">
                            <OptimizedImage
                              src={student.photo || ''}
                              alt={`${student.firstName || ''} ${student.lastName || ''}`}
                              className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0"
                              fallbackClassName="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
                              placeholder={`${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`}
                              quality={0.7}
                              maxWidth={100}
                              maxHeight={100}
                              lazy={true}
                            />
                            <div className="ml-4 min-w-0 flex-1">
                              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {student.firstName || ''} {student.lastName || ''}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                                <span>
                                {student.dateOfBirth ? 
                                  `${new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear()} ans` : 
                                  'Âge non renseigné'
                                }
                                </span>
                                {student.gender && (
                                  <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-lg font-medium">
                                    {student.gender === 'male' ? 'M' : student.gender === 'female' ? 'F' : student.gender}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm">
                                      {student.className || 'Non assigné'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-5 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                                      student.seniority === 'new' 
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                    }`}>
                                      {student.seniority === 'new' ? 'Nouveau' : student.seniority === 'old' ? 'Ancien' : 'Non défini'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
                                      {student.inscriptionFee ? `${student.inscriptionFee.toLocaleString('fr-FR')} F CFA` : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
                                      {student.reinscriptionFee ? `${student.reinscriptionFee.toLocaleString('fr-FR')} F CFA` : '-'}
                                    </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
                                      {student.tuitionFee ? `${student.tuitionFee.toLocaleString('fr-FR')} F CFA` : '-'}
                                    </div>
                                  </td>
                                  <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100 text-right">
                                      {student.totalSchoolFees ? `${student.totalSchoolFees.toLocaleString('fr-FR')} F CFA` : '-'}
                                    </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm ${getStatusColor(student.status)}`}>
                            {student.status === 'active' ? 'Actif' : 
                             student.status === 'inactive' ? 'Inactif' : 
                             student.status === 'transferred' ? 'Transféré' : 
                             student.status === 'graduated' ? 'Diplômé' : 'Inconnu'}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleViewStudent(student)}
                              className="p-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-200"
                              title="Voir les détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditStudent(student)}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                              title="Modifier l'élève"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteStudent(student)}
                              className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                              title="Supprimer l'élève"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleMoreActions(student)}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                              title="Plus d'actions"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                            ))}
                  </tbody>
                </table>
              </div>

                                      {/* Pagination pour cette classe */}
                                      {getClassTotalPages(classStudents) > 1 && (
                                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Page {getClassPage(level, className)} sur {getClassTotalPages(classStudents)}
                                              </span>
                                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                                ({classStudents.length} élève{classStudents.length > 1 ? 's' : ''} au total)
                                              </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                  <button 
                                                onClick={() => setClassPage(level, className, getClassPage(level, className) - 1)}
                                                disabled={getClassPage(level, className) === 1}
                                                className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button 
                                                onClick={() => setClassPage(level, className, getClassPage(level, className) + 1)}
                                                disabled={getClassPage(level, className) === getClassTotalPages(classStudents)}
                                                className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
                  </div>
                  </div>
                                      )}
                </div>
                                  )}
                                </div>
                              );
                            })}
              </div>
              )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {activeTab === 'enrollment' && (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-6 lg:mb-0">
                      <h2 className="text-3xl font-bold mb-2">Centre d'Inscription</h2>
                      <p className="text-blue-100 text-lg">Gérez efficacement les inscriptions et suivez les effectifs</p>
                    </div>
                <button 
                  onClick={handleNewStudent}
                      className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Nouvelle Inscription
                    </button>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Élèves</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalStudents}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600 dark:text-green-400 font-medium">+12%</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">vs mois dernier</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Actifs</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.activeStudents}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600 dark:text-green-400 font-medium">{Math.round((stats.activeStudents / stats.totalStudents) * 100)}%</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">du total</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nouveaux</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.newStudentsThisWeek}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-purple-600 dark:text-purple-400 font-medium">Cette semaine</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Présence</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.attendanceRate}%</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-orange-600 dark:text-orange-400 font-medium">Taux moyen</span>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Inscriptions en cours */}
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mr-4">
                          <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Inscriptions en Cours</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Dossiers en attente de validation</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      {students.filter(s => s.status === 'inactive').length > 0 ? (
                        <div className="space-y-4">
                          {students.filter(s => s.status === 'inactive').slice(0, 5).map((student) => (
                            <div key={student.id} className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-all duration-200">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold">
                                  {student.firstName?.[0] || ''}{student.lastName?.[0] || ''}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {student.firstName || ''} {student.lastName || ''}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {student.className || 'Classe non assignée'} • Dossier en cours
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    Inscrit le {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString('fr-FR') : 'Date inconnue'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-xs font-medium">
                                  En attente
                                </span>
                                <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {students.filter(s => s.status === 'inactive').length > 5 && (
                            <div className="text-center pt-4">
                              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                                Voir toutes les inscriptions ({students.filter(s => s.status === 'inactive').length})
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucune inscription en cours</h4>
                          <p className="text-gray-600 dark:text-gray-400 mb-6">Tous les dossiers sont à jour</p>
                          <button 
                            onClick={handleNewStudent}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle inscription
                </button>
                        </div>
                      )}
                    </div>
                  </div>
              </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Actions Rapides</h3>
                  <div className="space-y-3">
                      <button 
                        onClick={handleNewStudent}
                        className="w-full flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <Plus className="w-5 h-5 mr-3" />
                        Nouvelle inscription
                      </button>
                      <button className="w-full flex items-center p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                        <Download className="w-5 h-5 mr-3" />
                        Exporter la liste
                      </button>
                      <button className="w-full flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                        <FileText className="w-5 h-5 mr-3" />
                        Rapport d'inscription
                      </button>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Activité Récente</h3>
                    <div className="space-y-4">
                      {students.slice(0, 3).map((student) => (
                        <div key={student.id} className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-semibold">
                            {student.firstName?.[0] || ''}{student.lastName?.[0] || ''}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {student.firstName || ''} {student.lastName || ''}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Inscrit le {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString('fr-FR') : 'Date inconnue'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trombinoscope' && (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-6 lg:mb-0">
                      <h2 className="text-3xl font-bold mb-2">Trombinoscope</h2>
                      <p className="text-indigo-100 text-lg">Visualisez et gérez les photos de classe</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setIsTrombinoscopeModalOpen(true)}
                        className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Générer Trombinoscope
                      </button>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
              </div>

              {/* Filtre par classe */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                      <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Filtrer par classe</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sélectionnez une classe pour afficher uniquement ses élèves</p>
                      </div>
                  <div className="flex items-center space-x-4">
                    <select
                      value={trombinoscopeClassFilter}
                      onChange={(e) => setTrombinoscopeClassFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-w-[200px]"
                    >
                      <option value="all">Toutes les classes</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.name}>{cls.name}</option>
                      ))}
                    </select>
                    {trombinoscopeClassFilter !== 'all' && (
                      <button
                        onClick={() => setTrombinoscopeClassFilter('all')}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Réinitialiser
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {trombinoscopeClassFilter === 'all' ? 'Total Élèves' : 'Élèves de la classe'}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {trombinoscopeClassFilter === 'all' 
                          ? students.length 
                          : students.filter(s => s.className === trombinoscopeClassFilter).length
                        }
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avec Photo</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {trombinoscopeClassFilter === 'all' 
                          ? students.filter(s => s.photo).length
                          : students.filter(s => s.className === trombinoscopeClassFilter && s.photo).length
                        }
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sans Photo</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {trombinoscopeClassFilter === 'all' 
                          ? students.filter(s => !s.photo).length
                          : students.filter(s => s.className === trombinoscopeClassFilter && !s.photo).length
                        }
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {trombinoscopeClassFilter === 'all' ? 'Classes' : 'Classe sélectionnée'}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {trombinoscopeClassFilter === 'all' ? classes.length : 1}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Photos par classe */}
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mr-4">
                          <Camera className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Photos par Classe</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Visualisation des élèves par classe</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      {classes.length > 0 ? (
                        <div className="space-y-6">
                          {classes
                            .filter(cls => trombinoscopeClassFilter === 'all' || cls.name === trombinoscopeClassFilter)
                            .map((cls) => {
                            const classStudents = students.filter(s => s.className === cls.name);
                            const studentsWithPhotos = classStudents.filter(s => s.photo);
                            
                            return (
                              <div key={cls.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {cls.name}
                                  </h4>
                                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm font-medium">
                                    {studentsWithPhotos.length}/{classStudents.length} photos
                      </span>
                    </div>
                                
                                                                 {classStudents.length > 0 ? (
                                   <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                                     {classStudents.map((student) => (
                                       <div key={student.id} className="group relative">
                                         <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                           {student.photo ? (
                                             <OptimizedImage
                                               src={student.photo}
                                               alt={`${student.firstName || ''} ${student.lastName || ''}`}
                                               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                               fallbackClassName="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                                               placeholder={`${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`}
                                               quality={0.8}
                                               maxWidth={150}
                                               maxHeight={150}
                                               lazy={true}
                                             />
                                           ) : (
                                             <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-semibold text-sm">
                                               {student.firstName?.[0] || ''}{student.lastName?.[0] || ''}
                      </div>
                    )}
                                         </div>
                                         <div className="mt-3 text-center px-1">
                                           <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                                             {student.firstName || ''} {student.lastName || ''}
                                           </p>
                                         </div>
                                       </div>
                                     ))}
                                   </div>
                                ) : (
                                  <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                      <Users className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400">Aucun élève dans cette classe</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <GraduationCap className="w-8 h-8 text-gray-400" />
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucune classe</h4>
                          <p className="text-gray-600 dark:text-gray-400">Créez des classes pour organiser les élèves</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Actions Rapides</h3>
                  <div className="space-y-3">
                      <button
                        onClick={() => setIsTrombinoscopeModalOpen(true)}
                        className="w-full flex items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                      >
                        <Camera className="w-5 h-5 mr-3" />
                        Générer trombinoscope
                      </button>
                      <button className="w-full flex items-center p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                        <Download className="w-5 h-5 mr-3" />
                        Exporter photos
                      </button>
                      <button className="w-full flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                        <RefreshCw className="w-5 h-5 mr-3" />
                        Actualiser
                      </button>
                      </div>
                    </div>

                  {/* Élèves sans photo */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      {trombinoscopeClassFilter === 'all' ? 'Élèves sans Photo' : 'Élèves sans Photo (classe sélectionnée)'}
                    </h3>
                    <div className="space-y-3">
                      {students
                        .filter(s => !s.photo && (trombinoscopeClassFilter === 'all' || s.className === trombinoscopeClassFilter))
                        .slice(0, 5)
                        .map((student) => (
                        <div key={student.id} className="flex items-center space-x-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center text-white text-xs font-semibold">
                            {student.firstName?.[0] || ''}{student.lastName?.[0] || ''}
                    </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {student.firstName || ''} {student.lastName || ''}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {student.className || 'Classe non assignée'}
                            </p>
                    </div>
                          <button className="p-1 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors">
                            <Camera className="w-4 h-4" />
                          </button>
                    </div>
                      ))}
                      {students.filter(s => !s.photo && (trombinoscopeClassFilter === 'all' || s.className === trombinoscopeClassFilter)).length > 5 && (
                        <div className="text-center pt-2">
                          <button className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-medium text-sm">
                            Voir tous ({students.filter(s => !s.photo && (trombinoscopeClassFilter === 'all' || s.className === trombinoscopeClassFilter)).length})
                          </button>
                        </div>
                      )}
                      {students.filter(s => !s.photo && (trombinoscopeClassFilter === 'all' || s.className === trombinoscopeClassFilter)).length === 0 && (
                        <div className="text-center py-4">
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {trombinoscopeClassFilter === 'all' 
                              ? 'Tous les élèves ont une photo' 
                              : 'Tous les élèves de cette classe ont une photo'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'movements' && (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 rounded-2xl p-8 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-6 lg:mb-0">
                      <h2 className="text-3xl font-bold mb-2">Mouvements des Élèves</h2>
                      <p className="text-orange-100 text-lg">Gérez les transferts et changements de classe</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleNewTransfer}
                        className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                >
                        <Calendar className="w-5 h-5 mr-2" />
                        Nouveau Transfert
                </button>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
              </div>

              {/* Filtres */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filtres</h3>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={clearMovementFilters}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Effacer les filtres
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Classe d'origine */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Classe d'origine
                    </label>
                    <select
                      value={movementFilters.fromClass}
                      onChange={(e) => handleMovementFilterChange('fromClass', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">Toutes les classes</option>
                      {classes.map(classe => (
                        <option key={classe.id} value={classe.name}>{classe.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Classe de destination */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Classe de destination
                    </label>
                    <select
                      value={movementFilters.toClass}
                      onChange={(e) => handleMovementFilterChange('toClass', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">Toutes les classes</option>
                      {classes.map(classe => (
                        <option key={classe.id} value={classe.name}>{classe.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Statut */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Statut
                    </label>
                    <select
                      value={movementFilters.status}
                      onChange={(e) => handleMovementFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="pending">En attente</option>
                      <option value="approved">Approuvé</option>
                      <option value="rejected">Rejeté</option>
                    </select>
                  </div>
                  
                  {/* Date de début */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={movementFilters.dateFrom}
                      onChange={(e) => handleMovementFilterChange('dateFrom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  
                  {/* Date de fin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={movementFilters.dateTo}
                      onChange={(e) => handleMovementFilterChange('dateTo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transferts</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{getFilteredTransfers().length}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Attente</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {getFilteredTransfers().filter(t => t.status === 'pending').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approuvés</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {getFilteredTransfers().filter(t => t.status === 'approved').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>


                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejetés</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {getFilteredTransfers().filter(t => t.status === 'rejected').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <UserX className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* État des données pour l'onglet Mouvements */}
              {loading ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Chargement des transferts...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Erreur de chargement</h3>
                    <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
                  <button 
                    onClick={refreshData}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                      <RefreshCw className="w-5 h-5 mr-2" />
                    Réessayer
                  </button>
                  </div>
                </div>
              ) : transfers.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Calendar className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Aucun transfert</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">Aucun transfert d'élève n'a encore été enregistré.</p>
                  <button 
                    onClick={handleNewTransfer}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                      <Calendar className="w-5 h-5 mr-2" />
                    Créer le premier transfert
                  </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mr-4">
                        <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Changements de classe récents</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Historique des transferts d'élèves
                          {getFilteredTransfers().length !== transfers.length && (
                            <span className="ml-2 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-xs font-medium">
                              {getFilteredTransfers().length} sur {transfers.length} résultats
                            </span>
                          )}
                        </p>
                      </div>
                      </div>
                      <button
                        onClick={() => {
                          console.log('=== RAFRAÎCHISSEMENT MANUEL DES TRANSFERTS ===');
                          fetchTransfers();
                        }}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                        title="Rafraîchir les transferts"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Rafraîchir</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                <div className="space-y-4">
                      {getFilteredTransfers().map((transfer) => {
                        // Debug pour chaque transfert affiché
                        console.log('=== DEBUG Transfer dans le tableau ===');
                        console.log('Transfer ID:', transfer.id);
                        console.log('studentName:', transfer.studentName);
                        console.log('Transfer complet:', transfer);
                        
                        return (
                        <div key={transfer.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-orange-50 dark:from-gray-900/50 dark:to-orange-900/10 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-sm">
                              <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                              <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                                {transfer.studentName || 'Nom non disponible'}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 mr-2">
                                  {transfer.fromClassName}
                                </span>
                                <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
                                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-300">
                                  {transfer.toClassName}
                                </span>
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Motif: {transfer.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {new Date(transfer.date).toLocaleDateString('fr-FR')}
                            </p>
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm ${
                              transfer.status === 'approved' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300' :
                              transfer.status === 'rejected' ? 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-700 dark:text-red-300' :
                              'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-700 dark:text-yellow-300'
                            }`}>
                              {transfer.status === 'approved' ? 'Approuvé' :
                               transfer.status === 'rejected' ? 'Rejeté' : 'En attente'}
                      </span>
                            <div className="mt-3 flex space-x-2 flex-wrap">
                              {transfer.status === 'pending' && (
                                <>
                                <button 
                                    onClick={() => handleApproveTransfer(transfer.id)}
                                    className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    Approuver
                                </button>
                                  <button 
                                    onClick={() => handleRejectTransfer(transfer.id)}
                                    className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg text-xs hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                  >
                                    Rejeter
                                  </button>
                                </>
                              )}
                              {transfer.status === 'rejected' && (
                                <span className="px-3 py-1.5 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 text-red-600 dark:text-red-300 rounded-lg text-xs">
                                  Rejeté
                                </span>
                              )}
                              
                              {/* Bouton Supprimer - disponible pour tous les statuts */}
                              <button 
                                onClick={() => handleDeleteTransfer(transfer.id)}
                                className="px-3 py-1.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg text-xs hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
                                title="Supprimer ce transfert"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Supprimer
                              </button>
                  </div>
                </div>
                </div>
                        );
                      })}
              </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'absences' && (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-pink-600 to-rose-600 rounded-2xl p-8 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-6 lg:mb-0">
                      <h2 className="text-3xl font-bold mb-2">Gestion des Absences</h2>
                      <p className="text-red-100 text-lg">Suivez et gérez l'assiduité des élèves</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={handleOpenAbsenceReport}
                        className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                      >
                        <Download className="w-5 h-5 mr-2" />
                    Rapport d'assiduité
                  </button>
                  <button 
                    onClick={handleNewAbsence}
                        className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                  >
                        <UserX className="w-5 h-5 mr-2" />
                        Saisir Absence
                  </button>
                </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Absences</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{absenceStats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <UserX className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cette Semaine</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{absenceStats.thisWeek}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ce Mois</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{absenceStats.thisMonth}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Justifiées</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{absenceStats.justified}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Non Justifiées</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{absenceStats.unjustified}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtres */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filtres</h3>
                  <button
                    onClick={clearAbsenceFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Effacer les filtres
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Filtre par classe */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Classe
                    </label>
                    <select
                      value={absenceFilters.class}
                      onChange={(e) => handleAbsenceFilterChange('class', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="all">Toutes les classes</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.name}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtre par période */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Période
                    </label>
                    <select
                      value={absenceFilters.period}
                      onChange={(e) => handleAbsenceFilterChange('period', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="all">Toutes les périodes</option>
                      <option value="morning">Matin</option>
                      <option value="afternoon">Après-midi</option>
                      <option value="evening">Soir</option>
                      <option value="full">Journée complète</option>
                    </select>
                  </div>

                  {/* Filtre par statut de justification */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Statut
                    </label>
                    <select
                      value={absenceFilters.justified}
                      onChange={(e) => handleAbsenceFilterChange('justified', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="justified">Justifiées</option>
                      <option value="unjustified">Non justifiées</option>
                    </select>
                  </div>

                  {/* Filtre par date de début */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={absenceFilters.dateFrom}
                      onChange={(e) => handleAbsenceFilterChange('dateFrom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>

                  {/* Filtre par date de fin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={absenceFilters.dateTo}
                      onChange={(e) => handleAbsenceFilterChange('dateTo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* État des données pour l'onglet Absences */}
                {loading ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Chargement des absences...</p>
                  </div>
                  </div>
                ) : error ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Erreur de chargement</h3>
                    <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
                    <button 
                      onClick={refreshData}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Réessayer
                    </button>
                  </div>
                  </div>
                ) : absences.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <UserX className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Aucune absence enregistrée
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Aucune absence n'a encore été saisie dans le système.
                    </p>
                    <button 
                      onClick={handleNewAbsence}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <UserX className="w-5 h-5 mr-2" />
                      Saisir la première absence
                    </button>
                  </div>
                  </div>
                ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mr-4">
                        <UserX className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Historique des absences</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Suivi de l'assiduité des élèves</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {/* Compteur de résultats */}
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getFilteredAbsences().length} absence{getFilteredAbsences().length !== 1 ? 's' : ''} trouvée{getFilteredAbsences().length !== 1 ? 's' : ''}
                        {getFilteredAbsences().length !== absences.length && (
                          <span className="text-gray-500 dark:text-gray-500">
                            {' '}(sur {absences.length} total)
                          </span>
                        )}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      {getFilteredAbsences().map((absence, index) => {
                        // Debug: vérifier les données de chaque absence
                        console.log(`=== DEBUG Absence ${index + 1} ===`);
                        console.log('absence complète:', absence);
                        console.log('studentName:', absence.studentName);
                        console.log('className:', absence.className);
                        console.log('class:', absence.class);
                        
                        return (
                        <div key={index} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-red-50 dark:from-gray-900/50 dark:to-red-900/10 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm">
                          <UserX className="w-6 h-6 text-white" />
                        </div>
                        <div>
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {absence.studentName || 'Nom non disponible'}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 mr-2">
                                  {absence.className || absence.class || 'Classe non disponible'}
                                </span>
                                <span className="text-gray-400 mx-2">•</span>
                                <span className="text-gray-600 dark:text-gray-400">{translatePeriod(absence.period)}</span>
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                {absence.date} • {absence.reason}
                              </p>
                        </div>
                      </div>
                      <div className="text-right">
                            <div className="flex space-x-2 mb-3">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm ${
                                absence.justified ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300' : 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-700 dark:text-red-300'
                          }`}>
                            {absence.justified ? 'Justifiée' : 'Non justifiée'}
                          </span>
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm ${
                                absence.parentNotified ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300' : 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-700 dark:text-yellow-300'
                          }`}>
                            {absence.parentNotified ? 'Parent informé' : 'À notifier'}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                              <button 
                                onClick={() => handleJustifyAbsence(absence)}
                                disabled={absence.justified}
                                className={`px-4 py-2 text-white rounded-lg text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center ${
                                  absence.justified 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                }`}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                {absence.justified ? 'Justifiée' : 'Justifier'}
                          </button>
                              <button 
                                onClick={() => handleContactParent(absence)}
                                disabled={absence.parentNotified}
                                className={`px-4 py-2 text-white rounded-lg text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center ${
                                  absence.parentNotified 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                                }`}
                              >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                {absence.parentNotified ? 'Contacté' : 'Contacter'}
                              </button>
                              <button 
                                onClick={() => handleDeleteAbsence(absence)}
                                className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg text-sm hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                        );
                      })}
                  </div>
              </div>
                </div>
              )}
            </div>
          )}




          {activeTab === 'documents' && (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-6 lg:mb-0">
                      <h2 className="text-3xl font-bold mb-2">Éditions et Documents</h2>
                      <p className="text-purple-100 text-lg">Générez et gérez tous les documents officiels</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleGenerateDocument}
                        className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                >
                        <FileText className="w-5 h-5 mr-2" />
                        Générer Document
                </button>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
              </div>


              {/* Document Types Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Listes */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200 group">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <Users className="w-6 h-6 text-white" />
                  </div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Listes</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Listes d'élèves par classe, niveau ou critères spécifiques</p>
                  <button 
                    onClick={handleGenerateList}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Générer Liste
                  </button>
                </div>

                {/* 2. Cartes scolaires */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200 group">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Cartes scolaires</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Cartes d'identité scolaires et badges d'élèves</p>
                  <button 
                    onClick={handleGenerateCardId}
                    className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Générer Carte ID
                  </button>
                </div>

                {/* 3. Certificats */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200 group">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <FileText className="w-6 h-6 text-white" />
                  </div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Certificats</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Génération de certificats de scolarité et attestations officielles</p>
                  <button 
                    onClick={handleGenerateCertificate}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Générer Certificat
                  </button>
                </div>

                {/* 4. Attestations */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200 group">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <Award className="w-6 h-6 text-white" />
                  </div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Attestations</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Attestations de réussite, diplômes et mentions honorifiques</p>
                  <button 
                    onClick={handleGenerateAttestation}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Générer Attestation
                  </button>
                </div>

                {/* 5. Rapports */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200 group">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Rapports</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Rapports d'assiduité et bulletins de notes</p>
                  <button 
                    onClick={handleGenerateReport}
                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Générer Rapport
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={handleSaveStudent}
        studentData={selectedStudent}
        isEdit={isEditMode}
        isReadOnly={!isEditMode && selectedStudent !== null}
        classes={classes}
        currentAcademicYear={selectedSchoolYear}
      />

      <AbsenceModal
        isOpen={isAbsenceModalOpen}
        onClose={() => setIsAbsenceModalOpen(false)}
        onSave={handleSaveAbsence}
        students={students.map(s => ({ 
          id: s.id, 
          firstName: s.firstName,
          lastName: s.lastName,
          name: `${s.firstName} ${s.lastName}`, 
          class: s.className || '',
          className: s.className || '',
          classId: s.classId || ''
        })) as any}
        classes={classes}
      />


      <ClassTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSave={handleSaveTransfer}
        students={students.map(s => ({ 
          id: s.id, 
          name: `${s.firstName} ${s.lastName}`, 
          class: s.className || '',
          classId: s.classId || ''
        })) as any}
        classes={classes}
      />

      <DocumentGenerationModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        onGenerate={handleGenerateDocumentSubmit}
        students={students.map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, class: s.className || '' })) as any}
      />

      <TrombinoscopeModal
        isOpen={isTrombinoscopeModalOpen}
        onClose={() => setIsTrombinoscopeModalOpen(false)}
        students={students.map(s => ({ ...s, class: s.className || '' })) as any}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteStudent}
        title="Supprimer cet élève ?"
        message={`Êtes-vous sûr de vouloir supprimer l'élève ${selectedStudent?.firstName} ${selectedStudent?.lastName} ? Cette action est irréversible.`}
        type="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
      />

      <ConfirmModal
        isOpen={isDeleteMultipleStudentsModalOpen}
        onClose={() => setIsDeleteMultipleStudentsModalOpen(false)}
        onConfirm={handleConfirmDeleteMultipleStudents}
        title="Supprimer les élèves sélectionnés ?"
        message={`Êtes-vous sûr de vouloir supprimer ${selectedStudentsForDeletion.size} élève(s) sélectionné(s) ? Cette action est irréversible.`}
        type="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
      />

      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title={alertMessage.title}
        message={alertMessage.message}
        type={alertMessage.type}
      />

      {/* Toast de notification (comme Planning) */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ease-in-out ${
          toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <div className={`p-4 rounded-lg shadow-lg border ${
            toast.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : toast.type === 'error'
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {toast.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : toast.type === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  toast.type === 'success' 
                    ? 'text-green-800 dark:text-green-200' 
                    : toast.type === 'error'
                    ? 'text-red-800 dark:text-red-200'
                    : 'text-blue-800 dark:text-blue-200'
                }`}>
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => setToast(prev => ({ ...prev, show: false }))}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <TransferDeleteConfirmationModal
        isOpen={isTransferDeleteModalOpen}
        onClose={() => {
          setIsTransferDeleteModalOpen(false);
          setTransferToDelete(null);
        }}
        onConfirm={confirmDeleteTransfer}
        transfer={transferToDelete}
        isLoading={isDeletingTransfer}
      />

      <AbsenceDeleteConfirmationModal
        isOpen={isAbsenceDeleteModalOpen}
        onClose={() => {
          setIsAbsenceDeleteModalOpen(false);
          setAbsenceToDelete(null);
        }}
        onConfirm={confirmDeleteAbsence}
        absence={absenceToDelete}
        isLoading={isDeletingAbsence}
      />

      {studentForContact && (
        <ParentContactModal
          isOpen={isParentContactModalOpen}
          onClose={() => {
            setIsParentContactModalOpen(false);
            setStudentForContact(null);
            setAbsenceForContact(null);
          }}
          student={studentForContact}
          absence={absenceForContact}
          onParentContacted={handleParentContacted}
          onParentNotContacted={handleParentNotContacted}
        />
      )}

      {/* Modal de rapport d'assiduité */}
      <AbsenceReportModal
        isOpen={isAbsenceReportModalOpen}
        onClose={() => setIsAbsenceReportModalOpen(false)}
        onGenerateReport={handleGenerateAbsenceReport}
        classes={classes}
        isGenerating={isGeneratingReport}
      />

      {/* Modals de génération de documents */}
      <CertificateGenerationModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        onGenerate={handleGenerateDocumentSubmit}
        students={students.map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, class: s.className || '' }))}
        classes={classes}
      />

      <AttestationGenerationModal
        isOpen={isAttestationModalOpen}
        onClose={() => setIsAttestationModalOpen(false)}
        onGenerate={handleGenerateDocumentSubmit}
        students={students.map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, class: s.className || '' }))}
        classes={classes}
      />

      <ListGenerationModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        onGenerate={handleGenerateDocumentSubmit}
        students={students.map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, class: s.className || '' }))}
        classes={classes}
      />

      <ReportGenerationModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onGenerate={handleGenerateDocumentSubmit}
        students={students.map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, class: s.className || '' }))}
        classes={classes}
      />

      <CardIdGenerationModal
        isOpen={isCardIdModalOpen}
        onClose={() => setIsCardIdModalOpen(false)}
        onGenerate={handleGenerateDocumentSubmit}
        students={students.map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, class: s.className || '' }))}
        classes={classes}
      />
    </div>
  );
};

export default Students;