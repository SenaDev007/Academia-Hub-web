import { dataService } from '../dataService';
import { Teacher } from '../dataService';

export interface CreateTeacherData {
  matricule?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  qualification?: string;
  specialization?: string[];
  hireDate?: string;
  salary?: number;
  photo?: string;
  subjects?: string[];
}

export interface TeacherFilters {
  specialization?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const teachersService = {
  async getTeachers(filters?: TeacherFilters) {
    try {
      const teachers = await dataService.getAllTeachers(filters);
      return {
        data: teachers,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des enseignants:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getTeacher(id: string) {
    try {
      const teacher = await dataService.getTeacherById(id);
      if (!teacher) {
        return {
          data: null,
          success: false,
          error: 'Enseignant non trouvé'
        };
      }
      return {
        data: teacher,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'enseignant:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async createTeacher(data: CreateTeacherData) {
    try {
      const teacher = await dataService.createTeacher(data);
      return {
        data: teacher,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'enseignant:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async updateTeacher(id: string, data: Partial<CreateTeacherData>) {
    try {
      const teacher = await dataService.updateTeacher(id, data);
      return {
        data: teacher,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'enseignant:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async deleteTeacher(id: string) {
    try {
      const success = await dataService.deleteTeacher(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'enseignant:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getTeacherClasses(teacherId: string) {
    try {
      const classes = await dataService.getTeacherClasses(teacherId);
      return {
        data: classes,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des classes de l\'enseignant:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getTeacherSubjects(teacherId: string) {
    try {
      const subjects = await dataService.getTeacherSubjects(teacherId);
      return {
        data: subjects,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des matières de l\'enseignant:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getTeacherSchedule(teacherId: string, date?: string) {
    try {
      const schedules = await dataService.getAllSchedules({
        teacherId,
        date: date || new Date().toISOString().split('T')[0]
      });
      return {
        data: schedules,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'emploi du temps:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getTeacherStats(teacherId: string) {
    try {
      const stats = await dataService.getTeacherStats(teacherId);
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

  async assignToClass(teacherId: string, classId: string) {
    try {
      const success = await dataService.assignTeacherToClass(teacherId, classId);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de l\'assignation à la classe:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async assignToSubject(teacherId: string, subjectId: string) {
    try {
      const success = await dataService.assignTeacherToSubject(teacherId, subjectId);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de l\'assignation à la matière:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async uploadPhoto(id: string, photoPath: string) {
    try {
      const teacher = await dataService.updateTeacher(id, { photo: photoPath });
      return {
        data: { photoUrl: photoPath },
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'upload de la photo:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async generateMatricule() {
    try {
      const matricule = `ENS-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      return {
        data: { matricule },
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la génération du matricule:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async importTeachers(filePath: string) {
    try {
      // Pour l'import, on utilisera une méthode de parsing CSV/Excel via le main process
      const result = await dataService.importTeachers(filePath);
      return {
        data: result,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'import des enseignants:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async exportTeachers(filters?: TeacherFilters) {
    try {
      const teachers = await dataService.getAllTeachers(filters);
      return {
        data: teachers,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'export des enseignants:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
};
