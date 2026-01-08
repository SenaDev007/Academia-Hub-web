import { dataService } from '../dataService';
import { MedicalRecord, HealthConsultation, HealthAlert, VaccinationRecord } from '../dataService';

export interface CreateMedicalRecordData {
  studentId: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  medications?: string[];
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
}

export interface CreateHealthConsultationData {
  studentId: string;
  date: string;
  reason: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'completed' | 'follow_up';
  notes?: string;
}

export interface CreateHealthAlertData {
  studentId: string;
  type: 'allergy' | 'medical_condition' | 'medication' | 'emergency' | 'other';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status?: 'active' | 'resolved' | 'dismissed';
  validUntil?: string;
}

export interface CreateVaccinationRecordData {
  studentId: string;
  vaccineName: string;
  date: string;
  dose: string;
  nextDoseDate?: string;
  administeredBy?: string;
  notes?: string;
}

export interface HealthFilters {
  studentId?: string;
  classId?: string;
  bloodGroup?: string;
  hasAllergies?: boolean;
  hasChronicConditions?: boolean;
  alertType?: string;
  alertStatus?: string;
  consultationDateFrom?: string;
  consultationDateTo?: string;
}

export const healthService = {
  // Medical Records
  async getMedicalRecords(filters?: HealthFilters) {
    try {
      const records = await dataService.getAllMedicalRecords(filters);
      return {
        data: records,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des dossiers médicaux:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getMedicalRecord(id: string) {
    try {
      const record = await dataService.getMedicalRecordById(id);
      if (!record) {
        return {
          data: null,
          success: false,
          error: 'Dossier médical non trouvé'
        };
      }
      return {
        data: record,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du dossier médical:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async createMedicalRecord(data: CreateMedicalRecordData) {
    try {
      const record = await dataService.createMedicalRecord(data);
      return {
        data: record,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création du dossier médical:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async updateMedicalRecord(id: string, data: Partial<CreateMedicalRecordData>) {
    try {
      const record = await dataService.updateMedicalRecord(id, data);
      return {
        data: record,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du dossier médical:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async deleteMedicalRecord(id: string) {
    try {
      const success = await dataService.deleteMedicalRecord(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression du dossier médical:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Health Consultations
  async getHealthConsultations(filters?: HealthFilters) {
    try {
      const consultations = await dataService.getAllHealthConsultations(filters);
      return {
        data: consultations,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des consultations:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getHealthConsultation(id: string) {
    try {
      const consultation = await dataService.getHealthConsultationById(id);
      if (!consultation) {
        return {
          data: null,
          success: false,
          error: 'Consultation non trouvée'
        };
      }
      return {
        data: consultation,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la consultation:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async createHealthConsultation(data: CreateHealthConsultationData) {
    try {
      const consultation = await dataService.createHealthConsultation(data);
      return {
        data: consultation,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création de la consultation:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async updateHealthConsultation(id: string, data: Partial<CreateHealthConsultationData>) {
    try {
      const consultation = await dataService.updateHealthConsultation(id, data);
      return {
        data: consultation,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la consultation:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async deleteHealthConsultation(id: string) {
    try {
      const success = await dataService.deleteHealthConsultation(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de la consultation:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Health Alerts
  async getHealthAlerts(filters?: HealthFilters) {
    try {
      const alerts = await dataService.getAllHealthAlerts(filters);
      return {
        data: alerts,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getHealthAlert(id: string) {
    try {
      const alert = await dataService.getHealthAlertById(id);
      if (!alert) {
        return {
          data: null,
          success: false,
          error: 'Alerte non trouvée'
        };
      }
      return {
        data: alert,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'alerte:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async createHealthAlert(data: CreateHealthAlertData) {
    try {
      const alert = await dataService.createHealthAlert(data);
      return {
        data: alert,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async updateHealthAlert(id: string, data: Partial<CreateHealthAlertData>) {
    try {
      const alert = await dataService.updateHealthAlert(id, data);
      return {
        data: alert,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'alerte:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async deleteHealthAlert(id: string) {
    try {
      const success = await dataService.deleteHealthAlert(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'alerte:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Vaccination Records
  async getVaccinationRecords(filters?: { studentId?: string }) {
    try {
      const records = await dataService.getAllVaccinationRecords(filters);
      return {
        data: records,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des dossiers de vaccination:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getVaccinationRecord(id: string) {
    try {
      const record = await dataService.getVaccinationRecordById(id);
      if (!record) {
        return {
          data: null,
          success: false,
          error: 'Dossier de vaccination non trouvé'
        };
      }
      return {
        data: record,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du dossier de vaccination:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async createVaccinationRecord(data: CreateVaccinationRecordData) {
    try {
      const record = await dataService.createVaccinationRecord(data);
      return {
        data: record,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création du dossier de vaccination:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async updateVaccinationRecord(id: string, data: Partial<CreateVaccinationRecordData>) {
    try {
      const record = await dataService.updateVaccinationRecord(id, data);
      return {
        data: record,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du dossier de vaccination:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async deleteVaccinationRecord(id: string) {
    try {
      const success = await dataService.deleteVaccinationRecord(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression du dossier de vaccination:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Health Statistics
  async getHealthStats() {
    try {
      const stats = await dataService.getHealthStats();
      return {
        data: stats,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de santé:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getStudentsWithMedicalConditions() {
    try {
      const students = await dataService.getStudentsWithMedicalConditions();
      return {
        data: students,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des élèves avec conditions médicales:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Search
  async searchMedicalRecords(query: string) {
    try {
      const results = await dataService.searchMedicalRecords(query);
      return {
        data: results,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la recherche dans les dossiers médicaux:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
};
