import { PlanningTeacher } from '../types/planning';

export interface TeacherAvailability {
  id: string;
  teacherId: string;
  dayOfWeek: number; // 1-6 (Lundi-Samedi)
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkHoursConfig {
  id: string;
  schoolId: string;
  startTime: string;
  endTime: string;
  lunchBreakStart: string;
  lunchBreakEnd: string;
  courseDurationMinutes: number;
  breakBetweenCoursesMinutes: number;
  workDays: string; // JSON array of days
  createdAt: string;
  updatedAt: string;
}

export interface SchoolConstraints {
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  mandatoryBreaks: Array<{
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    duration: number;
  }>;
  blockedTimeSlots: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    reason: string;
  }>;
  minRestBetweenClasses: number;
  lunchBreakMandatory: boolean;
  lunchBreakStart: string;
  lunchBreakEnd: string;
}

class AvailabilityService {
  private electronAPI: any;

  constructor() {
    this.electronAPI = (window as any).electronAPI;
  }

  // Récupérer les disponibilités d'un enseignant
  async getTeacherAvailability(teacherId: string, schoolId: string): Promise<TeacherAvailability[]> {
    try {
      if (this.electronAPI?.database?.executeQuery) {
        // Chercher d'abord avec le school_id exact, puis avec school_id vide
        const query = `
          SELECT * FROM teacher_availability 
          WHERE teacher_id = ? AND (school_id = ? OR school_id = '' OR school_id IS NULL)
          ORDER BY day_of_week, start_time
        `;
        const result = await this.electronAPI.database.executeQuery(query, [teacherId, schoolId]);
        
        if (result.success && result.results) {
          console.log('🔍 availabilityService.getTeacherAvailability - Données brutes:', result.results);
          return result.results;
        }
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des disponibilités:', error);
      return [];
    }
  }

  // Récupérer toutes les disponibilités des enseignants
  async getAllTeacherAvailabilities(schoolId: string): Promise<TeacherAvailability[]> {
    try {
      if (this.electronAPI?.database?.executeQuery) {
        const query = `
          SELECT * FROM teacher_availability 
          WHERE school_id = ?
          ORDER BY teacher_id, day_of_week, start_time
        `;
        const result = await this.electronAPI.database.executeQuery(query, [schoolId]);
        
        if (result.success && result.results) {
          return result.results;
        }
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération de toutes les disponibilités:', error);
      return [];
    }
  }

  // Supprimer toutes les disponibilités d'un enseignant
  async deleteTeacherAvailability(teacherId: string, schoolId: string): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.electronAPI?.database?.executeQuery) {
        return { success: false, message: 'API non disponible' };
      }

      // Supprimer les disponibilités avec school_id exact ET avec school_id vide
      const deleteQuery = 'DELETE FROM teacher_availability WHERE teacher_id = ? AND (school_id = ? OR school_id = \'\' OR school_id IS NULL)';
      const result = await this.electronAPI.database.executeQuery(deleteQuery, [teacherId, schoolId]);
      
      if (result.success) {
        return { success: true, message: 'Disponibilités supprimées avec succès' };
      } else {
        return { success: false, message: result.message || 'Erreur lors de la suppression' };
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des disponibilités:', error);
      return { success: false, message: 'Erreur lors de la suppression des disponibilités' };
    }
  }

  // Sauvegarder les disponibilités d'un enseignant
  async saveTeacherAvailability(availabilityData: {
    teacherId: string;
    availability: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>;
    schoolId: string;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.electronAPI?.database?.executeQuery) {
        return { success: false, message: 'API non disponible' };
      }

      // Supprimer les anciennes disponibilités de cet enseignant
      const deleteQuery = 'DELETE FROM teacher_availability WHERE teacher_id = ? AND school_id = ?';
      await this.electronAPI.database.executeQuery(deleteQuery, [availabilityData.teacherId, availabilityData.schoolId]);

      // Insérer les nouvelles disponibilités
      const insertQuery = `
        INSERT INTO teacher_availability (id, teacher_id, day_of_week, start_time, end_time, is_available, school_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const now = new Date().toISOString();
      
      for (const slot of availabilityData.availability) {
        const id = `availability_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.electronAPI.database.executeQuery(insertQuery, [
          id,
          availabilityData.teacherId,
          slot.dayOfWeek,
          slot.startTime,
          slot.endTime,
          slot.isAvailable ? 1 : 0, // SQLite boolean
          availabilityData.schoolId,
          now,
          now
        ]);
      }

