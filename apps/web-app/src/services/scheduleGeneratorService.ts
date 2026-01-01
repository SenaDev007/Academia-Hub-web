import { PlanningClass, PlanningSubject, PlanningTeacher, PlanningSchedule, WorkHoursConfig } from '../types/planning';

export interface GenerationSettings {
  prioritizeTeacherAvailability: boolean;
  balanceWorkload: boolean;
  minimizeGaps: boolean;
  respectSubjectSequence: boolean;
  maxHoursPerDay: number;
  preferredTimeSlots: string[];
  avoidTimeSlots: string[];
  subjectWeights: { [key: string]: number };
  classConstraints: { [key: string]: any };
}

export interface GenerationResult {
  success: boolean;
  schedule: PlanningSchedule[];
  conflicts: Conflict[];
  statistics: GenerationStatistics;
  warnings: string[];
  suggestions: string[];
}

export interface Conflict {
  id: string;
  type: 'teacher_double_booking' | 'room_conflict' | 'teacher_overload' | 'class_overload' | 'subject_sequence';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedEntities: string[];
  suggestedResolutions: string[];
  teacherId?: string;
  classId?: string;
  roomId?: string;
  dayOfWeek?: number;
  timeSlot?: string;
}

export interface GenerationStatistics {
  totalSlots: number;
  filledSlots: number;
  completionRate: number;
  teacherUtilization: number;
  classCompletion: number;
  averageGapsPerDay: number;
  conflictsResolved: number;
  conflictsRemaining: number;
  generationTime: number;
}

export interface TeacherAvailability {
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface ScheduleSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  teacherId?: string;
  classId?: string;
  subjectId?: string;
  roomId?: string;
  isBlocked?: boolean;
  priority?: number;
}

class ScheduleGeneratorService {
  private electronAPI: any;

  constructor() {
    this.electronAPI = (window as any).electronAPI;
  }

  /**
   * Génère un emploi du temps intelligent basé sur les contraintes
   */
  async generateSchedule(
    teachers: PlanningTeacher[],
    classes: PlanningClass[],
    subjects: PlanningSubject[],
    workHours: WorkHoursConfig | null,
    settings: GenerationSettings,
    onProgress?: (progress: number, step: string) => void
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    
    try {
      // 1. Récupérer les disponibilités des enseignants
      onProgress?.(10, 'Récupération des disponibilités...');
      const teacherAvailabilities = await this.getTeacherAvailabilities(teachers);
      
      // 2. Analyser les contraintes
      onProgress?.(20, 'Analyse des contraintes...');
      const constraints = await this.analyzeConstraints(teachers, classes, subjects, workHours);
      
      // 3. Générer les créneaux de base
      onProgress?.(30, 'Génération des créneaux...');
      const baseSlots = this.generateBaseSlots(workHours);
      
      // 4. Assigner les cours selon la stratégie
      onProgress?.(40, 'Assignation des cours...');
      const schedule = await this.assignCourses(
        teachers,
        classes,
        subjects,
        teacherAvailabilities,
        baseSlots,
        settings,
        onProgress
      );
      
      // 5. Optimiser l'emploi du temps
      onProgress?.(80, 'Optimisation...');
      const optimizedSchedule = await this.optimizeSchedule(schedule, settings);
      
      // 6. Détecter et résoudre les conflits
      onProgress?.(90, 'Résolution des conflits...');
      const { finalSchedule, conflicts } = await this.resolveConflicts(optimizedSchedule, settings);
      
      // 7. Calculer les statistiques
      const statistics = this.calculateStatistics(finalSchedule, teachers, classes);
      
      const generationTime = Date.now() - startTime;
      
      return {
        success: true,
        schedule: finalSchedule,
        conflicts,
        statistics: {
          ...statistics,
          generationTime
        },
        warnings: this.generateWarnings(finalSchedule, conflicts),
        suggestions: this.generateSuggestions(finalSchedule, conflicts, statistics)
      };
      
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      return {
        success: false,
        schedule: [],
        conflicts: [],
        statistics: {
          totalSlots: 0,
          filledSlots: 0,
          completionRate: 0,
          teacherUtilization: 0,
          classCompletion: 0,
          averageGapsPerDay: 0,
          conflictsResolved: 0,
          conflictsRemaining: 0,
          generationTime: Date.now() - startTime
        },
        warnings: ['Erreur lors de la génération de l\'emploi du temps'],
        suggestions: []
      };
    }
  }

