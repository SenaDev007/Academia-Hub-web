// Service frontend pour la gestion RH
// Communique avec le backend Electron via IPC

// ===== UTILITAIRES DE MAPPING =====

// Types pour les genres
export type UIGender = 'M.' | 'Mme.' | 'Mlle.';
export type DBGender = 'male' | 'female' | 'other';

// Mapping des genres UI ↔ DB
export const GENDER_MAPPING = {
  // UI vers DB
  'M.': 'male' as DBGender,
  'Mme.': 'female' as DBGender,
  'Mlle.': 'female' as DBGender,
  
  // DB vers UI
  'male': 'M.' as UIGender,
  'female': 'Mme.' as UIGender,
  'other': 'M.' as UIGender, // Par défaut pour 'other'
} as const;

// Fonctions utilitaires pour la conversion des genres
export const convertGenderUIToDB = (uiGender: UIGender): DBGender => {
  return GENDER_MAPPING[uiGender];
};

export const convertGenderDBToUI = (dbGender: DBGender): UIGender => {
  return GENDER_MAPPING[dbGender];
};

// Fonction pour normaliser les données d'enseignant avant envoi au backend
export const normalizeTeacherForDB = (teacher: Personnel): any => {
  return {
    ...teacher,
    // Les civilités sont maintenant stockées directement dans la base de données
    // Pas besoin de conversion
    gender: teacher.gender
  };
};

// Fonction pour normaliser les données d'enseignant reçues du backend
export const normalizeTeacherFromDB = (teacher: any): Personnel => {
  return {
    ...teacher,
    // Les civilités sont maintenant stockées directement dans la base de données
    // Pas besoin de conversion si c'est déjà au format UI
    gender: teacher.gender || 'M.'
  };
};

// ===== GESTION DES FICHIERS UPLOADÉS =====

// Interface pour les fichiers uploadés
export interface UploadedFile {
  name: string;
  path: string;
  size: number;
  type: string;
}

