import { useUser } from '../contexts/UserContext';

export interface Reservation {
  id: string;
  roomId: string;
  date: string;
  start_time: string;
  end_time: string;
  subject: string;
  subjectId?: string;
  teacherId: string;
  classId: string;
  type: 'cours' | 'examen' | 'réunion' | 'maintenance';
  status: 'confirmé' | 'en_attente' | 'annulé';
  description?: string;
  schoolId: string;
  created_at: string;
  updated_at: string;
  teacher_name?: string;
  class_name?: string;
  room_name?: string;
  subject_name?: string;
}

export interface CreateReservationData {
  roomId: string;
  date: string;
  start_time: string;
  end_time: string;
  subject: string;
  subjectId?: string;
  teacherId: string;
  classId: string;
  type?: 'cours' | 'examen' | 'réunion' | 'maintenance';
  status?: 'confirmé' | 'en_attente' | 'annulé';
  description?: string;
}

export interface UpdateReservationData extends Partial<CreateReservationData> {}

class ReservationService {
  private getSchoolId(): string {
    // Récupérer le schoolId depuis le contexte d'authentification
    // Pour l'instant, on utilise une valeur par défaut
    return 'default-school-id';
  }

  async getReservationsByRoom(roomId: string): Promise<Reservation[]> {
    try {
      const schoolId = this.getSchoolId();
      
      // Utiliser directement l'API Electron si disponible, sinon fallback
      // Utiliser l'API HTTP
      try {
        const result = await api.reservations.getByRoom(roomId, schoolId);
        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.error || 'Erreur lors de la récupération des réservations');
        }
      } else {
        // Fallback pour le développement web
        console.warn('API Electron non disponible, utilisation du fallback');
        return [];
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      throw error;
    }
  }

  async getAllReservations(): Promise<Reservation[]> {
    try {
      const schoolId = this.getSchoolId();
      
      // Utiliser directement l'API Electron si disponible, sinon fallback
      // Utiliser l'API HTTP
      try {
        const result = await api.reservations.getAll(schoolId);
        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.error || 'Erreur lors de la récupération des réservations');
        }
      } else {
        // Fallback pour le développement web
        console.warn('API Electron non disponible, utilisation du fallback');
        return [];
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      throw error;
    }
  }

  async createReservation(reservationData: CreateReservationData): Promise<Reservation> {
    try {
      const schoolId = this.getSchoolId();
      
      // Utiliser l'API HTTP
      try {
        const result = await api.reservations.create({
          ...reservationData,
          schoolId: schoolId
        });
        
        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.error || 'Erreur lors de la création de la réservation');
        }
      } else {
        throw new Error('API de réservations non disponible');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      throw error;
    }
  }

  async updateReservation(id: string, reservationData: UpdateReservationData): Promise<Reservation> {
    try {
      // Utiliser l'API HTTP
      try {
        const result = await api.reservations.update(id, reservationData);
        
        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.error || 'Erreur lors de la mise à jour de la réservation');
        }
      } else {
        throw new Error('API de réservations non disponible');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réservation:', error);
      throw error;
    }
  }

  async deleteReservation(id: string): Promise<boolean> {
    try {
      // Utiliser l'API HTTP
      try {
        await api.reservations.delete(id);
        return true;
      } else {
        throw new Error('API de réservations non disponible');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la réservation:', error);
      throw error;
    }
  }

  async confirmReservation(id: string): Promise<boolean> {
    try {
      // Utiliser l'API HTTP
      try {
        await api.reservations.confirm(id);
        return true;
      } else {
        throw new Error('API de réservations non disponible');
      }
    } catch (error) {
      console.error('Erreur lors de la confirmation de la réservation:', error);
      throw error;
    }
  }

  async getConflicts(): Promise<Reservation[]> {
    try {
      const schoolId = this.getSchoolId();
      
      // Utiliser l'API HTTP
      try {
        const result = await api.reservations.getConflicts(schoolId);
        
        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.error || 'Erreur lors de la récupération des conflits');
        }
      } else {
        throw new Error('API de réservations non disponible');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des conflits:', error);
      throw error;
    }
  }
}

export const reservationService = new ReservationService();
