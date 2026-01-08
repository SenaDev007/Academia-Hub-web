import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { studentService } from '../services/studentService';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  classId?: string;
  className?: string;
  enrollmentDate?: string;
  status: 'active' | 'inactive' | 'transferred' | 'graduated';
  photo?: string;
  medicalInfo?: string;
  registrationNumber?: string;
  studentNumber?: string;
  notes?: string;
  // Nouveaux champs pour les frais scolaires
  seniority?: 'new' | 'old';
  inscriptionFee?: number;
  reinscriptionFee?: number;
  tuitionFee?: number;
  totalSchoolFees?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Class {
  id: string;
  name: string;
  level: string;
}

export interface Absence {
  id: string;
  studentId: string;
  studentName: string;
  firstName?: string;
  lastName?: string;
  class: string;
  className?: string; // Ajout pour compatibilité avec la base de données
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentAddress?: string;
  parentProfession?: string;
  parentRelationship?: string;
  date: string;
  period: string;
  reason: string;
  justified: boolean;
  parentNotified: boolean;
  comments?: string;
}

export interface DisciplineIncident {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  date: string;
  incident: string;
  severity: 'minor' | 'major' | 'severe';
  action: string;
  teacher: string;
}

export interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  presentStudents: number; // Ajout des présents
  absentStudents: number;
  newStudentsThisWeek: number;
  attendanceRate: number;
  averageAge: number;
  classDistribution: Record<string, number>;
}

