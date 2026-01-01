import dataService from '../dataService';
import { Class } from '../dataService';

export interface CreateClassData {
  name: string;
  code: string;
  level: string;
  section?: string;
  capacity?: number;
  academicYearId: string;
  teacherId?: string;
  roomId?: string;
  description?: string;
}

export interface ClassFilters {
  academicYearId?: string;
  level?: string;
  teacherId?: string;
  roomId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const classesService = {
  async getClasses(filters?: ClassFilters) {
    try {
      const classes = await dataService.getClasses();
      return {
        data: classes,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des classes:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getClass(id: string) {
    try {
      const classData = await dataService.getClassById(id);
      if (!classData) {
        return {
          data: null,
          success: false,
          error: 'Classe non trouvée'
        };
      }
      return {
        data: classData,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la classe:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async createClass(data: CreateClassData) {
    try {
      const classData = await dataService.createClass(data);
      return {
        data: classData,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création de la classe:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async updateClass(id: string, data: Partial<CreateClassData>) {
    try {
      const classData = await dataService.updateClass(id, data);
      return {
        data: classData,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la classe:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async deleteClass(id: string) {
    try {
      const success = await dataService.deleteClass(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de la classe:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getClassStudents(classId: string) {
    try {
      const students = await dataService.getStudentsByClass(classId);
      return {
        data: students,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des élèves de la classe:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getClassSubjects(classId: string) {
    try {
      const subjects = await dataService.getSubjectsByClass(classId);
      return {
        data: subjects,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des matières de la classe:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getClassSchedule(classId: string) {
    try {
      const schedules = await dataService.getAllSchedules({ classId });
      return {
        data: schedules,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'emploi du temps de la classe:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getClassStats(classId: string) {
    try {
      const stats = await dataService.getClassStats(classId);
      return {
        data: stats,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de la classe:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async assignTeacher(classId: string, teacherId: string) {
    try {
      const classData = await dataService.updateClass(classId, { teacherId });
      return {
        data: classData,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'assignation de l\'enseignant:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async assignRoom(classId: string, roomId: string) {
    try {
      const classData = await dataService.updateClass(classId, { roomId });
      return {
        data: classData,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'assignation de la salle:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getAvailableRooms(classId: string, date?: string, timeSlot?: string) {
    try {
      const rooms = await dataService.getAvailableRooms({ date, timeSlot });
      return {
        data: rooms,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des salles disponibles:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async duplicateClass(id: string, newAcademicYearId: string) {
    try {
      const originalClass = await dataService.getClassById(id);
      if (!originalClass) {
        return {
          data: null,
          success: false,
          error: 'Classe originale non trouvée'
        };
      }

      const duplicatedClass = await dataService.createClass({
        ...originalClass,
        academicYearId: newAcademicYearId,
        name: `${originalClass.name} - Copie`,
        code: `${originalClass.code}-COPY`
      });

      return {
        data: duplicatedClass,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la duplication de la classe:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getClassLevels() {
    try {
      const levels = [
        'Petite Section', 'Moyenne Section', 'Grande Section',
        'CP', 'CE1', 'CE2', 'CM1', 'CM2',
        '6ème', '5ème', '4ème', '3ème',
        '2nde', '1ère', 'Terminale'
      ];
      return {
        data: levels,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des niveaux:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
};