  /**
   * Récupère les disponibilités des enseignants
   */
  private async getTeacherAvailabilities(teachers: PlanningTeacher[]): Promise<TeacherAvailability[]> {
    const availabilities: TeacherAvailability[] = [];
    
    for (const teacher of teachers) {
      try {
        if (this.electronAPI?.database?.executeQuery) {
          const result = await this.electronAPI.database.executeQuery(
            'SELECT * FROM teacher_availability WHERE teacher_id = ? AND school_id = ?',
            [teacher.id, 'school-1']
          );
          
          if (result.results && Array.isArray(result.results)) {
            for (const availability of result.results) {
              availabilities.push({
                teacherId: teacher.id,
                dayOfWeek: availability.day_of_week,
                startTime: availability.start_time,
                endTime: availability.end_time,
                isAvailable: availability.is_available === 1
              });
            }
          }
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération des disponibilités pour ${teacher.name}:`, error);
      }
    }
    
    return availabilities;
  }

  /**
   * Analyse les contraintes du système
   */
  private async analyzeConstraints(
    teachers: PlanningTeacher[],
    classes: PlanningClass[],
    subjects: PlanningSubject[],
    workHours: WorkHoursConfig | null
  ) {
    return {
      teacherConstraints: teachers.map(teacher => ({
        id: teacher.id,
        maxHoursPerWeek: teacher.hoursPerWeek || 25,
        maxHoursPerDay: 6,
        preferredSubjects: [teacher.subject],
        unavailableDays: []
      })),
      classConstraints: classes.map(cls => ({
        id: cls.id,
        level: cls.level,
        requiredSubjects: subjects.filter(s => s.level === cls.level),
        maxHoursPerDay: 8,
        preferredTimeSlots: ['09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00']
      })),
      globalConstraints: {
        workDays: workHours?.workDays || [1, 2, 3, 4, 5, 6],
        startTime: workHours?.startTime || '08:00',
        endTime: workHours?.endTime || '17:00',
        courseDuration: workHours?.courseDuration || 60,
        breakBetweenCourses: workHours?.breakBetweenCourses || 15
      }
    };
  }

  /**
   * Génère les créneaux de base
   */
  private generateBaseSlots(workHours: WorkHoursConfig | null): ScheduleSlot[] {
    const slots: ScheduleSlot[] = [];
    const workDays = workHours?.workDays || [1, 2, 3, 4, 5, 6];
    const startTime = workHours?.startTime || '08:00';
    const endTime = workHours?.endTime || '17:00';
    const courseDuration = workHours?.courseDuration || 60;
    
    for (const day of workDays) {
      const startHour = parseInt(startTime.split(':')[0]);
      const endHour = parseInt(endTime.split(':')[0]);
      
      for (let hour = startHour; hour < endHour; hour++) {
        const slotStart = `${hour.toString().padStart(2, '0')}:00`;
        const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`;
        
        slots.push({
          dayOfWeek: day,
          startTime: slotStart,
          endTime: slotEnd,
          isAvailable: true,
          priority: this.calculateSlotPriority(slotStart, slotEnd)
        });
      }
    }
    
    return slots;
  }

  /**
   * Calcule la priorité d'un créneau
   */
  private calculateSlotPriority(startTime: string, endTime: string): number {
    const hour = parseInt(startTime.split(':')[0]);
    
    // Créneaux préférés (9h-11h et 14h-16h)
    if ((hour >= 9 && hour < 11) || (hour >= 14 && hour < 16)) {
      return 3;
    }
    
    // Créneaux acceptables (8h-9h et 11h-14h)
    if ((hour >= 8 && hour < 9) || (hour >= 11 && hour < 14)) {
      return 2;
    }
    
    // Créneaux moins préférés
    return 1;
  }

  /**
   * Assigne les cours aux créneaux
   */
  private async assignCourses(
    teachers: PlanningTeacher[],
    classes: PlanningClass[],
    subjects: PlanningSubject[],
    teacherAvailabilities: TeacherAvailability[],
    baseSlots: ScheduleSlot[],
    settings: GenerationSettings,
    onProgress?: (progress: number, step: string) => void
  ): Promise<PlanningSchedule[]> {
    const schedule: PlanningSchedule[] = [];
    const usedSlots = new Set<string>();
    
    // Trier les classes par priorité (niveau, nombre d'élèves, etc.)
    const sortedClasses = this.sortClassesByPriority(classes);
    
    for (let i = 0; i < sortedClasses.length; i++) {
      const cls = sortedClasses[i];
      onProgress?.(40 + (i / sortedClasses.length) * 30, `Planification de ${cls.name}...`);
      
      // Obtenir les matières pour cette classe
      const classSubjects = subjects.filter(s => s.level === cls.level);
      
      for (const subject of classSubjects) {
        // Trouver un enseignant disponible pour cette matière
        const availableTeachers = teachers.filter(teacher => 
          teacher.subject === subject.name && 
          this.isTeacherAvailable(teacher.id, teacherAvailabilities)
        );
        
        if (availableTeachers.length === 0) continue;
        
        // Choisir le meilleur enseignant
        const teacher = this.selectBestTeacher(availableTeachers, schedule, settings);
        
        // Trouver un créneau disponible
        const availableSlot = this.findAvailableSlot(
          baseSlots,
          teacher.id,
          cls.id,
          teacherAvailabilities,
          usedSlots,
          settings
        );
        
        if (availableSlot) {
          const scheduleEntry: PlanningSchedule = {
            id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            day: this.getDayName(availableSlot.dayOfWeek),
            time: `${availableSlot.startTime}-${availableSlot.endTime}`,
            startTime: availableSlot.startTime,
            endTime: availableSlot.endTime,
            subject: subject.name,
            teacher: teacher.name,
            class: cls.name,
            room: '', // À assigner plus tard
            duration: '60',
            dayOfWeek: availableSlot.dayOfWeek,
            durationMinutes: 60,
            subjectId: subject.id,
            teacherId: teacher.id,
            classId: cls.id
          };
          
          schedule.push(scheduleEntry);
          usedSlots.add(`${availableSlot.dayOfWeek}_${availableSlot.startTime}_${teacher.id}`);
        }
      }
    }
    
    return schedule;
  }

  /**
   * Trie les classes par priorité
   */
  private sortClassesByPriority(classes: PlanningClass[]): PlanningClass[] {
    return classes.sort((a, b) => {
      // Priorité par niveau (Secondaire > Primaire > Maternelle)
      const levelPriority = { 'Secondaire': 3, 'Primaire': 2, 'Maternelle': 1 };
      const aPriority = levelPriority[a.level as keyof typeof levelPriority] || 0;
      const bPriority = levelPriority[b.level as keyof typeof levelPriority] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Puis par capacité (classes plus grandes en priorité)
      return b.capacity - a.capacity;
    });
  }

  /**
   * Vérifie si un enseignant est disponible
   */
  private isTeacherAvailable(teacherId: string, availabilities: TeacherAvailability[]): boolean {
    return availabilities.some(av => 
      av.teacherId === teacherId && av.isAvailable
    );
  }

  /**
   * Sélectionne le meilleur enseignant
   */
  private selectBestTeacher(
    teachers: PlanningTeacher[],
    currentSchedule: PlanningSchedule[],
    settings: GenerationSettings
  ): PlanningTeacher {
    if (teachers.length === 1) return teachers[0];
    
    // Calculer la charge de travail de chaque enseignant
    const teacherWorkload = teachers.map(teacher => {
      const currentHours = currentSchedule
        .filter(s => s.teacherId === teacher.id)
        .length;
      
      return {
        teacher,
        currentHours,
        remainingCapacity: teacher.hoursPerWeek - currentHours,
        utilization: currentHours / teacher.hoursPerWeek
      };
    });
    
    // Trier par capacité restante et utilisation
    return teacherWorkload
      .sort((a, b) => {
        if (settings.balanceWorkload) {
          return a.utilization - b.utilization; // Moins utilisé en priorité
        }
        return b.remainingCapacity - a.remainingCapacity; // Plus de capacité en priorité
      })[0].teacher;
  }

  /**
   * Trouve un créneau disponible
   */
  private findAvailableSlot(
    baseSlots: ScheduleSlot[],
    teacherId: string,
    classId: string,
    teacherAvailabilities: TeacherAvailability[],
    usedSlots: Set<string>,
    settings: GenerationSettings
  ): ScheduleSlot | null {
    // Filtrer les créneaux disponibles pour cet enseignant
    const teacherSlots = baseSlots.filter(slot => {
      const slotKey = `${slot.dayOfWeek}_${slot.startTime}_${teacherId}`;
      if (usedSlots.has(slotKey)) return false;
      
      // Vérifier la disponibilité de l'enseignant
      const teacherAvailability = teacherAvailabilities.find(av => 
        av.teacherId === teacherId && 
        av.dayOfWeek === slot.dayOfWeek &&
        av.isAvailable &&
        av.startTime <= slot.startTime &&
        av.endTime >= slot.endTime
      );
      
      return !!teacherAvailability;
    });
    
    if (teacherSlots.length === 0) return null;
    
    // Trier par priorité et préférences
    return teacherSlots
      .sort((a, b) => {
        // Priorité des créneaux préférés
        const aPreferred = settings.preferredTimeSlots.some(ts => 
          ts.includes(a.startTime)
        );
        const bPreferred = settings.preferredTimeSlots.some(ts => 
          ts.includes(b.startTime)
        );
        
        if (aPreferred !== bPreferred) {
          return aPreferred ? -1 : 1;
        }
        
        // Éviter les créneaux non souhaités
        const aAvoided = settings.avoidTimeSlots.some(ts => 
          ts.includes(a.startTime)
        );
        const bAvoided = settings.avoidTimeSlots.some(ts => 
          ts.includes(b.startTime)
        );
        
        if (aAvoided !== bAvoided) {
          return aAvoided ? 1 : -1;
        }
        
        // Priorité du créneau
        return (b.priority || 0) - (a.priority || 0);
      })[0];
  }

  /**
   * Optimise l'emploi du temps
   */
  private async optimizeSchedule(
    schedule: PlanningSchedule[],
    settings: GenerationSettings
  ): Promise<PlanningSchedule[]> {
    if (!settings.minimizeGaps) return schedule;
    
    // Algorithme simple d'optimisation : regrouper les cours par enseignant
    const optimizedSchedule: PlanningSchedule[] = [];
    const teacherSchedules = new Map<string, PlanningSchedule[]>();
    
    // Grouper par enseignant
    for (const entry of schedule) {
      if (!teacherSchedules.has(entry.teacherId)) {
        teacherSchedules.set(entry.teacherId, []);
      }
      teacherSchedules.get(entry.teacherId)!.push(entry);
    }
    
    // Optimiser chaque enseignant
    for (const [teacherId, entries] of teacherSchedules) {
      const optimizedEntries = this.optimizeTeacherSchedule(entries, settings);
      optimizedSchedule.push(...optimizedEntries);
    }
    
    return optimizedSchedule;
  }

  /**
   * Optimise l'emploi du temps d'un enseignant
   */
  private optimizeTeacherSchedule(
    entries: PlanningSchedule[],
    settings: GenerationSettings
  ): PlanningSchedule[] {
    // Trier par jour et heure pour minimiser les déplacements
    return entries.sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) {
        return a.dayOfWeek - b.dayOfWeek;
      }
      return a.startTime.localeCompare(b.startTime);
    });
  }

  /**
   * Résout les conflits détectés
   */
  private async resolveConflicts(
    schedule: PlanningSchedule[],
    settings: GenerationSettings
  ): Promise<{ finalSchedule: PlanningSchedule[]; conflicts: Conflict[] }> {
    const conflicts: Conflict[] = [];
    const finalSchedule: PlanningSchedule[] = [];
    const usedSlots = new Map<string, PlanningSchedule>();
    
    for (const entry of schedule) {
      const slotKey = `${entry.dayOfWeek}_${entry.startTime}_${entry.teacherId}`;
      
      if (usedSlots.has(slotKey)) {
        // Conflit détecté
        const existingEntry = usedSlots.get(slotKey)!;
        conflicts.push({
          id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'teacher_double_booking',
          severity: 'high',
          description: `Double réservation pour ${entry.teacher} le ${entry.day} à ${entry.startTime}`,
          affectedEntities: [entry.teacherId, existingEntry.teacherId],
          suggestedResolutions: [
            'Déplacer le cours vers un autre créneau',
            'Assigner un autre enseignant',
            'Modifier les disponibilités'
          ],
          teacherId: entry.teacherId,
          dayOfWeek: entry.dayOfWeek,
          timeSlot: entry.startTime
        });
        
        // Garder le premier cours, ignorer le second
        continue;
      }
      
      usedSlots.set(slotKey, entry);
      finalSchedule.push(entry);
    }
    
    return { finalSchedule, conflicts };
  }

  /**
   * Calcule les statistiques de génération
   */
  private calculateStatistics(
    schedule: PlanningSchedule[],
    teachers: PlanningTeacher[],
    classes: PlanningClass[]
  ): GenerationStatistics {
    const totalPossibleSlots = classes.length * 6 * 9; // 6 jours × 9 créneaux
    const filledSlots = schedule.length;
    const completionRate = totalPossibleSlots > 0 ? (filledSlots / totalPossibleSlots) * 100 : 0;
    
    // Utilisation des enseignants
    const teacherUtilization = teachers.length > 0 ? 
      (new Set(schedule.map(s => s.teacherId)).size / teachers.length) * 100 : 0;
    
    // Complétude des classes
    const classCompletion = classes.length > 0 ? 
      (new Set(schedule.map(s => s.classId)).size / classes.length) * 100 : 0;
    
    // Calculer les trous moyens par jour
    const gapsPerDay = this.calculateGapsPerDay(schedule);
    
    return {
      totalSlots: totalPossibleSlots,
      filledSlots,
      completionRate,
      teacherUtilization,
      classCompletion,
      averageGapsPerDay: gapsPerDay,
      conflictsResolved: 0, // À implémenter
      conflictsRemaining: 0 // À implémenter
    };
  }

  /**
   * Calcule les trous moyens par jour
   */
  private calculateGapsPerDay(schedule: PlanningSchedule[]): number {
    const gapsByDay = new Map<number, number>();
    
    for (let day = 1; day <= 6; day++) {
      const daySchedule = schedule.filter(s => s.dayOfWeek === day);
      const sortedSchedule = daySchedule.sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      let gaps = 0;
      for (let i = 1; i < sortedSchedule.length; i++) {
        const prevEnd = sortedSchedule[i - 1].endTime;
        const currentStart = sortedSchedule[i].startTime;
        
        if (prevEnd !== currentStart) {
          gaps++;
        }
      }
      
      gapsByDay.set(day, gaps);
    }
    
    const totalGaps = Array.from(gapsByDay.values()).reduce((sum, gaps) => sum + gaps, 0);
    return totalGaps / 6; // Moyenne sur 6 jours
  }

  /**
   * Génère les avertissements
   */
  private generateWarnings(schedule: PlanningSchedule[], conflicts: Conflict[]): string[] {
    const warnings: string[] = [];
    
    if (conflicts.length > 0) {
      warnings.push(`${conflicts.length} conflit(s) détecté(s) nécessitant une attention`);
    }
    
    if (schedule.length === 0) {
      warnings.push('Aucun cours n\'a pu être planifié');
    }
    
    return warnings;
  }

  /**
   * Génère les suggestions d'amélioration
   */
  private generateSuggestions(
    schedule: PlanningSchedule[],
    conflicts: Conflict[],
    statistics: GenerationStatistics
  ): string[] {
    const suggestions: string[] = [];
    
    if (statistics.completionRate < 80) {
      suggestions.push('Considérez ajouter plus d\'enseignants ou ajuster les disponibilités');
    }
    
    if (statistics.averageGapsPerDay > 2) {
      suggestions.push('Optimisez les créneaux pour réduire les trous dans les emplois du temps');
    }
    
    if (conflicts.length > 0) {
      suggestions.push('Résolvez les conflits avant de finaliser l\'emploi du temps');
    }
    
    return suggestions;
  }

  /**
   * Obtient le nom du jour
   */
  private getDayName(dayOfWeek: number): string {
    const days = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[dayOfWeek] || 'Inconnu';
  }
}

export const scheduleGeneratorService = new ScheduleGeneratorService();
