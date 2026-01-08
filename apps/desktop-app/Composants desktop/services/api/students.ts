import dataService from '../dataService';
import { Student } from '../dataService';

export interface CreateStudentData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  classId?: string | null;
  academicYearId?: string | null;
  enrollmentDate?: string;
  studentNumber?: string;
  photo?: string;
  status?: 'active' | 'inactive' | 'graduated';
  notes?: string;
  // Nouveaux champs pour les frais scolaires
  seniority?: 'new' | 'old';
  inscriptionFee?: number;
  reinscriptionFee?: number;
  tuitionFee?: number;
  totalSchoolFees?: number;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {}

export const studentsService = {
  // Récupérer tous les étudiants
  async getAllStudents(
    filters?: {
      classId?: string;
      academicYearId?: string;
      status?: string;
      search?: string;
    },
    pagination?: {
      page?: number;
      limit?: number;
    }
  ) {
    try {
      const students = await dataService.getStudents(filters);
      return {
        data: students,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des étudiants:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer un étudiant par ID
  async getStudentById(id: string) {
    try {
      const student = await dataService.getStudentById(id);
      if (!student) {
        return {
          data: null,
          success: false,
          error: 'Étudiant non trouvé'
        };
      }
      return {
        data: student,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'étudiant:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Créer un nouvel étudiant
  async createStudent(data: CreateStudentData) {
    try {
      const student = await dataService.createStudent(data);
      return {
        data: student,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'étudiant:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Mettre à jour un étudiant
  async updateStudent(id: string, data: UpdateStudentData) {
    try {
      const student = await dataService.updateStudent(id, data);
      return {
        data: student,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'étudiant:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Supprimer un étudiant
  async deleteStudent(id: string) {
    try {
      const success = await dataService.deleteStudent(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'étudiant:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer les étudiants d'une classe
  async getStudentsByClass(classId: string) {
    try {
      const students = await dataService.getStudentsByClass(classId);
      return {
        data: students,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des étudiants par classe:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Rechercher des étudiants
  async searchStudents(query: string) {
    try {
      const students = await dataService.searchStudents(query);
      return {
        data: students,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la recherche des étudiants:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer les statistiques des étudiants
  async getStudentStats() {
    try {
      const stats = await dataService.getStudentStats();
      return {
        data: stats,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer les étudiants avec leurs notes
  async getStudentsWithGrades(classId?: string) {
    try {
      const students = await dataService.getStudentsWithGrades(classId);
      return {
        data: students,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des étudiants avec notes:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
};
