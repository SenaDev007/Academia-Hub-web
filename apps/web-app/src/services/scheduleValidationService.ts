import { PlanningSchedule, PlanningTeacher, PlanningClass, PlanningSubject, WorkHoursConfig } from '../types/planning';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  id: string;
  type: 'conflict' | 'constraint_violation' | 'resource_unavailable' | 'schedule_invalid';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  affectedEntries: string[];
  suggestedFix?: string;
  teacherId?: string;
  classId?: string;
  roomId?: string;
  dayOfWeek?: number;
  timeSlot?: string;
}

export interface ValidationWarning {
  id: string;
  type: 'suboptimal' | 'inefficient' | 'unbalanced' | 'gap_detected';
  message: string;
  affectedEntries: string[];
  suggestion?: string;
}

export interface ValidationSuggestion {
  id: string;
  type: 'optimization' | 'balance' | 'efficiency' | 'constraint';
  message: string;
  action?: string;
  impact?: 'low' | 'medium' | 'high';
}

export interface TeacherAvailability {
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

class ScheduleValidationService {
  private electronAPI: any;

  constructor() {
    this.electronAPI = (window as any).electronAPI;
  }

  /**
   * Valide un emploi du temps complet
   */
  async validateSchedule(
    schedule: PlanningSchedule[],
    teachers: PlanningTeacher[],
    classes: PlanningClass[],
    subjects: PlanningSubject[],
    workHours: WorkHoursConfig | null
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    try {
      // 1. Validation des conflits de base
      const conflictErrors = await this.validateConflicts(schedule);
      errors.push(...conflictErrors);

      // 2. Validation des contraintes des enseignants
      const teacherErrors = await this.validateTeacherConstraints(schedule, teachers);
      errors.push(...teacherErrors);

      // 3. Validation des contraintes des classes
      const classErrors = await this.validateClassConstraints(schedule, classes);
      errors.push(...classErrors);

      // 4. Validation des contraintes globales
      const globalErrors = await this.validateGlobalConstraints(schedule, workHours);
      errors.push(...globalErrors);

      // 5. Détection des problèmes d'optimisation
      const optimizationWarnings = this.detectOptimizationIssues(schedule, teachers, classes);
      warnings.push(...optimizationWarnings);

      // 6. Génération de suggestions d'amélioration
      const improvementSuggestions = this.generateImprovementSuggestions(schedule, teachers, classes);
      suggestions.push(...improvementSuggestions);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        suggestions
      };

    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      return {
        isValid: false,
        errors: [{
          id: 'validation_error',
          type: 'schedule_invalid',
          severity: 'critical',
          message: 'Erreur lors de la validation de l\'emploi du temps',
          affectedEntries: []
        }],
        warnings: [],
        suggestions: []
      };
    }
  }

  /**
   * Valide les conflits de base (double réservation, etc.)
   */
  private async validateConflicts(schedule: PlanningSchedule[]): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const usedSlots = new Map<string, PlanningSchedule>();

    for (const entry of schedule) {
      const slotKey = `${entry.dayOfWeek}_${entry.startTime}_${entry.teacherId}`;
      
      if (usedSlots.has(slotKey)) {
        const existingEntry = usedSlots.get(slotKey)!;
        errors.push({
          id: `conflict_${entry.id}`,
          type: 'conflict',
          severity: 'high',
          message: `Conflit de réservation pour ${entry.teacher} le ${entry.day} à ${entry.startTime}`,
          affectedEntries: [entry.id, existingEntry.id],
          suggestedFix: 'Déplacer l\'un des cours vers un autre créneau',
          teacherId: entry.teacherId,
          dayOfWeek: entry.dayOfWeek,
          timeSlot: entry.startTime
        });
      } else {
        usedSlots.set(slotKey, entry);
      }
    }

