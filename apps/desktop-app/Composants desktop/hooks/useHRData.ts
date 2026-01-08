import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import hrService, { 
  Teacher, 
  Department, 
  Contract, 
  Evaluation, 
  Training, 
  HRStats,
  TeacherFilters,
  ContractFilters
} from '../services/hrService';

interface UseHRDataReturn {
  // Données
  teachers: Teacher[];
  departments: Department[];
  contracts: Contract[];
  evaluations: Evaluation[];
  trainings: Training[];
  stats: HRStats;
  
  // États de chargement
  loading: boolean;
  teachersLoading: boolean;
  departmentsLoading: boolean;
  contractsLoading: boolean;
  evaluationsLoading: boolean;
  trainingsLoading: boolean;
  statsLoading: boolean;
  
  // États d'erreur
  error: string | null;
  
  // Fonctions CRUD pour les enseignants
  createTeacher: (teacherData: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTeacher: (id: string, teacherData: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  
  // Fonctions CRUD pour les contrats
  createContract: (contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContract: (id: string, contractData: Partial<Contract>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
  
  // Fonctions CRUD pour les évaluations
  createEvaluation: (evaluationData: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvaluation: (id: string, evaluationData: Partial<Evaluation>) => Promise<void>;
  deleteEvaluation: (id: string) => Promise<void>;
  
  // Fonctions CRUD pour les formations
  createTraining: (trainingData: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTraining: (id: string, trainingData: Partial<Training>) => Promise<void>;
  deleteTraining: (id: string) => Promise<void>;
  
  // Fonctions de récupération avec filtres
  getTeachersWithFilters: (filters?: TeacherFilters) => Promise<void>;
  getContractsWithFilters: (filters?: ContractFilters) => Promise<void>;
  
  // Fonction de rafraîchissement
    refreshData,
    
    
}

export function useHRData(): UseHRDataReturn {
  const { user } = useUser();
  
  // États des données
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [stats, setStats] = useState<HRStats>({
    totalTeachers: 0,
    activeTeachers: 0,
    totalSalary: 0,
    averageSalary: 0,
    contractsExpiring: 0,
    evaluationsPending: 0,
    trainingsThisMonth: 0,
    satisfactionScore: 0
  });
  
  // États de chargement
  const [loading, setLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [evaluationsLoading, setEvaluationsLoading] = useState(false);
  const [trainingsLoading, setTrainingsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // État d'erreur
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer tous les enseignants
  const fetchTeachers = useCallback(async () => {
    if (!user?.schoolId) return;
    
    setTeachersLoading(true);
    setError(null);
    
    try {
      console.log('=== DEBUG fetchTeachers ===');
      console.log('schoolId:', user.schoolId);
      
      const response = await hrService.getTeachers(user.schoolId);
      console.log('Réponse getTeachers:', response);
      
      setTeachers(response);
      console.log('Teachers mis à jour:', response);
    } catch (err) {
      console.error('Erreur lors de la récupération des enseignants:', err);
      setError('Erreur lors de la récupération des enseignants');
    } finally {
      setTeachersLoading(false);
    }
  }, [user?.schoolId]);

  // Fonction pour récupérer tous les départements
  const fetchDepartments = useCallback(async () => {
    if (!user?.schoolId) return;
    
    setDepartmentsLoading(true);
    setError(null);
    
    try {
      const response = await hrService.getDepartments(user.schoolId);
      setDepartments(response);
    } catch (err) {
      console.error('Erreur lors de la récupération des départements:', err);
      setError('Erreur lors de la récupération des départements');
    } finally {
      setDepartmentsLoading(false);
    }
  }, [user?.schoolId]);

  // Fonction pour récupérer tous les contrats
  const fetchContracts = useCallback(async () => {
    if (!user?.schoolId) return;
    
    console.log('=== DEBUG fetchContracts ===');
    console.log('schoolId:', user.schoolId);
    
    setContractsLoading(true);
    setError(null);
    
    try {
      const response = await hrService.getContracts(user.schoolId);
      console.log('Contrats récupérés:', response);
      console.log('Nombre de contrats:', response?.length);
      setContracts(response);
    } catch (err) {
      console.error('Erreur lors de la récupération des contrats:', err);
      setError('Erreur lors de la récupération des contrats');
    } finally {
      setContractsLoading(false);
    }
  }, [user?.schoolId]);

  // Fonction pour récupérer toutes les évaluations
  const fetchEvaluations = useCallback(async () => {
    if (!user?.schoolId) return;
    
    setEvaluationsLoading(true);
    setError(null);
    
    try {
      const response = await hrService.getEvaluations(user.schoolId);
      setEvaluations(response);
    } catch (err) {
      console.error('Erreur lors de la récupération des évaluations:', err);
      setError('Erreur lors de la récupération des évaluations');
    } finally {
      setEvaluationsLoading(false);
    }
  }, [user?.schoolId]);

  // Fonction pour récupérer toutes les formations
  const fetchTrainings = useCallback(async () => {
    if (!user?.schoolId) return;
    
    setTrainingsLoading(true);
    setError(null);
    
    try {
      const response = await hrService.getTrainings(user.schoolId);
      setTrainings(response);
    } catch (err) {
      console.error('Erreur lors de la récupération des formations:', err);
      setError('Erreur lors de la récupération des formations');
    } finally {
      setTrainingsLoading(false);
    }
  }, [user?.schoolId]);

  // Fonction pour récupérer les statistiques RH
  const fetchStats = useCallback(async () => {
    if (!user?.schoolId) return;
    
    setStatsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 fetchStats appelé avec schoolId:', user.schoolId);
      const response = await hrService.getHRStats(user.schoolId);
      console.log('📊 Statistiques reçues du service:', response);
      setStats(response);
      console.log('📊 Stats mises à jour dans le state:', response);
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques RH:', err);
      setError('Erreur lors de la récupération des statistiques RH');
    } finally {
      setStatsLoading(false);
    }
  }, [user?.schoolId]);

  // Fonction pour récupérer tous les enseignants avec filtres
  const getTeachersWithFilters = useCallback(async (filters?: TeacherFilters) => {
    if (!user?.schoolId) return;
    
    setTeachersLoading(true);
    setError(null);
    
    try {
      const response = await hrService.getTeachers(user.schoolId, filters);
      setTeachers(response);
    } catch (err) {
      console.error('Erreur lors de la récupération des enseignants avec filtres:', err);
      setError('Erreur lors de la récupération des enseignants');
    } finally {
      setTeachersLoading(false);
    }
  }, [user?.schoolId]);

  // Fonction pour récupérer tous les contrats avec filtres
  const getContractsWithFilters = useCallback(async (filters?: ContractFilters) => {
    if (!user?.schoolId) return;
    
    setContractsLoading(true);
    setError(null);
    
    try {
      const response = await hrService.getContracts(user.schoolId, filters);
      setContracts(response);
    } catch (err) {
      console.error('Erreur lors de la récupération des contrats avec filtres:', err);
      setError('Erreur lors de la récupération des contrats');
    } finally {
      setContractsLoading(false);
    }
  }, [user?.schoolId]);

  // Fonction pour récupérer toutes les données
  const fetchData = useCallback(async () => {
    if (!user?.schoolId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchTeachers(),
        fetchDepartments(),
        fetchContracts(),
        fetchEvaluations(),
        fetchTrainings(),
        fetchStats()
      ]);
    } catch (err) {
      console.error('Erreur lors de la récupération des données RH:', err);
      setError('Erreur lors de la récupération des données RH');
    } finally {
      setLoading(false);
    }
  }, [user?.schoolId, fetchTeachers, fetchDepartments, fetchContracts, fetchEvaluations, fetchTrainings, fetchStats]);

  // Fonction de rafraîchissement
  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);



  // Fonctions CRUD pour les enseignants
  const createTeacher = useCallback(async (teacherData: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.schoolId) return;
    
    try {
      console.log('=== DEBUG createTeacher dans useHRData ===');
      console.log('teacherData reçu:', teacherData);
      
      const result = await hrService.createTeacher({ ...teacherData, schoolId: user.schoolId });
      console.log('Résultat createTeacher:', result);
      
      console.log('Rafraîchissement des données...');
      await fetchTeachers(); // Rafraîchir la liste
      await fetchStats(); // Rafraîchir les statistiques
      console.log('Données rafraîchies avec succès');
    } catch (err) {
      console.error('Erreur lors de la création de l\'enseignant:', err);
      throw err;
    }
  }, [user?.schoolId, fetchTeachers, fetchStats]);

  const updateTeacher = useCallback(async (id: string, teacherData: Partial<Teacher>) => {
    try {
      console.log('=== DEBUG updateTeacher dans useHRData ===');
      console.log('ID:', id);
      console.log('teacherData:', teacherData);
      
      const result = await hrService.updateTeacher(id, teacherData);
      console.log('Résultat updateTeacher:', result);
      
      console.log('Rafraîchissement des données...');
      await fetchTeachers(); // Rafraîchir la liste
      await fetchStats(); // Rafraîchir les statistiques
      console.log('Données rafraîchies avec succès');
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'enseignant:', err);
      throw err;
    }
  }, [fetchTeachers, fetchStats]);

  const deleteTeacher = useCallback(async (id: string) => {
    try {
      await hrService.deleteTeacher(id);
      await fetchTeachers(); // Rafraîchir la liste
      await fetchStats(); // Rafraîchir les statistiques
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'enseignant:', err);
      throw err;
    }
  }, [fetchTeachers, fetchStats]);

  // Fonctions CRUD pour les contrats
  const createContract = useCallback(async (contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.schoolId) return;
    
    try {
      console.log('=== DEBUG createContract dans useHRData ===');
      console.log('contractData reçu:', contractData);
      
      const result = await hrService.createContract({ ...contractData, schoolId: user.schoolId });
      console.log('Résultat createContract:', result);
      
      console.log('Rafraîchissement des données...');
      await fetchContracts(); // Rafraîchir la liste
      await fetchStats(); // Rafraîchir les statistiques
      console.log('Données rafraîchies avec succès');
    } catch (err) {
      console.error('Erreur lors de la création du contrat:', err);
      throw err;
    }
  }, [user?.schoolId, fetchContracts, fetchStats]);

