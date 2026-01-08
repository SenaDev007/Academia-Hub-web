import dataService from './dataService';
import { hybridStorageService } from './hybridStorageService';
import { enhancedCache } from './offline/EnhancedCache';
import { hybridSyncService } from './hybridSyncService';

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
  status: 'active' | 'inactive' | 'graduated' | 'transferred';
  photo?: string; // Maintenant c'est un chemin vers le fichier local
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

export interface Absence {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  date: string;
  period: 'Matin' | 'Après-midi' | 'Journée';
  reason: string;
  justified: boolean;
  parentNotified: boolean;
}

export interface DisciplinaryIncident {
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

export interface EnrollmentStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  newThisWeek: number;
}

class LocalDatabaseService {
  constructor() {
    // Démarrer le nettoyage automatique
    hybridStorageService.startAutoCleanup();
    // Note: enhancedCache.startAutoCleanup() n'existe pas encore, on l'ajoutera plus tard
    
    // Démarrer la synchronisation automatique
    hybridSyncService.startAutoSync();
  }

  async getAllStudents(filters?: {
    classId?: string;
    status?: string;
    search?: string;
  }) {
    try {
      // Essayer d'abord le cache
      const cacheKey = `students:${JSON.stringify(filters || {})}`;
      let students = await enhancedCache.get<Student[]>(cacheKey);
      
      if (students) {
        console.log('Students retrieved from cache');
        return students;
      }

      // Si pas en cache, récupérer depuis le service principal
      students = await dataService.getStudents(filters || {});
      
      // Transformer les données pour inclure les chemins des photos
      const transformedStudents = students.map(student => ({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        dateOfBirth: student.dateOfBirth,
        address: student.address,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        classId: student.classId,
        className: student.classId, // Sera rempli avec le nom de la classe
        enrollmentDate: (student as any).createdAt || new Date().toISOString(),
        status: student.status as 'active' | 'inactive' | 'graduated',
        medicalInfo: student.medicalInfo,
        registrationNumber: student.registrationNumber,
        fees: 'paid' as 'paid' | 'pending' | 'overdue', // À déterminer avec les paiements
        photo: student.photo ? `student-photos/${student.id}.jpg` : undefined
      }));

      // Mettre en cache avec stratégie fréquente
      await enhancedCache.set(cacheKey, transformedStudents, 'frequent', ['students', 'list']);
      
      return transformedStudents;
    } catch (error) {
      console.error('Erreur lors de la récupération des étudiants:', error);
      return [];
    }
  }

  async getStudentById(id: string) {
    try {
      // Essayer d'abord le cache
      const cacheKey = `student:${id}`;
      let student = await enhancedCache.get<Student>(cacheKey);
      
      if (student) {
        console.log('Student retrieved from cache');
        return student;
      }

      // Si pas en cache, récupérer depuis le service principal
      student = await dataService.getStudent(id);
      
      if (student) {
        // Transformer les données
        const transformedStudent = {
          ...student,
          photo: student.photo ? `student-photos/${student.id}.jpg` : undefined
        };

        // Mettre en cache avec stratégie fréquente
        await enhancedCache.set(cacheKey, transformedStudent, 'frequent', ['student', 'detail']);
        
        return transformedStudent;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'étudiant:', error);
      return null;
    }
  }

  async createStudent(data: any, photoFile?: File) {
    try {
      // Créer l'étudiant avec le stockage hybride
      const studentData = await dataService.createStudent(data);
      
      // Si une photo est fournie, l'optimiser et la stocker
      if (photoFile) {
        await hybridStorageService.storeStudentData(
          studentData.id,
          studentData,
          photoFile
        );
      }

      // Mettre en cache
      const cacheKey = `student:${studentData.id}`;
      await enhancedCache.set(cacheKey, studentData, 'frequent', ['student', 'detail']);

      // Invalider le cache de la liste
      await this.invalidateStudentsListCache();

      // Ajouter à la queue de synchronisation
      await hybridSyncService.addToSyncQueue(
        'create',
        'student',
        studentData,
        'high'
      );

      return studentData;
    } catch (error) {
      console.error('Erreur lors de la création de l\'étudiant:', error);
      throw error;
    }
  }

