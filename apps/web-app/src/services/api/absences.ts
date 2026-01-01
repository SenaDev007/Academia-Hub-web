import dataService from '../dataService';

export interface Absence {
  id: string;
  studentId: string;
  studentName?: string;
  class?: string;
  date: string;
  period: string;
  reason: string;
  justified: boolean;
  parentNotified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAbsenceData {
  studentId: string;
  date: string;
  period: string;
  reason: string;
  justified?: boolean;
  parentNotified?: boolean;
}

export interface UpdateAbsenceData extends Partial<CreateAbsenceData> {}

export interface AbsenceFilters {
  studentId?: string;
  classId?: string;
  dateFrom?: string;
  dateTo?: string;
  justified?: boolean;
  parentNotified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const absencesService = {
  // Récupérer toutes les absences
  async getAbsences(filters?: AbsenceFilters) {
    try {
      // Méthode temporaire - retourne un tableau vide
      const absences: Absence[] = [];
      return {
        data: absences,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des absences:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer une absence par ID
  async getAbsenceById(id: string) {
    try {
      const absence = await dataService.getAbsenceById(id);
      if (!absence) {
        return {
          data: null,
          success: false,
          error: 'Absence non trouvée'
        };
      }
      return {
        data: absence,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'absence:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Créer une nouvelle absence
  async createAbsence(data: CreateAbsenceData) {
    try {
      const absence = await dataService.createAbsence(data);
      return {
        data: absence,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'absence:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Mettre à jour une absence
  async updateAbsence(id: string, data: UpdateAbsenceData) {
    try {
      const absence = await dataService.updateAbsence(id, data);
      return {
        data: absence,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'absence:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Supprimer une absence
  async deleteAbsence(id: string) {
    try {
      const success = await dataService.deleteAbsence(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'absence:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer les absences d'un étudiant
  async getAbsencesByStudent(studentId: string) {
    try {
      const absences = await dataService.getAbsencesByStudent(studentId);
      return {
        data: absences,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des absences de l\'étudiant:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer les absences d'une classe
  async getAbsencesByClass(classId: string) {
    try {
      const absences = await dataService.getAbsencesByClass(classId);
      return {
        data: absences,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des absences de la classe:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer les statistiques d'absences
  async getAbsenceStats(schoolId: string) {
    try {
      const stats = await dataService.getAbsenceStats(schoolId);
      return {
        data: stats,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques d\'absences:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Justifier une absence
  async justifyAbsence(id: string, justified: boolean) {
    try {
      const absence = await dataService.updateAbsence(id, { justified });
      return {
        data: absence,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la justification de l\'absence:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Notifier les parents
  async notifyParents(id: string, parentNotified: boolean) {
    try {
      const absence = await dataService.updateAbsence(id, { parentNotified });
      return {
        data: absence,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la notification des parents:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
};
