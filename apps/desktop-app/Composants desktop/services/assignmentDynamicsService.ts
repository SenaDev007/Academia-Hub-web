import { PlanningClass, PlanningSubject, PlanningTeacher, PlanningSchedule } from '../types/planning';
import { availabilityService } from './availabilityService';

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  classId: string;
  subjectId?: string;
  hoursPerWeek: number;
  mode: 'maternelle' | 'primaire' | 'secondaire' | 'non_defini';
  className: string;
  classLevel: string;
  subjectName?: string;
  subjectLevel?: string;
  teacherName: string;
}

export interface AssignmentContext {
  teacher: PlanningTeacher;
  assignedClasses: PlanningClass[];
  assignedSubjects: PlanningSubject[];
  mode: 'maternelle' | 'primaire' | 'secondaire' | 'non_defini';
  totalHours: number;
  canTeachAllSubjects: boolean;
  specificSubject?: PlanningSubject;
  availability: {
    isAvailable: boolean;
    availableDays: number[];
    availableTimeSlots: string[];
    totalAvailableHours: number;
  };
}

export interface SmartSuggestion {
  type: 'teacher' | 'subject' | 'class' | 'time';
  value: string;
  reason: string;
  confidence: number; // 0-1
  priority: 'high' | 'medium' | 'low';
}

class AssignmentDynamicsService {
  private electronAPI: any;

  constructor() {
    this.electronAPI = (window as any).electronAPI;
  }

  /**
   * Récupère le contexte d'affectation d'un enseignant avec ses disponibilités
   */
  async getTeacherAssignmentContext(teacherId: string, schoolId: string): Promise<AssignmentContext | null> {
    try {
      if (!this.electronAPI?.database?.executeQuery) {
        console.error('API non disponible');
        return null;
      }

      // Récupérer les affectations de l'enseignant
      const assignmentsQuery = `
        SELECT 
          ta.id,
          ta.teacher_id,
          ta.class_id,
          ta.subject_id,
          ta.hours_per_week,
          ta.mode,
          c.name as class_name,
          c.level as class_level,
          s.name as subject_name,
          s.level as subject_level
        FROM teacher_assignments ta
        LEFT JOIN classes c ON ta.class_id = c.id
        LEFT JOIN subjects s ON ta.subject_id = s.id
        WHERE ta.teacher_id = ? AND ta.school_id = ?
      `;

      const assignmentsResult = await this.electronAPI.database.executeQuery(assignmentsQuery, [teacherId, schoolId]);
      const assignments: TeacherAssignment[] = assignmentsResult.results || [];

      console.log('🔍 assignmentDynamicsService - Assignments trouvées:', assignments);

      // Même sans affectations, on peut récupérer les informations de base de l'enseignant
      if (assignments.length === 0) {
        console.log('⚠️ Aucune affectation trouvée pour l\'enseignant', teacherId);
        // Retourner un contexte minimal avec les informations de base
        const teacherQuery = `
          SELECT firstName, lastName, subjectId
          FROM teachers 
          WHERE id = ?
        `;
        const teacherResult = await this.electronAPI.database.executeQuery(teacherQuery, [teacherId]);
        const teacherData = teacherResult.results?.[0];

        if (!teacherData) {
          return null;
        }

        // Récupérer les disponibilités même sans affectations
        const availabilityData = await availabilityService.getTeacherAvailability(teacherId, schoolId);
        const availability = this.processTeacherAvailability(availabilityData);

        return {
          teacher: {
            id: teacherId,
            name: `${teacherData.firstName} ${teacherData.lastName}`,
            firstName: teacherData.firstName,
            lastName: teacherData.lastName,
            subject: 'Toutes les matières',
            classes: [],
            hoursPerWeek: 0,
            mode: 'non_defini'
          } as PlanningTeacher,
          assignedClasses: [],
          assignedSubjects: [],
          mode: 'non_defini',
          totalHours: 0,
          canTeachAllSubjects: true,
          specificSubject: undefined,
          availability
        };
      }

      // Récupérer les informations de l'enseignant
      const teacherQuery = `
        SELECT firstName, lastName, subjectId
        FROM teachers 
        WHERE id = ?
      `;
      const teacherResult = await this.electronAPI.database.executeQuery(teacherQuery, [teacherId]);
      const teacherData = teacherResult.results?.[0];

      if (!teacherData) {
        return null;
      }

      // Récupérer les classes et matières
      const classesQuery = `
        SELECT id, name, level
        FROM classes
        WHERE id IN (${assignments.map(a => `'${a.classId}'`).join(',')})
      `;
      const classesResult = await this.electronAPI.database.executeQuery(classesQuery, []);
      const classes: PlanningClass[] = classesResult.results || [];

      const subjectsQuery = `
        SELECT id, name, level
        FROM subjects
        WHERE id IN (${assignments.filter(a => a.subjectId).map(a => `'${a.subjectId}'`).join(',')})
      `;
      const subjectsResult = await this.electronAPI.database.executeQuery(subjectsQuery, []);
      const subjects: PlanningSubject[] = subjectsResult.results || [];

      // Récupérer les disponibilités de l'enseignant
      const availabilityData = await availabilityService.getTeacherAvailability(teacherId, schoolId);
      console.log('🔍 assignmentDynamicsService - Availability data:', availabilityData);
      const availability = this.processTeacherAvailability(availabilityData);
      console.log('🔍 assignmentDynamicsService - Processed availability:', availability);

      // Déterminer le mode et les capacités
      const mode = assignments[0].mode;
      const totalHours = assignments.reduce((sum, a) => sum + (a.hoursPerWeek || 0), 0);
      const canTeachAllSubjects = mode === 'maternelle' || mode === 'primaire';
      const specificSubject = subjects.length === 1 ? subjects[0] : undefined;

      return {
        teacher: {
          id: teacherId,
          name: `${teacherData.firstName} ${teacherData.lastName}`,
          firstName: teacherData.firstName,
          lastName: teacherData.lastName,
          subject: canTeachAllSubjects ? 'Toutes les matières' : (specificSubject?.name || 'Matière non définie'),
          classes: classes.map(c => c.name),
          hoursPerWeek: totalHours,
          mode: mode
        } as PlanningTeacher,
        assignedClasses: classes,
        assignedSubjects: subjects,
        mode,
        totalHours,
        canTeachAllSubjects,
        specificSubject,
        availability
      };

    } catch (error) {
      console.error('Erreur lors de la récupération du contexte d\'affectation:', error);
      return null;
    }
  }