  const updateContract = useCallback(async (id: string, contractData: Partial<Contract>) => {
    try {
      await hrService.updateContract(id, contractData);
      await fetchContracts(); // Rafraîchir la liste
      await fetchStats(); // Rafraîchir les statistiques
    } catch (err) {
      console.error('Erreur lors de la mise à jour du contrat:', err);
      throw err;
    }
  }, [fetchContracts, fetchStats]);

  const deleteContract = useCallback(async (id: string) => {
    try {
      await hrService.deleteContract(id);
      await fetchContracts(); // Rafraîchir la liste
      await fetchStats(); // Rafraîchir les statistiques
    } catch (err) {
      console.error('Erreur lors de la suppression du contrat:', err);
      throw err;
    }
  }, [fetchContracts, fetchStats]);

  // Fonctions CRUD pour les évaluations
  const createEvaluation = useCallback(async (evaluationData: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.schoolId) return;
    
    try {
      await hrService.createEvaluation({ ...evaluationData, schoolId: user.schoolId });
      await fetchEvaluations(); // Rafraîchir la liste
      await fetchStats(); // Rafraîchir les statistiques
    } catch (err) {
      console.error('Erreur lors de la création de l\'évaluation:', err);
      throw err;
    }
  }, [user?.schoolId, fetchEvaluations, fetchStats]);

  const updateEvaluation = useCallback(async (id: string, evaluationData: Partial<Evaluation>) => {
    try {
      await hrService.updateEvaluation(id, evaluationData);
      await fetchEvaluations(); // Rafraîchir la liste
      await fetchStats(); // Rafraîchir les statistiques
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'évaluation:', err);
      throw err;
    }
  }, [fetchEvaluations, fetchStats]);

  const deleteEvaluation = useCallback(async (id: string) => {
    try {
      await hrService.deleteEvaluation(id);
      await fetchEvaluations(); // Rafraîchir la liste
      await fetchStats(); // Rafraîchir les statistiques
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'évaluation:', err);
      throw err;
    }
  }, [fetchEvaluations, fetchStats]);

  // Fonctions CRUD pour les formations
  const createTraining = useCallback(async (trainingData: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.schoolId) return;
    
    try {
      await hrService.createTraining({ ...trainingData, schoolId: user.schoolId });
      await fetchTrainings(); // Rafraîchir la liste
      await fetchStats(); // Rafraîchir les statistiques
    } catch (err) {
      console.error('Erreur lors de la création de la formation:', err);
      throw err;
    }
  }, [user?.schoolId, fetchTrainings, fetchStats]);

  const updateTraining = useCallback(async (id: string, trainingData: Partial<Training>) => {
    try {
      await hrService.updateTraining(id, trainingData);
      await fetchTrainings(); // Rafraîchir la liste
      await fetchStats(); // Rafraîchir les statistiques
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la formation:', err);
      throw err;
    }
  }, [fetchTrainings, fetchStats]);

  const deleteTraining = useCallback(async (id: string) => {
    try {
      await hrService.deleteTraining(id);
      await fetchTrainings(); // Rafraîchir la liste
      await fetchStats(); // Rafraîchir les statistiques
    } catch (err) {
      console.error('Erreur lors de la suppression de la formation:', err);
      throw err;
    }
  }, [fetchTrainings, fetchStats]);

  // Effet pour charger les données au montage et quand schoolId change
  useEffect(() => {
    if (user?.schoolId) {
      fetchData();
    }
  }, [user?.schoolId, fetchData]);

  return {
    // Données
    teachers,
    departments,
    contracts,
    evaluations,
    trainings,
    stats,
    
    // États de chargement
    loading,
    teachersLoading,
    departmentsLoading,
    contractsLoading,
    evaluationsLoading,
    trainingsLoading,
    statsLoading,
    
    // États d'erreur
    error,
    
    // Fonctions CRUD pour les enseignants
    createTeacher,
    updateTeacher,
    deleteTeacher,
    
    // Fonctions CRUD pour les contrats
    createContract,
    updateContract,
    deleteContract,
    
    // Fonctions CRUD pour les évaluations
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    
    // Fonctions CRUD pour les formations
    createTraining,
    updateTraining,
    deleteTraining,
    
    // Fonctions de récupération avec filtres
    getTeachersWithFilters,
    getContractsWithFilters,
    
    // Fonction de rafraîchissement
    refreshData,
    

  };
}
