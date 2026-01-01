import React, { useState, useEffect, useMemo } from 'react';
import { useAcademicYearState } from '../../hooks/useAcademicYearState';
import AcademicYearSelector from '../common/AcademicYearSelector';
import CurrentAcademicYearDisplay from '../common/CurrentAcademicYearDisplay';
import { 
  Calendar, 
  Plus, 
  Clock,
  Users,
  BookOpen,
  Settings,
  Edit,
  Trash2,
  BarChart3,
  MapPin,
  User,
  Building,
  FileText,
  Hash,
  Printer,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { 
  ClassModal, 
  RoomModal, 
  SubjectModal, 
  BreakModal, 
  TeacherAssignmentModal, 
  ScheduleEntryModal, 
  TeacherAvailabilityModal, 
  WorkHoursModal,
  DeleteConfirmationModal,
  RoomPlanningModal,
  RoomsPrintModal,
  ClassesPrintModal
} from '../modals';
import EnhancedRoomReservationModal from '../modals/EnhancedRoomReservationModal';
import MultipleSubjectsModal from '../modals/MultipleSubjectsModal';
import { planningService } from '../../services/planningService';
// import CahierJournalDashboard from '../../modules/planning/components/CahierJournal/CahierJournalDashboard';
// import FichesPedagogiquesDashboard from '../../modules/planning/components/FichesPedagogiques/FichesPedagogiquesDashboard';
// import CahierTexteApp from '../../modules/planning/components/CahierTextes/CahierTexteApp';
import EmploiDuTempsModern from './EmploiDuTempsModern';
import { usePlanningData } from '../../hooks/usePlanningData';
import { PlanningRoom } from '../../types/planning';
import { reservationService, Reservation } from '../../services/reservationService';
import { useUser } from '../../contexts/UserContext';
import TeachersTab from './Planning/teachers/TeachersTab';
import AvailabilityTab from './Planning/availability/AvailabilityTab';
import ScheduleTab from './Planning/schedule/ScheduleTab';
import WorkedHoursTab from './Planning/worked-hours/WorkedHoursTab';

const Planning: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('rooms');
  // (les états des modals enseignants existent déjà plus bas: isTeacherAssignmentModalOpen, isTeacherAvailabilityModalOpen)
  
  // Gestion de l'année scolaire
  const { selectedAcademicYear, setSelectedAcademicYear } = useAcademicYearState('planning');

  
  // Modal states
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [isRoomReservationModalOpen, setIsRoomReservationModalOpen] = useState(false);
  const [isTeacherAssignmentModalOpen, setIsTeacherAssignmentModalOpen] = useState(false);
  const [isScheduleEntryModalOpen, setIsScheduleEntryModalOpen] = useState(false);
  const [isTeacherAvailabilityModalOpen, setIsTeacherAvailabilityModalOpen] = useState(false);
  const [isWorkHoursModalOpen, setIsWorkHoursModalOpen] = useState(false);
  const [isRoomPlanningModalOpen, setIsRoomPlanningModalOpen] = useState(false);
  const [selectedRoomForPlanning, setSelectedRoomForPlanning] = useState<PlanningRoom | null>(null);
  const [isRoomsPrintModalOpen, setIsRoomsPrintModalOpen] = useState(false);
  const [isClassesPrintModalOpen, setIsClassesPrintModalOpen] = useState(false);
  const [isMultipleSubjectsModalOpen, setIsMultipleSubjectsModalOpen] = useState(false);

  const [selectedSubjectLevel, setSelectedSubjectLevel] = useState('all');
  const [selectedSubjectsForDeletion, setSelectedSubjectsForDeletion] = useState<Set<string>>(new Set());
  const [isDeleteMultipleModalOpen, setIsDeleteMultipleModalOpen] = useState(false);
  
  // État pour gérer le pliage/dépliage des regroupements de matières
  const [collapsedGroups, setCollapsedGroups] = useState<{ [key: string]: boolean }>({
    'Maternelle': true,
    'Primaire': true,
    'Secondaire 1er cycle': true,
    'Secondaire 2nd cycle': true
  });
  
  // État pour gérer le pliage/dépliage des classes dans le 2nd cycle
  const [collapsedClasses, setCollapsedClasses] = useState<{ [key: string]: boolean }>({});
  
  // États pour la recherche et filtrage des enseignants
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  
  // État pour tous les employés (enseignants + personnel)
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  
  // États pour les heures travaillées
  const [workedHours, setWorkedHours] = useState<any[]>([]);
  const [workedHoursLoading, setWorkedHoursLoading] = useState(false);
  const [workedHoursError, setWorkedHoursError] = useState<string | null>(null);
  
  // États pour la suppression multiple des salles
  const [selectedRoomsForDeletion, setSelectedRoomsForDeletion] = useState<Set<string>>(new Set());
  const [isDeleteMultipleRoomsModalOpen, setIsDeleteMultipleRoomsModalOpen] = useState(false);
  
  // États pour la suppression multiple des classes
  const [selectedClassesForDeletion, setSelectedClassesForDeletion] = useState<Set<string>>(new Set());
  const [isDeleteMultipleClassesModalOpen, setIsDeleteMultipleClassesModalOpen] = useState(false);
  
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'info'
  });
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // État pour les réservations
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationsError, setReservationsError] = useState<string | null>(null);
  
  // États pour la suppression des réservations
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [isDeleteReservationModalOpen, setIsDeleteReservationModalOpen] = useState(false);
  const [isDeletingReservation, setIsDeletingReservation] = useState(false);
  
  // États pour la sélection multiple des réservations
  const [selectedReservationsForDeletion, setSelectedReservationsForDeletion] = useState<Set<string>>(new Set());
  const [isDeleteMultipleReservationsModalOpen, setIsDeleteMultipleReservationsModalOpen] = useState(false);
  const [isDeletingMultipleReservations, setIsDeletingMultipleReservations] = useState(false);

  // État pour le filtre par classe des réservations
  const [reservationClassFilter, setReservationClassFilter] = useState<string>('');
  const [reservationRoomTypeFilter, setReservationRoomTypeFilter] = useState<string | null>(null);

  const {
    classes,
    rooms,
    subjects,
    teachers,
    schedule,
    breaks,
    workHours,
    loading,
    error,
    refreshData,
    createClass,
    updateClass,
    deleteClass,
    createRoom,
    updateRoom,
    deleteRoom,
    createSubject,
    updateSubject,
    deleteSubject,
    createMultipleSubjects
  } = usePlanningData();

  // Debug: Vérifier les données des enseignants
  console.log('🔍 Planning - Teachers data:', teachers);
  console.log('🔍 Planning - Teachers length:', teachers?.length);

  // Filtrage des enseignants
  const filteredTeachers = useMemo(() => {
    if (!teachers) return [];
    
    return teachers.filter(teacher => {
      const matchesSearch = !searchTerm || 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !filterStatus || teacher.status === filterStatus;
      
      const matchesPosition = !filterPosition || 
        (filterPosition === 'enseignant' && teacher.position?.toLowerCase().includes('enseignant')) ||
        (filterPosition === 'professeur' && teacher.position?.toLowerCase().includes('professeur'));
      
      return matchesSearch && matchesStatus && matchesPosition;
    });
  }, [teachers, searchTerm, filterStatus, filterPosition]);



  // Fonction utilitaire pour gérer les équipements
  const formatEquipment = (equipment: any): string => {
    if (!equipment) return 'Aucun équipement';
    
    // Si c'est déjà un tableau
    if (Array.isArray(equipment)) {
      return equipment.length > 0 ? equipment.join(', ') : 'Aucun équipement';
    }
    
    // Si c'est une chaîne JSON
    if (typeof equipment === 'string') {
      try {
        const parsed = JSON.parse(equipment);
        if (Array.isArray(parsed)) {
          return parsed.length > 0 ? parsed.join(', ') : 'Aucun équipement';
        }
      } catch (e) {
        // Si le parsing échoue, traiter comme une chaîne simple
        return equipment || 'Aucun équipement';
      }
    }
    
    return 'Aucun équipement';
  };

  // Fonction pour calculer le nombre de matières par classe
  const getSubjectsCountForClass = (classLevel: string): number => {
    if (!subjects || !classLevel) return 0;
    
    // Filtrer les matières selon le niveau de la classe
    const classSubjects = subjects.filter(subject => subject.level === classLevel);
    return classSubjects.length;
  };

  // Fonction pour compter les matières assignées à une classe depuis le schedule
  const getAssignedSubjectsCountForClass = (classId: string): number => {
    if (!schedule || !subjects || !classId) return 0;
    
    // Trouver toutes les entrées du schedule pour cette classe
    const classScheduleEntries = schedule.filter(entry => entry.class_id === classId);
    
    // Récupérer les matières uniques assignées à cette classe
    const assignedSubjects = classScheduleEntries.reduce((acc, entry) => {
      const subject = subjects.find(s => s.id === entry.subject_id);
      if (subject && !acc.find(s => s.id === subject.id)) {
        acc.push(subject);
      }
      return acc;
    }, [] as any[]);
    
    return assignedSubjects.length;
  };

  // Fonction pour compter les matières d'une classe selon son niveau et type d'assignation
  const getClassSubjectsCount = (classId: string, classLevel: string): number => {
    if (!subjects || !classLevel) return 0;
    
    const level = classLevel.toLowerCase();
    
    // Pour Maternelle et Primaire : toutes les matières du niveau sont automatiquement assignées
    if (level.includes('maternelle') || level.includes('primaire')) {
      const classSubjects = subjects.filter(subject => subject.level === level);
      return classSubjects.length;
    }
    
    // Pour Secondaire : compter les matières réellement assignées
    return getAssignedSubjectsCountForClass(classId);
  };

  // Fonction pour récupérer l'enseignant titulaire d'une classe depuis les affectations
  // UNIQUEMENT pour les niveaux maternelle et primaire (un seul enseignant par classe)
  const getClassTeacherName = (classId: string): string => {
    if (!teachers || !classes) return 'Non assigné';
    
    // Trouver la classe pour vérifier son niveau
    const classObj = classes.find(c => c.id === classId);
    if (!classObj) return 'Non assigné';
    
    const level = classObj.level.toLowerCase();
    
    // Seulement pour maternelle et primaire (un seul enseignant par classe)
    if (!level.includes('maternelle') && !level.includes('primaire')) {
      return 'Non assigné'; // Pour le secondaire, l'utilisateur doit définir le titulaire manuellement
    }
    
    // Chercher dans les enseignants enrichis avec leurs affectations
    // Les enseignants ont une propriété 'classes' qui contient les classes assignées
    const assignedTeacher = teachers.find(teacher => {
      // Vérifier si l'enseignant a cette classe dans ses affectations
      return teacher.classes && teacher.classes.includes(classObj.name);
    });
    
    if (assignedTeacher) {
      return `${assignedTeacher.first_name || ''} ${assignedTeacher.last_name || ''}`.trim() || assignedTeacher.name || 'Enseignant inconnu';
    }
    
    return 'Non assigné';
  };

  // Fonction pour récupérer la salle assignée à une classe depuis les réservations
  const getClassRoomName = (classId: string): string => {
    if (!reservations || !rooms || !classes) return 'Non assignée';
    
    // Trouver la classe pour vérifier son niveau
    const classObj = classes.find(c => c.id === classId);
    if (!classObj) return 'Non assignée';
    
    // Chercher la réservation la plus récente pour cette classe
    const classReservations = reservations.filter(reservation => reservation.classId === classId);
    if (classReservations.length === 0) return 'Non assignée';
    
    // Prendre la réservation la plus récente
    const latestReservation = classReservations.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    
    // Récupérer le nom de la salle
    const room = rooms.find(r => r.id === latestReservation.roomId);
    if (!room) return 'Non assignée';
    
    return room.name || 'Salle inconnue';
  };

  // Fonction pour récupérer le nom de l'enseignant d'une réservation
  const getReservationTeacherName = (reservation: any): string => {
    if (!teachers) return reservation.teacher_name || 'Enseignant non spécifié';
    
    // Si on a un teacher_id dans la réservation, utiliser celui-ci
    if (reservation.teacherId) {
      const teacher = teachers.find(t => t.id === reservation.teacherId);
      return teacher ? teacher.name : reservation.teacher_name || 'Enseignant non spécifié';
    }
    
    // Sinon, utiliser le nom stocké dans la réservation
    return reservation.teacher_name || 'Enseignant non spécifié';
  };

  // Fonction pour afficher le sujet d'une réservation
  const getReservationSubjectDisplay = (reservation: any): string => {
    // Trouver la classe pour déterminer le niveau
    const classObj = classes.find(c => c.id === reservation.classId);
    
    if (classObj) {
      const classLevel = classObj.level.toLowerCase();
      
      // Vérifier si c'est une classe maternelle ou primaire (enseignant polyvalent)
      if (classLevel.includes('maternelle') || classLevel.includes('primaire')) {
        // Compter les matières selon le niveau
        const classSubjects = subjects.filter(subject => {
          if (classLevel.includes('maternelle')) {
            return subject.level === 'maternelle';
          } else if (classLevel.includes('primaire')) {
            return subject.level === 'primaire';
          }
          return false;
        });
        
        return `${classSubjects.length} matières`;
      }
    }
    
    // Pour les classes secondaires, essayer de récupérer le nom de la matière depuis l'ID
    if (reservation.subjectId && reservation.subjectId !== 'all-subjects') {
      const subject = subjects.find(s => s.id === reservation.subjectId);
      if (subject) {
        return subject.name;
      }
    }
    
    // Fallback: utiliser les champs de la réservation
    return reservation.subject_name || reservation.subject || 'Matière non spécifiée';
  };

  // Fonction pour trier les classes selon l'ordre éducatif logique
  const sortClassesByEducationalOrder = (classes: any[]) => {
    if (!classes) return [];
    
    // Ordre éducatif défini avec variations possibles
    const educationalOrder = [
      'maternelle',
      'CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2',
      '6ème', '6eme', '6eme', '5ème', '5eme', '4ème', '4eme', '3ème', '3eme',
      '2nde', '1ère', '1ere', 'Tle', 'terminale', 'Tle'
    ];
    
    return classes.sort((a, b) => {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      
      // Fonction pour trouver l'index d'une classe dans l'ordre éducatif
      const getEducationalIndex = (className: string) => {
        return educationalOrder.findIndex(order => {
          const orderLower = order.toLowerCase();
          return className.includes(orderLower) || 
                 className === orderLower ||
                 className.startsWith(orderLower + ' ') ||
                 className.endsWith(' ' + orderLower);
        });
      };
      
      const indexA = getEducationalIndex(nameA);
      const indexB = getEducationalIndex(nameB);
      
      // Si les deux classes sont dans l'ordre éducatif, trier par index
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // Si une seule classe est dans l'ordre éducatif, elle vient en premier
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // Si aucune classe n'est dans l'ordre éducatif, trier alphabétiquement
      return nameA.localeCompare(nameB);
    });
  };

  // Fonction pour déterminer le type de salle selon le niveau scolaire
  const getRoomTypeForClass = (classLevel: string): 'fixed' | 'flexible' | 'mixed' => {
    const level = classLevel.toLowerCase();
    
    // Maternelle et Primaire : salles fixes
    if (level.includes('maternelle') || level.includes('primaire')) {
      return 'fixed';
    }
    
    // Secondaire : logique mixte (à configurer par l'école)
    if (level.includes('secondaire') || level.includes('6') || level.includes('5') || 
        level.includes('4') || level.includes('3') || level.includes('2nde') || 
        level.includes('1ère') || level.includes('tle')) {
      return 'mixed'; // Par défaut, mais peut être configuré par classe
    }
    
    return 'flexible'; // Par défaut pour les autres cas
  };

  // Fonction pour vérifier si une classe nécessite des réservations de salles
  const requiresRoomReservation = (classLevel: string): boolean => {
    const roomType = getRoomTypeForClass(classLevel);
    return roomType === 'flexible' || roomType === 'mixed';
  };

  // Fonction pour obtenir les salles disponibles pour une classe selon son type
  const getAvailableRoomsForClass = (classId: string, rooms: any[]): any[] => {
    if (!rooms || !classes) return [];
    
    const classObj = classes.find(c => c.id === classId);
    if (!classObj) return [];
    
    const roomType = getRoomTypeForClass(classObj.level);
    
    switch (roomType) {
      case 'fixed':
        // Pour les salles fixes, retourner uniquement la salle attitrée de la classe
        return rooms.filter(room => room.id === classObj.room_id);
      
      case 'flexible':
        // Pour les salles flexibles, retourner toutes les salles polyvalentes
        return rooms.filter(room => room.type === 'polyvalente' || room.type === 'laboratoire');
      
      case 'mixed':
        // Pour les salles mixtes, retourner la salle attitrée + les salles polyvalentes
        const fixedRoom = rooms.find(room => room.id === classObj.room_id);
        const flexibleRooms = rooms.filter(room => 
          room.type === 'polyvalente' || room.type === 'laboratoire'
        );
        return fixedRoom ? [fixedRoom, ...flexibleRooms] : flexibleRooms;
      
      default:
        return rooms;
    }
  };


  // Fonction pour obtenir les matières par niveau
  const getSubjectsByLevel = (level: string) => {
    if (!subjects) return [];
    if (level === 'all') return subjects;
    return subjects.filter(subject => subject.level === level);
  };

  // Fonction utilitaire pour formater le niveau scolaire - Version 2.0 - 2025-01-17
  const formatSubjectLevel = (level: string) => {
    console.log('🔍 formatSubjectLevel appelée avec:', level);
    switch(level) {
      case 'maternelle': return 'Maternelle';
      case 'primaire': return 'Primaire';
      case 'secondaire_1er_cycle': return '1er Cycle';
      case 'secondaire_2nd_cycle': return '2nd Cycle';
      default: return level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Fonction utilitaire pour récupérer le nom de la classe
  const getClassName = (classId: string) => {
    console.log('🔍 getClassName appelée avec:', classId);
    if (!classId) return 'Classe non définie';
    const correspondingClass = classes.find(cls => cls.id === classId);
    console.log('🔍 classe trouvée:', correspondingClass?.name);
    return correspondingClass ? correspondingClass.name : `Classe ${classId}`;
  };

  // Fonction pour regrouper les matières par niveau scolaire
  const getSubjectsGroupedByLevel = () => {
    if (!subjects) return [];
    
    const groupedSubjects: { [key: string]: any } = {
      'Maternelle': [],
      'Primaire': [],
      'Secondaire 1er cycle': [],
      'Secondaire 2nd cycle': {}
    };

    subjects.forEach(subject => {
      const level = subject.level;
      if (level === 'maternelle') {
        groupedSubjects['Maternelle'].push(subject);
      } else if (level === 'primaire') {
        groupedSubjects['Primaire'].push(subject);
      } else if (level === 'secondaire_1er_cycle') {
        groupedSubjects['Secondaire 1er cycle'].push(subject);
      } else if (level === 'secondaire_2nd_cycle') {
        // Pour le 2nd cycle, grouper par classe dans le groupe principal
        const className = getClassName(subject.classId);
        
        if (!groupedSubjects['Secondaire 2nd cycle'][className]) {
          groupedSubjects['Secondaire 2nd cycle'][className] = [];
        }
        groupedSubjects['Secondaire 2nd cycle'][className].push(subject);
      }
    });

    return groupedSubjects;
  };

  // Fonction pour gérer la sélection/désélection des matières pour suppression
  const toggleSubjectForDeletion = (subjectId: string) => {
    setSelectedSubjectsForDeletion(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId);
      } else {
        newSet.add(subjectId);
      }
      return newSet;
    });
  };

  // Fonction pour gérer le pliage/dépliage des regroupements
  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };
  
  // Fonction pour gérer le pliage/dépliage des classes dans le 2nd cycle
  const toggleClassCollapse = (className: string) => {
    setCollapsedClasses(prev => ({
      ...prev,
      [className]: !prev[className]
    }));
  };

  // Fonction pour ouvrir le modal de suppression multiple
  const handleDeleteMultipleSubjects = () => {
    if (selectedSubjectsForDeletion.size > 0) {
      setIsDeleteMultipleModalOpen(true);
    }
  };

  // Fonction pour afficher un toast
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

  // Fonction pour supprimer plusieurs matières
  const handleConfirmDeleteMultipleSubjects = async () => {
    if (selectedSubjectsForDeletion.size === 0) return;

    try {
      const subjectsToDelete = Array.from(selectedSubjectsForDeletion);
      
      // Supprimer chaque matière
      for (const subjectId of subjectsToDelete) {
        await deleteSubject(subjectId);
      }

      // Réinitialiser la sélection
      setSelectedSubjectsForDeletion(new Set());
      setIsDeleteMultipleModalOpen(false);
      
      // Afficher un toast de succès
      showToast(`${subjectsToDelete.length} matière(s) supprimée(s) avec succès !`, 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression multiple des matières:', error);
      showToast('Erreur lors de la suppression des matières. Veuillez réessayer.', 'error');
    }
  };

  // Fonctions pour la suppression multiple des salles
  const toggleRoomForDeletion = (roomId: string) => {
    setSelectedRoomsForDeletion(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roomId)) {
        newSet.delete(roomId);
      } else {
        newSet.add(roomId);
      }
      return newSet;
    });
  };

  const handleDeleteMultipleRooms = () => {
    if (selectedRoomsForDeletion.size > 0) {
      setIsDeleteMultipleRoomsModalOpen(true);
    }
  };

  const handleConfirmDeleteMultipleRooms = async () => {
    if (selectedRoomsForDeletion.size === 0) return;

    try {
      const roomsToDelete = Array.from(selectedRoomsForDeletion);
      
      // Delete each room
      for (const roomId of roomsToDelete) {
        await deleteRoom(roomId);
      }

      // Reset selection and close modal
      setSelectedRoomsForDeletion(new Set());
      setIsDeleteMultipleRoomsModalOpen(false);
      
      // Show success toast
      showToast(`${roomsToDelete.length} salle(s) supprimée(s) avec succès !`, 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression multiple des salles:', error);
      showToast('Erreur lors de la suppression des salles. Veuillez réessayer.', 'error');
    }
  };

  // Fonctions pour la suppression multiple des classes
  const toggleClassForDeletion = (classId: string) => {
    setSelectedClassesForDeletion(prev => {
      const newSet = new Set(prev);
      if (newSet.has(classId)) {
        newSet.delete(classId);
      } else {
        newSet.add(classId);
      }
      return newSet;
    });
  };

  const handleDeleteMultipleClasses = () => {
    if (selectedClassesForDeletion.size > 0) {
      setIsDeleteMultipleClassesModalOpen(true);
    }
  };

  const handleConfirmDeleteMultipleClasses = async () => {
    if (selectedClassesForDeletion.size === 0) return;

    try {
      const classesToDelete = Array.from(selectedClassesForDeletion);
      
      // Delete each class
      for (const classId of classesToDelete) {
        await deleteClass(classId);
      }

      // Reset selection and close modal
      setSelectedClassesForDeletion(new Set());
      setIsDeleteMultipleClassesModalOpen(false);
      
      // Show success toast
      showToast(`${classesToDelete.length} classe(s) supprimée(s) avec succès !`, 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression multiple des classes:', error);
      showToast('Erreur lors de la suppression des classes. Veuillez réessayer.', 'error');
    }
  };

  // État pour le modal de suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'occupied': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'reserved': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Modal handlers
  const handleNewClass = () => {
    setIsEditMode(false);
    setSelectedItem(null);
    setIsClassModalOpen(true);
  };

  const handleNewRoom = () => {
    setIsEditMode(false);
    setSelectedItem(null);
    setIsRoomModalOpen(true);
  };

  const handleNewSubject = () => {
    setIsEditMode(false);
    setSelectedItem({ type: 'subject' });
    setIsSubjectModalOpen(true);
  };

  const handleAddMultipleSubjects = () => {
    setIsMultipleSubjectsModalOpen(true);
  };



  const handleConfigureWorkHours = () => {
    setIsWorkHoursModalOpen(true);
  };

  const handleNewScheduleEntry = () => {
    setIsEditMode(false);
    setSelectedItem(null);
    setIsScheduleEntryModalOpen(true);
  };

  const handleNewReservation = () => {
    setIsEditMode(false);
    setSelectedItem(null);
    setIsRoomReservationModalOpen(true);
  };

  const handleNewAssignment = () => {
    setIsEditMode(false);
    setSelectedItem(null);
    setIsTeacherAssignmentModalOpen(true);
  };

  const handleTeacherAvailability = () => {
    setIsEditMode(false);
    setSelectedItem(null);
    setIsTeacherAvailabilityModalOpen(true);
  };

  // Fonctions de gestion des enseignants
  const handleViewTeacherPlanning = (teacher: PlanningTeacher) => {
    setIsEditMode(false);
    setSelectedItem(teacher);
    setIsTeacherAvailabilityModalOpen(true);
  };

  const handleEditTeacher = (teacher: PlanningTeacher) => {
    setIsEditMode(true);
    setSelectedItem(teacher);
    setIsTeacherAssignmentModalOpen(true);
  };

  const handleDeleteTeacher = async (teacher: PlanningTeacher) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'enseignant ${teacher.name} ?`)) {
      try {
        // TODO: Implémenter la suppression de l'enseignant
        console.log('Suppression de l\'enseignant:', teacher.name);
        showToast(`Suppression de ${teacher.name} - Fonctionnalité en cours de développement`, 'info');
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'enseignant:', error);
        showToast('Erreur lors de la suppression de l\'enseignant', 'error');
      }
    }
  };

  const handleSaveClass = async (classData: any) => {
    console.log('=== DEBUG handleSaveClass ===');
    console.log('classData reçu:', classData);
    console.log('isEditMode:', isEditMode);
    console.log('selectedItem:', selectedItem);

    try {
      if (isEditMode && selectedItem) {
        console.log('Mode édition - mise à jour de la classe:', selectedItem.id);
        await updateClass(selectedItem.id, classData);
        console.log('Classe mise à jour avec succès');
      } else {
        console.log('Mode création - création d\'une nouvelle classe');
        await createClass(classData);
        console.log('Classe créée avec succès');
      }
      console.log('Fermeture du modal');
      setIsClassModalOpen(false);
      setSelectedItem(null);
      setIsEditMode(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la classe:', error);
      // L'erreur sera gérée par le hook usePlanningData
    }
  };

  const handleSaveRoom = async (roomData: any) => {
    console.log('=== DEBUG handleSaveRoom ===');
    console.log('roomData reçu:', roomData);
    console.log('isEditMode:', isEditMode);
    console.log('selectedItem:', selectedItem);

    
    try {
      if (isEditMode && selectedItem) {
        console.log('Mode édition - mise à jour de la salle:', selectedItem.id);
        await updateRoom(selectedItem.id, roomData);
        console.log('Salle mise à jour avec succès');
      } else {
        console.log('Mode création - création d\'une nouvelle salle');
        await createRoom(roomData);
        console.log('Salle créée avec succès');
      }
      console.log('Fermeture du modal');
      setIsRoomModalOpen(false);
      setSelectedItem(null);
      setIsEditMode(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la salle:', error);
      // L'erreur sera gérée par le hook usePlanningData
    }
  };

  const handleEditRoom = (room: any) => {
    setSelectedItem(room);
    setIsEditMode(true);
    setIsRoomModalOpen(true);
  };

  const handleEditSubject = (subject: any) => {
    setSelectedItem({ ...subject, type: 'subject' });
    setIsEditMode(true);
    setIsSubjectModalOpen(true);
  };

  const handleDeleteRoom = async (room: any) => {
    setRoomToDelete(room);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteRoom = async () => {
    if (!roomToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteRoom(roomToDelete.id);
      setIsDeleteModalOpen(false);
      setRoomToDelete(null);
      showToast('Salle supprimée avec succès !', 'success');
    } catch (error) {
      console.error('Error deleting room:', error);
      showToast('Erreur lors de la suppression de la salle. Veuillez réessayer.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteClass = async () => {
    if (!selectedItem) return;
    
    setIsDeleting(true);
    try {
      await deleteClass(selectedItem.id);
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      showToast('Classe supprimée avec succès !', 'success');
    } catch (error) {
      console.error('Error deleting class:', error);
      showToast('Erreur lors de la suppression de la classe. Veuillez réessayer.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteSubject = async () => {
    if (!selectedItem) return;
    
    try {
      await deleteSubject(selectedItem.id);
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      showToast('Matière supprimée avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression de la matière:', error);
      showToast('Erreur lors de la suppression de la matière. Veuillez réessayer.', 'error');
    }
  };

  const handleSaveMultipleSubjects = async (subjectsData: any[]) => {
    try {
      await createMultipleSubjects(subjectsData);
      setIsMultipleSubjectsModalOpen(false);
      // setSelectedClassForSubjects(null);
    } catch (error) {
      console.error('Erreur lors de la création des matières:', error);
    }
  };

  // Fonction pour gérer le clic sur le bouton Planning
  const handleRoomPlanning = (room: PlanningRoom) => {
    console.log('=== BOUTON PLANNING CLICKÉ ===');
    console.log('Salle sélectionnée:', room);
    
    // Ouvrir le modal de planning pour cette salle
    setSelectedRoomForPlanning(room);
  };

  // Fonction pour ouvrir le modal d'impression des salles
  const handlePrintRooms = () => {
    if (!rooms || rooms.length === 0) {
      alert('Aucune salle à imprimer');
      return;
    }
    setIsRoomsPrintModalOpen(true);
  };

  // Fonctions de gestion des classes
  const handleEditClass = (cls: any) => {
    setSelectedItem(cls);
    setIsEditMode(true);
    setIsClassModalOpen(true);
  };

  const handleDeleteClass = async (cls: any) => {
    setSelectedItem(cls);
    setRoomToDelete(null); // Réinitialiser roomToDelete pour s'assurer qu'il s'agit d'une classe
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSubject = async (subject: any) => {
    setSelectedItem({ ...subject, type: 'subject' });
    setRoomToDelete(null); // S'assurer que c'est bien une matière
    setIsDeleteModalOpen(true);
  };

  const handleClassSchedule = (cls: any) => {
    console.log('Ouverture de l\'emploi du temps pour la classe:', cls);
    // TODO: Implémenter l'ouverture de l'emploi du temps
    alert(`Emploi du temps pour ${cls.name} - Fonctionnalité à venir`);
  };

  const handlePrintClasses = () => {
    if (!classes || classes.length === 0) {
      alert('Aucune classe à imprimer');
      return;
    }
    setIsClassesPrintModalOpen(true);
  };

  const handleSaveSubject = async (subjectData: any) => {
    console.log('=== DEBUG handleSaveSubject ===');
    console.log('subjectData reçu:', subjectData);
    console.log('subjectData.classId:', subjectData.classId);
    console.log('subjectData.level:', subjectData.level);
    console.log('subjectData.coefficient:', subjectData.coefficient);
    console.log('isEditMode:', isEditMode);
    console.log('selectedItem:', selectedItem);

    try {
      if (isEditMode && selectedItem) {
        console.log('Mode édition - mise à jour de la matière:', selectedItem.id);
        await updateSubject(selectedItem.id, subjectData);
        console.log('Matière mise à jour avec succès');
        showToast('Matière modifiée avec succès !', 'success');
      } else {
        console.log('Mode création - création d\'une nouvelle matière');
        console.log('🔍 Données envoyées à createSubject:', subjectData);
        await createSubject(subjectData);
        console.log('Matière créée avec succès');
        showToast('Matière créée avec succès !', 'success');
      }
      console.log('Fermeture du modal');
      setIsSubjectModalOpen(false);
      setSelectedItem(null);
      setIsEditMode(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la matière:', error);
      showToast('Erreur lors de la sauvegarde de la matière. Veuillez réessayer.', 'error');
    }
  };

  const handleSaveBreaks = (breaksData: any) => {
    // saveBreaks(breaksData);
    console.log('Saving breaks:', breaksData);
  };

  const handleSaveWorkHours = (workHoursData: any) => {
    // saveWorkHours(workHoursData);
    console.log('Saving work hours:', workHoursData);
  };

  const handleSaveReservation = async (reservationData: any) => {
    console.log('=== DEBUG handleSaveReservation ===');
    console.log('reservationData reçu:', reservationData);
    console.log('isEditMode:', isEditMode);
    console.log('selectedItem:', selectedItem);

    try {
      // Vérifier si c'est une réservation multiple
      if (Array.isArray(reservationData)) {
        console.log('🎯 Mode réservation multiple détecté:', reservationData.length, 'réservations');
        
        // Créer toutes les réservations
        const promises = reservationData.map(async (data) => {
          const reservationServiceData = {
            roomId: data.roomId,
            date: data.date,
            start_time: data.startTime,
            end_time: data.endTime,
            subject: data.subjectId === 'all-subjects' ? 
              (() => {
                // Pour les enseignants polyvalents (maternelle/primaire), compter les matières réellement assignées
                const teacherScheduleEntries = schedule.filter(entry => 
                  entry.teacher_id === data.teacherId && entry.class_id === data.classId
                );
                
                // Récupérer les matières uniques assignées à cet enseignant pour cette classe
                const assignedSubjects = teacherScheduleEntries.reduce((acc, entry) => {
                  const subject = subjects.find(s => s.id === entry.subject_id);
                  if (subject && !acc.find(s => s.id === subject.id)) {
                    acc.push(subject);
                  }
                  return acc;
                }, [] as any[]);
                
                if (assignedSubjects.length > 0) {
                  return `${assignedSubjects.length} matières`;
                }
                
                // Fallback: compter les matières du niveau si aucune affectation trouvée
                const classObj = classes.find(c => c.id === data.classId);
                if (classObj) {
                  const classLevel = classObj.level.toLowerCase();
                  const classSubjects = subjects.filter(subject => {
                    if (classLevel.includes('maternelle')) {
                      return subject.level === 'maternelle';
                    } else if (classLevel.includes('primaire')) {
                      return subject.level === 'primaire';
                    }
                    return false;
                  });
                  return `${classSubjects.length} matières`;
                }
                return 'Matière non spécifiée';
              })() : 
              (subjects.find(s => s.id === data.subjectId)?.name || 'Matière non spécifiée'),
            subjectId: data.subjectId, // Ajouter l'ID de la matière
            teacherId: data.teacherId,
            classId: data.classId,
            type: 'cours' as const,
            status: 'En attente' as const,
            description: data.notes || ''
          };
          
          return await reservationService.createReservation(reservationServiceData);
        });
        
        await Promise.all(promises);
        console.log('✅ Toutes les réservations multiples créées avec succès');
        
        setToast({
          show: true,
          type: 'success',
          message: `${reservationData.length} réservations créées avec succès !`
        });
      } else {
        // Réservation normale (une seule matière)
        const reservationServiceData = {
          roomId: reservationData.roomId,
          date: reservationData.date,
          start_time: reservationData.startTime,
          end_time: reservationData.endTime,
          subject: reservationData.subjectId === 'all-subjects' ? 
            (() => {
              // Pour les enseignants polyvalents (maternelle/primaire), compter les matières réellement assignées
              const teacherScheduleEntries = schedule.filter(entry => 
                entry.teacher_id === reservationData.teacherId && entry.class_id === reservationData.classId
              );
              
              // Récupérer les matières uniques assignées à cet enseignant pour cette classe
              const assignedSubjects = teacherScheduleEntries.reduce((acc, entry) => {
                const subject = subjects.find(s => s.id === entry.subject_id);
                if (subject && !acc.find(s => s.id === subject.id)) {
                  acc.push(subject);
                }
                return acc;
              }, [] as any[]);
              
              if (assignedSubjects.length > 0) {
                return `${assignedSubjects.length} matières`;
              }
              
              // Fallback: compter les matières du niveau si aucune affectation trouvée
              const classObj = classes.find(c => c.id === reservationData.classId);
              if (classObj) {
                const classLevel = classObj.level.toLowerCase();
                const classSubjects = subjects.filter(subject => {
                  if (classLevel.includes('maternelle')) {
                    return subject.level === 'maternelle';
                  } else if (classLevel.includes('primaire')) {
                    return subject.level === 'primaire';
                  }
                  return false;
                });
                return `${classSubjects.length} matières`;
              }
              return 'Matière non spécifiée';
            })() : 
            (subjects.find(s => s.id === reservationData.subjectId)?.name || 'Matière non spécifiée'),
          subjectId: reservationData.subjectId, // Ajouter l'ID de la matière
          teacherId: reservationData.teacherId,
          classId: reservationData.classId,
          type: 'cours' as const,
          status: 'En attente' as const,
          description: reservationData.notes || ''
        };

        if (isEditMode && selectedItem) {
          console.log('Mode édition - mise à jour de la réservation:', selectedItem.id);
          await reservationService.updateReservation(selectedItem.id, reservationServiceData);
          console.log('Réservation mise à jour avec succès');
        } else {
          console.log('Mode création - création d\'une nouvelle réservation');
          await reservationService.createReservation(reservationServiceData);
          console.log('Réservation créée avec succès');
        }
        
        setToast({
          show: true,
          type: 'success',
          message: isEditMode ? 'Réservation mise à jour avec succès' : 'Réservation créée avec succès'
        });
      }
      
      console.log('Fermeture du modal');
      setIsRoomReservationModalOpen(false);
      setSelectedItem(null);
      setIsEditMode(false);
      
      // Rafraîchir les données
      await fetchReservations();
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la réservation:', error);
      setToast({
        show: true,
        type: 'error',
        message: 'Erreur lors de la sauvegarde de la réservation'
      });
    }
  };

  const handleSaveAssignment = async (assignmentData: any) => {
    if (!user?.schoolId) return;
    try {
      console.log('🔄 === DÉBUT SAUVEGARDE AFFECTATION ===');
      console.log('📊 Données d\'affectation reçues:', assignmentData);
      console.log('🏫 SchoolId:', user.schoolId);
      
      const { mode, teacherId, classId, subjectId, classIds, classSubjectPairs, startDate, endDate, hoursPerWeek, notes } = assignmentData;
      
      if (mode === 'secondaire' && subjectId) {
        console.log('🔍 Mode secondaire - appel assignTeacherToSubjectClasses');
        const result = await planningService.assignTeacherToSubjectClasses({
          schoolId: user.schoolId,
          teacherId,
          subjectId,
          classIds: Array.isArray(classIds) ? classIds : (classId ? [classId] : []),
          startDate,
          endDate,
          hoursPerWeek,
          notes
        });
        console.log('✅ Résultat assignTeacherToSubjectClasses:', result);
      } else if (mode === 'secondaire') {
        console.log('🔍 Mode secondaire - traitement des associations classe-matière');
        // Traiter les associations classe-matière pour le secondaire
        if (classSubjectPairs && classSubjectPairs.length > 0) {
          for (const pair of classSubjectPairs) {
            const result = await planningService.assignTeacherToClassSpecificSubject({
              schoolId: user.schoolId,
              teacherId,
              classId: pair.classId,
              subjectId: pair.subjectId,
              subjectName: pair.subjectName,
              startDate,
              endDate,
              hoursPerWeek,
              notes
            });
            console.log(`✅ Association ${pair.className} - ${pair.subjectName}:`, result);
          }
        } else {
          console.log('❌ Aucune association classe-matière trouvée');
        }
      } else {
        const cycle = mode === 'maternelle' ? 'maternelle' : 'primaire';
        console.log(`🔍 Mode ${cycle} - appel assignTeacherToClassAllSubjects`);
        const result = await planningService.assignTeacherToClassAllSubjects({
          schoolId: user.schoolId,
          teacherId,
          classId,
          cycle,
          startDate,
          endDate,
          hoursPerWeek,
          notes
        });
        console.log('✅ Résultat assignTeacherToClassAllSubjects:', result);
      }
      
      console.log('🔄 Rechargement des données après affectation...');
      await refreshData();
      
      // Vérification immédiate des enseignants après affectation
      console.log('🔍 Vérification immédiate des enseignants...');
      // Utiliser directement l'API HTTP
      try {
        try {
          console.log('🔍 Appel de l\'API backend getTeachers...');
          const result = await api.planning.getTeachers(user.schoolId);
          console.log('🔍 Résultat brut de l\'API backend:', result);
          const teachersCheck = result?.data || result || [];
          console.log('📊 Nombre d\'enseignants après test (API backend):', teachersCheck.length);
          console.log('📋 Détail des enseignants après test:', teachersCheck);
          
          // Vérifier si Elodie a ses affectations
          const elodie = teachersCheck.find(t => t.name.includes('Elodie'));
          if (elodie) {
            console.log('🔍 Elodie trouvée:', elodie);
            console.log('🔍 Classes d\'Elodie:', elodie.classes);
            console.log('🔍 Heures d\'Elodie:', elodie.hoursPerWeek);
          }
        } catch (error) {
          console.error('❌ Erreur API backend getTeachers:', error);
          // Fallback vers le service planning
          const teachersCheck = await planningService.getTeachers(user.schoolId);
          console.log('📊 Nombre d\'enseignants après test (API frontend):', teachersCheck.length);
          console.log('📋 Détail des enseignants après test:', teachersCheck);
        }
      
      // L'affichage des enseignants titulaires est maintenant dynamique
      // Plus besoin de mise à jour manuelle
      
      showToast('Affectation enregistrée', 'success');
      console.log('✅ === FIN SAUVEGARDE AFFECTATION ===');
    } catch (error) {
      console.error('❌ Erreur lors de l\'affectation:', error);
      showToast('Erreur lors de l\'affectation', 'error');
    }
  };

  const handleSaveScheduleEntry = async (scheduleData: any) => {
    console.log('Saving schedule entry:', scheduleData);
    
    try {
      const result = await planningService.saveScheduleEntry(scheduleData);
      
      if (result.success) {
        showToast('Cours planifié avec succès', 'success');
        // Forcer le rechargement des données
        console.log('🔄 Rechargement des données après sauvegarde...');
        await refreshData();
      } else {
        showToast(result.error || 'Erreur lors de la planification du cours', 'error');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showToast('Erreur lors de la planification du cours', 'error');
    }
  };

  // Fonction de débogage pour vérifier les données dans la base


  const handleSaveAvailability = async (availabilityData: any) => {
    if (!user?.schoolId) return;
    try {
      await planningService.saveTeacherAvailability({
        schoolId: user.schoolId,
        teacherId: availabilityData.teacherId,
        availability: availabilityData.availability,
        notes: availabilityData.notes
      });
      showToast('Disponibilités enregistrées', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des disponibilités:', error);
      showToast('Erreur lors de l\'enregistrement des disponibilités', 'error');
    }
  };

  const handleSaveWorkedHours = async (workedHoursData: any) => {
    if (!user?.schoolId) return;
    try {
      switch (workedHoursData.action) {
        case 'create':
          const newEntry = await workedHoursService.createWorkedHoursEntry({
            ...workedHoursData,
            validatedBy: user.id || 'current-user'
          });
          console.log('✅ Nouvelle entrée créée:', newEntry);
          showToast('Entrée d\'heures travaillées créée', 'success');
          
          // Recharger les données
          const updatedHours = await workedHoursService.getAllWorkedHours();
          setWorkedHours(updatedHours);
          break;
        case 'update':
          await planningService.updateWorkedHoursEntry(workedHoursData.id, workedHoursData.updates);
          showToast('Entrée d\'heures travaillées mise à jour', 'success');
          break;
        case 'delete':
          await planningService.deleteWorkedHoursEntry(workedHoursData.entryId);
          showToast('Entrée d\'heures travaillées supprimée', 'success');
          break;
        case 'validate':
          await planningService.updateWorkedHoursEntry(workedHoursData.entryId, {
            status: 'validated',
            validatedBy: workedHoursData.validatedBy,
            validatedAt: workedHoursData.validatedAt
          });
          showToast('Entrée d\'heures travaillées validée', 'success');
          break;
        case 'validate_from_schedule':
          await planningService.validateHoursFromSchedule(
            workedHoursData.scheduleEntryId, 
            workedHoursData.validatedBy
          );
          showToast('Heures validées depuis le planning', 'success');
          break;
        default:
          console.warn('Action non reconnue:', workedHoursData.action);
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des heures travaillées:', error);
      showToast('Erreur lors de la gestion des heures travaillées', 'error');
    }
  };

  // Fonction pour charger les réservations
  const fetchReservations = async () => {
    if (!user?.schoolId) return;
    
    setReservationsLoading(true);
    setReservationsError(null);
    
    try {
      const reservationsData = await reservationService.getAllReservations();
      setReservations(reservationsData);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      setReservationsError(error instanceof Error ? error.message : 'Erreur lors du chargement');
      setReservations([]);
    } finally {
      setReservationsLoading(false);
    }
  };

  // Charger les réservations au montage du composant
  useEffect(() => {
    fetchReservations();
  }, [user?.schoolId]);

  // Charger tous les employés
  useEffect(() => {
    const loadAllEmployees = async () => {
      try {
        if (user?.schoolId) {
          // Import statique au lieu de dynamique
          const employeeService = (await import('../../services/employeeService')).employeeService;
          const employees = await employeeService.getAllEmployees(user.schoolId);
          if (process.env.NODE_ENV === 'development') {
            console.log('👥 Employés chargés:', employees.length);
          }
          setAllEmployees(employees);
        } else {
          console.log('❌ Pas de schoolId disponible');
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des employés:', error);
        // En cas d'erreur, on laisse allEmployees vide et le fallback vers teachers fonctionnera
        setAllEmployees([]);
      }
    };

    loadAllEmployees();
  }, [user?.schoolId]);

  // Charger les heures travaillées
  useEffect(() => {
    console.log('🔍 useEffect - Début du chargement des heures travaillées');
    const loadWorkedHours = async () => {
      console.log('🔍 loadWorkedHours - Début de la fonction');
      setWorkedHoursLoading(true);
      setWorkedHoursError(null);
      try {
        console.log('🔍 Chargement des heures travaillées...');
        
        // TODO: Adapter cette requête SQL pour utiliser un endpoint API spécifique
        // Les requêtes SQL directes ne sont pas recommandées dans le Web SaaS
        // Utiliser un endpoint API dédié à la place (ex: api.planning.getWorkedHours)
        console.warn('⚠️ Direct SQL queries are not allowed. Use specific API endpoints instead.');
        setWorkedHours([]);
        setWorkedHoursError('Direct SQL queries are not allowed. Use specific API endpoints instead.');
        return;
          
          console.log('🔍 Résultat de la requête:', result);
          
          if (!Array.isArray(result)) {
            console.warn('⚠️ executeQuery n\'a pas retourné un tableau:', result);
            setWorkedHours([]);
            return;
          }
          
          // Convertir les données de snake_case vers camelCase
          const hours = result.map((row: any) => ({
            id: row.id,
            employeeId: row.employee_id,
            employeeName: row.employee_name,
            date: row.date,
            scheduledHours: row.scheduled_hours,
            validatedHours: row.validated_hours,
            classId: row.class_id,
            className: row.class_name,
            subjectId: row.subject_id,
            subjectName: row.subject_name,
            entryMode: row.entry_mode,
            validatedBy: row.validated_by,
            validatedAt: row.validated_at,
            notes: row.notes,
            status: row.status,
            schoolId: row.school_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));
          
          console.log('✅ Heures travaillées chargées:', hours.length, 'entrées');
          console.log('🔍 Données converties:', hours);
          if (hours.length > 0) {
            console.log('🔍 Première entrée:', hours[0]);
          }
          // setWorkedHours(hours); // Déjà géré plus haut
      } catch (error) {
        console.error('❌ Erreur lors du chargement des heures travaillées:', error);
        setWorkedHoursError('Erreur lors du chargement des heures travaillées');
      } finally {
        setWorkedHoursLoading(false);
        console.log('🔍 Chargement terminé, workedHoursLoading: false');
      }
    };

    loadWorkedHours();
  }, []);

  const handleConfirmReservation = async (reservationId: string) => {
    try {
      await reservationService.confirmReservation(reservationId);
      setToast({
        show: true,
        type: 'success',
        message: 'Réservation validée avec succès !'
      });
      await fetchReservations();
    } catch (error) {
      console.error('Erreur lors de la confirmation de la réservation:', error);
      setToast({
        show: true,
        type: 'error',
        message: 'Erreur lors de la confirmation de la réservation. Veuillez réessayer.'
      });
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation) {
      setReservationToDelete(reservation);
      setIsDeleteReservationModalOpen(true);
    }
  };

  const confirmDeleteReservation = async () => {
    if (!reservationToDelete) return;
    
    setIsDeletingReservation(true);
    try {
      await reservationService.deleteReservation(reservationToDelete.id);
      setToast({
        show: true,
        type: 'success',
        message: 'Réservation supprimée avec succès !'
      });
      await fetchReservations();
    } catch (error) {
      console.error('Erreur lors de la suppression de la réservation:', error);
      setToast({
        show: true,
        type: 'error',
        message: 'Erreur lors de la suppression de la réservation. Veuillez réessayer.'
      });
    } finally {
      setIsDeletingReservation(false);
      setIsDeleteReservationModalOpen(false);
      setReservationToDelete(null);
    }
  };

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Fonctions pour la sélection multiple des réservations
  const handleReservationSelectionChange = (reservationId: string, checked: boolean) => {
    setSelectedReservationsForDeletion(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(reservationId);
      } else {
        newSet.delete(reservationId);
      }
      return newSet;
    });
  };

  const handleSelectAllReservations = (checked: boolean) => {
    if (checked) {
      setSelectedReservationsForDeletion(new Set(filteredReservations.map(r => r.id)));
    } else {
      setSelectedReservationsForDeletion(new Set());
    }
  };

  const handleConfirmMultipleReservations = async () => {
    const selectedReservations = reservations.filter(r => selectedReservationsForDeletion.has(r.id));
    const pendingReservations = selectedReservations.filter(r => r.status === 'En attente' || r.status === 'en_attente');
    
    if (pendingReservations.length === 0) {
      setToast({
        show: true,
        type: 'error',
        message: 'Aucune réservation en attente sélectionnée'
      });
      return;
    }

    try {
      const promises = pendingReservations.map(reservation => 
        reservationService.confirmReservation(reservation.id)
      );
      await Promise.all(promises);
      
      setToast({
        show: true,
        type: 'success',
        message: `${pendingReservations.length} réservation(s) validée(s) avec succès !`
      });
      
      setSelectedReservationsForDeletion(new Set());
      await fetchReservations();
    } catch (error) {
      console.error('Erreur lors de la validation multiple:', error);
      setToast({
        show: true,
        type: 'error',
        message: 'Erreur lors de la validation multiple. Veuillez réessayer.'
      });
    }
  };

  const handleConfirmDeleteMultipleReservations = async () => {
    setIsDeletingMultipleReservations(true);
    try {
      const promises = Array.from(selectedReservationsForDeletion).map(reservationId =>
        reservationService.deleteReservation(reservationId)
      );
      await Promise.all(promises);
      
      setToast({
        show: true,
        type: 'success',
        message: `${selectedReservationsForDeletion.size} réservation(s) supprimée(s) avec succès !`
      });
      
      setSelectedReservationsForDeletion(new Set());
      setIsDeleteMultipleReservationsModalOpen(false);
      await fetchReservations();
    } catch (error) {
      console.error('Erreur lors de la suppression multiple:', error);
      setToast({
        show: true,
        type: 'error',
        message: 'Erreur lors de la suppression multiple. Veuillez réessayer.'
      });
    } finally {
      setIsDeletingMultipleReservations(false);
    }
  };

  // Fonction pour filtrer les réservations par classe et type de salle
  const filteredReservations = useMemo(() => {
    let filtered = reservations || [];
    
    // Filtre par classe
    if (reservationClassFilter) {
      filtered = filtered.filter(reservation => 
      reservation.classId === reservationClassFilter
    );
    }
    
    // Filtre par type de salle
    if (reservationRoomTypeFilter) {
      filtered = filtered.filter(reservation => {
        const classObj = classes?.find(c => c.id === reservation.classId);
        if (!classObj) return false;
        
        const roomType = getRoomTypeForClass(classObj.level);
        return roomType === reservationRoomTypeFilter;
      });
    }
    
    return filtered;
  }, [reservations, reservationClassFilter, reservationRoomTypeFilter, classes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Études & Planification</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestion intelligente des emplois du temps et ressources</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          {/* Affichage de l'année scolaire actuelle */}
          <CurrentAcademicYearDisplay variant="compact" />
          
          {/* Sélecteur d'année scolaire */}
          <AcademicYearSelector
            value={selectedAcademicYear}
            onChange={setSelectedAcademicYear}
            className="w-full sm:w-auto min-w-[200px]"
          />
          <button 
            onClick={handleConfigureWorkHours}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configuration
          </button>
          <button 
            onClick={handleNewScheduleEntry}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau cours
          </button>
        </div>
      </div>


      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
            {[
              { id: 'rooms', label: 'Salles', icon: Building },
              { id: 'classes', label: 'Classes', icon: Users },
              { id: 'reservations', label: 'Réservations', icon: MapPin },
              { id: 'subjects', label: 'Matières', icon: BookOpen },
              { id: 'teachers', label: 'Enseignants', icon: User },
              { id: 'availability', label: 'Disponibilités', icon: Clock },
              { id: 'schedule', label: 'Emploi du temps', icon: Calendar },
              { id: 'worked-hours', label: 'Heures travaillées', icon: BarChart3 },
              { id: 'journal', label: 'Cahier Journal', icon: BookOpen },
              { id: 'fiches-pedagogiques', label: 'Fiches Pédagogiques', icon: FileText },
              { id: 'cahier-textes', label: 'Cahier de Textes', icon: BookOpen }
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
          {activeTab === 'schedule' && (
            <ScheduleTab
              teachers={teachers}
              classes={classes}
              subjects={subjects}
              rooms={rooms}
              schedule={schedule}
              workHours={workHours}
              onSaveScheduleEntry={handleSaveScheduleEntry}
              onRefreshData={refreshData}
              loading={loading}
              error={error}
            />
          )}

          {activeTab === 'worked-hours' && (
            <WorkedHoursTab
              teachers={teachers}
              classes={classes}
              subjects={subjects}
              allEmployees={allEmployees}
              workedHours={workedHours}
              workedHoursLoading={workedHoursLoading}
              workedHoursError={workedHoursError}
              onSaveWorkedHours={handleSaveWorkedHours}
              loading={loading}
              error={error}
            />
          )}

          {activeTab === 'classes' && (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-8 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-6 lg:mb-0">
                      <h2 className="text-3xl font-bold mb-2">Gestion des Classes</h2>
                      <p className="text-blue-100 text-lg">Organisez et gérez les classes de votre établissement</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handlePrintClasses}
                        className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                  >
                        <Printer className="w-5 h-5 mr-2" />
                    Imprimer
                  </button>
                <button 
                  onClick={handleNewClass}
                        className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                >
                        <Plus className="w-5 h-5 mr-2" />
                        Nouvelle Classe
                </button>
                      {selectedClassesForDeletion.size > 0 && (
                  <button 
                    onClick={handleDeleteMultipleClasses}
                          className="inline-flex items-center px-6 py-3 bg-red-500/80 backdrop-blur-sm text-white rounded-xl hover:bg-red-500 transition-all duration-300 border border-red-400/20 shadow-lg hover:shadow-xl"
                  >
                          <Trash2 className="w-5 h-5 mr-2" />
                          Supprimer ({selectedClassesForDeletion.size})
                </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Classes</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{classes?.length || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Élèves Total</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {classes?.reduce((sum, c) => sum + ((c as any).student_count || 0), 0) || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Niveaux</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {new Set(classes?.map(c => c.level)).size || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Moyenne Élèves</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {classes?.length ? Math.round(classes.reduce((sum, c) => sum + ((c as any).student_count || 0), 0) / classes.length) : 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons de sélection rapide pour les classes */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {classes?.length || 0} classe{classes?.length !== 1 ? 's' : ''} trouvée{classes?.length !== 1 ? 's' : ''}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const allClassIds = classes?.map(c => c.id) || [];
                      setSelectedClassesForDeletion(new Set(allClassIds));
                    }}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    onClick={() => setSelectedClassesForDeletion(new Set())}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900/40"
                  >
                    Aucune
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {sortClassesByEducationalOrder(classes).map((cls) => (
                  <div key={cls.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Checkbox pour la sélection multiple */}
                        <input
                          type="checkbox"
                          checked={selectedClassesForDeletion.has(cls.id)}
                          onChange={() => toggleClassForDeletion(cls.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          aria-label={`Sélectionner la classe ${cls.name} pour suppression`}
                        />
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">{cls.name}</h4>
                            
                            {/* Badge du nombre de matières */}
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              getClassSubjectsCount(cls.id, cls.level) > 0
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                            }`}>
                              <BookOpen className="w-4 h-4 mr-1" />
                              {getClassSubjectsCount(cls.id, cls.level) > 0 
                                ? `${getClassSubjectsCount(cls.id, cls.level)} matière${getClassSubjectsCount(cls.id, cls.level) !== 1 ? 's' : ''}`
                                : 'Aucune matière'
                              }
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            Enseignant titulaire: <span className={`font-medium ${
                              getClassTeacherName(cls.id) === 'Non assigné' 
                                ? 'text-gray-500 dark:text-gray-400' 
                                : 'text-blue-600 dark:text-blue-400'
                            }`}>
                              {getClassTeacherName(cls.id)}
                            </span>
                            {(() => {
                              const level = cls.level?.toLowerCase() || '';
                              if (level.includes('secondaire') || level.includes('6') || level.includes('5') || level.includes('4') || level.includes('3') || level.includes('2nde') || level.includes('1ère') || level.includes('tle')) {
                                return <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">(Définir manuellement)</span>;
                              }
                              return null;
                            })()}
                          </p>
                          {cls.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                              {cls.description}
                            </p>
                          )}
                          
                          {/* Informations sur les matières de la classe */}
                          <div className="mt-2">
                            <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                              <span className="flex items-center">
                                <BookOpen className="w-3 h-3 mr-1" />
                                {getClassSubjectsCount(cls.id, cls.level)} matière{getClassSubjectsCount(cls.id, cls.level) !== 1 ? 's' : ''}
                                {(() => {
                                  const level = cls.level?.toLowerCase() || '';
                                  if (level.includes('maternelle') || level.includes('primaire')) {
                                    return ' (toutes assignées)';
                                  } else {
                                    return ' assignée' + (getClassSubjectsCount(cls.id, cls.level) !== 1 ? 's' : '');
                                  }
                                })()}
                              </span>
                              <span className="flex items-center">
                                <Hash className="w-3 h-3 mr-1" />
                                Niveau: {cls.level ? cls.level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
                              </span>
                              {getClassSubjectsCount(cls.id, cls.level) === 0 && (
                                <span className="flex items-center text-orange-600 dark:text-orange-400">
                                  <Plus className="w-3 h-3 mr-1" />
                                  Ajouter des affectations
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Salle: <span className={`font-medium ${
                            getClassRoomName(cls.id) === 'Non assignée' 
                              ? 'text-gray-500 dark:text-gray-400' 
                              : 'text-blue-600 dark:text-blue-400'
                          }`}>
                            {getClassRoomName(cls.id)}
                          </span>
                        </p>
                        {cls.capacity && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Capacité: {cls.capacity} élèves
                          </p>
                        )}
                        <div className="flex space-x-2 mt-2">
                          <button 
                            onClick={() => handleClassSchedule(cls)}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50"
                          >
                            Emploi du temps
                          </button>
                          <button 
                            onClick={() => handleEditClass(cls)}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            Modifier
                          </button>
                          <button 
                            onClick={() => handleDeleteClass(cls)}
                            className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-6 lg:mb-0">
                      <h2 className="text-3xl font-bold mb-2">Gestion des Salles</h2>
                      <p className="text-purple-100 text-lg">Organisez et gérez l'espace de votre établissement</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                      onClick={handlePrintRooms}
                        className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                    >
                        <Printer className="w-5 h-5 mr-2" />
                      Imprimer
                    </button>
                  <button 
                    onClick={handleNewReservation}
                        className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                  >
                        <Calendar className="w-5 h-5 mr-2" />
                    Réserver
                  </button>
                  <button 
                    onClick={handleNewRoom}
                        className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                  >
                        <Plus className="w-5 h-5 mr-2" />
                        Nouvelle Salle
                  </button>
                      {selectedRoomsForDeletion.size > 0 && (
                    <button 
                      onClick={handleDeleteMultipleRooms}
                          className="inline-flex items-center px-6 py-3 bg-red-500/80 backdrop-blur-sm text-white rounded-xl hover:bg-red-500 transition-all duration-300 border border-red-400/20 shadow-lg hover:shadow-xl"
                    >
                          <Trash2 className="w-5 h-5 mr-2" />
                          Supprimer ({selectedRoomsForDeletion.size})
                  </button>
                      )}
                </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Salles</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{rooms?.length || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disponibles</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {rooms?.filter(r => r.status === 'available').length || 0}
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
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Occupées</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {rooms?.filter(r => r.status === 'occupied').length || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Capacité Totale</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {rooms?.reduce((sum, r) => sum + (r.capacity || 0), 0) || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>



              {/* Sélection rapide et filtres */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {rooms?.length || 0} salle{rooms?.length !== 1 ? 's' : ''} trouvée{rooms?.length !== 1 ? 's' : ''}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const allRoomIds = rooms?.map(r => r.id) || [];
                      setSelectedRoomsForDeletion(new Set(allRoomIds));
                    }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-xl hover:from-blue-200 hover:to-indigo-200 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/40 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    onClick={() => setSelectedRoomsForDeletion(new Set())}
                        className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-xl hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Aucune
                  </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Affichage des erreurs */}
              {error && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center mr-4">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Information</h3>
                      <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* État de chargement */}
              {loading && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Chargement des salles...</p>
                  </div>
                </div>
              )}

              {/* Liste des salles */}
              {!loading && (!rooms || rooms.length === 0) && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Building className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Aucune salle trouvée</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">Commencez par créer votre première salle pour organiser vos cours.</p>
                  <button 
                    onClick={handleNewRoom}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                      <Plus className="w-5 h-5 mr-2" />
                    Créer une salle
                  </button>
                  </div>
                </div>
              )}

              {!loading && rooms && rooms.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mr-4">
                        <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Liste des Salles</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Gérez l'espace de votre établissement</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                {rooms.map((room) => (
                        <div key={room.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-900/50 dark:to-purple-900/10 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        {/* Checkbox pour la sélection multiple */}
                        <input
                          type="checkbox"
                          checked={selectedRoomsForDeletion.has(room.id)}
                          onChange={() => toggleRoomForDeletion(room.id)}
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          aria-label={`Sélectionner la salle ${room.name} pour suppression`}
                        />
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                          <Building className="w-6 h-6 text-white" />
                        </div>
                        <div>
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{room.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 mr-2">
                                  {room.type}
                                </span>
                                <span className="text-gray-400 mx-2">•</span>
                                <span className="text-gray-600 dark:text-gray-400">{room.capacity} places</span>
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                              Équipements: {formatEquipment(room.equipment)}
                            </p>
                            {room.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {room.description}
                              </p>
                            )}
                        </div>
                      </div>
                      <div className="text-right">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm ${getStatusColor(room.status)}`}>
                          {room.status === 'available' ? 'Disponible' : 
                           room.status === 'occupied' ? 'Occupée' : 
                           room.status === 'maintenance' ? 'Maintenance' : 'Réservée'}
                        </span>
                            <div className="flex space-x-2 mt-3">
                            <button 
                              onClick={() => handleRoomPlanning(room)}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                            Planning
                          </button>
                            <button 
                              onClick={() => handleEditRoom(room)}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-sm hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                            Modifier
                          </button>
                            <button 
                              onClick={() => handleDeleteRoom(room)}
                                className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg text-sm hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              Supprimer
                          </button>
                      </div>
                    </div>
                  </div>
                ))}
                    </div>
                  </div>
              </div>
              )}
            </div>
          )}

          {activeTab === 'subjects' && (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-6 lg:mb-0">
                      <h2 className="text-3xl font-bold mb-2">Gestion des Matières</h2>
                      <p className="text-green-100 text-lg">Organisez et gérez les matières enseignées</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleNewSubject}
                        className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                >
                        <Plus className="w-5 h-5 mr-2" />
                        Nouvelle Matière
                </button>
                                <button 
                                  onClick={handleAddMultipleSubjects}
                        className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                                >
                        <Plus className="w-5 h-5 mr-2" />
                        Ajouter Plusieurs
                                </button>
                      {selectedSubjectsForDeletion.size > 0 && (
                                <button 
                                  onClick={handleDeleteMultipleSubjects}
                          className="inline-flex items-center px-6 py-3 bg-red-500/80 backdrop-blur-sm text-white rounded-xl hover:bg-red-500 transition-all duration-300 border border-red-400/20 shadow-lg hover:shadow-xl"
                                >
                          <Trash2 className="w-5 h-5 mr-2" />
                          Supprimer ({selectedSubjectsForDeletion.size})
                </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
              </div>


              {/* Sélecteur de niveau scolaire */}
              <div className="flex items-center space-x-4">
                <label htmlFor="levelFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filtrer par niveau :
                </label>
                <select
                  id="levelFilter"
                  value={selectedSubjectLevel}
                  onChange={(e) => setSelectedSubjectLevel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">Tous les niveaux</option>
                  <option value="maternelle">Maternelle</option>
                  <option value="primaire">Primaire</option>
                  <option value="secondaire_1er_cycle">1er Cycle Secondaire</option>
                  <option value="secondaire_2nd_cycle">2nd Cycle Secondaire</option>
                </select>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {getSubjectsByLevel(selectedSubjectLevel).length} matière{getSubjectsByLevel(selectedSubjectLevel).length !== 1 ? 's' : ''} trouvée{getSubjectsByLevel(selectedSubjectLevel).length !== 1 ? 's' : ''}
                </span>
                {selectedSubjectLevel === 'all' && (
                <div className="flex space-x-2">
                      <button
                        onClick={() => setCollapsedGroups({ 'Maternelle': true, 'Primaire': true, 'Secondaire': true })}
                        className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/40 flex items-center space-x-1"
                      >
                        <ChevronRight className="w-3 h-3" />
                        <span>Tout replier</span>
                      </button>
                      <button
                        onClick={() => setCollapsedGroups({ 'Maternelle': false, 'Primaire': false, 'Secondaire': false })}
                        className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 flex items-center space-x-1"
                      >
                        <ChevronDown className="w-3 h-3" />
                        <span>Tout développer</span>
                      </button>
                  </div>
                  )}
              </div>

              <div className="space-y-8">
                {selectedSubjectLevel === 'all' ? (
                  // Affichage regroupé par niveau pour "Tous les niveaux"
                  Object.entries(getSubjectsGroupedByLevel()).map(([levelName, levelSubjects]) => {
                    // Vérifier si c'est un tableau (niveaux normaux) ou un objet (2nd cycle avec classes)
                    const isArray = Array.isArray(levelSubjects);
                    const hasSubjects = isArray ? levelSubjects.length > 0 : Object.keys(levelSubjects).length > 0;
                    
                    if (!hasSubjects) return null;
                    
                    return (
                      <div key={levelName} className="space-y-4">
                        {/* En-tête du niveau avec bouton de pliage/dépliage */}
                        <div className="pb-2 border-b-2 border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                levelName.includes('2nde') ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                                levelName.includes('1ère') ? 'bg-gradient-to-r from-purple-600 to-violet-600' :
                                levelName.includes('Tle') ? 'bg-gradient-to-r from-orange-600 to-red-600' :
                                levelName === 'Secondaire 1er cycle' ? 'bg-gradient-to-r from-indigo-600 to-blue-600' :
                                'bg-gradient-to-r from-blue-600 to-purple-600'
                              }`}>
                              <BookOpen className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                              {levelName}
                            </h3>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                levelName === 'Secondaire 2nd cycle' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                levelName === 'Secondaire 1er cycle' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' :
                                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              }`}>
                                {isArray ? 
                                  `${levelSubjects.length} matière${levelSubjects.length !== 1 ? 's' : ''}` :
                                  `${Object.values(levelSubjects).flat().length} matière${Object.values(levelSubjects).flat().length !== 1 ? 's' : ''}`
                                }
                            </span>
                          </div>
                          <button
                            onClick={() => toggleGroupCollapse(levelName)}
                              className="flex items-center justify-center w-8 h-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                            title={collapsedGroups[levelName] ? 'Développer' : 'Replier'}
                            aria-label={collapsedGroups[levelName] ? 'Développer le groupe' : 'Replier le groupe'}
                          >
                            {collapsedGroups[levelName] ? (
                              <ChevronRight className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          </div>
                          
                          {/* Boutons de sélection pour cette catégorie */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                const subjectIds = isArray ? 
                                  levelSubjects.map((s: any) => s.id) : 
                                  Object.values(levelSubjects).flat().map((s: any) => s.id);
                                setSelectedSubjectsForDeletion(new Set(subjectIds));
                              }}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40"
                            >
                              Tout sélectionner
                            </button>
                            {(() => {
                              const subjectIds = isArray ? 
                                levelSubjects.map((s: any) => s.id) : 
                                Object.values(levelSubjects).flat().map((s: any) => s.id);
                              const hasSelectedInCategory = subjectIds.some((id: string) => selectedSubjectsForDeletion.has(id));
                              
                              return hasSelectedInCategory && (
                                <button
                                  onClick={() => {
                                    const newSelection = new Set(selectedSubjectsForDeletion);
                                    subjectIds.forEach((id: string) => newSelection.delete(id));
                                    setSelectedSubjectsForDeletion(newSelection);
                                  }}
                                  className="px-3 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900/40"
                                >
                                  Aucune
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                        
                        {/* Liste des matières du niveau - conditionnellement affichée */}
                        {!collapsedGroups[levelName] && (
                          <div className="grid gap-4">
                            {isArray ? (
                              // Affichage simple pour les niveaux normaux
                              levelSubjects.map((subject) => (
                            <div key={subject.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  {/* Checkbox pour la sélection multiple */}
                                  <input
                                    type="checkbox"
                                    checked={selectedSubjectsForDeletion.has(subject.id)}
                                    onChange={() => toggleSubjectForDeletion(subject.id)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    aria-label={`Sélectionner la matière ${subject.name} pour suppression`}
                                  />
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    levelName.includes('2nde') ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                                    levelName.includes('1ère') ? 'bg-gradient-to-r from-purple-600 to-violet-600' :
                                    levelName.includes('Tle') ? 'bg-gradient-to-r from-orange-600 to-red-600' :
                                    levelName === 'Secondaire 1er cycle' ? 'bg-gradient-to-r from-indigo-600 to-blue-600' :
                                    'bg-gradient-to-r from-green-600 to-blue-600'
                                  }`}>
                                    <BookOpen className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">{subject.name}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Code: {subject.code} • Niveau: {formatSubjectLevel(subject.level)}</p>
                                    {subject.level === 'secondaire_2nd_cycle' && subject.classId ? (
                                      <div className="mt-2">
                                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">Classe: <span className="font-medium text-blue-600 dark:text-blue-400">{getClassName(subject.classId)}</span></p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500">Coefficient: <span className="font-medium text-green-600 dark:text-green-400">{subject.coefficient}</span></p>
                                      </div>
                                    ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-500">Coefficient: {subject.coefficient || 'N/A'}</p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => handleEditSubject(subject)}
                                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                                  >
                                    Modifier
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteSubject(subject)}
                                    className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50"
                                  >
                                    Supprimer
                                  </button>
                                </div>
                              </div>
                            </div>
                              ))
                            ) : (
                              // Affichage imbriqué pour le 2nd cycle (groupé par classe)
                              Object.entries(levelSubjects).map(([className, classSubjects]) => (
                                <div key={className} className="space-y-3">
                                  {/* En-tête de la classe */}
                                  <div className="pb-2 border-b border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-3">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                                          className.includes('2nde') ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                                          className.includes('1ère') ? 'bg-gradient-to-r from-purple-600 to-violet-600' :
                                          className.includes('Tle') ? 'bg-gradient-to-r from-orange-600 to-red-600' :
                                          'bg-gradient-to-r from-gray-600 to-gray-700'
                                        }`}>
                                          <BookOpen className="w-3 h-3 text-white" />
                                        </div>
                                        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                          {className}
                                        </h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          className.includes('2nde') ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                          className.includes('1ère') ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                                          className.includes('Tle') ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                          'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
                                        }`}>
                                          {classSubjects.length} matière{classSubjects.length !== 1 ? 's' : ''}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => toggleClassCollapse(className)}
                                        className="flex items-center justify-center w-6 h-6 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                                        title={collapsedClasses[className] ? 'Développer la classe' : 'Replier la classe'}
                                        aria-label={collapsedClasses[className] ? 'Développer la classe' : 'Replier la classe'}
                                      >
                                        {collapsedClasses[className] ? (
                                          <ChevronRight className="w-3 h-3" />
                                        ) : (
                                          <ChevronDown className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                    
                                    {/* Boutons de sélection pour cette classe */}
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => {
                                          const subjectIds = classSubjects.map((s: any) => s.id);
                                          setSelectedSubjectsForDeletion(new Set(subjectIds));
                                        }}
                                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40"
                                      >
                                        Tout sélectionner
                                      </button>
                                      {(() => {
                                        const subjectIds = classSubjects.map((s: any) => s.id);
                                        const hasSelectedInClass = subjectIds.some((id: string) => selectedSubjectsForDeletion.has(id));
                                        
                                        return hasSelectedInClass && (
                                          <button
                                            onClick={() => {
                                              const newSelection = new Set(selectedSubjectsForDeletion);
                                              subjectIds.forEach((id: string) => newSelection.delete(id));
                                              setSelectedSubjectsForDeletion(newSelection);
                                            }}
                                            className="px-2 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900/40"
                                          >
                                            Aucune
                                          </button>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                  
                                  {/* Matières de la classe - conditionnellement affichées */}
                                  {!collapsedClasses[className] && (
                                    <div className="grid gap-3 ml-6">
                                      {classSubjects.map((subject) => (
                                      <div key={subject.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-3">
                                            {/* Checkbox pour la sélection multiple */}
                                            <input
                                              type="checkbox"
                                              checked={selectedSubjectsForDeletion.has(subject.id)}
                                              onChange={() => toggleSubjectForDeletion(subject.id)}
                                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                              aria-label={`Sélectionner la matière ${subject.name} pour suppression`}
                                            />
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                              className.includes('2nde') ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                                              className.includes('1ère') ? 'bg-gradient-to-r from-purple-600 to-violet-600' :
                                              className.includes('Tle') ? 'bg-gradient-to-r from-orange-600 to-red-600' :
                                              'bg-gradient-to-r from-gray-600 to-gray-700'
                                            }`}>
                                              <BookOpen className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                              <h5 className="text-base font-medium text-gray-900 dark:text-gray-100">{subject.name}</h5>
                                              <p className="text-sm text-gray-600 dark:text-gray-400">Code: {subject.code} • Niveau: {formatSubjectLevel(subject.level)}</p>
                                              {subject.level === 'secondaire_2nd_cycle' && subject.classId ? (
                                                <div className="mt-1">
                                                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">Classe: <span className="font-medium text-blue-600 dark:text-blue-400">{getClassName(subject.classId)}</span></p>
                                                  <p className="text-sm text-gray-500 dark:text-gray-500">Coefficient: <span className="font-medium text-green-600 dark:text-green-400">{subject.coefficient}</span></p>
                                                </div>
                                              ) : (
                                                <p className="text-sm text-gray-500 dark:text-gray-500">Coefficient: {subject.coefficient || 'N/A'}</p>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <button 
                                              onClick={() => handleEditSubject(subject)}
                                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50"
                                  >
                                    Modifier
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteSubject(subject)}
                                    className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50"
                                  >
                                    Supprimer
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  // Affichage simple pour un niveau spécifique
              <div className="grid gap-4">
                {getSubjectsByLevel(selectedSubjectLevel).map((subject) => (
                  <div key={subject.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Checkbox pour la sélection multiple */}
                        <input
                          type="checkbox"
                          checked={selectedSubjectsForDeletion.has(subject.id)}
                          onChange={() => toggleSubjectForDeletion(subject.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          aria-label={`Sélectionner la matière ${subject.name} pour suppression`}
                        />
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          subject.level === 'secondaire_2nd_cycle' && subject.classId ? (
                            subject.classId.includes('2nde') ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                            subject.classId.includes('1ère') ? 'bg-gradient-to-r from-purple-600 to-violet-600' :
                            subject.classId.includes('Tle') ? 'bg-gradient-to-r from-orange-600 to-red-600' :
                            'bg-gradient-to-r from-gray-600 to-gray-700'
                          ) : subject.level === 'secondaire_1er_cycle' ? 'bg-gradient-to-r from-indigo-600 to-blue-600' :
                          'bg-gradient-to-r from-green-600 to-blue-600'
                        }`}>
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">{subject.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Code: {subject.code} • Niveau: {formatSubjectLevel(subject.level)}</p>
                          {subject.level === 'secondaire_2nd_cycle' && subject.classId ? (
                            <div className="mt-2">
                              <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">Classe: <span className="font-medium text-blue-600 dark:text-blue-400">{getClassName(subject.classId)}</span></p>
                              <p className="text-sm text-gray-500 dark:text-gray-500">Coefficient: <span className="font-medium text-green-600 dark:text-green-400">{subject.coefficient}</span></p>
                            </div>
                          ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-500">Coefficient: {subject.coefficient || 'N/A'}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditSubject(subject)}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          Modifier
                        </button>
                        <button 
                          onClick={() => handleDeleteSubject(subject)}
                          className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'teachers' && (
            <div>
            <TeachersTab
              teachers={teachers}
              classes={classes}
              subjects={subjects}
                schedule={schedule}
              onSaveAssignment={handleSaveAssignment}
              onSaveAvailability={handleSaveAvailability}
                onRefreshData={refreshData}
              loading={loading}
              error={error}
            />
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-6 lg:mb-0">
                      <h2 className="text-3xl font-bold mb-2">Réservations de Salles</h2>
                      <p className="text-indigo-100 text-lg">Gérez les réservations et disponibilités des salles</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {selectedReservationsForDeletion.size > 0 && (
                        <>
                  <button 
                    onClick={handleConfirmMultipleReservations}
                            className="inline-flex items-center px-6 py-3 bg-green-500/80 backdrop-blur-sm text-white rounded-xl hover:bg-green-500 transition-all duration-300 border border-green-400/20 shadow-lg hover:shadow-xl"
                  >
                            <Check className="w-5 h-5 mr-2" />
                            Valider ({selectedReservationsForDeletion.size})
                  </button>
                  <button 
                    onClick={() => setIsDeleteMultipleReservationsModalOpen(true)}
                            className="inline-flex items-center px-6 py-3 bg-red-500/80 backdrop-blur-sm text-white rounded-xl hover:bg-red-500 transition-all duration-300 border border-red-400/20 shadow-lg hover:shadow-xl"
                  >
                            <Trash2 className="w-5 h-5 mr-2" />
                            Supprimer ({selectedReservationsForDeletion.size})
                  </button>
                        </>
                      )}
                  <button 
                    onClick={handleNewReservation}
                        className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
                  >
                        <Plus className="w-5 h-5 mr-2" />
                        Nouvelle Réservation
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
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Réservations</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{reservations?.length || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Attente</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {reservations?.filter(r => r.status === 'En attente' || r.status === 'en_attente').length || 0}
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
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confirmées</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {reservations?.filter(r => r.status === 'confirmé').length || 0}
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
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Salles Fixes</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {classes?.filter(cls => getRoomTypeForClass(cls.level) === 'fixed').length || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Salles Polyvalentes</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {classes?.filter(cls => requiresRoomReservation(cls.level)).length || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons de sélection rapide pour les réservations */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredReservations?.length || 0} réservation{filteredReservations?.length !== 1 ? 's' : ''} trouvée{filteredReservations?.length !== 1 ? 's' : ''}
                  {reservationClassFilter && (
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {' '}pour la classe sélectionnée
                    </span>
                  )}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSelectAllReservations(true)}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    onClick={() => handleSelectAllReservations(false)}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900/40"
                  >
                    Aucune
                  </button>
                </div>
              </div>

              {/* Filtres */}
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Filtre par classe */}
              <div className="flex items-center space-x-4">
                <label htmlFor="classFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filtrer par classe :
                </label>
                <select
                  id="classFilter"
                  value={reservationClassFilter}
                  onChange={(e) => setReservationClassFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value="">Toutes les classes</option>
                  {classes?.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                        {cls.name} ({getRoomTypeForClass(cls.level) === 'fixed' ? 'Salle fixe' : 'Réservation requise'})
                    </option>
                  ))}
                </select>
                {reservationClassFilter && (
                  <button
                    onClick={() => setReservationClassFilter('')}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900/40"
                  >
                      Effacer
                  </button>
                )}
                </div>

                {/* Filtre par type de salle */}
                <div className="flex items-center space-x-4">
                  <label htmlFor="roomTypeFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type de salle :
                  </label>
                  <select
                    id="roomTypeFilter"
                    value={reservationRoomTypeFilter || ''}
                    onChange={(e) => setReservationRoomTypeFilter(e.target.value || null)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                  >
                    <option value="">Tous les types</option>
                    <option value="fixed">Salles fixes (Maternelle/Primaire)</option>
                    <option value="flexible">Salles polyvalentes (Secondaire)</option>
                    <option value="mixed">Salles mixtes (Secondaire)</option>
                  </select>
                  {reservationRoomTypeFilter && (
                    <button
                      onClick={() => setReservationRoomTypeFilter(null)}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900/40"
                    >
                      Effacer
                    </button>
                  )}
                </div>
              </div>

              {/* État de chargement */}
              {reservationsLoading && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-900/30">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-indigo-200 dark:bg-indigo-700 rounded w-1/4"></div>
                <div className="space-y-3">
                      <div className="h-12 bg-white dark:bg-gray-800 rounded-lg"></div>
                      <div className="h-12 bg-white dark:bg-gray-800 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Erreur */}
              {reservationsError && (
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-900/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-red-900 dark:text-red-300">Erreur de chargement</h4>
                      <p className="text-red-700 dark:text-red-400">{reservationsError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Liste des réservations */}
              {!reservationsLoading && !reservationsError && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-900/30">
                  <h4 className="text-lg font-medium text-indigo-900 dark:text-indigo-300 mb-4">
                    Réservations ({filteredReservations.length})
                  </h4>
                  
                  {filteredReservations.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 mx-auto text-indigo-400 mb-4" />
                      <h3 className="text-lg font-medium text-indigo-900 dark:text-indigo-300 mb-2">
                        {reservationClassFilter ? 'Aucune réservation pour cette classe' : 'Aucune réservation'}
                      </h3>
                      <p className="text-indigo-700 dark:text-indigo-400">
                        {reservationClassFilter 
                          ? 'Aucune réservation trouvée pour la classe sélectionnée.'
                          : 'Commencez par créer votre première réservation de salle.'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredReservations.map((reservation) => (
                        <div key={reservation.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3">
                            {/* Checkbox pour la sélection multiple */}
                            <input
                              type="checkbox"
                              checked={selectedReservationsForDeletion.has(reservation.id)}
                              onChange={(e) => handleReservationSelectionChange(reservation.id, e.target.checked)}
                              className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              aria-label={`Sélectionner la réservation pour ${reservation.subject_name || 'Matière'} pour suppression`}
                            />
                            <div className="flex-1">
                              {/* Titre généré automatiquement - en premier et en gras */}
                              <p className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                                {`Réservation pour cours de ${getReservationSubjectDisplay(reservation)}`}
                              </p>
                              
                              {/* Informations principales */}
                              <div className="space-y-2">
                                {/* Salle et type */}
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {reservation.room_name || 'Salle non spécifiée'}
                              </p>
                                  {(() => {
                                    const classObj = classes?.find(c => c.id === reservation.classId);
                                    const roomType = classObj ? getRoomTypeForClass(classObj.level) : 'unknown';
                                    const roomTypeLabels = {
                                      'fixed': 'Salle fixe',
                                      'flexible': 'Salle polyvalente',
                                      'mixed': 'Salle mixte',
                                      'unknown': 'Type inconnu'
                                    };
                                    const roomTypeColors = {
                                      'fixed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                                      'flexible': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
                                      'mixed': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
                                      'unknown': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                    };
                                    return (
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roomTypeColors[roomType]}`}>
                                        {roomTypeLabels[roomType]}
                                      </span>
                                    );
                                  })()}
                                </div>

                                {/* Date et horaires */}
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(reservation.date).toLocaleDateString('fr-FR')} • {reservation.start_time} - {reservation.end_time}
                              </p>
                                </div>

                                {/* Enseignant et classe */}
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-gray-500" />
                              <p className="text-sm text-gray-500 dark:text-gray-500">
                                    <span className="font-medium text-blue-600 dark:text-blue-400">{getReservationTeacherName(reservation)}</span> • {reservation.class_name || 'Classe non spécifiée'}
                              </p>
                                </div>

                                {/* Matière */}
                                <div className="flex items-center space-x-2">
                                  <BookOpen className="w-4 h-4 text-gray-500" />
                              <p className="text-sm text-gray-500 dark:text-gray-500">
                                    {getReservationSubjectDisplay(reservation)}
                              </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              reservation.status === 'confirmé' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : reservation.status === 'En attente' || reservation.status === 'en_attente'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {reservation.status === 'en_attente' ? 'En attente' : reservation.status}
                    </span>
                            <button
                              onClick={() => {
                                setSelectedItem(reservation);
                                setIsEditMode(true);
                                setIsRoomReservationModalOpen(true);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {(reservation.status === 'En attente' || reservation.status === 'en_attente') && (
                              <button
                                onClick={() => handleConfirmReservation(reservation.id)}
                                className="p-1 text-green-400 hover:text-green-600 dark:hover:text-green-300"
                                title="Valider réservation"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteReservation(reservation.id)}
                              className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                  </div>
                </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'availability' && (
            <AvailabilityTab
              teachers={teachers}
              classes={classes}
              subjects={subjects}
              workHours={workHours}
              onSaveAvailability={handleSaveAvailability}
              loading={loading}
              error={error}
            />
          )}

          {activeTab === 'journal' && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Cahier Journal</h3>
              <p className="text-gray-600 dark:text-gray-400">Module en cours de développement</p>
            </div>
          )}

          {activeTab === 'fiches-pedagogiques' && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Fiches Pédagogiques</h3>
              <p className="text-gray-600 dark:text-gray-400">Module en cours de développement</p>
            </div>
          )}
          {activeTab === 'cahier-textes' && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Cahier de Textes</h3>
              <p className="text-gray-600 dark:text-gray-400">Module en cours de développement</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSave={handleSaveClass}
        classData={selectedItem}
        isEdit={isEditMode}
        teachers={teachers}
        rooms={rooms}
      />

      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        onSave={handleSaveRoom}
        roomData={selectedItem}
        isEdit={isEditMode}
      />

      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        onSave={handleSaveSubject}
        subjectData={selectedItem}
        isEdit={isEditMode}
      />

      <BreakModal
        isOpen={isBreakModalOpen}
        onClose={() => setIsBreakModalOpen(false)}
        onSave={handleSaveBreaks}
        currentBreaks={breaks}
      />

      <WorkHoursModal
        isOpen={isWorkHoursModalOpen}
        onClose={() => setIsWorkHoursModalOpen(false)}
        onSave={handleSaveWorkHours}
        currentWorkHours={workHours}
      />

      <EnhancedRoomReservationModal
        isOpen={isRoomReservationModalOpen}
        onClose={() => setIsRoomReservationModalOpen(false)}
        onSave={handleSaveReservation}
        reservationData={selectedItem}
        isEdit={isEditMode}
        classes={classes}
        rooms={rooms}
        teachers={teachers}
        subjects={subjects}
      />

      <TeacherAssignmentModal
        isOpen={isTeacherAssignmentModalOpen}
        onClose={() => setIsTeacherAssignmentModalOpen(false)}
        onSave={handleSaveAssignment}
        assignmentData={selectedItem}
        isEdit={isEditMode}
        teachers={teachers}
        subjects={subjects}
        classes={classes}
      />

      <ScheduleEntryModal
        isOpen={isScheduleEntryModalOpen}
        onClose={() => setIsScheduleEntryModalOpen(false)}
        onSave={handleSaveScheduleEntry}
        scheduleData={selectedItem}
        isEdit={isEditMode}
        teachers={teachers}
        subjects={subjects}
        classes={classes}
        rooms={rooms}
        workHours={workHours}
      />

      <TeacherAvailabilityModal
        isOpen={isTeacherAvailabilityModalOpen}
        onClose={() => setIsTeacherAvailabilityModalOpen(false)}
        onSave={handleSaveAvailability}
        teacherId={selectedItem?.id}
        teacherName={selectedItem?.name}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={roomToDelete ? confirmDeleteRoom : (selectedItem?.type === 'subject' ? confirmDeleteSubject : confirmDeleteClass)}
        title={roomToDelete ? "Supprimer la salle" : (selectedItem?.type === 'subject' ? "Supprimer la matière" : "Supprimer la classe")}
        message={roomToDelete 
          ? "Êtes-vous sûr de vouloir supprimer cette salle ? Cette action est irréversible et supprimera définitivement la salle de votre système."
          : selectedItem?.type === 'subject'
          ? "Êtes-vous sûr de vouloir supprimer cette matière ? Cette action est irréversible et supprimera définitivement la matière de votre système."
          : "Êtes-vous sûr de vouloir supprimer cette classe ? Cette action est irréversible et supprimera définitivement la classe de votre système."
        }
        itemName={roomToDelete?.name || selectedItem?.name || ''}
        itemType={roomToDelete ? "Salle" : (selectedItem?.type === 'subject' ? "Matière" : "Classe")}
        isLoading={isDeleting}
      />

      {selectedRoomForPlanning && (
        <RoomPlanningModal
          isOpen={isRoomPlanningModalOpen}
          onClose={() => {
            setIsRoomPlanningModalOpen(false);
            setSelectedRoomForPlanning(null);
          }}
          room={selectedRoomForPlanning}
        />
      )}

      <RoomsPrintModal
        isOpen={isRoomsPrintModalOpen}
        onClose={() => setIsRoomsPrintModalOpen(false)}
        rooms={rooms || []}
      />

      <ClassesPrintModal
        isOpen={isClassesPrintModalOpen}
        onClose={() => setIsClassesPrintModalOpen(false)}
        classes={classes || []}
      />

      <MultipleSubjectsModal
        isOpen={isMultipleSubjectsModalOpen}
        onClose={() => {
          setIsMultipleSubjectsModalOpen(false);
        }}
        onSave={handleSaveMultipleSubjects}
        educationLevel=""
        schoolId={classes[0]?.school_id || ''}
        existingSubjects={subjects}
        allowLevelSelection={true}
      />

      {/* Modal de suppression multiple des matières */}
      {isDeleteMultipleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Confirmer la suppression
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>{selectedSubjectsForDeletion.size} matière(s)</strong> ? 
              Cette action est irréversible.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setIsDeleteMultipleModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDeleteMultipleSubjects}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer {selectedSubjectsForDeletion.size} matière(s)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression multiple des salles */}
      {isDeleteMultipleRoomsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Confirmer la suppression
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>{selectedRoomsForDeletion.size} salle(s)</strong> ? 
              Cette action est irréversible.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setIsDeleteMultipleRoomsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDeleteMultipleRooms}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer {selectedRoomsForDeletion.size} salle(s)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression multiple des classes */}
      {isDeleteMultipleClassesModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Confirmer la suppression
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>{selectedClassesForDeletion.size} classe(s)</strong> ? 
              Cette action est irréversible.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setIsDeleteMultipleClassesModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDeleteMultipleClasses}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer {selectedClassesForDeletion.size} classe(s)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast de notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ease-in-out ${
          toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <div className={`rounded-lg shadow-lg p-4 border-l-4 relative overflow-hidden ${
            toast.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400 text-green-800 dark:text-green-200'
              : toast.type === 'error'
              ? 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400 text-red-800 dark:text-red-200'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-800 dark:text-blue-200'
          }`}>
            {/* Barre de progression */}
            <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 animate-pulse" style={{ animationDuration: '5s' }}></div>
            
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                toast.type === 'success'
                  ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400'
                  : toast.type === 'error'
                  ? 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400'
                  : 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400'
              }`}>
                {toast.type === 'success' ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : toast.type === 'error' ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast(prev => ({ ...prev, show: false }))}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Fermer la notification"
                title="Fermer la notification"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression des réservations */}
      <DeleteConfirmationModal
        isOpen={isDeleteReservationModalOpen}
        onClose={() => {
          setIsDeleteReservationModalOpen(false);
          setReservationToDelete(null);
        }}
        onConfirm={confirmDeleteReservation}
        title="Supprimer la réservation"
        message="Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible et supprimera définitivement la réservation de votre système."
        itemName={reservationToDelete ? `${reservationToDelete.subject_name || reservationToDelete.subject || 'Matière non spécifiée'} - ${getReservationTeacherName(reservationToDelete)}` : ''}
        itemType="Réservation"
        isLoading={isDeletingReservation}
      />

      {/* Modal de confirmation de suppression multiple des réservations */}
      {isDeleteMultipleReservationsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Confirmer la suppression
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>{selectedReservationsForDeletion.size} réservation(s)</strong> ? 
              Cette action est irréversible.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setIsDeleteMultipleReservationsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDeleteMultipleReservations}
                disabled={isDeletingMultipleReservations}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isDeletingMultipleReservations ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Suppression...
                  </>
                ) : (
                  `Supprimer ${selectedReservationsForDeletion.size} réservation(s)`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planning;