  /**
   * Traite les données de disponibilité d'un enseignant
   */
  private processTeacherAvailability(availabilityData: any[]): AssignmentContext['availability'] {
    if (!availabilityData || availabilityData.length === 0) {
      return {
        isAvailable: false,
        availableDays: [],
        availableTimeSlots: [],
        totalAvailableHours: 0
      };
    }

    const availableDays: number[] = [];
    const availableTimeSlots: string[] = [];
    let totalAvailableHours = 0;

    availabilityData.forEach(slot => {
      // Utiliser les noms de colonnes de la base de données
      const isAvailable = slot.is_available === 1 || slot.is_available === true;
      if (isAvailable) {
        availableDays.push(slot.day_of_week);
        const timeSlot = `${slot.start_time}-${slot.end_time}`;
        availableTimeSlots.push(timeSlot);
        
        // Calculer les heures disponibles
        const startTime = parseInt(slot.start_time.split(':')[0]);
        const endTime = parseInt(slot.end_time.split(':')[0]);
        totalAvailableHours += endTime - startTime;
      }
    });

    return {
      isAvailable: availableDays.length > 0,
      availableDays: [...new Set(availableDays)].sort(),
      availableTimeSlots: [...new Set(availableTimeSlots)],
      totalAvailableHours
    };
  }

  /**
   * Génère des suggestions intelligentes pour l'emploi du temps en tenant compte des disponibilités
   */
  generateSmartSuggestions(
    context: AssignmentContext,
    selectedClass?: PlanningClass,
    selectedSubject?: PlanningSubject,
    selectedTime?: string
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];

    // Suggestion d'enseignant basée sur l'affectation et la disponibilité
    if (context.teacher) {
      const availabilityReason = context.availability.isAvailable 
        ? `Disponible ${context.availability.availableDays.length} jours/semaine`
        : 'Disponibilités non configurées';
      
      suggestions.push({
        type: 'teacher',
        value: context.teacher.id,
        reason: `Enseignant assigné à ${context.assignedClasses.map(c => c.name).join(', ')} • ${availabilityReason}`,
        confidence: context.availability.isAvailable ? 0.9 : 0.6,
        priority: context.availability.isAvailable ? 'high' : 'medium'
      });
    }

    // Suggestions de matières selon le mode
    if (context.mode === 'maternelle' || context.mode === 'primaire') {
      // Pour maternelle/primaire : toutes les matières du niveau
      const levelSubjects = this.getSubjectsForLevel(context.assignedClasses[0]?.level || '');
      levelSubjects.forEach(subject => {
        suggestions.push({
          type: 'subject',
          value: subject.id,
          reason: `Matière du niveau ${context.mode}`,
          confidence: 0.8,
          priority: 'high'
        });
      });
    } else if (context.mode === 'secondaire' && context.specificSubject) {
      // Pour secondaire : matière spécifique
      suggestions.push({
        type: 'subject',
        value: context.specificSubject.id,
        reason: `Matière spécialisée de l'enseignant`,
        confidence: 0.95,
        priority: 'high'
      });
    }