export interface ClassTransfer {
  id: string;
  studentId: string;
  studentName?: string;
  fromClassId: string;
  fromClassName?: string;
  toClassId: string;
  toClassName?: string;
  reason: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UseStudentsDataReturn {
  // Données
  students: Student[];
  classes: Class[];
  absences: Absence[];
  disciplineIncidents: DisciplineIncident[];
  transfers: ClassTransfer[];
  stats: StudentStats;
  
  // États de chargement
  loading: boolean;
  studentsLoading: boolean;
  classesLoading: boolean;
  absencesLoading: boolean;
  disciplineLoading: boolean;
  transfersLoading: boolean;
  statsLoading: boolean;
  
  // États d'erreur
  error: string | null;
  
  // Fonctions CRUD pour les étudiants
  createStudent: (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateStudent: (id: string, studentData: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  
  // Fonctions CRUD pour les absences
  createAbsence: (absenceData: Omit<Absence, 'id'>) => Promise<void>;
  updateAbsence: (id: string, absenceData: Partial<Absence>) => Promise<void>;
  deleteAbsence: (id: string) => Promise<void>;
  
  // Fonctions CRUD pour les incidents disciplinaires
  createDisciplineIncident: (incidentData: Omit<DisciplineIncident, 'id'>) => Promise<void>;
  updateDisciplineIncident: (id: string, incidentData: Partial<DisciplineIncident>) => Promise<void>;
  deleteDisciplineIncident: (id: string) => Promise<void>;
  
  // Fonctions CRUD pour les transferts
  createTransfer: (transferData: Omit<ClassTransfer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransfer: (id: string, transferData: Partial<ClassTransfer>) => Promise<void>;
  deleteTransfer: (id: string) => Promise<void>;
  approveTransfer: (id: string, approvedBy: string) => Promise<void>;
  rejectTransfer: (id: string, approvedBy: string, notes?: string) => Promise<void>;
  
  // Fonctions de récupération avec filtres
  getStudentsWithFilters: (filters?: any) => Promise<void>;
  
  // Fonctions de récupération individuelles
  fetchTransfers: () => Promise<void>;
  
  // Fonction de rafraîchissement
  refreshData: () => Promise<void>;
}

export function useStudentsData(): UseStudentsDataReturn {
  const { user } = useUser();
  
  // États des données
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [disciplineIncidents, setDisciplineIncidents] = useState<DisciplineIncident[]>([]);
  const [transfers, setTransfers] = useState<ClassTransfer[]>([]);
  const [stats, setStats] = useState<StudentStats>({
    totalStudents: 0,
    activeStudents: 0,
    presentStudents: 0, // Ajout des présents
    absentStudents: 0,
    newStudentsThisWeek: 0,
    attendanceRate: 0,
    averageAge: 0,
    classDistribution: {}
  });
  
  // États de chargement
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(false);
  const [absencesLoading, setAbsencesLoading] = useState(false);
  const [disciplineLoading, setDisciplineLoading] = useState(false);
  const [transfersLoading, setTransfersLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // État d'erreur
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer tous les étudiants
  const fetchStudents = useCallback(async () => {
    if (!user?.schoolId) return;
    
    setStudentsLoading(true);
    setError(null);
    
    try {
      console.log('=== DEBUG fetchStudents ===');
      console.log('schoolId:', user.schoolId);
      
      const studentsData = await studentService.getAllStudents();
      console.log('Students récupérés:', studentsData);
      setStudents(studentsData);
    } catch (err) {
      console.error('Erreur lors de la récupération des étudiants:', err);
      setError('Erreur lors de la récupération des étudiants');
    } finally {
      setStudentsLoading(false);
    }
  }, [user?.schoolId]);

  // Fonction pour récupérer toutes les classes
  const fetchClasses = useCallback(async () => {
    if (!user?.schoolId) return;
    
    setClassesLoading(true);
    setError(null);
    
    try {
      const classesData = await studentService.getClasses();
      setClasses(classesData);
    } catch (err) {
      console.error('Erreur lors de la récupération des classes:', err);
      setError('Erreur lors de la récupération des classes');
    } finally {
      setClassesLoading(false);
    }
  }, [user?.schoolId]);

  // Fonction pour récupérer toutes les absences
  const fetchAbsences = useCallback(async () => {
    if (!user?.schoolId) return;
    
    setAbsencesLoading(true);
    setError(null);
    
    try {
      console.log('=== DEBUG fetchAbsences ===');
      console.log('schoolId:', user.schoolId);
      
      const absencesData = await studentService.getAbsences(user.schoolId);
      console.log('Absences récupérées:', absencesData);
      console.log('Nombre d\'absences:', absencesData.length);
      
      // Debug détaillé pour chaque absence
      absencesData.forEach((absence, index) => {
        console.log(`Absence ${index + 1}:`, {
          id: absence.id,
          studentName: absence.studentName,
          className: absence.className,
          date: absence.date,
          period: absence.period,
          reason: absence.reason,
          justified: absence.justified,
          parentNotified: absence.parentNotified
        });
      });
      
      setAbsences(absencesData);
    } catch (err) {
      console.error('Erreur lors de la récupération des absences:', err);
      setError('Erreur lors de la récupération des absences');
    } finally {
      setAbsencesLoading(false);
    }
  }, [user?.schoolId]);

  // Fonction pour récupérer tous les incidents disciplinaires
  const fetchDisciplineIncidents = useCallback(async () => {
    if (!user?.schoolId) return;
    
    setDisciplineLoading(true);
    setError(null);
    
    try {
      // TODO: Implémenter getDisciplineIncidents dans studentService
      setDisciplineIncidents([]);
    } catch (err) {
      console.error('Erreur lors de la récupération des incidents disciplinaires:', err);
      setError('Erreur lors de la récupération des incidents disciplinaires');
    } finally {
      setDisciplineLoading(false);
    }
  }, [user?.schoolId]);

  // Fonction pour récupérer les transferts
  const fetchTransfers = useCallback(async () => {
    if (!user?.schoolId) return;
    
    setTransfersLoading(true);
    setError(null);
    
    try {
      console.log('=== DEBUG fetchTransfers ===');
      console.log('schoolId:', user.schoolId);
      
      const transfersData = await studentService.getClassTransfers(user.schoolId);
      console.log('Transfers récupérés:', transfersData);
      console.log('Nombre de transferts:', transfersData.length);
      
      // Debug détaillé pour chaque transfert
      transfersData.forEach((transfer, index) => {
        console.log(`Transfert ${index + 1}:`, {
          id: transfer.id,
          studentName: transfer.studentName,
          fromClassName: transfer.fromClassName,
          toClassName: transfer.toClassName,
          status: transfer.status
        });
      });
      
      setTransfers(transfersData);
    } catch (err) {
      console.error('Erreur lors de la récupération des transferts:', err);
      setError('Erreur lors de la récupération des transferts');
    } finally {
      setTransfersLoading(false);
    }
  }, [user?.schoolId]);

  // Fonction pour récupérer les statistiques des étudiants
  const fetchStats = useCallback(async () => {
    if (!user?.schoolId) return;
    
    setStatsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 fetchStats appelé avec schoolId:', user.schoolId);
      const statsData = await studentService.getEnrollmentStats();
      console.log('📊 Statistiques reçues du service:', statsData);
      setStats(statsData);
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err);
      // Fallback vers des stats calculées
      const activeStudents = students.filter(s => s.status === 'active').length;
      const totalStudents = students.length;
      const absentStudents = Math.floor(totalStudents * 0.05); // 5% d'absents
      const presentStudents = totalStudents - absentStudents; // Calcul correct des présents
      const mockStats: StudentStats = {
        totalStudents,
        activeStudents,
        presentStudents, // Ajout des présents
        absentStudents,
        newStudentsThisWeek: Math.floor(totalStudents * 0.01), // 1% nouveaux
        attendanceRate: 95.3,
        averageAge: 15.2,
        classDistribution: {}
      };
      setStats(mockStats);
      setError('Erreur lors de la récupération des statistiques');
    } finally {
      setStatsLoading(false);
    }
  }, [user?.schoolId, students]);

  // Fonction pour récupérer tous les étudiants avec filtres
  const getStudentsWithFilters = useCallback(async (filters?: any) => {
    if (!user?.schoolId) return;
    
    setStudentsLoading(true);
    setError(null);
    
    try {
      const studentsData = await studentService.getAllStudents(filters);
      setStudents(studentsData);
    } catch (err) {
      console.error('Erreur lors de la récupération des étudiants avec filtres:', err);
      setError('Erreur lors de la récupération des étudiants');
    } finally {
      setStudentsLoading(false);
    }
  }, [user?.schoolId]);

  // Fonction pour récupérer toutes les données
  const fetchData = useCallback(async () => {
    if (!user?.schoolId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchStudents(),
        fetchClasses(),
        fetchAbsences(),
        fetchDisciplineIncidents(),
        fetchTransfers()
      ]);
    } catch (err) {
      console.error('Erreur lors de la récupération des données étudiants:', err);
      setError('Erreur lors de la récupération des données étudiants');
    } finally {
      setLoading(false);
    }
  }, [user?.schoolId, fetchStudents, fetchClasses, fetchAbsences, fetchDisciplineIncidents, fetchTransfers]);

  // Fonction de rafraîchissement
  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Fonctions CRUD pour les étudiants
  const createStudent = useCallback(async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.schoolId) {
      console.error('Aucun établissement sélectionné');
      throw new Error('Aucun établissement sélectionné');
    }
    
    try {
      console.log('=== DEBUG createStudent dans useStudentsData ===');
      console.log('studentData reçu:', studentData);
      console.log('Appel de studentService.createStudent avec:', { ...studentData, schoolId: user.schoolId });
      
      const result = await studentService.createStudent({ ...studentData, schoolId: user.schoolId });
      console.log('Résultat createStudent:', result);
      
      console.log('Rafraîchissement des données...');
      await fetchStudents(); // Rafraîchir la liste
      await fetchStats(); // Rafraîchir les statistiques
      console.log('Données rafraîchies avec succès');
    } catch (err) {
      console.error('Erreur lors de la création de l\'étudiant:', err);
      throw err;
    }
  }, [user?.schoolId, fetchStudents, fetchStats]);

  const updateStudent = useCallback(async (id: string, studentData: Partial<Student>) => {
    try {
      const result = await studentService.updateStudent(id, studentData);
      await fetchStudents(); // Rafraîchir la liste
      await fetchStats(); // Rafraîchir les statistiques
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'étudiant:', err);
      throw err;
    }
  }, [fetchStudents, fetchStats]);

  const deleteStudent = useCallback(async (id: string) => {
    try {
      await studentService.deleteStudent(id);
      await fetchStudents(); // Rafraîchir la liste
      await fetchStats(); // Rafraîchir les statistiques
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'étudiant:', err);
      throw err;
    }
  }, [fetchStudents, fetchStats]);

  // Fonctions CRUD pour les absences
  const createAbsence = useCallback(async (absenceData: Omit<Absence, 'id'>) => {
    if (!user?.schoolId) {
      console.error('Aucun établissement sélectionné');
      throw new Error('Aucun établissement sélectionné');
    }
    
    try {
      console.log('=== DEBUG createAbsence dans useStudentsData ===');
      console.log('absenceData reçu:', absenceData);
      console.log('Appel de studentService.createAbsence avec:', { ...absenceData, schoolId: user.schoolId });
      
      const result = await studentService.createAbsence({ ...absenceData, schoolId: user.schoolId });
      console.log('Résultat createAbsence:', result);
      
      console.log('Rafraîchissement des données...');
      await fetchAbsences(); // Rafraîchir la liste
      console.log('Données rafraîchies avec succès');
    } catch (err) {
      console.error('Erreur lors de la création de l\'absence:', err);
      throw err;
    }
  }, [user?.schoolId, fetchAbsences]);

  const updateAbsence = useCallback(async (id: string, absenceData: Partial<Absence>) => {
    try {
      console.log('=== DEBUG updateAbsence dans useStudentsData ===');
      console.log('id:', id);
      console.log('absenceData:', absenceData);
      
      await studentService.updateAbsence(id, absenceData);
      console.log('Absence mise à jour avec succès');
      
      await fetchAbsences(); // Rafraîchir la liste
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'absence:', err);
      throw err;
    }
  }, [fetchAbsences]);

  const deleteAbsence = useCallback(async (id: string) => {
    try {
      console.log('=== DEBUG deleteAbsence dans useStudentsData ===');
      console.log('id:', id);
      
      await studentService.deleteAbsence(id);
      console.log('Absence supprimée avec succès');
      
      await fetchAbsences(); // Rafraîchir la liste
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'absence:', err);
      throw err;
    }
  }, [fetchAbsences]);

  // Fonctions CRUD pour les incidents disciplinaires
  const createDisciplineIncident = useCallback(async (incidentData: Omit<DisciplineIncident, 'id'>) => {
    if (!user?.schoolId) return;
    
    try {
      // TODO: Implémenter createDisciplineIncident dans studentService
      console.log('createDisciplineIncident appelé avec:', incidentData);
      await fetchDisciplineIncidents(); // Rafraîchir la liste
    } catch (err) {
      console.error('Erreur lors de la création de l\'incident disciplinaire:', err);
      throw err;
    }
  }, [user?.schoolId, fetchDisciplineIncidents]);

  const updateDisciplineIncident = useCallback(async (id: string, incidentData: Partial<DisciplineIncident>) => {
    try {
      // TODO: Implémenter updateDisciplineIncident dans studentService
      console.log('updateDisciplineIncident appelé avec:', id, incidentData);
      await fetchDisciplineIncidents(); // Rafraîchir la liste
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'incident disciplinaire:', err);
      throw err;
    }
  }, [fetchDisciplineIncidents]);

  const deleteDisciplineIncident = useCallback(async (id: string) => {
    try {
      // TODO: Implémenter deleteDisciplineIncident dans studentService
      console.log('deleteDisciplineIncident appelé avec:', id);
      await fetchDisciplineIncidents(); // Rafraîchir la liste
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'incident disciplinaire:', err);
      throw err;
    }
  }, [fetchDisciplineIncidents]);

  // Fonctions CRUD pour les transferts
  const createTransfer = useCallback(async (transferData: Omit<ClassTransfer, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.schoolId) {
      console.error('Aucun établissement sélectionné');
      throw new Error('Aucun établissement sélectionné');
    }
    
    try {
      console.log('=== DEBUG createTransfer dans useStudentsData ===');
      console.log('transferData reçu:', transferData);
      console.log('Appel de studentService.createClassTransfer avec:', { ...transferData, schoolId: user.schoolId });
      
      const result = await studentService.createClassTransfer({ ...transferData, schoolId: user.schoolId });
      console.log('Résultat createClassTransfer:', result);
      
      console.log('Rafraîchissement des données...');
      await fetchTransfers(); // Rafraîchir la liste
      console.log('Données rafraîchies avec succès');
    } catch (err) {
      console.error('Erreur lors de la création du transfert:', err);
      throw err;
    }
  }, [user?.schoolId, fetchTransfers]);

  const updateTransfer = useCallback(async (id: string, transferData: Partial<ClassTransfer>) => {
    try {
      console.log('updateTransfer appelé avec:', id, transferData);
      await studentService.updateClassTransfer(id, transferData);
      await fetchTransfers(); // Rafraîchir la liste
    } catch (err) {
      console.error('Erreur lors de la mise à jour du transfert:', err);
      throw err;
    }
  }, [fetchTransfers]);

  const deleteTransfer = useCallback(async (id: string) => {
    try {
      console.log('=== DEBUG deleteTransfer ===');
      console.log('deleteTransfer appelé avec:', id);
      await studentService.deleteClassTransfer(id);
      await fetchTransfers(); // Rafraîchir la liste
      console.log('Transfert supprimé avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression du transfert:', err);
      throw err;
    }
  }, [fetchTransfers]);

  const approveTransfer = useCallback(async (id: string, approvedBy: string) => {
    try {
      console.log('=== DEBUG approveTransfer ===');
      console.log('id:', id);
      console.log('approvedBy:', approvedBy);
      
      // Récupérer les détails du transfert
      const transfer = transfers.find(t => t.id === id);
      if (!transfer) {
        throw new Error('Transfert non trouvé');
      }
      
      console.log('Transfert trouvé:', transfer);
      console.log('studentId:', transfer.studentId);
      console.log('toClassId:', transfer.toClassId);
      
      // 1. Mettre à jour le statut du transfert
      await studentService.updateClassTransfer(id, { 
        status: 'approved', 
        approvedBy, 
        approvedAt: new Date().toISOString() 
      });
      
      // 2. Déplacer l'élève vers la nouvelle classe
      console.log('=== DEBUG - Déplacement de l\'élève ===');
      console.log('studentId à déplacer:', transfer.studentId);
      console.log('toClassId (nouvelle classe):', transfer.toClassId);
      
      const updateResult = await studentService.updateStudentClass(transfer.studentId, transfer.toClassId);
      console.log('Résultat updateStudentClass:', updateResult);
      
      console.log('Transfert approuvé et élève déplacé avec succès');
      
      // 3. Rafraîchir les données
      await fetchTransfers();
      await fetchStudents(); // Rafraîchir aussi la liste des étudiants
    } catch (err) {
      console.error('Erreur lors de l\'approbation du transfert:', err);
      throw err;
    }
  }, [fetchTransfers, fetchStudents, transfers]);

  const rejectTransfer = useCallback(async (id: string, approvedBy: string, notes?: string) => {
    try {
      console.log('=== DEBUG rejectTransfer ===');
      console.log('id:', id);
      console.log('approvedBy:', approvedBy);
      console.log('notes:', notes);
      
      // Récupérer les détails du transfert
      const transfer = transfers.find(t => t.id === id);
      if (!transfer) {
        throw new Error('Transfert non trouvé');
      }
      
      console.log('Transfert trouvé:', transfer);
      
      // 1. Mettre à jour le statut du transfert (rejeté)
      await studentService.updateClassTransfer(id, { 
        status: 'rejected', 
        approvedBy, 
        approvedAt: new Date().toISOString(),
        notes: notes || 'Transfert rejeté par l\'administrateur'
      });
      
      console.log('Transfert rejeté avec succès - l\'élève reste dans sa classe d\'origine');
      
      // 2. Rafraîchir les données (pas besoin de déplacer l'élève)
      await fetchTransfers();
    } catch (err) {
      console.error('Erreur lors du rejet du transfert:', err);
      throw err;
    }
  }, [fetchTransfers, transfers]);


  // Effet pour charger les données au montage et quand schoolId change
  useEffect(() => {
    if (user?.schoolId) {
      fetchData();
    }
  }, [user?.schoolId, fetchData]);

  // Effet pour mettre à jour les stats quand les étudiants changent
  useEffect(() => {
    if (students.length > 0) {
      fetchStats();
    }
  }, [students, fetchStats]);

  return {
    // Données
    students,
    classes,
    absences,
    disciplineIncidents,
    transfers,
    stats,
    
    // États de chargement
    loading,
    studentsLoading,
    classesLoading,
    absencesLoading,
    disciplineLoading,
    transfersLoading,
    statsLoading,
    
    // États d'erreur
    error,
    
    // Fonctions CRUD pour les étudiants
    createStudent,
    updateStudent,
    deleteStudent,
    
    // Fonctions CRUD pour les absences
    createAbsence,
    updateAbsence,
    deleteAbsence,
    
    // Fonctions CRUD pour les incidents disciplinaires
    createDisciplineIncident,
    updateDisciplineIncident,
    deleteDisciplineIncident,
    
    // Fonctions CRUD pour les transferts
    createTransfer,
    updateTransfer,
    deleteTransfer,
    approveTransfer,
    rejectTransfer,
    
    // Fonctions de récupération avec filtres
    getStudentsWithFilters,
    
    // Fonctions de récupération individuelles
    fetchTransfers,
    
    // Fonction de rafraîchissement
    refreshData,
  };
}
