import { dataService } from '../dataService';
import { Schedule, Break, WorkHours, RoomReservation, CahierJournalEntry } from '../dataService';

export interface CreateScheduleData {
  classId: string;
  subjectId: string;
  teacherId: string;
  roomId?: string;
  day: string;
  startTime: string;
  endTime: string;
  academicYearId?: string;
  termId?: string;
  isActive?: boolean;
}

export interface CreateBreakData {
  name: string;
  type: 'recreation' | 'break' | 'lunch';
  startTime: string;
  endTime: string;
  duration: number;
  levels: string[];
}

export interface CreateRoomReservationData {
  roomId: string;
  teacherId: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
}

export interface CreateCahierJournalData {
  classId: string;
  subjectId: string;
  teacherId: string;
  scheduleId?: string;
  date: string;
  startTime: string;
  endTime: string;
  content: string;
  homework?: string;
  observations?: string;
}

export interface ScheduleFilters {
  classId?: string;
  teacherId?: string;
  roomId?: string;
  day?: string;
  academicYearId?: string;
  termId?: string;
  isActive?: boolean;
}

export const schedulesService = {
  // Schedules
  async getSchedules(filters?: ScheduleFilters) {
    try {
      const schedules = await dataService.getAllSchedules(filters);
      return {
        data: schedules,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des emplois du temps:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getSchedule(id: string) {
    try {
      const schedule = await dataService.getScheduleById(id);
      if (!schedule) {
        return {
          data: null,
          success: false,
          error: 'Emploi du temps non trouvé'
        };
      }
      return {
        data: schedule,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'emploi du temps:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async createSchedule(data: CreateScheduleData) {
    try {
      const schedule = await dataService.createSchedule(data);
      return {
        data: schedule,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'emploi du temps:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async updateSchedule(id: string, data: Partial<CreateScheduleData>) {
    try {
      const schedule = await dataService.updateSchedule(id, data);
      return {
        data: schedule,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'emploi du temps:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async deleteSchedule(id: string) {
    try {
      const success = await dataService.deleteSchedule(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'emploi du temps:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Breaks
  async getBreaks() {
    try {
      const breaks = await dataService.getAllBreaks();
      return {
        data: breaks,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des pauses:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getBreak(id: string) {
    try {
      const breakItem = await dataService.getBreakById(id);
      if (!breakItem) {
        return {
          data: null,
          success: false,
          error: 'Pause non trouvée'
        };
      }
      return {
        data: breakItem,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la pause:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async createBreak(data: CreateBreakData) {
    try {
      const breakItem = await dataService.createBreak(data);
      return {
        data: breakItem,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création de la pause:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async updateBreak(id: string, data: Partial<CreateBreakData>) {
    try {
      const breakItem = await dataService.updateBreak(id, data);
      return {
        data: breakItem,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la pause:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async deleteBreak(id: string) {
    try {
      const success = await dataService.deleteBreak(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de la pause:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Work Hours
  async getWorkHours() {
    try {
      const workHours = await dataService.getWorkHours();
      return {
        data: workHours,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des horaires de travail:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async createWorkHours(data: any) {
    try {
      const workHours = await dataService.createWorkHours(data);
      return {
        data: workHours,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création des horaires de travail:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async updateWorkHours(id: string, data: any) {
    try {
      const workHours = await dataService.updateWorkHours(id, data);
      return {
        data: workHours,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour des horaires de travail:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Room Reservations
  async getRoomReservations(filters?: {
    roomId?: string;
    teacherId?: string;
    date?: string;
    status?: string;
  }) {
    try {
      const reservations = await dataService.getAllRoomReservations(filters);
      return {
        data: reservations,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getRoomReservation(id: string) {
    try {
      const reservation = await dataService.getRoomReservationById(id);
      if (!reservation) {
        return {
          data: null,
          success: false,
          error: 'Réservation non trouvée'
        };
      }
      return {
        data: reservation,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la réservation:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async createRoomReservation(data: CreateRoomReservationData) {
    try {
      const reservation = await dataService.createRoomReservation(data);
      return {
        data: reservation,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async updateRoomReservation(id: string, data: Partial<CreateRoomReservationData>) {
    try {
      const reservation = await dataService.updateRoomReservation(id, data);
      return {
        data: reservation,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réservation:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async deleteRoomReservation(id: string) {
    try {
      const success = await dataService.deleteRoomReservation(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de la réservation:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Cahier Journal
  async getCahierJournalEntries(filters?: {
    classId?: string;
    subjectId?: string;
    teacherId?: string;
    date?: string;
    scheduleId?: string;
  }) {
    try {
      const entries = await dataService.getAllCahierJournalEntries(filters);
      return {
        data: entries,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des entrées du cahier journal:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getCahierJournalEntry(id: string) {
    try {
      const entry = await dataService.getCahierJournalEntryById(id);
      if (!entry) {
        return {
          data: null,
          success: false,
          error: 'Entrée du cahier journal non trouvée'
        };
      }
      return {
        data: entry,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'entrée du cahier journal:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async createCahierJournalEntry(data: CreateCahierJournalData) {
    try {
      const entry = await dataService.createCahierJournalEntry(data);
      return {
        data: entry,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'entrée du cahier journal:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async updateCahierJournalEntry(id: string, data: Partial<CreateCahierJournalData>) {
    try {
      const entry = await dataService.updateCahierJournalEntry(id, data);
      return {
        data: entry,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'entrée du cahier journal:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async deleteCahierJournalEntry(id: string) {
    try {
      const success = await dataService.deleteCahierJournalEntry(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'entrée du cahier journal:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  // Schedule by Class
  async getScheduleByClass(classId: string, academicYearId?: string, termId?: string) {
    try {
      const schedules = await dataService.getSchedulesByClass(classId, academicYearId, termId);
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

  // Schedule by Teacher
  async getScheduleByTeacher(teacherId: string, academicYearId?: string, termId?: string) {
    try {
      const schedules = await dataService.getSchedulesByTeacher(teacherId, academicYearId, termId);
      return {
        data: schedules,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'emploi du temps de l\'enseignant:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
};