  async updateStudent(id: string, data: any, photoFile?: File) {
    try {
      // Mettre à jour l'étudiant
      const updatedStudent = await dataService.updateStudent(id, data);
      
      // Si une nouvelle photo est fournie, l'optimiser et la stocker
      if (photoFile) {
        await hybridStorageService.storeStudentData(
          id,
          updatedStudent,
          photoFile
        );
      }

      // Mettre à jour le cache
      const cacheKey = `student:${id}`;
      await enhancedCache.set(cacheKey, updatedStudent, 'frequent', ['student', 'detail']);

      // Invalider le cache de la liste
      await this.invalidateStudentsListCache();

      // Ajouter à la queue de synchronisation
      await hybridSyncService.addToSyncQueue(
        'update',
        'student',
        updatedStudent,
        'high'
      );

      return updatedStudent;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'étudiant:', error);
      throw error;
    }
  }

  async deleteStudent(id: string) {
    try {
      // Supprimer l'étudiant
      await dataService.deleteStudent(id);
      
      // Supprimer du cache
      const cacheKey = `student:${id}`;
      // Note: delete() n'existe pas encore dans EnhancedCache
      console.log('Cache delete requested - method not yet implemented');

      // Invalider le cache de la liste
      await this.invalidateStudentsListCache();

      // Ajouter à la queue de synchronisation
      await hybridSyncService.addToSyncQueue(
        'delete',
        'student',
        { id },
        'high'
      );

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'étudiant:', error);
      throw error;
    }
  }

  async getClasses() {
    try {
      // Essayer d'abord le cache
      const cacheKey = 'classes:all';
      let classes = await enhancedCache.get(cacheKey);
      
      if (classes) {
        console.log('Classes retrieved from cache');
        return classes;
      }

      // Si pas en cache, récupérer depuis le service principal
      classes = await dataService.getClasses();
      
      // Mettre en cache avec stratégie fréquente
      await enhancedCache.set(cacheKey, classes, 'frequent', ['classes', 'list']);
      
      return (classes as any[]).map((cls: any) => ({
        id: cls.id,
        name: cls.name,
        level: cls.level
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des classes:', error);
      return [];
    }
  }

  async getEnrollmentStats() {
    try {
      // Essayer d'abord le cache
      const cacheKey = 'enrollment:stats';
      let stats = await enhancedCache.get<EnrollmentStats>(cacheKey);
      
      if (stats) {
        console.log('Enrollment stats retrieved from cache');
        return stats;
      }

      // Si pas en cache, récupérer depuis le service principal
      const dashboardStats = await dataService.getDashboardStats();
      
      stats = {
        totalStudents: dashboardStats.totalStudents,
        presentToday: dashboardStats.totalStudents - 5, // Mock - à implémenter avec les absences
        absentToday: 5, // Mock - à implémenter avec les absences
        newThisWeek: 2 // Mock - à implémenter avec les nouvelles inscriptions
      };

      // Mettre en cache avec stratégie normale
      await enhancedCache.set(cacheKey, stats, 'normal', ['enrollment', 'stats']);
      
      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        newThisWeek: 0
      };
    }
  }

  async getAbsences() {
    try {
      // Essayer d'abord le cache
      const cacheKey = 'absences:recent';
      let absences = await enhancedCache.get<Absence[]>(cacheKey);
      
      if (absences) {
        console.log('Absences retrieved from cache');
        return absences;
      }

      // Si pas en cache, récupérer depuis le service principal
    // À implémenter avec la table absences
      absences = [];
      
      // Mettre en cache avec stratégie normale
      await enhancedCache.set(cacheKey, absences, 'normal', ['absences', 'recent']);
      
      return absences;
    } catch (error) {
      console.error('Erreur lors de la récupération des absences:', error);
    return [];
    }
  }

  async getDisciplinaryIncidents() {
    try {
      // Essayer d'abord le cache
      const cacheKey = 'disciplinary:recent';
      let incidents = await enhancedCache.get<DisciplinaryIncident[]>(cacheKey);
      
      if (incidents) {
        console.log('Disciplinary incidents retrieved from cache');
        return incidents;
      }

      // Si pas en cache, récupérer depuis le service principal
    // À implémenter avec la table disciplinary_incidents
      incidents = [];
      
      // Mettre en cache avec stratégie normale
      await enhancedCache.set(cacheKey, incidents, 'normal', ['disciplinary', 'recent']);
      
      return incidents;
    } catch (error) {
      console.error('Erreur lors de la récupération des incidents disciplinaires:', error);
    return [];
    }
  }

  // Méthodes pour la gestion du cache
  private async invalidateStudentsListCache() {
    try {
      // Supprimer tous les caches liés aux listes d'étudiants
      // Note: getAllKeys n'existe pas encore, on utilisera une approche différente
      console.log('Invalidating students list cache...');
    } catch (error) {
      console.error('Error invalidating students list cache:', error);
    }
  }

  async clearCache() {
    try {
      // Note: clear() n'existe pas encore dans EnhancedCache
      console.log('Cache clear requested - method not yet implemented');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async getCacheStats() {
    try {
      // Note: getStats() n'existe pas encore dans EnhancedCache
      console.log('Cache stats requested - method not yet implemented');
      return null;
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  }

  async getStorageStats() {
    try {
      return await hybridStorageService.getStorageStats();
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return null;
    }
  }

  // Méthode pour précharger les données fréquemment utilisées
  async preloadFrequentData() {
    try {
      console.log('Preloading frequent data...');
      
      // Précharger les étudiants
      await this.getAllStudents();
      
      // Précharger les classes
      await this.getClasses();
      
      // Précharger les statistiques
      await this.getEnrollmentStats();
      
      console.log('Frequent data preloaded successfully');
    } catch (error) {
      console.error('Error preloading frequent data:', error);
    }
  }

  // Méthodes pour la gestion de la synchronisation
  async getSyncStats() {
    try {
      return hybridSyncService.getSyncStats();
    } catch (error) {
      console.error('Error getting sync stats:', error);
      return null;
    }
  }

  async forceSync() {
    try {
      await hybridSyncService.forceSync();
    } catch (error) {
      console.error('Error forcing sync:', error);
      throw error;
    }
  }

  async getSyncConfig() {
    try {
      return hybridSyncService.getConfig();
    } catch (error) {
      console.error('Error getting sync config:', error);
      return null;
    }
  }

  async updateSyncConfig(newConfig: any) {
    try {
      await hybridSyncService.updateConfig(newConfig);
    } catch (error) {
      console.error('Error updating sync config:', error);
      throw error;
    }
  }

  async getSyncQueue() {
    try {
      return hybridSyncService.getSyncQueue();
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }

  async clearSyncQueue() {
    try {
      hybridSyncService.clearSyncQueue();
    } catch (error) {
      console.error('Error clearing sync queue:', error);
    }
  }

  async isOnline() {
    try {
      return hybridSyncService.isOnlineStatus();
    } catch (error) {
      console.error('Error checking online status:', error);
      return false;
    }
  }
}

export const localDatabaseService = new LocalDatabaseService();