// Fonction pour sauvegarder un fichier et retourner son chemin
export const saveUploadedFile = async (file: File, contractId: string): Promise<string> => {
  try {
    // Vérifier si l'API Electron est disponible
    // TODO: Implémenter endpoint API pour sauvegarder un fichier
    // Pour l'instant, utiliser un endpoint API dédié
    try {
      // const response = await api.hr.saveFile(fileData);
      throw new Error('File save not yet implemented in API');

    // Convertir le File en ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Préparer les données du fichier
    const fileData = {
      name: file.name,
      content: Array.from(buffer), // Convertir en array pour la sérialisation
      type: file.type,
      size: file.size,
      contractId: contractId
    };

    // Appeler l'API de sauvegarde
    const response = await api.hr.saveFile(fileData);
    
    if (response.success) {
      return response.data.path;
    } else {
      throw new Error(response.error || 'Erreur lors de la sauvegarde du fichier');
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du fichier:', error);
    throw error;
  }
};

// Fonction pour sérialiser les fichiers uploadés en chemins
export const serializeUploadedDocuments = async (files: File[], contractId: string): Promise<string[]> => {
  try {
    const paths: string[] = [];
    
    for (const file of files) {
      const path = await saveUploadedFile(file, contractId);
      paths.push(path);
    }
    
    return paths;
  } catch (error) {
    console.error('Erreur lors de la sérialisation des documents:', error);
    throw error;
  }
};

// Fonction pour désérialiser les chemins en objets de fichiers
export const deserializeUploadedDocuments = (paths: string[]): UploadedFile[] => {
  return paths.map(path => {
    const fileName = path.split('/').pop() || path.split('\\').pop() || 'Fichier inconnu';
    return {
      name: fileName,
      path: path,
      size: 0, // Taille inconnue depuis le chemin
      type: 'application/octet-stream' // Type par défaut
    };
  });
};

export interface Personnel {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  gender: 'M.' | 'Mme.' | 'Mlle.';
  dateOfBirth: string;
  nationality: string;
  address: string;
  phone: string;
  email: string;
  departmentId: string;
  positionId: string;
  subjectId?: string;
  qualifications: string;
  experienceYears: number;
  hireDate: string;
  description: string;
  emergencyContact: string;
  photo?: string; // URL ou base64 de la photo
  createdAt: string;
  updatedAt: string;
  schoolId: string;
  
  // Champs relationnels pour l'affichage
  departmentName?: string;
  positionName?: string;
  subjectName?: string;
  
  // Champs spécifiques aux enseignants (seulement si position pédagogique)
  isTeacher?: boolean;
  canTeachClasses?: boolean;
}

// Alias pour la compatibilité (à supprimer progressivement)
export interface Teacher extends Personnel {}

export interface Position {
  id: string;
  name: string;
  department: string;
  category: 'pedagogical' | 'administrative' | 'technical' | 'logistic';
  canTeach: boolean;
  canManageClasses: boolean;
  requiresSubjects: boolean;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
  schoolId: string;
}

export interface Contract {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  
  // === INFORMATIONS DE BASE DU CONTRAT ===
  contractType: 'permanent' | 'vacataire';
  contractDuration: 'CDI' | 'CDD' | 'mission-ponctuelle';
  workTimeType: 'plein-temps' | 'temps-partiel';
  startDate: string;
  endDate?: string;
  
  // === RÉMUNÉRATION ===
  salaryType: 'fixe' | 'horaire';
  baseSalary: number;
  hourlyRate: number;
  workingHours: number;
  maxWorkingHours: number;
  
  // === AVANTAGES CONTRACTUELS ===
  housingAllowance: number;
  transportAllowance: number;
  fixedBonuses: number;
  benefits: string;
  
  // === DÉCLARATIONS SOCIALES ===
  cnssDeclaration: boolean;
  irppDeclaration: boolean;
  otherDeductions: string;
  
  // === INFORMATIONS CONTRACTUELLES ===
  probationPeriod: string;
  noticePeriod: string;
  renewalDate?: string;
  signatureDate: string;
  status: 'active' | 'expired' | 'terminated' | 'pending';
  specialClauses: string;
  
  // === INFORMATIONS BANCAIRES ===
  bankDetails: string;
  mobileMoneyType: string;
  mobileMoneyNumber: string;
  
  // === DOCUMENTS D'IDENTITÉ ===
  identityDocumentType: string;
  identityDocumentNumber: string;
  ifuNumber: string;
  uploadedDocuments: string[]; // URLs des documents uploadés
  
  // === CONDITIONS DE TRAVAIL ===
  workSchedule: string;
  workLocation: string;
  remoteWork: boolean;
  overtimePolicy: string;
  leavePolicy: string;
  confidentialityClause: boolean;
  nonCompeteClause: boolean;
  trainingRequirements: string;
  performanceExpectations: string;
  
  // === MÉTADONNÉES ===
  createdAt: string;
  updatedAt: string;
  schoolId: string;
  
  // === NOTES ===
  notes: string;
}

export interface Evaluation {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  evaluationDate: string;
  evaluator: string;
  overallScore: number;
  criteria: {
    pedagogy?: number;
    communication: number;
    teamwork: number;
    innovation: number;
    punctuality: number;
    quality: number;
    leadership?: number;
  };
  objectives: string[];
  strengths: string[];
  areasForImprovement: string[];
  nextEvaluation: string;
  status: 'draft' | 'submitted' | 'approved' | 'completed';
  comments?: string;
  createdAt: string;
  updatedAt: string;
  schoolId: string;
}

export interface Training {
  id: string;
  title: string;
  category: string;
  instructor: string;
  startDate: string;
  endDate: string;
  duration: string;
  participants: number;
  cost: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  description?: string;
  objectives?: string[];
  materials?: string[];
  location?: string;
  maxParticipants?: number;
  createdAt: string;
  updatedAt: string;
  schoolId: string;
}

export interface Leave {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'personal' | 'unpaid' | 'compensatory';
  startDate: string;
  endDate: string;
  duration: number; // en jours
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  attachments?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  schoolId: string;
}

export interface LeaveBalance {
  employeeId: string;
  employeeName: string;
  annualLeaveTotal: number;
  annualLeaveUsed: number;
  annualLeaveRemaining: number;
  sickLeaveTotal: number;
  sickLeaveUsed: number;
  sickLeaveRemaining: number;
  maternityLeaveTotal: number;
  maternityLeaveUsed: number;
  maternityLeaveRemaining: number;
  paternityLeaveTotal: number;
  paternityLeaveUsed: number;
  paternityLeaveRemaining: number;
  compensatoryLeaveTotal: number;
  compensatoryLeaveUsed: number;
  compensatoryLeaveRemaining: number;
}

export interface HRStats {
  totalTeachers: number;
  activeTeachers: number;
  totalSalary: number;
  averageSalary: number;
  contractsExpiring: number;
  evaluationsPending: number;
  trainingsThisMonth: number;
  satisfactionScore: number;
}

export interface TeacherFilters {
  department?: string;
  status?: string;
  contractType?: string;
  subject?: string;
  searchTerm?: string;
}

export interface ContractFilters {
  status?: string;
  contractType?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

class HRService {
  // Vérifier si l'API Electron est disponible
  private isElectronAPIAvailable(): boolean {
    return typeof window !== 'undefined' && 
          api && 
          typeof api === 'object' &&
          api.hr &&
          typeof api.hr === 'object';
  }

  // ===== GESTION DES ENSEIGNANTS =====

  async createTeacher(teacherData: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>): Promise<Teacher> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      console.log('=== DEBUG createTeacher côté client ===');
      console.log('teacherData envoyé:', teacherData);
      
      // Normaliser les données avant envoi au backend
      const normalizedData = normalizeTeacherForDB(teacherData);
      console.log('teacherData normalisé:', normalizedData);
      
      const response = await api.hr.createTeacher(normalizedData);
      console.log('Réponse reçue du backend:', response);
      
      if (response.success) {
        // Normaliser les données reçues du backend
        return normalizeTeacherFromDB(response.data);
      } else {
        throw new Error(response.error || response.message || 'Erreur lors de la création de l\'enseignant');
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'enseignant:', error);
      throw error;
    }
  }

  async getTeachers(schoolId: string, filters?: TeacherFilters): Promise<Teacher[]> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      console.log('🔍 Appel de api.hr.getTeachers...');
      console.log('schoolId envoyé:', schoolId);
      console.log('filters envoyés:', filters);
      
      const response = await api.hr.getTeachers(schoolId, filters);
      console.log('✅ Réponse reçue du backend pour getTeachers:', response);
      console.log('Type de la réponse:', typeof response);
      console.log('Structure de la réponse:', Object.keys(response));
      
      // Handle both wrapped and unwrapped responses
      if (response && typeof response === 'object') {
        if ('success' in response && !response.success) {
          console.error('❌ Erreur API getTeachers:', response.error || response.message);
          return [];
        }
        
        const data = response.data ?? response;
        if (Array.isArray(data)) {
          console.log('🎯 Récupération réussie, données retournées:', data);
          console.log('Nombre d\'enseignants:', data.length);
          
          // Normaliser les données reçues du backend
          const normalizedTeachers = data.map((teacher: any) => normalizeTeacherFromDB(teacher));
          return normalizedTeachers;
        }
      }
      
      console.warn('⚠️ Réponse inattendue de getTeachers, retour tableau vide');
      return [];
    } catch (error) {
      console.error('💥 Erreur lors de la récupération des enseignants:', error);
      return [];
    }
  }

  async getTeacherById(id: string): Promise<Teacher> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.getTeacherById(id);
      if (response.success) {
        return normalizeTeacherFromDB(response.data);
      } else {
        throw new Error(response.message || 'Erreur lors de la récupération de l\'enseignant');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'enseignant:', error);
      throw error;
    }
  }

  async updateTeacher(id: string, teacherData: Partial<Teacher>): Promise<void> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      console.log('=== DEBUG updateTeacher côté client ===');
      console.log('ID envoyé:', id);
      console.log('teacherData envoyé:', teacherData);
      
      // Normaliser les données avant envoi au backend
      const normalizedData = normalizeTeacherForDB(teacherData as Personnel);
      console.log('teacherData normalisé:', normalizedData);
      
      const response = await api.hr.updateTeacher(id, normalizedData);
      console.log('Réponse reçue du backend pour updateTeacher:', response);
      
      if (response.success) {
        console.log('✅ Mise à jour réussie côté client');
        return;
      } else {
        console.error('❌ Erreur de mise à jour:', response.message || response.error);
        throw new Error(response.message || response.error || 'Erreur lors de la mise à jour de l\'enseignant');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'enseignant:', error);
      throw error;
    }
  }

  async deleteTeacher(id: string): Promise<void> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.deleteTeacher(id);
      if (response.success) {
        return;
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression de l\'enseignant');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'enseignant:', error);
      throw error;
    }
  }

  // ===== GESTION DES DÉPARTEMENTS =====

  async getDepartments(schoolId: string): Promise<Department[]> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.getDepartments(schoolId);
      
      // Handle both wrapped and unwrapped responses
      if (response && typeof response === 'object') {
        if ('success' in response && !response.success) {
          console.error('❌ Erreur API getDepartments:', response.error || response.message);
          return [];
        }
        
        const data = response.data ?? response;
        if (Array.isArray(data)) {
          return data;
        }
      }
      
      console.warn('⚠️ Réponse inattendue de getDepartments, retour tableau vide');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des départements:', error);
      return [];
    }
  }

  // ===== GESTION DES CONTRATS =====

  async createContract(contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.createContract(contractData);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la création du contrat');
      }
    } catch (error) {
      console.error('Erreur lors de la création du contrat:', error);
      throw error;
    }
  }

  async getContracts(schoolId: string, filters?: ContractFilters): Promise<Contract[]> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      console.log('🔍 Appel de api.hr.getContracts...');
      console.log('schoolId envoyé:', schoolId);
      console.log('filters envoyés:', filters);
      
      const response = await api.hr.getContracts(schoolId, filters);
      
      console.log('✅ Réponse reçue du backend pour getContracts:', response);
      console.log('Type de la réponse:', typeof response);
      console.log('Structure de la réponse:', response ? Object.keys(response) : 'null');
      
      // Handle both wrapped and unwrapped responses
      if (response && typeof response === 'object') {
        if ('success' in response && !response.success) {
          console.error('❌ Erreur API getContracts:', response.error || response.message);
          return [];
        }
        
        const data = response.data ?? response;
        console.log('📊 Données extraites:', data);
        console.log('Type des données:', typeof data);
        console.log('Est un tableau:', Array.isArray(data));
        
        if (Array.isArray(data)) {
          console.log('🎯 Récupération réussie, données retournées:', data);
          console.log('Nombre de contrats:', data.length);
          return data;
        }
      }
      
      console.warn('⚠️ Réponse inattendue de getContracts, retour tableau vide');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des contrats:', error);
      return [];
    }
  }

  async updateContract(id: string, contractData: Partial<Contract>): Promise<Contract> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.updateContract(id, contractData);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour du contrat');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contrat:', error);
      throw error;
    }
  }

  async deleteContract(id: string): Promise<void> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.deleteContract(id);
      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la suppression du contrat');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du contrat:', error);
      throw error;
    }
  }

  // ===== GESTION DES ÉVALUATIONS =====

  async createEvaluation(evaluationData: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Evaluation> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.createEvaluation(evaluationData);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la création de l\'évaluation');
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'évaluation:', error);
      throw error;
    }
  }

  async getEvaluations(schoolId: string): Promise<Evaluation[]> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.getEvaluations(schoolId);
      
      // Handle both wrapped and unwrapped responses
      if (response && typeof response === 'object') {
        if ('success' in response && !response.success) {
          console.error('❌ Erreur API getEvaluations:', response.error || response.message);
          return [];
        }
        
        const data = response.data ?? response;
        if (Array.isArray(data)) {
          return data;
        }
      }
      
      console.warn('⚠️ Réponse inattendue de getEvaluations, retour tableau vide');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des évaluations:', error);
      return [];
    }
  }

  async updateEvaluation(id: string, evaluationData: Partial<Evaluation>): Promise<Evaluation> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.updateEvaluation(id, evaluationData);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour de l\'évaluation');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'évaluation:', error);
      throw error;
    }
  }

  async deleteEvaluation(id: string): Promise<void> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.deleteEvaluation(id);
      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la suppression de l\'évaluation');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'évaluation:', error);
      throw error;
    }
  }

  // ===== GESTION DES FORMATIONS =====

  async createTraining(trainingData: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>): Promise<Training> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.createTraining(trainingData);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la création de la formation');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la formation:', error);
      throw error;
    }
  }

  async getTrainings(schoolId: string): Promise<Training[]> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.getTrainings(schoolId);
      
      // Handle both wrapped and unwrapped responses
      if (response && typeof response === 'object') {
        if ('success' in response && !response.success) {
          console.error('❌ Erreur API getTrainings:', response.error || response.message);
          return [];
        }
        
        const data = response.data ?? response;
        if (Array.isArray(data)) {
          return data;
        }
      }
      
      console.warn('⚠️ Réponse inattendue de getTrainings, retour tableau vide');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des formations:', error);
      return [];
    }
  }

  async updateTraining(id: string, trainingData: Partial<Training>): Promise<Training> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.updateTraining(id, trainingData);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour de la formation');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la formation:', error);
      throw error;
    }
  }

  async deleteTraining(id: string): Promise<void> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.deleteTraining(id);
      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la suppression de la formation');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la formation:', error);
      throw error;
    }
  }

  // ===== STATISTIQUES RH =====

  async getHRStats(schoolId: string): Promise<HRStats> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      console.log('🔍 Appel de api.hr.getHRStats...');
      console.log('schoolId envoyé:', schoolId);
      
      const response = await api.hr.getHRStats(schoolId);
      console.log('✅ Réponse reçue du backend pour getHRStats:', response);
      console.log('Type de la réponse:', typeof response);
      console.log('Structure de la réponse:', Object.keys(response));
      
      // Handle both wrapped and unwrapped responses
      if (response && typeof response === 'object') {
        if ('success' in response && !response.success) {
          console.error('❌ Erreur API getHRStats:', response.error || response.message);
          return {
            totalTeachers: 0,
            activeTeachers: 0,
            totalSalary: 0,
            averageSalary: 0,
            contractsExpiring: 0,
            evaluationsPending: 0,
            trainingsThisMonth: 0,
            satisfactionScore: 0
          };
        }
        
        const data = response.data ?? response;
        console.log('🎯 Récupération réussie, données retournées:', data);
        console.log('Type des données:', typeof data);
        console.log('Clés des données:', Object.keys(data));
        return data;
      }
      
      console.warn('⚠️ Réponse inattendue de getHRStats, retour stats par défaut');
      return {
        totalTeachers: 0,
        activeTeachers: 0,
        totalSalary: 0,
        averageSalary: 0,
        contractsExpiring: 0,
        evaluationsPending: 0,
        trainingsThisMonth: 0,
        satisfactionScore: 0
      };
    } catch (error) {
      console.error('💥 Erreur lors de la récupération des statistiques RH:', error);
      return {
        totalTeachers: 0,
        activeTeachers: 0,
        totalSalary: 0,
        averageSalary: 0,
        contractsExpiring: 0,
        evaluationsPending: 0,
        trainingsThisMonth: 0,
        satisfactionScore: 0
      };
    }
  }

  // ===== RÉCUPÉRATION DES EMPLOYÉS =====

  async getEmployees(schoolId: string): Promise<Personnel[]> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      console.log('🔍 Récupération de tous les employés...');
      
      // Utiliser getTeachers qui récupère tous les employés
      const employees = await this.getTeachers(schoolId);
      
      console.log('✅ Employés récupérés:', employees.length);
      return employees;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des employés:', error);
      throw error;
    }
  }

  // ===== RÉCUPÉRATION DU COMPTABLE =====

  async getAccountantInfo(schoolId: string): Promise<{ name: string; position: string } | null> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      console.log('🔍 Récupération des informations du comptable...');
      
      // Récupérer tous les employés
      const employees = await this.getTeachers(schoolId);
      
      // Chercher un employé avec la position "Comptable"
      const accountant = employees.find(emp => 
        emp.positionName?.toLowerCase().includes('comptable') ||
        emp.position?.toLowerCase().includes('comptable') ||
        emp.positionName?.toLowerCase().includes('accountant') ||
        emp.position?.toLowerCase().includes('accountant')
      );
      
      if (accountant) {
        console.log('✅ Comptable trouvé:', accountant.firstName, accountant.lastName);
        return {
          name: `${accountant.firstName} ${accountant.lastName}`.trim(), // Utiliser le nom complet
          position: accountant.positionName || accountant.position || 'Comptable'
        };
      } else {
        console.log('⚠️ Aucun comptable trouvé dans les employés');
        return null;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du comptable:', error);
      throw error;
    }
  }

  // ===== ASSIGNATION ENSEIGNANTS-CLASSES =====

  async assignTeacherToClass(assignmentData: any): Promise<any> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.assignTeacherToClass(assignmentData);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de l\'assignation enseignant-classe');
      }
    } catch (error) {
      console.error('Erreur lors de l\'assignation enseignant-classe:', error);
      throw error;
    }
  }

  async getTeacherAssignments(schoolId: string, teacherId?: string): Promise<any[]> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.getTeacherAssignments(schoolId, teacherId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la récupération des assignations');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des assignations:', error);
      throw error;
    }
  }

  // ===== GESTION DES CONGÉS =====

  async createLeave(leaveData: Omit<Leave, 'id' | 'createdAt' | 'updatedAt'>): Promise<Leave> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.createLeave(leaveData);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la création de la demande de congé');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la demande de congé:', error);
      throw error;
    }
  }

  async getLeaves(schoolId: string, filters?: any): Promise<Leave[]> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.getLeaves(schoolId, filters);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la récupération des congés');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des congés:', error);
      throw error;
    }
  }

  async updateLeave(id: string, leaveData: Partial<Leave>): Promise<Leave> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.updateLeave(id, leaveData);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour de la demande de congé');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la demande de congé:', error);
      throw error;
    }
  }

  async deleteLeave(id: string): Promise<void> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.deleteLeave(id);
      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la suppression de la demande de congé');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la demande de congé:', error);
      throw error;
    }
  }

  async approveLeave(id: string, approvedBy: string, notes?: string): Promise<Leave> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.approveLeave(id, approvedBy, notes);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de l\'approbation de la demande de congé');
      }
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la demande de congé:', error);
      throw error;
    }
  }

  async rejectLeave(id: string, rejectedBy: string, reason: string): Promise<Leave> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.rejectLeave(id, rejectedBy, reason);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors du rejet de la demande de congé');
      }
    } catch (error) {
      console.error('Erreur lors du rejet de la demande de congé:', error);
      throw error;
    }
  }

  async getLeaveBalances(schoolId: string): Promise<LeaveBalance[]> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.getLeaveBalances(schoolId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la récupération des soldes de congés');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des soldes de congés:', error);
      throw error;
    }
  }

  // ===== GESTION DES RAPPORTS RH =====

  async generateHRReport(schoolId: string, reportType: string, filters?: any): Promise<any> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.generateHRReport(schoolId, reportType, filters);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la génération du rapport RH');
      }
    } catch (error) {
      console.error('Erreur lors de la génération du rapport RH:', error);
      throw error;
    }
  }

  async exportHRData(schoolId: string, dataType: string, format: 'excel' | 'pdf' | 'csv'): Promise<any> {
    if (!this.isElectronAPIAvailable()) {
      throw new Error('API Electron non disponible');
    }

    try {
      const response = await api.hr.exportHRData(schoolId, dataType, format);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de l\'export des données RH');
      }
    } catch (error) {
      console.error('Erreur lors de l\'export des données RH:', error);
      throw error;
    }
  }


}

// Instance singleton du service
export const hrService = new HRService();
export default hrService;