      return { success: true, message: 'Disponibilités sauvegardées avec succès' };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des disponibilités:', error);
      return { success: false, message: 'Erreur lors de la sauvegarde' };
    }
  }

  // Récupérer la configuration des heures de travail
  async getWorkHoursConfig(schoolId: string): Promise<WorkHoursConfig | null> {
    try {
      if (this.electronAPI?.database?.executeQuery) {
        const query = 'SELECT * FROM work_hours_config WHERE school_id = ? LIMIT 1';
        const result = await this.electronAPI.database.executeQuery(query, [schoolId]);
        
        if (result.success && result.results && result.results.length > 0) {
          return result.results[0];
        }
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration:', error);
      return null;
    }
  }

  // Sauvegarder la configuration des heures de travail
  async saveWorkHoursConfig(config: Partial<WorkHoursConfig> & {
    maxHoursPerDay?: number;
    maxHoursPerWeek?: number;
    lunchBreakMandatory?: boolean;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.electronAPI?.database?.executeQuery) {
        return { success: false, message: 'API non disponible' };
      }

      const now = new Date().toISOString();
      
      // Vérifier si une configuration existe déjà
      const existing = await this.getWorkHoursConfig(config.schoolId!);
      
      if (existing) {
        // Mettre à jour
        const updateQuery = `
          UPDATE work_hours_config 
          SET start_time = ?, end_time = ?, lunch_break_start = ?, lunch_break_end = ?,
              course_duration_minutes = ?, break_between_courses_minutes = ?, 
              work_days = ?, max_hours_per_day = ?, max_hours_per_week = ?, 
              lunch_break_mandatory = ?, updated_at = ?
          WHERE id = ?
        `;
        
        await this.electronAPI.database.executeQuery(updateQuery, [
          config.startTime,
          config.endTime,
          config.lunchBreakStart,
          config.lunchBreakEnd,
          config.courseDurationMinutes,
          config.breakBetweenCoursesMinutes,
          config.workDays,
          config.maxHoursPerDay,
          config.maxHoursPerWeek,
          config.lunchBreakMandatory ? 1 : 0,
          now,
          existing.id
        ]);
      } else {
        // Créer
        const insertQuery = `
          INSERT INTO work_hours_config (id, school_id, start_time, end_time, lunch_break_start, lunch_break_end,
                                        course_duration_minutes, break_between_courses_minutes, work_days, 
                                        max_hours_per_day, max_hours_per_week, lunch_break_mandatory, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const id = `work_hours_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await this.electronAPI.database.executeQuery(insertQuery, [
          id,
          config.schoolId,
          config.startTime,
          config.endTime,
          config.lunchBreakStart,
          config.lunchBreakEnd,
          config.courseDurationMinutes,
          config.breakBetweenCoursesMinutes,
          config.workDays,
          config.maxHoursPerDay,
          config.maxHoursPerWeek,
          config.lunchBreakMandatory ? 1 : 0,
          now,
          now
        ]);
      }

      return { success: true, message: 'Configuration sauvegardée avec succès' };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
      return { success: false, message: 'Erreur lors de la sauvegarde' };
    }
  }

  // Récupérer les enseignants avec leurs disponibilités
  async getTeachersWithAvailability(schoolId: string): Promise<Array<{
    teacher: PlanningTeacher;
    availability: TeacherAvailability[];
  }>> {
    try {
      // Récupérer uniquement les enseignants (canTeach = 1)
      const teachersQuery = `
        SELECT t.* FROM teachers t 
        JOIN positions p ON t.positionId = p.id 
        WHERE t.schoolId = ? AND p.canTeach = 1
      `;
      const teachersResult = await this.electronAPI.database.executeQuery(teachersQuery, [schoolId]);
      
      if (!teachersResult.success || !teachersResult.results) {
        return [];
      }

      const teachers = teachersResult.results;
      const result = [];

      for (const teacher of teachers) {
        const availability = await this.getTeacherAvailability(teacher.id, schoolId);
        result.push({
          teacher: {
            id: teacher.id,
            name: `${teacher.firstName} ${teacher.lastName}`,
            email: teacher.email,
            phone: teacher.phone,
            subject: teacher.subject,
            status: teacher.status || 'active',
            schoolId: teacher.schoolId
          },
          availability
        });
      }

      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des enseignants avec disponibilités:', error);
      return [];
    }
  }

  // Calculer les statistiques de disponibilité
  async getAvailabilityStats(schoolId: string): Promise<{
    totalTeachers: number;
    availableTeachers: number; // Nouveau: enseignants avec au moins une disponibilité
    fullyAvailable: number;
    withConstraints: number;
    conflicts: number;
    utilizationRate: number;
    averageHoursPerDay: number;
  }> {
    try {
      const teachersWithAvailability = await this.getTeachersWithAvailability(schoolId);
      
      const totalTeachers = teachersWithAvailability.length;
      let availableTeachers = 0; // Enseignants avec au moins une disponibilité
      let fullyAvailable = 0;
      let withConstraints = 0;
      let conflicts = 0;
      let totalAvailableSlots = 0;
      let totalSlots = 0;

      for (const { availability } of teachersWithAvailability) {
        const availableSlots = availability.filter(slot => slot.is_available).length;
        const totalSlotsForTeacher = availability.length;
        
        totalAvailableSlots += availableSlots;
        totalSlots += totalSlotsForTeacher;

        if (availableSlots > 0) {
          availableTeachers++; // Enseignant avec au moins une disponibilité
        }

        if (availableSlots === totalSlotsForTeacher && totalSlotsForTeacher > 0) {
          fullyAvailable++;
        } else if (availableSlots > 0) {
          withConstraints++;
        } else {
          conflicts++;
        }
      }

      const utilizationRate = totalSlots > 0 ? Math.round((totalAvailableSlots / totalSlots) * 100) : 0;
      const averageHoursPerDay = totalTeachers > 0 ? Math.round((totalAvailableSlots / totalTeachers / 6) * 10) / 10 : 0;

      return {
        totalTeachers,
        availableTeachers, // Nouveau champ
        fullyAvailable,
        withConstraints,
        conflicts,
        utilizationRate,
        averageHoursPerDay
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return {
        totalTeachers: 0,
        availableTeachers: 0,
        fullyAvailable: 0,
        withConstraints: 0,
        conflicts: 0,
        utilizationRate: 0,
        averageHoursPerDay: 0
      };
    }
  }

  // === CONTRAINTES SCOLAIRES ===

  // Récupérer les contraintes scolaires
  async getSchoolConstraints(schoolId: string): Promise<SchoolConstraints> {
    try {
      if (!this.electronAPI?.database?.executeQuery) {
        return this.getDefaultConstraints();
      }

      // Récupérer la configuration des heures de travail
      const workHoursQuery = 'SELECT * FROM work_hours_config WHERE school_id = ? LIMIT 1';
      const workHoursResult = await this.electronAPI.database.executeQuery(workHoursQuery, [schoolId]);
      
      // Récupérer les pauses obligatoires
      const breaksQuery = 'SELECT * FROM breaks WHERE school_id = ? ORDER BY start_time';
      const breaksResult = await this.electronAPI.database.executeQuery(breaksQuery, [schoolId]);
      
      // Récupérer les créneaux bloqués
      const blockedSlotsQuery = 'SELECT * FROM blocked_time_slots WHERE school_id = ? ORDER BY day_of_week, start_time';
      const blockedSlotsResult = await this.electronAPI.database.executeQuery(blockedSlotsQuery, [schoolId]);

      const workHours = workHoursResult.success && workHoursResult.results?.length > 0 ? workHoursResult.results[0] : null;
      const breaks = breaksResult.success ? breaksResult.results || [] : [];
      const blockedSlots = blockedSlotsResult.success ? blockedSlotsResult.results || [] : [];

      return {
        maxHoursPerDay: workHours?.max_hours_per_day || 6,
        maxHoursPerWeek: workHours?.max_hours_per_week || 25,
        mandatoryBreaks: breaks.map(breakItem => ({
          id: breakItem.id,
          name: breakItem.name,
          startTime: breakItem.start_time,
          endTime: breakItem.end_time,
          duration: breakItem.duration_minutes || 0
        })),
        blockedTimeSlots: blockedSlots.map(slot => ({
          id: slot.id,
          dayOfWeek: slot.day_of_week,
          startTime: slot.start_time,
          endTime: slot.end_time,
          reason: slot.reason
        })),
        minRestBetweenClasses: workHours?.break_between_courses_minutes || 15,
        lunchBreakMandatory: workHours?.lunch_break_mandatory === 1,
        lunchBreakStart: workHours?.lunch_break_start || '12:00',
        lunchBreakEnd: workHours?.lunch_break_end || '13:00'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des contraintes scolaires:', error);
      return this.getDefaultConstraints();
    }
  }

  // Sauvegarder les contraintes scolaires
  async saveSchoolConstraints(schoolId: string, constraints: SchoolConstraints): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.electronAPI?.database?.executeQuery) {
        return { success: false, message: 'API non disponible' };
      }

      const now = new Date().toISOString();

      // Sauvegarder/mettre à jour la configuration des heures de travail
      await this.saveWorkHoursConfig({
        schoolId,
        startTime: '08:00', // Valeur par défaut
        endTime: '17:00',   // Valeur par défaut
        lunchBreakStart: constraints.lunchBreakStart,
        lunchBreakEnd: constraints.lunchBreakEnd,
        courseDurationMinutes: 60, // Valeur par défaut
        breakBetweenCoursesMinutes: constraints.minRestBetweenClasses,
        workDays: JSON.stringify([1, 2, 3, 4, 5, 6]), // Tous les jours
        maxHoursPerDay: constraints.maxHoursPerDay,
        maxHoursPerWeek: constraints.maxHoursPerWeek,
        lunchBreakMandatory: constraints.lunchBreakMandatory
      });

      // Supprimer les anciennes pauses obligatoires
      const deleteBreaksQuery = 'DELETE FROM breaks WHERE school_id = ?';
      await this.electronAPI.database.executeQuery(deleteBreaksQuery, [schoolId]);

      // Insérer les nouvelles pauses obligatoires
      if (constraints.mandatoryBreaks.length > 0) {
        const insertBreakQuery = `
          INSERT INTO breaks (id, school_id, name, start_time, end_time, duration_minutes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        for (const breakItem of constraints.mandatoryBreaks) {
          const breakId = `break_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await this.electronAPI.database.executeQuery(insertBreakQuery, [
            breakId,
            schoolId,
            breakItem.name,
            breakItem.startTime,
            breakItem.endTime,
            breakItem.duration,
            now,
            now
          ]);
        }
      }

      // Supprimer les anciens créneaux bloqués
      const deleteSlotsQuery = 'DELETE FROM blocked_time_slots WHERE school_id = ?';
      await this.electronAPI.database.executeQuery(deleteSlotsQuery, [schoolId]);

      // Insérer les nouveaux créneaux bloqués
      if (constraints.blockedTimeSlots.length > 0) {
        const insertSlotQuery = `
          INSERT INTO blocked_time_slots (id, school_id, day_of_week, start_time, end_time, reason, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        for (const slot of constraints.blockedTimeSlots) {
          const slotId = `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await this.electronAPI.database.executeQuery(insertSlotQuery, [
            slotId,
            schoolId,
            slot.dayOfWeek,
            slot.startTime,
            slot.endTime,
            slot.reason,
            now,
            now
          ]);
        }
      }

      return { success: true, message: 'Contraintes scolaires sauvegardées avec succès' };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des contraintes scolaires:', error);
      return { success: false, message: 'Erreur lors de la sauvegarde des contraintes' };
    }
  }

  // Contraintes par défaut
  private getDefaultConstraints(): SchoolConstraints {
    return {
      maxHoursPerDay: 6,
      maxHoursPerWeek: 25,
      mandatoryBreaks: [
        {
          id: 'break-1',
          name: 'Récréation matinale',
          startTime: '10:00',
          endTime: '10:15',
          duration: 15
        },
        {
          id: 'break-2',
          name: 'Pause déjeuner',
          startTime: '12:00',
          endTime: '13:00',
          duration: 60
        },
        {
          id: 'break-3',
          name: 'Récréation après-midi',
          startTime: '15:00',
          endTime: '15:15',
          duration: 15
        }
      ],
      blockedTimeSlots: [],
      minRestBetweenClasses: 15,
      lunchBreakMandatory: true,
      lunchBreakStart: '12:00',
      lunchBreakEnd: '13:00'
    };
  }
}

export const availabilityService = new AvailabilityService();