    return errors;
  }

  /**
   * Valide les contraintes des enseignants
   */
  private async validateTeacherConstraints(
    schedule: PlanningSchedule[],
    teachers: PlanningTeacher[]
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    for (const teacher of teachers) {
      const teacherSchedule = schedule.filter(s => s.teacherId === teacher.id);
      
      // Vérifier la charge de travail hebdomadaire
      const weeklyHours = teacherSchedule.length;
      const maxWeeklyHours = teacher.hoursPerWeek || 25;
      
      if (weeklyHours > maxWeeklyHours) {
        errors.push({
          id: `overload_${teacher.id}`,
          type: 'constraint_violation',
          severity: 'high',
          message: `${teacher.name} dépasse sa charge maximale (${weeklyHours}/${maxWeeklyHours}h)`,
          affectedEntries: teacherSchedule.map(s => s.id),
          suggestedFix: 'Réduire le nombre d\'heures ou ajuster les disponibilités',
          teacherId: teacher.id
        });
      }

      // Vérifier la charge quotidienne
      const dailyHours = this.calculateDailyHours(teacherSchedule);
      const maxDailyHours = 6; // Contrainte par défaut
      
      for (const [day, hours] of dailyHours.entries()) {
        if (hours > maxDailyHours) {
          errors.push({
            id: `daily_overload_${teacher.id}_${day}`,
            type: 'constraint_violation',
            severity: 'medium',
            message: `${teacher.name} dépasse la charge quotidienne maximale le jour ${day} (${hours}/${maxDailyHours}h)`,
            affectedEntries: teacherSchedule.filter(s => s.dayOfWeek === day).map(s => s.id),
            suggestedFix: 'Répartir les cours sur plusieurs jours',
            teacherId: teacher.id,
            dayOfWeek: day
          });
        }
      }

      // Vérifier les disponibilités
      const availabilityErrors = await this.validateTeacherAvailability(teacher.id, teacherSchedule);
      errors.push(...availabilityErrors);
    }

    return errors;
  }

  /**
   * Calcule les heures par jour pour un enseignant
   */
  private calculateDailyHours(schedule: PlanningSchedule[]): Map<number, number> {
    const dailyHours = new Map<number, number>();
    
    for (const entry of schedule) {
      const currentHours = dailyHours.get(entry.dayOfWeek) || 0;
      dailyHours.set(entry.dayOfWeek, currentHours + 1); // 1 heure par cours
    }
    
    return dailyHours;
  }

  /**
   * Valide les disponibilités d'un enseignant
   */
  private async validateTeacherAvailability(
    teacherId: string,
    schedule: PlanningSchedule[]
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    try {
      if (this.electronAPI?.database?.executeQuery) {
        const result = await this.electronAPI.database.executeQuery(
          'SELECT * FROM teacher_availability WHERE teacher_id = ? AND school_id = ?',
          [teacherId, 'school-1']
        );

        if (result.results && Array.isArray(result.results)) {
          const availabilities = result.results;
          
          for (const entry of schedule) {
            const isAvailable = availabilities.some(av => 
              av.day_of_week === entry.dayOfWeek &&
              av.is_available === 1 &&
              av.start_time <= entry.startTime &&
              av.end_time >= entry.endTime
            );

            if (!isAvailable) {
              errors.push({
                id: `availability_${entry.id}`,
                type: 'constraint_violation',
                severity: 'high',
                message: `Cours programmé en dehors des disponibilités de l'enseignant`,
                affectedEntries: [entry.id],
                suggestedFix: 'Déplacer le cours vers un créneau disponible',
                teacherId,
                dayOfWeek: entry.dayOfWeek,
                timeSlot: entry.startTime
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(`Erreur lors de la validation des disponibilités pour ${teacherId}:`, error);
    }

    return errors;
  }

  /**
   * Valide les contraintes des classes
   */
  private async validateClassConstraints(
    schedule: PlanningSchedule[],
    classes: PlanningClass[]
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    for (const cls of classes) {
      const classSchedule = schedule.filter(s => s.classId === cls.id);
      
      // Vérifier la charge quotidienne de la classe
      const dailyHours = this.calculateDailyHours(classSchedule);
      const maxDailyHours = 8; // Maximum par classe
      
      for (const [day, hours] of dailyHours.entries()) {
        if (hours > maxDailyHours) {
          errors.push({
            id: `class_overload_${cls.id}_${day}`,
            type: 'constraint_violation',
            severity: 'medium',
            message: `La classe ${cls.name} dépasse la charge quotidienne maximale le jour ${day} (${hours}/${maxDailyHours}h)`,
            affectedEntries: classSchedule.filter(s => s.dayOfWeek === day).map(s => s.id),
            suggestedFix: 'Répartir les cours sur plusieurs jours',
            classId: cls.id,
            dayOfWeek: day
          });
        }
      }
    }

    return errors;
  }

  /**
   * Valide les contraintes globales
   */
  private async validateGlobalConstraints(
    schedule: PlanningSchedule[],
    workHours: WorkHoursConfig | null
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    if (!workHours) return errors;

    // Vérifier les jours de travail
    const workDays = workHours.workDays || [1, 2, 3, 4, 5, 6];
    const invalidDays = schedule.filter(entry => !workDays.includes(entry.dayOfWeek));
    
    for (const entry of invalidDays) {
      errors.push({
        id: `invalid_day_${entry.id}`,
        type: 'constraint_violation',
        severity: 'medium',
        message: `Cours programmé un jour non ouvré`,
        affectedEntries: [entry.id],
        suggestedFix: 'Déplacer le cours vers un jour ouvré',
        dayOfWeek: entry.dayOfWeek
      });
    }

    // Vérifier les heures de travail
    const startTime = workHours.startTime || '08:00';
    const endTime = workHours.endTime || '17:00';
    
    const invalidHours = schedule.filter(entry => 
      entry.startTime < startTime || entry.endTime > endTime
    );
    
    for (const entry of invalidHours) {
      errors.push({
        id: `invalid_hours_${entry.id}`,
        type: 'constraint_violation',
        severity: 'medium',
        message: `Cours programmé en dehors des heures de travail`,
        affectedEntries: [entry.id],
        suggestedFix: 'Déplacer le cours vers les heures ouvrables',
        dayOfWeek: entry.dayOfWeek,
        timeSlot: entry.startTime
      });
    }

    return errors;
  }

  /**
   * Détecte les problèmes d'optimisation
   */
  private detectOptimizationIssues(
    schedule: PlanningSchedule[],
    teachers: PlanningTeacher[],
    classes: PlanningClass[]
  ): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // Détecter les trous dans les emplois du temps
    const gaps = this.detectGaps(schedule);
    if (gaps.length > 0) {
      warnings.push({
        id: 'gaps_detected',
        type: 'gap_detected',
        message: `${gaps.length} trou(s) détecté(s) dans les emplois du temps`,
        affectedEntries: gaps.map(gap => gap.entryId),
        suggestion: 'Considérez combler les trous pour optimiser l\'utilisation'
      });
    }

    // Détecter les déséquilibres de charge
    const imbalances = this.detectLoadImbalances(schedule, teachers);
    if (imbalances.length > 0) {
      warnings.push({
        id: 'load_imbalance',
        type: 'unbalanced',
        message: 'Déséquilibre de charge détecté entre enseignants',
        affectedEntries: imbalances.flatMap(imbalance => imbalance.affectedEntries),
        suggestion: 'Rééquilibrer la charge de travail entre enseignants'
      });
    }

    return warnings;
  }

  /**
   * Détecte les trous dans les emplois du temps
   */
  private detectGaps(schedule: PlanningSchedule[]): Array<{ entryId: string; gap: string }> {
    const gaps: Array<{ entryId: string; gap: string }> = [];
    
    // Grouper par enseignant et jour
    const teacherSchedules = new Map<string, Map<number, PlanningSchedule[]>>();
    
    for (const entry of schedule) {
      if (!teacherSchedules.has(entry.teacherId)) {
        teacherSchedules.set(entry.teacherId, new Map());
      }
      if (!teacherSchedules.get(entry.teacherId)!.has(entry.dayOfWeek)) {
        teacherSchedules.get(entry.teacherId)!.set(entry.dayOfWeek, []);
      }
      teacherSchedules.get(entry.teacherId)!.get(entry.dayOfWeek)!.push(entry);
    }

    // Détecter les trous pour chaque enseignant
    for (const [teacherId, daySchedules] of teacherSchedules) {
      for (const [day, entries] of daySchedules) {
        const sortedEntries = entries.sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        for (let i = 1; i < sortedEntries.length; i++) {
          const prevEnd = sortedEntries[i - 1].endTime;
          const currentStart = sortedEntries[i].startTime;
          
          if (prevEnd !== currentStart) {
            gaps.push({
              entryId: sortedEntries[i].id,
              gap: `${prevEnd} - ${currentStart}`
            });
          }
        }
      }
    }

    return gaps;
  }

  /**
   * Détecte les déséquilibres de charge
   */
  private detectLoadImbalances(
    schedule: PlanningSchedule[],
    teachers: PlanningTeacher[]
  ): Array<{ teacherId: string; hours: number; affectedEntries: string[] }> {
    const imbalances: Array<{ teacherId: string; hours: number; affectedEntries: string[] }> = [];
    
    const teacherHours = new Map<string, number>();
    
    for (const entry of schedule) {
      const currentHours = teacherHours.get(entry.teacherId) || 0;
      teacherHours.set(entry.teacherId, currentHours + 1);
    }

    const hours = Array.from(teacherHours.values());
    const averageHours = hours.reduce((sum, h) => sum + h, 0) / hours.length;
    const threshold = averageHours * 0.3; // 30% de différence

    for (const [teacherId, hours] of teacherHours) {
      if (Math.abs(hours - averageHours) > threshold) {
        const teacherSchedule = schedule.filter(s => s.teacherId === teacherId);
        imbalances.push({
          teacherId,
          hours,
          affectedEntries: teacherSchedule.map(s => s.id)
        });
      }
    }

    return imbalances;
  }

  /**
   * Génère des suggestions d'amélioration
   */
  private generateImprovementSuggestions(
    schedule: PlanningSchedule[],
    teachers: PlanningTeacher[],
    classes: PlanningClass[]
  ): ValidationSuggestion[] {
    const suggestions: ValidationSuggestion[] = [];

    // Suggestion d'optimisation des créneaux
    if (schedule.length > 0) {
      suggestions.push({
        id: 'optimize_slots',
        type: 'optimization',
        message: 'Considérez regrouper les cours consécutifs pour réduire les déplacements',
        action: 'Utiliser l\'optimisation automatique',
        impact: 'medium'
      });
    }

    // Suggestion d'équilibrage
    const teacherUtilization = this.calculateTeacherUtilization(schedule, teachers);
    if (teacherUtilization < 0.8) {
      suggestions.push({
        id: 'balance_workload',
        type: 'balance',
        message: 'Rééquilibrer la charge de travail entre enseignants',
        action: 'Ajuster les assignations',
        impact: 'high'
      });
    }

    return suggestions;
  }

  /**
   * Calcule l'utilisation des enseignants
   */
  private calculateTeacherUtilization(
    schedule: PlanningSchedule[],
    teachers: PlanningTeacher[]
  ): number {
    const activeTeachers = new Set(schedule.map(s => s.teacherId)).size;
    return activeTeachers / teachers.length;
  }

  /**
   * Valide une modification en temps réel
   */
  async validateRealTimeChange(
    newEntry: PlanningSchedule,
    existingSchedule: PlanningSchedule[],
    teachers: PlanningTeacher[],
    classes: PlanningClass[]
  ): Promise<ValidationResult> {
    // Créer un planning temporaire avec la nouvelle entrée
    const tempSchedule = [...existingSchedule, newEntry];
    
    // Valider le planning temporaire
    return await this.validateSchedule(tempSchedule, teachers, classes, [], null);
  }
}

export const scheduleValidationService = new ScheduleValidationService();
