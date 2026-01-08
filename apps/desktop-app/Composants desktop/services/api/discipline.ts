import dataService from '../dataService';

export interface DisciplineIncident {
  id: string;
  studentId: string;
  studentName?: string;
  class?: string;
  date: string;
  incident: string;
  severity: 'minor' | 'major' | 'severe';
  action: string;
  teacher: string;
  description?: string;
  location?: string;
  witnesses?: string;
  parentNotified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIncidentData {
  studentId: string;
  date: string;
  incident: string;
  severity: 'minor' | 'major' | 'severe';
  action: string;
  teacher: string;
  description?: string;
  location?: string;
  witnesses?: string;
  parentNotified?: boolean;
}

export interface UpdateIncidentData extends Partial<CreateIncidentData> {}

export interface IncidentFilters {
  studentId?: string;
  classId?: string;
  severity?: 'minor' | 'major' | 'severe';
  teacher?: string;
  dateFrom?: string;
  dateTo?: string;
  parentNotified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const disciplineService = {
  // Récupérer tous les incidents
  async getIncidents(filters?: IncidentFilters) {
    try {
      // Méthode temporaire - retourne un tableau vide
      const incidents: DisciplineIncident[] = [];
      return {
        data: incidents,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des incidents:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer un incident par ID
  async getIncidentById(id: string) {
    try {
      const incident = await dataService.getDisciplineIncidentById(id);
      if (!incident) {
        return {
          data: null,
          success: false,
          error: 'Incident non trouvé'
        };
      }
      return {
        data: incident,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'incident:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Créer un nouvel incident
  async createIncident(data: CreateIncidentData) {
    try {
      const incident = await dataService.createDisciplineIncident(data);
      return {
        data: incident,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'incident:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Mettre à jour un incident
  async updateIncident(id: string, data: UpdateIncidentData) {
    try {
      const incident = await dataService.updateDisciplineIncident(id, data);
      return {
        data: incident,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'incident:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Supprimer un incident
  async deleteIncident(id: string) {
    try {
      const success = await dataService.deleteDisciplineIncident(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'incident:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer les incidents d'un étudiant
  async getIncidentsByStudent(studentId: string) {
    try {
      const incidents = await dataService.getDisciplineIncidentsByStudent(studentId);
      return {
        data: incidents,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des incidents de l\'étudiant:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer les incidents d'une classe
  async getIncidentsByClass(classId: string) {
    try {
      const incidents = await dataService.getDisciplineIncidentsByClass(classId);
      return {
        data: incidents,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des incidents de la classe:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer les incidents par enseignant
  async getIncidentsByTeacher(teacherId: string) {
    try {
      const incidents = await dataService.getDisciplineIncidentsByTeacher(teacherId);
      return {
        data: incidents,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des incidents de l\'enseignant:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Récupérer les statistiques d'incidents
  async getIncidentStats(schoolId: string) {
    try {
      const stats = await dataService.getDisciplineIncidentStats(schoolId);
      return {
        data: stats,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques d\'incidents:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Notifier les parents d'un incident
  async notifyParents(id: string, parentNotified: boolean) {
    try {
      const incident = await dataService.updateDisciplineIncident(id, { parentNotified });
      return {
        data: incident,
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
  },

  // Mettre à jour la sévérité d'un incident
  async updateSeverity(id: string, severity: 'minor' | 'major' | 'severe') {
    try {
      const incident = await dataService.updateDisciplineIncident(id, { severity });
      return {
        data: incident,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la sévérité:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Mettre à jour l'action prise
  async updateAction(id: string, action: string) {
    try {
      const incident = await dataService.updateDisciplineIncident(id, { action });
      return {
        data: incident,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'action:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
};