    // Suggestions de classes selon l'affectation
    context.assignedClasses.forEach(cls => {
      suggestions.push({
        type: 'class',
        value: cls.id,
        reason: `Classe assignée à l'enseignant`,
        confidence: 0.9,
        priority: 'high'
      });
    });

    // Suggestions de créneaux horaires basées sur les disponibilités
    if (context.availability.isAvailable) {
      context.availability.availableTimeSlots.forEach(timeSlot => {
        suggestions.push({
          type: 'time',
          value: timeSlot,
          reason: `Créneau disponible selon les disponibilités configurées`,
          confidence: 0.9,
          priority: 'high'
        });
      });
    } else {
      // Si pas de disponibilités configurées, suggérer des créneaux optimaux
      const optimalTimes = this.getOptimalTimeSlots(context.teacher.hoursPerWeek || 0);
      optimalTimes.forEach(time => {
        suggestions.push({
          type: 'time',
          value: time,
          reason: `Créneau optimal pour ${context.teacher.name} (disponibilités non configurées)`,
          confidence: 0.5,
          priority: 'low'
        });
      });
    }

    return suggestions.sort((a, b) => {
      // Trier par priorité puis par confiance
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.confidence - a.confidence;
    });
  }

  /**
   * Filtre les enseignants disponibles selon le contexte
   */
  filterAvailableTeachers(
    teachers: PlanningTeacher[],
    selectedClass?: PlanningClass,
    selectedSubject?: PlanningSubject
  ): PlanningTeacher[] {
    return teachers.filter(teacher => {
      // Vérifier si l'enseignant peut enseigner cette classe
      if (selectedClass && teacher.classes) {
        const canTeachClass = teacher.classes.includes(selectedClass.name);
        if (!canTeachClass) return false;
      }

      // Vérifier si l'enseignant peut enseigner cette matière
      if (selectedSubject) {
        const canTeachSubject = this.canTeacherTeachSubject(teacher, selectedSubject);
        if (!canTeachSubject) return false;
      }

      // Vérifier la charge de travail
      const currentHours = teacher.hoursPerWeek || 0;
      const maxHours = this.getMaxHoursForTeacher(teacher);
      if (currentHours >= maxHours) return false;

      return true;
    });
  }

  /**
   * Filtre les matières disponibles selon le contexte
   */
  filterAvailableSubjects(
    subjects: PlanningSubject[],
    selectedTeacher?: PlanningTeacher,
    selectedClass?: PlanningClass
  ): PlanningSubject[] {
    if (!selectedTeacher) return subjects;

    return subjects.filter(subject => {
      // Pour maternelle/primaire : toutes les matières du niveau
      if (selectedTeacher.mode === 'maternelle' || selectedTeacher.mode === 'primaire') {
        return subject.level === selectedClass?.level;
      }

      // Pour secondaire : matière spécifique de l'enseignant
      if (selectedTeacher.mode === 'secondaire') {
        return selectedTeacher.subject === subject.name;
      }

      return true;
    });
  }

  /**
   * Filtre les classes disponibles selon le contexte
   */
  filterAvailableClasses(
    classes: PlanningClass[],
    selectedTeacher?: PlanningTeacher,
    selectedSubject?: PlanningSubject
  ): PlanningClass[] {
    if (!selectedTeacher) return classes;

    return classes.filter(cls => {
      // Vérifier si l'enseignant est assigné à cette classe
      if (selectedTeacher.classes) {
        return selectedTeacher.classes.includes(cls.name);
      }

      return true;
    });
  }

  /**
   * Vérifie si un enseignant peut enseigner une matière
   */
  private canTeacherTeachSubject(teacher: PlanningTeacher, subject: PlanningSubject): boolean {
    // Pour maternelle/primaire : peut enseigner toutes les matières du niveau
    if (teacher.mode === 'maternelle' || teacher.mode === 'primaire') {
      return true;
    }

    // Pour secondaire : matière spécifique
    if (teacher.mode === 'secondaire') {
      return teacher.subject === subject.name;
    }

    return false;
  }

  /**
   * Récupère les matières pour un niveau donné
   */
  private getSubjectsForLevel(level: string): PlanningSubject[] {
    // Cette méthode devrait récupérer les matières depuis la base de données
    // Pour l'instant, on retourne des matières par défaut selon le niveau
    const defaultSubjects: { [key: string]: PlanningSubject[] } = {
      'maternelle': [
        { id: 'sub-mat-1', name: 'Éveil', level: 'maternelle', coefficient: 1 },
        { id: 'sub-mat-2', name: 'Motricité', level: 'maternelle', coefficient: 1 }
      ],
      'primaire': [
        { id: 'sub-pri-1', name: 'Français', level: 'primaire', coefficient: 4 },
        { id: 'sub-pri-2', name: 'Mathématiques', level: 'primaire', coefficient: 4 },
        { id: 'sub-pri-3', name: 'Sciences', level: 'primaire', coefficient: 2 }
      ],
      'secondaire': [
        { id: 'sub-sec-1', name: 'Mathématiques', level: 'secondaire', coefficient: 4 },
        { id: 'sub-sec-2', name: 'Français', level: 'secondaire', coefficient: 4 },
        { id: 'sub-sec-3', name: 'SVT', level: 'secondaire', coefficient: 2 }
      ]
    };

    return defaultSubjects[level] || [];
  }

  /**
   * Récupère les créneaux horaires optimaux
   */
  private getOptimalTimeSlots(hoursPerWeek: number): string[] {
    // Créneaux optimaux selon la charge de travail
    if (hoursPerWeek < 15) {
      return ['08:00-09:00', '09:00-10:00', '10:00-11:00'];
    } else if (hoursPerWeek < 25) {
      return ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00'];
    } else {
      return ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];
    }
  }

  /**
   * Récupère le nombre maximum d'heures pour un enseignant
   */
  private getMaxHoursForTeacher(teacher: PlanningTeacher): number {
    // Limites selon le mode
    switch (teacher.mode) {
      case 'maternelle':
        return 20;
      case 'primaire':
        return 25;
      case 'secondaire':
        return 30;
      default:
        return 20;
    }
  }

  /**
   * Valide une affectation selon les contraintes et les disponibilités
   */
  async validateAssignment(
    teacher: PlanningTeacher,
    classId: string,
    subjectId: string,
    timeSlot: string,
    existingSchedule: PlanningSchedule[],
    schoolId: string
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Vérifier si l'enseignant peut enseigner cette classe
    if (teacher.classes && !teacher.classes.includes(classId)) {
      errors.push(`L'enseignant ${teacher.name} n'est pas assigné à cette classe`);
    }

    // Vérifier si l'enseignant peut enseigner cette matière
    if (teacher.mode === 'secondaire' && teacher.subject !== subjectId) {
      errors.push(`L'enseignant ${teacher.name} ne peut pas enseigner cette matière`);
    }

    // Vérifier les conflits d'horaire
    const hasConflict = existingSchedule.some(entry => 
      entry.teacherId === teacher.id && 
      entry.time === timeSlot
    );
    if (hasConflict) {
      errors.push(`L'enseignant ${teacher.name} a déjà un cours à ce créneau`);
    }

    // Vérifier les disponibilités de l'enseignant
    try {
      const availabilityData = await availabilityService.getTeacherAvailability(teacher.id, schoolId);
      const availability = this.processTeacherAvailability(availabilityData);
      
      if (availability.isAvailable) {
        // Extraire le jour et l'heure du créneau
        const [dayOfWeek, timeRange] = timeSlot.split('_');
        const [startTime, endTime] = timeRange.split('-');
        
        // Vérifier si l'enseignant est disponible ce jour
        if (!availability.availableDays.includes(parseInt(dayOfWeek))) {
          errors.push(`L'enseignant ${teacher.name} n'est pas disponible ce jour selon ses disponibilités configurées`);
        }
        
        // Vérifier si l'enseignant est disponible à cette heure
        const isTimeAvailable = availability.availableTimeSlots.some(slot => {
          const [slotStart, slotEnd] = slot.split('-');
          return startTime >= slotStart && endTime <= slotEnd;
        });
        
        if (!isTimeAvailable) {
          errors.push(`L'enseignant ${teacher.name} n'est pas disponible à cette heure selon ses disponibilités configurées`);
        }
      } else {
        warnings.push(`L'enseignant ${teacher.name} n'a pas configuré ses disponibilités - vérifiez manuellement`);
      }
    } catch (error) {
      warnings.push(`Impossible de vérifier les disponibilités de ${teacher.name}`);
    }

    // Vérifier la charge de travail
    const currentHours = teacher.hoursPerWeek || 0;
    const maxHours = this.getMaxHoursForTeacher(teacher);
    if (currentHours >= maxHours) {
      warnings.push(`L'enseignant ${teacher.name} a déjà une charge de travail importante`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const assignmentDynamicsService = new AssignmentDynamicsService();
