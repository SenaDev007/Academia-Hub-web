// Interfaces pour le module Planning et l'intégration avec les contrats
import { api } from '../lib/api/client';

import { 
  PlanningClass, 
  PlanningRoom, 
  PlanningSubject, 
  PlanningTeacher, 
  PlanningSchedule, 
  PlanningBreak, 
  WorkHoursConfig, 
  PlanningStats,
  WorkedHoursEntry,
  WorkedHoursSummary,
  PayrollReport,
  WorkedHoursAlert,
  WorkedHoursConfig
} from '../types/planning';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

export interface WorkSchedule {
  id: string;
  contractId: string;
  employeeId: string;
  employeeName: string;
  date: string;
  plannedHours: number;
  actualHours: number;
  startTime?: string;
  endTime?: string;
  breakDuration: number;
  overtimeHours: number;
  status: 'planned' | 'in_progress' | 'completed' | 'absent' | 'late';
  notes?: string;
  location?: string;
  isRemote: boolean;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeTracking {
  id: string;
  workScheduleId: string;
  contractId: string;
  employeeId: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours: number;
  breakStartTime?: string;
  breakEndTime?: string;
  breakDuration: number;
  overtimeStartTime?: string;
  overtimeEndTime?: string;
  overtimeHours: number;
  isLate: boolean;
  lateMinutes: number;
  isAbsent: boolean;
  absenceReason?: string;
  supervisorId?: string;
  supervisorName?: string;
  approvedAt?: string;
  approvedBy?: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyHoursSummary {
  id: string;
  contractId: string;
  employeeId: string;
  employeeName: string;
  year: number;
  month: number;
  totalPlannedHours: number;
  totalActualHours: number;
  totalOvertimeHours: number;
  totalAbsentDays: number;
  totalLateDays: number;
  averageDailyHours: number;
  efficiencyRate: number;
  salaryCalculated: number;
  overtimePay: number;
  deductions: number;
  netPay: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'paid';
  approvedBy?: string;
  approvedAt?: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractHoursAnalysis {
  contractId: string;
  employeeName: string;
  contractType: 'permanent' | 'vacataire';
  salaryType: 'fixe' | 'horaire';
  baseSalary: number;
  hourlyRate: number;
  workingHours: number;
  maxWorkingHours: number;
  
  // Analyse des heures
  totalPlannedHours: number;
  totalActualHours: number;
  totalOvertimeHours: number;
  efficiencyRate: number;
  
  // Calculs de paie
  basePay: number;
  overtimePay: number;
  totalGrossPay: number;
  deductions: number;
  netPay: number;
  
  // Statistiques
  totalWorkingDays: number;
  totalAbsentDays: number;
  totalLateDays: number;
  averageDailyHours: number;
  
  // Période d'analyse
  periodStart: string;
  periodEnd: string;
}

// Service pour la gestion du planning et des heures
export class PlanningService {
  private static instance: PlanningService;
  private electronAPI: any;

  constructor() {
    this.electronAPI = (window as any).electronAPI;
  }

  // Générer un ID unique
  private generateId(): string {
    return 'planning-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  static getInstance(): PlanningService {
    if (!PlanningService.instance) {
      PlanningService.instance = new PlanningService();
    }
    return PlanningService.instance;
  }

  // === GESTION DES PLANNINGS DE TRAVAIL ===

  async createWorkSchedule(scheduleData: Partial<WorkSchedule>): Promise<{ success: boolean; data?: WorkSchedule; message?: string }> {
    try {
      if (this.electronAPI?.planning?.createWorkSchedule) {
        const result = await this.electronAPI.planning.createWorkSchedule(scheduleData);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la création du planning:', error);
      return { success: false, message: 'Erreur lors de la création du planning' };
    }
  }

  async getWorkSchedules(filters?: {
    contractId?: string;
    employeeId?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  }): Promise<WorkSchedule[]> {
    try {
      if (this.electronAPI?.planning?.getWorkSchedules) {
        const result = await this.electronAPI.planning.getWorkSchedules(filters);
        // Handle both wrapped and unwrapped responses
        if (result && typeof result === 'object') {
          if ('success' in result && !result.success) {
            console.error('Erreur API getWorkSchedules:', result.error);
            return [];
          }
          return (result.data ?? result) || [];
        }
        return result || [];
      }
      console.warn('API getWorkSchedules non disponible');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des plannings:', error);
      return [];
    }
  }

  async updateWorkSchedule(id: string, scheduleData: Partial<WorkSchedule>): Promise<{ success: boolean; data?: WorkSchedule; message?: string }> {
    try {
      if (this.electronAPI?.planning?.updateWorkSchedule) {
        const result = await this.electronAPI.planning.updateWorkSchedule(id, scheduleData);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du planning:', error);
      return { success: false, message: 'Erreur lors de la mise à jour du planning' };
    }
  }

  // === GESTION DU SUIVI DU TEMPS ===

  async createTimeTracking(trackingData: Partial<TimeTracking>): Promise<{ success: boolean; data?: TimeTracking; message?: string }> {
    try {
      if (this.electronAPI?.planning?.createTimeTracking) {
        const result = await this.electronAPI.planning.createTimeTracking(trackingData);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la création du suivi:', error);
      return { success: false, message: 'Erreur lors de la création du suivi' };
    }
  }

  async getTimeTracking(filters?: {
    workScheduleId?: string;
    contractId?: string;
    employeeId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<TimeTracking[]> {
    try {
      if (this.electronAPI?.planning?.getTimeTracking) {
        const result = await this.electronAPI.planning.getTimeTracking(filters);
        // Handle both wrapped and unwrapped responses
        if (result && typeof result === 'object') {
          if ('success' in result && !result.success) {
            console.error('Erreur API getTimeTracking:', result.error);
            return [];
          }
          return (result.data ?? result) || [];
        }
        return result || [];
      }
      console.warn('API getTimeTracking non disponible');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération du suivi:', error);
      return [];
    }
  }

  async updateTimeTracking(id: string, trackingData: Partial<TimeTracking>): Promise<{ success: boolean; data?: TimeTracking; message?: string }> {
    try {
      if (this.electronAPI?.planning?.updateTimeTracking) {
        const result = await this.electronAPI.planning.updateTimeTracking(id, trackingData);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du suivi:', error);
      return { success: false, message: 'Erreur lors de la mise à jour du suivi' };
    }
  }

  // === ANALYSE DES HEURES ET CALCULS ===

  async getContractHoursAnalysis(contractId: string, periodStart: string, periodEnd: string): Promise<ContractHoursAnalysis | null> {
    try {
      if (this.electronAPI?.planning?.getContractHoursAnalysis) {
        const result = await this.electronAPI.planning.getContractHoursAnalysis(contractId, periodStart, periodEnd);
        return result;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de l\'analyse des heures:', error);
      return null;
    }
  }

  async generateMonthlySummary(contractId: string, year: number, month: number): Promise<{ success: boolean; data?: MonthlyHoursSummary; message?: string }> {
    try {
      if (this.electronAPI?.planning?.generateMonthlySummary) {
        const result = await this.electronAPI.planning.generateMonthlySummary(contractId, year, month);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la génération du résumé mensuel:', error);
      return { success: false, message: 'Erreur lors de la génération du résumé mensuel' };
    }
  }

  async getMonthlySummaries(filters?: {
    contractId?: string;
    employeeId?: string;
    year?: number;
    month?: number;
    status?: string;
  }): Promise<MonthlyHoursSummary[]> {
    try {
      if (this.electronAPI?.planning?.getMonthlySummaries) {
        const result = await this.electronAPI.planning.getMonthlySummaries(filters);
        // Handle both wrapped and unwrapped responses
        if (result && typeof result === 'object') {
          if ('success' in result && !result.success) {
            console.error('Erreur API getMonthlySummaries:', result.error);
            return [];
          }
          return (result.data ?? result) || [];
        }
        return result || [];
      }
      console.warn('API getMonthlySummaries non disponible');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des résumés mensuels:', error);
      return [];
    }
  }

  // === MÉTHODES UTILITAIRES ===

  calculateOvertimeHours(actualHours: number, maxHours: number): number {
    return Math.max(0, actualHours - maxHours);
  }

  calculateEfficiencyRate(actualHours: number, plannedHours: number): number {
    if (plannedHours === 0) return 0;
    return Math.min(100, (actualHours / plannedHours) * 100);
  }

  calculateHourlyPay(hours: number, hourlyRate: number): number {
    return hours * hourlyRate;
  }

  calculateOvertimePay(overtimeHours: number, hourlyRate: number, overtimeMultiplier: number = 1.5): number {
    return overtimeHours * hourlyRate * overtimeMultiplier;
  }

  formatTimeToHours(timeString: string): number {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + (minutes / 60);
  }

  formatHoursToTime(hours: number): string {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // === GESTION DES CLASSES ===

  async getClasses(schoolId: string): Promise<PlanningClass[]> {
    try {
      // Utiliser l'approche directe comme availabilityService
      if (this.electronAPI?.database?.executeQuery) {
        const sql = 'SELECT * FROM classes WHERE schoolId = ? ORDER BY name';
        const result = await this.electronAPI.database.executeQuery(sql, [schoolId]);
        
        if (result.success && result.results) {
          return result.results;
        }
        
        return [];
      }
      
      // Fallback vers l'API planning
      if (this.electronAPI?.planning?.getClasses) {
        const result = await this.electronAPI.planning.getClasses(schoolId);
        if (result && typeof result === 'object') {
          if ('success' in result && !result.success) {
            console.error('Erreur API getClasses:', result.error);
            return [];
          }
          return (result.data ?? result) || [];
        }
        return result || [];
      }
      
      console.warn('API getClasses non disponible');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des classes:', error);
      return [];
    }
  }

  async getClassesByLevel(level: string): Promise<{ success: boolean; data?: PlanningClass[]; message?: string }> {
    try {
      if (this.electronAPI?.planning?.getClassesByLevel) {
        const result = await this.electronAPI.planning.getClassesByLevel(level);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la récupération des classes par niveau:', error);
      return { success: false, message: 'Erreur lors de la récupération des classes' };
    }
  }

  async createClass(classData: Partial<PlanningClass>): Promise<{ success: boolean; data?: PlanningClass; message?: string }> {
    try {
      if (this.electronAPI?.planning?.createClass) {
        const result = await this.electronAPI.planning.createClass(classData);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la création de la classe:', error);
      return { success: false, message: 'Erreur lors de la création de la classe' };
    }
  }

  async updateClass(id: string, classData: Partial<PlanningClass>): Promise<{ success: boolean; data?: PlanningClass; message?: string }> {
    try {
      if (this.electronAPI?.planning?.updateClass) {
        const result = await this.electronAPI.planning.updateClass(id, classData);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la classe:', error);
      return { success: false, message: 'Erreur lors de la mise à jour de la classe' };
    }
  }

  async deleteClass(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      if (this.electronAPI?.planning?.deleteClass) {
        const result = await this.electronAPI.planning.deleteClass(id);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la suppression de la classe:', error);
      return { success: false, message: 'Erreur lors de la suppression de la classe' };
    }
  }

  // === GESTION DES SALLES ===

  async getRooms(schoolId: string): Promise<PlanningRoom[]> {
    try {
      if (this.electronAPI?.planning?.getRooms) {
        const result = await this.electronAPI.planning.getRooms(schoolId);
        // Handle both wrapped and unwrapped responses
        if (result && typeof result === 'object') {
          if ('success' in result && !result.success) {
            console.error('Erreur API getRooms:', result.error);
            return [];
          }
          return (result.data ?? result) || [];
        }
        return result || [];
      }
      console.warn('API getRooms non disponible');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des salles:', error);
      return [];
    }
  }

  async createRoom(roomData: Partial<PlanningRoom>): Promise<{ success: boolean; data?: PlanningRoom; message?: string }> {
    try {
      if (this.electronAPI?.planning?.createRoom) {
        const result = await this.electronAPI.planning.createRoom(roomData);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la création de la salle:', error);
      return { success: false, message: 'Erreur lors de la création de la salle' };
    }
  }

  async updateRoom(id: string, roomData: Partial<PlanningRoom>): Promise<{ success: boolean; data?: PlanningRoom; message?: string }> {
    try {
      if (this.electronAPI?.planning?.updateRoom) {
        const result = await this.electronAPI.planning.updateRoom(id, roomData);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la salle:', error);
      return { success: false, message: 'Erreur lors de la mise à jour de la salle' };
    }
  }

  async deleteRoom(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      if (this.electronAPI?.planning?.deleteRoom) {
        const result = await this.electronAPI.planning.deleteRoom(id);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la suppression de la salle:', error);
      return { success: false, message: 'Erreur lors de la suppression de la salle' };
    }
  }

  // === GESTION DES MATIÈRES ===

  async getSubjects(schoolId: string): Promise<PlanningSubject[]> {
    try {
      if (this.electronAPI?.planning?.getSubjects) {
        const result = await this.electronAPI.planning.getSubjects(schoolId);
        // Handle both wrapped and unwrapped responses
        if (result && typeof result === 'object') {
          if ('success' in result && !result.success) {
            console.error('Erreur API getSubjects:', result.error);
            return [];
          }
          return (result.data ?? result) || [];
        }
        return result || [];
      }
      console.warn('API getSubjects non disponible');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des matières:', error);
      return [];
    }
  }

  async createSubject(subjectData: Partial<PlanningSubject>): Promise<{ success: boolean; data?: PlanningSubject; message?: string }> {
    console.log('🔍 planningService.createSubject appelé avec:', subjectData);
    console.log('🔍 subjectData.classId:', subjectData.classId);
    console.log('🔍 subjectData.level:', subjectData.level);
    console.log('🔍 subjectData.coefficient:', subjectData.coefficient);
    
    try {
      // CORRECTION TEMPORAIRE : Utiliser l'API directe de la base de données
      // car l'API Electron ne sauvegarde pas correctement le classId
      if (this.electronAPI?.database?.executeQuery) {
        console.log('🔍 Utilisation de l\'API database directe pour corriger le problème classId...');
        
        const now = new Date().toISOString();
        const subjectId = subjectData.id || this.generateId();
        
        const insertQuery = `
          INSERT INTO subjects (id, name, code, level, coefficient, classId, schoolId, createdAt, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await this.electronAPI.database.executeQuery(insertQuery, [
          subjectId,
          subjectData.name,
          subjectData.code,
          subjectData.level,
          subjectData.coefficient,
          subjectData.classId, // CORRECTION : S'assurer que classId est bien sauvegardé
          subjectData.schoolId,
          now,
          now
        ]);
        
        console.log('🔍 Résultat insertion directe:', result);
        
        if (result.success) {
          // Récupérer la matière créée pour la retourner
          const selectQuery = 'SELECT * FROM subjects WHERE id = ?';
          const selectResult = await this.electronAPI.database.executeQuery(selectQuery, [subjectId]);
          
          if (selectResult.success && selectResult.results && selectResult.results.length > 0) {
            const createdSubject = selectResult.results[0];
            console.log('🔍 Matière créée avec classId:', createdSubject.classId);
            return { success: true, data: createdSubject };
          }
        }
        
        return { success: false, message: 'Erreur lors de la création de la matière' };
      }
      
      // Fallback vers l'API Electron (qui a le bug)
      if (this.electronAPI?.planning?.createSubject) {
        console.log('🔍 Fallback vers l\'API Electron createSubject...');
        const result = await this.electronAPI.planning.createSubject(subjectData);
        console.log('🔍 Résultat de l\'API Electron:', result);
        return result;
      }
      
      console.warn('🔍 API createSubject non disponible');
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la création de la matière:', error);
      return { success: false, message: 'Erreur lors de la création de la matière' };
    }
  }

  async updateSubject(id: string, subjectData: Partial<PlanningSubject>): Promise<{ success: boolean; data?: PlanningSubject; message?: string }> {
    try {
      if (this.electronAPI?.planning?.updateSubject) {
        const result = await this.electronAPI.planning.updateSubject(id, subjectData);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la matière:', error);
      return { success: false, message: 'Erreur lors de la mise à jour de la matière' };
    }
  }

  async deleteSubject(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      if (this.electronAPI?.planning?.deleteSubject) {
        const result = await this.electronAPI.planning.deleteSubject(id);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la suppression de la matière:', error);
      return { success: false, message: 'Erreur lors de la suppression de la matière' };
    }
  }

  async getSubjectsByLevel(schoolId: string, level: string): Promise<PlanningSubject[]> {
    try {
      if (this.electronAPI?.planning?.getSubjectsByLevel) {
        const result = await this.electronAPI.planning.getSubjectsByLevel(schoolId, level);
        // Handle both wrapped and unwrapped responses
        if (result && typeof result === 'object') {
          if ('success' in result && !result.success) {
            console.error('Erreur API getSubjectsByLevel:', result.error);
            return [];
          }
          return (result.data ?? result) || [];
        }
        return result || [];
      }
      console.warn('API getSubjectsByLevel non disponible');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des matières par niveau:', error);
      return [];
    }
  }

  // === GESTION DES ENSEIGNANTS ===

  async getTeachers(schoolId: string): Promise<PlanningTeacher[]> {
    try {
      // Récupérer les enseignants et professeurs du module HR
      if (this.electronAPI?.hr?.getPersonnel) {
        const result = await this.electronAPI.hr.getPersonnel(schoolId);
        
        if (result && typeof result === 'object') {
          if ('success' in result && !result.success) {
            console.error('Erreur API getPersonnel:', result.error);
            return [];
          }
          
          const personnel = (result.data ?? result) || [];
          
          // Filtrer uniquement les enseignants et professeurs
          const teachers = personnel.filter((person: Record<string, unknown>) => {
            const positionName = (person.positionName || person.position || '') as string;
            return positionName.toLowerCase().includes('enseignant') || 
                   positionName.toLowerCase().includes('professeur');
          });
          
          // Convertir au format PlanningTeacher
          return teachers.map((teacher: Record<string, unknown>) => ({
            id: teacher.id as string,
            name: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Nom non défini',
            first_name: teacher.firstName as string,
            last_name: teacher.lastName as string,
            subject: (teacher.subjectName || teacher.specialization || 'Aucune matière') as string,
            classes: [], // Sera rempli par les affectations
            hoursPerWeek: (teacher.workingHours || 0) as number,
            userId: teacher.id as string,
            school_id: teacher.schoolId as string,
            // Informations supplémentaires du HR
            matricule: teacher.matricule as string,
            email: teacher.email as string,
            phone: teacher.phone as string,
            position: (teacher.positionName || teacher.position) as string,
            department: (teacher.departmentName || teacher.department) as string,
            status: (teacher.status || 'active') as string,
            hireDate: teacher.hireDate as string,
            qualifications: teacher.qualifications as string
          }));
        }
      }
      
      // Fallback vers l'ancienne API si disponible
      if (this.electronAPI?.planning?.getTeachers) {
        const result = await this.electronAPI.planning.getTeachers(schoolId);
        if (result && typeof result === 'object') {
          if ('success' in result && !result.success) {
            console.error('Erreur API getTeachers:', result.error);
            return [];
          }
          return (result.data ?? result) || [];
        }
        return result || [];
      }
      
      console.warn('API getPersonnel et getTeachers non disponibles');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des enseignants:', error);
      return [];
    }
  }

  // === AFFECTATIONS ENSEIGNANTS (selon cycle) ===

  // Primaire/Maternelle: enseignant -> classe (toutes matières du niveau)
  async assignTeacherToClassSpecificSubject(params: {
    schoolId: string;
    teacherId: string;
    classId: string;
    subjectId: string;
    subjectName: string;
    startDate?: string;
    endDate?: string;
    hoursPerWeek?: number;
    notes?: string;
  }) {
    try {
      console.log('🔍 === assignTeacherToClassSpecificSubject DIRECT ===');
      console.log('Params reçus:', params);
      
      if (this.electronAPI?.planning?.assignTeacherToClassSpecificSubject) {
        return await this.electronAPI.planning.assignTeacherToClassSpecificSubject(params);
      }
      
      console.warn('API assignTeacherToClassSpecificSubject non disponible');
      return { success: false, error: 'API non disponible' };
    } catch (error) {
      console.error('Erreur assignTeacherToClassSpecificSubject:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  async assignTeacherToClassAllSubjects(params: {
    schoolId: string;
    teacherId: string;
    classId: string;
    cycle: 'maternelle' | 'primaire';
    startDate?: string;
    endDate?: string;
    hoursPerWeek?: number;
    notes?: string;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('🔍 === assignTeacherToClassAllSubjects DIRECT ===');
      console.log('Params reçus:', params);
      
      // Appel direct à la base de données comme dans le module Finance
      if (this.electronAPI?.database?.executeQuery) {
        console.log('🔍 Utilisation de l\'API database directe');
        
        // 1. Récupérer la classe
        const classResult = await this.electronAPI.database.executeQuery(
          'SELECT name, level FROM classes WHERE id = ? AND schoolId = ?',
          [params.classId, params.schoolId]
        );
        console.log('✅ Classe récupérée:', classResult.results?.[0]);
        
        const cls = classResult.results?.[0];
        if (!cls) {
          return { success: false, message: 'Classe non trouvée' };
        }
        
        // 2. Mapper le niveau de la classe vers le niveau des matières
        let subjectLevel = null;
        const classLevel = cls.level?.toLowerCase() || '';
        console.log('🔍 Niveau de la classe:', classLevel);
        
        if (classLevel.includes('maternelle') || classLevel.includes('ps') || classLevel.includes('ms') || classLevel.includes('gs')) {
          subjectLevel = 'maternelle';
        } else if (classLevel.includes('primaire') || classLevel.includes('cp') || classLevel.includes('ce') || classLevel.includes('cm')) {
          subjectLevel = 'primaire';
        } else if (classLevel.includes('1er-cycle') || classLevel.includes('6') || classLevel.includes('5') || classLevel.includes('4') || classLevel.includes('3')) {
          subjectLevel = 'secondaire_1er_cycle';
        } else if (classLevel.includes('2nd-cycle') || classLevel.includes('2nde') || classLevel.includes('1ère') || classLevel.includes('tle') || classLevel.includes('terminale')) {
          subjectLevel = 'secondaire_2nd_cycle';
        }
        
        console.log('🔍 Niveau des matières mappé:', subjectLevel);
        
        // 3. Récupérer les matières pour ce niveau
        const subjectsResult = await this.electronAPI.database.executeQuery(
          'SELECT id, name FROM subjects WHERE schoolId = ? AND level = ?',
          [params.schoolId, subjectLevel]
        );
        console.log('✅ Matières récupérées:', subjectsResult.results?.length || 0, 'matières');
        console.log('🔍 Détail des matières:', subjectsResult.results);
        
        if (!subjectsResult.results || subjectsResult.results.length === 0) {
          return { success: false, message: 'Aucune matière trouvée pour ce niveau' };
        }
        
        // 4. Créer UNE SEULE affectation pour toutes les matières de la classe
        const now = new Date().toISOString();
        let assignmentsCreated = 0;
        
        // Pour maternelle/primaire : 1 affectation = 1 enseignant + 1 classe + toutes les matières
        const assignmentId = this.generateId();
        console.log('🔍 Création de l\'affectation unique:', assignmentId);
        console.log('🔍 Classe:', cls.name, '| Enseignant:', params.teacherId, '| Heures:', params.hoursPerWeek);
        console.log('🔍 Matières concernées:', subjectsResult.results.length, 'matières');
        
        try {
          // Créer une seule affectation avec toutes les matières
          const assignmentResult = await this.electronAPI.database.executeQuery(
            `INSERT INTO teacher_assignments (id, school_id, teacher_id, class_id, subject_id, hours_per_week, mode, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [assignmentId, params.schoolId, params.teacherId, params.classId, null, params.hoursPerWeek || null, params.cycle, now, now]
          );
          console.log('✅ Résultat insertion affectation unique:', assignmentResult);
          assignmentsCreated = 1;
          console.log('✅ Affectation unique créée:', assignmentId);
          console.log('✅ Enseignant affecté à la classe', cls.name, 'pour toutes les matières avec', params.hoursPerWeek, 'h/semaine');
        } catch (error) {
          console.error('❌ Erreur insertion affectation unique:', error);
          throw error;
        }
        
        console.log('✅ === RÉSUMÉ ===');
        console.log('Affectations créées:', assignmentsCreated);
        
        return { success: true, assignmentsCreated };
      }
      
      // Fallback vers l'API planning
      if (this.electronAPI?.planning?.assignTeacherToClassAllSubjects) {
        return await this.electronAPI.planning.assignTeacherToClassAllSubjects(params);
      }
      console.warn('API assignTeacherToClassAllSubjects non disponible');
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur assignTeacherToClassAllSubjects:', error);
      return { success: false, message: 'Erreur lors de l\'affectation: ' + error.message };
    }
  }

  // Secondaire: enseignant -> matière -> plusieurs classes
  async assignTeacherToSubjectClasses(params: {
    schoolId: string;
    teacherId: string;
    subjectId: string;
    classIds: string[];
    startDate?: string;
    endDate?: string;
    hoursPerWeek?: number;
    notes?: string;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      if (this.electronAPI?.planning?.assignTeacherToSubjectClasses) {
        return await this.electronAPI.planning.assignTeacherToSubjectClasses(params);
      }
      console.warn('API assignTeacherToSubjectClasses non disponible');
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur assignTeacherToSubjectClasses:', error);
      return { success: false, message: 'Erreur lors de l\'affectation' };
    }
  }

  // Lister les affectations d\'un enseignant
  async listTeacherAssignments(params: { schoolId: string; teacherId?: string }): Promise<any[]> {
    try {
      if (this.electronAPI?.planning?.listTeacherAssignments) {
        const result = await this.electronAPI.planning.listTeacherAssignments(params);
        if (result && typeof result === 'object') {
          if ('success' in result && !result.success) {
            console.error('Erreur API listTeacherAssignments:', (result as any).error);
            return [];
          }
          return (result as any).data ?? result ?? [];
        }
        return result ?? [];
      }
      console.warn('API listTeacherAssignments non disponible');
      return [];
    } catch (error) {
      console.error('Erreur listTeacherAssignments:', error);
      return [];
    }
  }

  // Récupérer toutes les affectations des enseignants
  async getTeacherAssignments(schoolId: string): Promise<any[]> {
    try {
      console.log('🔍 planningService.getTeacherAssignments appelé avec schoolId:', schoolId);
      
      // Utiliser l'API directe de la base de données
      if (this.electronAPI?.database?.executeQuery) {
        console.log('🔍 Utilisation de l\'API database directe pour getTeacherAssignments');
        
        const query = `
          SELECT 
            ta.id,
            ta.teacher_id,
            ta.class_id,
            ta.subject_id,
            ta.hours_per_week,
            ta.mode,
            ta.created_at,
            ta.updated_at,
            c.name as class_name,
            c.level as class_level,
            s.name as subject_name,
            s.level as subject_level,
            t.firstName as first_name,
            t.lastName as last_name
          FROM teacher_assignments ta
          LEFT JOIN classes c ON ta.class_id = c.id
          LEFT JOIN subjects s ON ta.subject_id = s.id
          LEFT JOIN teachers t ON ta.teacher_id = t.id
          WHERE ta.school_id = ?
          ORDER BY t.firstName, t.lastName, c.name, s.name
        `;
        
        const result = await this.electronAPI.database.executeQuery(query, [schoolId]);
        console.log('🔍 Résultat getTeacherAssignments:', result);
        
        if (result.results && Array.isArray(result.results)) {
          console.log('✅ Assignments récupérées:', result.results.length);
          return result.results;
        }
        
        return [];
      }
      
      // Fallback vers l'API planning
      if (this.electronAPI?.planning?.getTeacherAssignments) {
        const result = await this.electronAPI.planning.getTeacherAssignments(schoolId);
        if (result && typeof result === 'object') {
          if ('success' in result && !result.success) {
            console.error('Erreur API getTeacherAssignments:', result.error);
            return [];
          }
          return (result.data ?? result) || [];
        }
        return result || [];
      }
      
      console.warn('API getTeacherAssignments non disponible');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des affectations:', error);
      return [];
    }
  }

  // === DISPONIBILITÉS ENSEIGNANTS ===
  async saveTeacherAvailability(params: {
    schoolId: string;
    teacherId: string;
    availability: any[];
    notes?: string;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      if (this.electronAPI?.planning?.saveTeacherAvailability) {
        return await this.electronAPI.planning.saveTeacherAvailability(params);
      }
      console.warn('API saveTeacherAvailability non disponible');
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur saveTeacherAvailability:', error);
      return { success: false, message: 'Erreur lors de l\'enregistrement des disponibilités' };
    }
  }

  async getTeacherAvailability(params: { schoolId: string; teacherId: string }): Promise<any[]> {
    try {
      if (this.electronAPI?.planning?.getTeacherAvailability) {
        const result = await this.electronAPI.planning.getTeacherAvailability(params);
        if (result && typeof result === 'object') {
          if ('success' in result && !(result as any).success) {
            console.error('Erreur API getTeacherAvailability:', (result as any).error);
            return [];
          }
          return (result as any).data ?? result ?? [];
        }
        return result ?? [];
      }
      console.warn('API getTeacherAvailability non disponible');
      return [];
    } catch (error) {
      console.error('Erreur getTeacherAvailability:', error);
      return [];
    }
  }

  // === GESTION DE L'EMPLOI DU TEMPS ===

  async getSchedule(): Promise<PlanningSchedule[]> {
    try {
      console.log('🔍 getSchedule - isElectron:', isElectron);
      console.log('🔍 getSchedule - electronAPI disponible:', !!this.electronAPI);
      console.log('🔍 getSchedule - database disponible:', !!this.electronAPI?.database);
      console.log('🔍 getSchedule - executeQuery disponible:', !!this.electronAPI?.database?.executeQuery);
      
      if (!isElectron || !this.electronAPI) {
        console.warn('🔍 getSchedule - API Electron non disponible, utilisation du fallback temporaire');
        // Fallback temporaire : retourner les données de test que nous avons créées
        return [
          {
            id: 'schedule_entry_test_123',
            classId: 'e4f50b0a-cfbe-40fe-ba9c-bb19d462545a',
            subjectId: 'a6650b51-8dcd-424c-ac10-fdc29c19254c',
            teacherId: 'd412ed54-4f01-4704-b541-beac0e788407',
            roomId: '55d78f7e-c799-4208-8e99-2224310f396d',
            dayOfWeek: 1,
            startTime: '08:00',
            endTime: '09:00',
            academicYear: '2024-2025',
            schoolId: 'school-1',
            class: 'Maternelle 1',
            subject: 'Education du mouvement',
            teacher: 'Elodie YAROU',
            room: 'Salle 101',
            day: 'Lundi',
            time: '08:00-09:00',
            duration: '1',
            durationMinutes: 60
          }
        ];
      }

      const sql = 'SELECT * FROM schedule_entries WHERE school_id = ? ORDER BY day_of_week, start_time';
      const result = await this.electronAPI.database.executeQuery(sql, ['school-1']);
      console.log('🔍 getSchedule - Résultat executeQuery:', result);
      
      if (result.success && result.results) {
        // Convertir les noms de colonnes de snake_case vers camelCase
        const convertedResults = result.results.map((entry: any) => ({
          id: entry.id,
          classId: entry.class_id,
          subjectId: entry.subject_id,
          teacherId: entry.teacher_id,
          roomId: entry.room_id,
          dayOfWeek: entry.day_of_week,
          startTime: entry.start_time,
          endTime: entry.end_time,
          academicYear: entry.academic_year,
          schoolId: entry.school_id,
          createdAt: entry.created_at,
          updatedAt: entry.updated_at
        }));
        
        console.log('🔍 getSchedule - Résultats convertis:', convertedResults);
        return convertedResults;
      }
      
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'emploi du temps:', error);
      return [];
    }
  }

  async createScheduleEntry(scheduleData: Partial<PlanningSchedule>): Promise<{ success: boolean; data?: PlanningSchedule; message?: string }> {
    try {
      if (this.electronAPI?.planning?.createScheduleEntry) {
        const result = await this.electronAPI.planning.createScheduleEntry(scheduleData);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la création du cours:', error);
      return { success: false, message: 'Erreur lors de la création du cours' };
    }
  }

  // === GESTION DES PAUSES ===

  async getBreaks(schoolId: string): Promise<PlanningBreak[]> {
    try {
      if (this.electronAPI?.planning?.getBreaks) {
        const result = await this.electronAPI.planning.getBreaks(schoolId);
        // Handle both wrapped and unwrapped responses
        if (result && typeof result === 'object') {
          if ('success' in result && !result.success) {
            console.error('Erreur API getBreaks:', result.error);
            return [];
          }
          return (result.data ?? result) || [];
        }
        return result || [];
      }
      console.warn('API getBreaks non disponible');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des pauses:', error);
      return [];
    }
  }

  async saveBreaks(breaks: PlanningBreak[]): Promise<{ success: boolean; message?: string }> {
    try {
      if (this.electronAPI?.planning?.saveBreaks) {
        const result = await this.electronAPI.planning.saveBreaks(breaks);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des pauses:', error);
      return { success: false, message: 'Erreur lors de la sauvegarde des pauses' };
    }
  }

  // === CONFIGURATION DES HEURES DE TRAVAIL ===

  async getWorkHoursConfig(schoolId: string): Promise<WorkHoursConfig | null> {
    try {
      if (this.electronAPI?.planning?.getWorkHoursConfig) {
        const result = await this.electronAPI.planning.getWorkHoursConfig(schoolId);
        // Handle both wrapped and unwrapped responses
        if (result && typeof result === 'object') {
          if ('success' in result && !result.success) {
            console.error('Erreur API getWorkHoursConfig:', result.error);
            return null;
          }
          return (result.data ?? result) || null;
        }
        return result || null;
      }
      console.warn('API getWorkHoursConfig non disponible');
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration des heures:', error);
      return null;
    }
  }

  async saveWorkHoursConfig(config: WorkHoursConfig): Promise<{ success: boolean; message?: string }> {
    try {
      if (this.electronAPI?.planning?.saveWorkHoursConfig) {
        const result = await this.electronAPI.planning.saveWorkHoursConfig(config);
        return result;
      }
      return { success: false, message: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration des heures:', error);
      return { success: false, message: 'Erreur lors de la sauvegarde de la configuration des heures' };
    }
  }

  // === STATISTIQUES ===

  async getPlanningStats(schoolId: string): Promise<PlanningStats[]> {
    try {
      if (this.electronAPI?.planning?.getPlanningStats) {
        const result = await this.electronAPI.planning.getPlanningStats(schoolId);
        // Handle both wrapped and unwrapped responses
        if (result && typeof result === 'object') {
          if ('success' in result && !result.success) {
            console.error('Erreur API getPlanningStats:', result.error);
            return [];
          }
          return (result.data ?? result) || [];
        }
        return result || [];
      }
      console.warn('API getPlanningStats non disponible');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return [];
    }
  }

  // ===== MÉTHODES POUR LES HEURES TRAVAILLÉES =====

  /**
   * Créer une entrée d'heures travaillées
   */
  async createWorkedHoursEntry(entryData: Omit<WorkedHoursEntry, 'id' | 'validatedAt'>): Promise<WorkedHoursEntry> {
    try {
      // TODO: Implémenter endpoint API pour créer une entrée d'heures travaillées
      try {
        // const result = await api.planning.createWorkedHoursEntry(entryData);
        throw new Error('Worked hours entry creation not yet implemented in API');
      
      // Implémentation directe avec SQL
      // TODO: Utiliser un endpoint API spécifique
      // Les requêtes SQL directes ne sont pas recommandées dans le Web SaaS
      try {
        throw new Error('Direct SQL queries are not allowed. Use specific API endpoints instead.');
        const id = `wh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const validatedAt = new Date().toISOString();
        const createdAt = new Date().toISOString();
        const updatedAt = new Date().toISOString();
        
        const sql = `
          INSERT INTO worked_hours (
            id, employee_id, employee_name, date, scheduled_hours, validated_hours,
            class_id, class_name, subject_id, subject_name, entry_mode, validated_by,
            validated_at, notes, status, school_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
          id, entryData.employeeId, entryData.employeeName, entryData.date,
          entryData.scheduledHours, entryData.validatedHours, entryData.classId || '',
          entryData.className || '', entryData.subjectId || '', entryData.subjectName || '',
          entryData.entryMode, entryData.validatedBy || '', validatedAt,
          entryData.notes || '', entryData.status, entryData.schoolId, createdAt, updatedAt
        ];
        
        const result = await api.database.executeQuery(sql, values);
        
        // Vérifier que l'insertion a réussi
        if (result && typeof result === 'object' && 'changes' in result) {
          console.log('✅ Entrée insérée avec succès, changements:', result.changes);
        }
        
        return {
          ...entryData,
          id,
          validatedAt
        } as WorkedHoursEntry;
      }
      
      console.warn('API createWorkedHoursEntry non disponible');
      // Mock pour développement
      return {
        ...entryData,
        id: `wh-${Date.now()}`,
        validatedAt: new Date().toISOString()
      } as WorkedHoursEntry;
    } catch (error) {
      console.error('Erreur lors de la création de l\'entrée d\'heures travaillées:', error);
      throw error;
    }
  }

  /**
   * Récupérer les entrées d'heures travaillées avec filtres
   */
  async getWorkedHoursEntries(filters?: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<WorkedHoursEntry[]> {
    try {
      // TODO: Implémenter endpoint API pour récupérer les entrées d'heures travaillées
      try {
        // const result = await api.planning.getWorkedHoursEntries(filters);
        throw new Error('Worked hours entries retrieval not yet implemented in API');
        if (result.success) {
          return result.data;
        }
        throw new Error(result.error || 'Erreur lors de la récupération des entrées');
      }
      
      // Implémentation directe avec SQL
      // TODO: Utiliser un endpoint API spécifique
      // Les requêtes SQL directes ne sont pas recommandées dans le Web SaaS
      try {
        throw new Error('Direct SQL queries are not allowed. Use specific API endpoints instead.');
        let sql = 'SELECT * FROM worked_hours WHERE 1=1';
        const params: any[] = [];
        
        if (filters?.employeeId) {
          sql += ' AND employee_id = ?';
          params.push(filters.employeeId);
        }
        if (filters?.startDate) {
          sql += ' AND date >= ?';
          params.push(filters.startDate);
        }
        if (filters?.endDate) {
          sql += ' AND date <= ?';
          params.push(filters.endDate);
        }
        if (filters?.status) {
          sql += ' AND status = ?';
          params.push(filters.status);
        }
        
        sql += ' ORDER BY created_at DESC';
        
        console.log('🔍 getWorkedHoursEntries - SQL:', sql);
        console.log('🔍 getWorkedHoursEntries - Params:', params);
        
        const result = await api.database.executeQuery(sql, params);
        
        console.log('🔍 getWorkedHoursEntries - Result type:', typeof result);
        console.log('🔍 getWorkedHoursEntries - Is array:', Array.isArray(result));
        console.log('🔍 getWorkedHoursEntries - Result length:', result?.length);
        
        // Vérifier que result est un tableau
        if (!Array.isArray(result)) {
          console.warn('⚠️ executeQuery n\'a pas retourné un tableau:', result);
          return [];
        }
        
        console.log('🔍 getWorkedHoursEntries - Raw data:', result);
        
        // Convertir les données de snake_case vers camelCase
        const converted = result.map((row: any) => ({
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
        
        console.log('🔍 getWorkedHoursEntries - Converted data:', converted);
        return converted;
      }
      
      console.warn('API getWorkedHoursEntries non disponible');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des entrées d\'heures travaillées:', error);
      return [];
    }
  }

  /**
   * Mettre à jour une entrée d'heures travaillées
   */
  async updateWorkedHoursEntry(id: string, updates: Partial<WorkedHoursEntry>): Promise<WorkedHoursEntry> {
    try {
      // TODO: Implémenter endpoint API pour mettre à jour une entrée d'heures travaillées
      try {
        // const result = await api.planning.updateWorkedHoursEntry(id, updates);
        throw new Error('Worked hours entry update not yet implemented in API');
        const result = await api.planning.updateWorkedHoursEntry(id, updates);
        if (result.success) {
          return result.data;
        }
        throw new Error(result.error || 'Erreur lors de la mise à jour de l\'entrée');
      }
      console.warn('API updateWorkedHoursEntry non disponible');
      // Mock pour développement
      return {
        id,
        ...updates,
        validatedAt: new Date().toISOString()
      } as WorkedHoursEntry;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'entrée d\'heures travaillées:', error);
      throw error;
    }
  }

  /**
   * Supprimer une entrée d'heures travaillées
   */
  async deleteWorkedHoursEntry(id: string): Promise<void> {
    try {
      // Utiliser l'API HTTP
      try {
        const result = await api.planning.deleteWorkedHoursEntry(id);
        if (!result.success) {
          throw new Error(result.error || 'Erreur lors de la suppression de l\'entrée');
        }
      } else {
        console.warn('API deleteWorkedHoursEntry non disponible');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'entrée d\'heures travaillées:', error);
      throw error;
    }
  }

  /**
   * Supprimer une affectation d'enseignant
   */
  async deleteTeacherAssignment(assignmentId: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('🔍 planningService.deleteTeacherAssignment appelé avec:', assignmentId);
      console.log('🔍 electronAPI disponible:', !!this.electronAPI);
      console.log('🔍 planning API disponible:', !!this.electronAPI?.planning);
      console.log('🔍 deleteTeacherAssignment disponible:', !!this.electronAPI?.planning?.deleteTeacherAssignment);
      
      if (this.electronAPI?.planning?.deleteTeacherAssignment) {
        console.log('🔍 Appel de l\'API deleteTeacherAssignment...');
        const result = await this.electronAPI.planning.deleteTeacherAssignment(assignmentId);
        console.log('🔍 Résultat de l\'API:', result);
        return result;
      } else {
        console.warn('API deleteTeacherAssignment non disponible');
        return { success: false, message: 'API non disponible' };
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'affectation:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  /**
   * Valider automatiquement les heures depuis le planning
   */
  async validateHoursFromSchedule(scheduleEntryId: string, validatedBy: string): Promise<WorkedHoursEntry> {
    try {
      // Utiliser l'API HTTP
      try {
        const result = await api.planning.validateHoursFromSchedule(scheduleEntryId, validatedBy);
        if (result.success) {
          return result.data;
        }
        throw new Error(result.error || 'Erreur lors de la validation des heures');
      }
      console.warn('API validateHoursFromSchedule non disponible');
      throw new Error('API non disponible');
    } catch (error) {
      console.error('Erreur lors de la validation des heures depuis le planning:', error);
      throw error;
    }
  }

  /**
   * Générer un résumé des heures travaillées
   */
  async getWorkedHoursSummary(filters: {
    employeeId?: string;
    period: string;
    periodType: 'daily' | 'weekly' | 'monthly';
  }): Promise<WorkedHoursSummary[]> {
    try {
      // Utiliser l'API HTTP
      try {
        const result = await api.planning.getWorkedHoursSummary(filters);
        if (result.success) {
          return result.data;
        }
        throw new Error(result.error || 'Erreur lors de la génération du résumé');
      }
      console.warn('API getWorkedHoursSummary non disponible');
      return [];
    } catch (error) {
      console.error('Erreur lors de la génération du résumé des heures travaillées:', error);
      return [];
    }
  }

  /**
   * Générer un rapport de paie
   */
  async generatePayrollReport(employeeId: string, period: string): Promise<PayrollReport> {
    try {
      // Utiliser l'API HTTP
      try {
        const result = await api.planning.generatePayrollReport(employeeId, period);
        if (result.success) {
          return result.data;
        }
        throw new Error(result.error || 'Erreur lors de la génération du rapport de paie');
      }
      console.warn('API generatePayrollReport non disponible');
      throw new Error('API non disponible');
    } catch (error) {
      console.error('Erreur lors de la génération du rapport de paie:', error);
      throw error;
    }
  }

  /**
   * Récupérer les rapports de paie
   */
  async getPayrollReports(filters?: {
    employeeId?: string;
    period?: string;
    status?: string;
  }): Promise<PayrollReport[]> {
    try {
      // Utiliser l'API HTTP
      try {
        const result = await api.planning.getPayrollReports(filters);
        if (result.success) {
          return result.data;
        }
        throw new Error(result.error || 'Erreur lors de la récupération des rapports de paie');
      }
      console.warn('API getPayrollReports non disponible');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des rapports de paie:', error);
      return [];
    }
  }

  /**
   * Envoyer un rapport de paie au module Paie
   */
  async sendReportToPayroll(reportId: string): Promise<void> {
    try {
      // Utiliser l'API HTTP
      try {
        const result = await api.planning.sendReportToPayroll(reportId);
        if (!result.success) {
          throw new Error(result.error || 'Erreur lors de l\'envoi du rapport au module Paie');
        }
      } else {
        console.warn('API sendReportToPayroll non disponible');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du rapport au module Paie:', error);
      throw error;
    }
  }

  /**
   * Récupérer les alertes d'heures travaillées
   */
  async getWorkedHoursAlerts(): Promise<WorkedHoursAlert[]> {
    try {
      // Utiliser l'API HTTP
      try {
        const result = await api.planning.getWorkedHoursAlerts();
        if (result.success) {
          return result.data;
        }
        throw new Error(result.error || 'Erreur lors de la récupération des alertes');
      }
      console.warn('API getWorkedHoursAlerts non disponible');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes d\'heures travaillées:', error);
      return [];
    }
  }

  /**
   * Marquer une alerte comme résolue
   */
  async resolveWorkedHoursAlert(alertId: string, resolvedBy: string): Promise<void> {
    try {
      // Utiliser l'API HTTP
      try {
        const result = await api.planning.resolveWorkedHoursAlert(alertId, resolvedBy);
        if (!result.success) {
          throw new Error(result.error || 'Erreur lors de la résolution de l\'alerte');
        }
      } else {
        console.warn('API resolveWorkedHoursAlert non disponible');
      }
    } catch (error) {
      console.error('Erreur lors de la résolution de l\'alerte:', error);
      throw error;
    }
  }

  /**
   * Récupérer la configuration des heures travaillées
   */
  async getWorkedHoursConfig(): Promise<WorkedHoursConfig | null> {
    try {
      // Utiliser l'API HTTP
      try {
        const result = await api.planning.getWorkedHoursConfig();
        if (result.success) {
          return result.data;
        }
        throw new Error(result.error || 'Erreur lors de la récupération de la configuration');
      }
      console.warn('API getWorkedHoursConfig non disponible');
      // Retourner une configuration par défaut
      return {
        id: 'default-config',
        schoolId: 'school-1',
        startTime: '08:00',
        endTime: '17:00',
        lunchBreakStart: '12:00',
        lunchBreakEnd: '13:00',
        courseDurationMinutes: 60,
        breakBetweenCoursesMinutes: 15,
        workDays: JSON.stringify([1, 2, 3, 4, 5]), // Lundi à Vendredi
        maxHoursPerDay: 8,
        maxHoursPerWeek: 40,
        lunchBreakMandatory: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration des heures travaillées:', error);
      return null;
    }
  }

  /**
   * Sauvegarder la configuration des heures travaillées
   */
  async saveWorkedHoursConfig(config: WorkedHoursConfig): Promise<void> {
    try {
      // Utiliser l'API HTTP
      try {
        const result = await api.planning.saveWorkedHoursConfig(config);
        if (!result.success) {
          throw new Error(result.error || 'Erreur lors de la sauvegarde de la configuration');
        }
      } else {
        console.warn('API saveWorkedHoursConfig non disponible');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration des heures travaillées:', error);
      throw error;
    }
  }

  /**
   * Sauvegarder une entrée de planning
   */
  async saveScheduleEntry(scheduleData: {
    id: string;
    classId: string;
    subjectId: string;
    teacherId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    roomId?: string;
    notes?: string;
    class: string;
    subject: string;
    teacher: string;
    day: string;
    time: string;
    duration: string;
    durationMinutes: number;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log('🔍 saveScheduleEntry - Données reçues:', scheduleData);
      
      if (!this.electronAPI?.database?.executeQuery) {
        console.warn('API database non disponible');
        return { success: false, error: 'API database non disponible' };
      }

      // Insérer l'entrée dans schedule_entries
      const sql = `
        INSERT INTO schedule_entries (
          id, class_id, subject_id, teacher_id, room_id, 
          day_of_week, start_time, end_time, school_id, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `;
      
      const params = [
        scheduleData.id,
        scheduleData.classId,
        scheduleData.subjectId,
        scheduleData.teacherId,
        scheduleData.roomId || null,
        scheduleData.dayOfWeek,
        scheduleData.startTime,
        scheduleData.endTime,
        'school-1'
      ];

      console.log('🔍 saveScheduleEntry - SQL:', sql);
      console.log('🔍 saveScheduleEntry - Params:', params);

      const result = await this.electronAPI.database.executeQuery(sql, params);
      console.log('🔍 saveScheduleEntry - Résultat:', result);

      if (result.success) {
        return { success: true, message: 'Entrée de planning sauvegardée avec succès' };
      } else {
        return { success: false, error: result.error || 'Erreur lors de la sauvegarde' };
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'entrée de planning:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  /**
   * Supprimer une entrée de planning
   */
  async deleteScheduleEntry(entryId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log('🗑️ deleteScheduleEntry - Suppression de l\'entrée:', entryId);
      
      if (!this.electronAPI?.database?.executeQuery) {
        console.warn('API database non disponible');
        return { success: false, error: 'API database non disponible' };
      }

      // Supprimer l'entrée de schedule_entries
      const sql = 'DELETE FROM schedule_entries WHERE id = ?';
      const result = await this.electronAPI.database.executeQuery(sql, [entryId]);
      
      console.log('🗑️ deleteScheduleEntry - Résultat:', result);
      
      if (result.success) {
        return { 
          success: true, 
          message: `Entrée ${entryId} supprimée avec succès` 
        };
      } else {
        return { 
          success: false, 
          error: 'Erreur lors de la suppression' 
        };
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'entrée de planning:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  /**
   * Exporter les données d'heures travaillées
   */
  async exportWorkedHoursData(filters: {
    employeeId?: string;
    startDate: string;
    endDate: string;
    format: 'csv' | 'excel' | 'pdf';
  }): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      // Utiliser l'API HTTP
      try {
        const result = await api.planning.exportWorkedHoursData(filters);
        return result;
      }
      console.warn('API exportWorkedHoursData non disponible');
      return { success: false, error: 'API non disponible' };
    } catch (error) {
      console.error('Erreur lors de l\'export des données d\'heures travaillées:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }
}

export const planningService = PlanningService.getInstance();