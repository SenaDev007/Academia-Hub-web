import { availabilityService } from './availabilityService';

export interface ConflictResolutionResult {
  success: boolean;
  message: string;
  resolvedConflicts: string[];
  failedResolutions: string[];
}

export interface Conflict {
  id: string;
  type: 'availability' | 'workload' | 'schedule' | 'constraint';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedTeachers: string[];
  affectedClasses?: string[];
  timeSlot?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  };
  suggestions: string[];
  autoResolvable: boolean;
}

class ConflictResolutionService {
  private electronAPI: any;

  constructor() {
    this.electronAPI = (window as any).electronAPI;
  }

  /**
   * Résout automatiquement un conflit
   */
  async resolveConflict(conflict: Conflict, schoolId: string): Promise<ConflictResolutionResult> {
    try {
      console.log(`🔧 Résolution du conflit: ${conflict.title}`);
      
      switch (conflict.type) {
        case 'workload':
          return await this.resolveWorkloadConflict(conflict, schoolId);
        
        case 'constraint':
          return await this.resolveConstraintConflict(conflict, schoolId);
        
        case 'availability':
          return await this.resolveAvailabilityConflict(conflict, schoolId);
        
        default:
          return {
            success: false,
            message: 'Type de conflit non supporté pour la résolution automatique',
            resolvedConflicts: [],
            failedResolutions: [conflict.id]
          };
      }
    } catch (error) {
      console.error('Erreur lors de la résolution du conflit:', error);
      return {
        success: false,
        message: 'Erreur lors de la résolution du conflit',
        resolvedConflicts: [],
        failedResolutions: [conflict.id]
      };
    }
  }

  /**
   * Résout un conflit de charge de travail
   */
  private async resolveWorkloadConflict(conflict: Conflict, schoolId: string): Promise<ConflictResolutionResult> {
    try {
      const { affectedTeachers } = conflict;
      const resolvedConflicts: string[] = [];
      const failedResolutions: string[] = [];

      for (const teacherId of affectedTeachers) {
        try {
          // Récupérer les disponibilités actuelles de l'enseignant
          const currentAvailability = await availabilityService.getTeacherAvailability(teacherId, schoolId);
          
          if (currentAvailability && currentAvailability.length > 0) {
            // Ajuster les heures pour respecter les contraintes
            const adjustedAvailability = this.adjustTeacherAvailability(currentAvailability, conflict);
            
            // Sauvegarder les nouvelles disponibilités
            const saveResult = await availabilityService.saveTeacherAvailability({
              teacherId,
              schoolId,
              availability: adjustedAvailability
            });
            
            if (saveResult.success) {
              resolvedConflicts.push(conflict.id);
              console.log(`✅ Conflit de charge résolu pour l'enseignant ${teacherId}`);
            } else {
              failedResolutions.push(conflict.id);
              console.log(`❌ Échec de la résolution pour l'enseignant ${teacherId}`);
            }
          }
        } catch (error) {
          console.error(`Erreur lors de la résolution pour l'enseignant ${teacherId}:`, error);
          failedResolutions.push(conflict.id);
        }
      }

      return {
        success: resolvedConflicts.length > 0,
        message: resolvedConflicts.length > 0 
          ? `${resolvedConflicts.length} conflit(s) de charge résolu(s) avec succès`
          : 'Aucun conflit de charge n\'a pu être résolu',
        resolvedConflicts,
        failedResolutions
      };
    } catch (error) {
      console.error('Erreur lors de la résolution du conflit de charge:', error);
      return {
        success: false,
        message: 'Erreur lors de la résolution du conflit de charge',
        resolvedConflicts: [],
        failedResolutions: [conflict.id]
      };
    }
  }

  /**
   * Résout un conflit de contrainte
   */
  private async resolveConstraintConflict(conflict: Conflict, schoolId: string): Promise<ConflictResolutionResult> {
    try {
      // Pour les conflits de contrainte, on peut suggérer des ajustements
      // mais la résolution automatique est plus complexe
      console.log(`⚠️ Résolution manuelle recommandée pour le conflit de contrainte: ${conflict.title}`);
      
      return {
        success: false,
        message: 'Ce type de conflit nécessite une résolution manuelle',
        resolvedConflicts: [],
        failedResolutions: [conflict.id]
      };
    } catch (error) {
      console.error('Erreur lors de la résolution du conflit de contrainte:', error);
      return {
        success: false,
        message: 'Erreur lors de la résolution du conflit de contrainte',
        resolvedConflicts: [],
        failedResolutions: [conflict.id]
      };
    }
  }

  /**
   * Résout un conflit de disponibilité
   */
  private async resolveAvailabilityConflict(conflict: Conflict, schoolId: string): Promise<ConflictResolutionResult> {
    try {
      // Pour les conflits de disponibilité, on peut suggérer des améliorations
      // mais la résolution automatique nécessite l'intervention de l'utilisateur
      console.log(`⚠️ Résolution manuelle recommandée pour le conflit de disponibilité: ${conflict.title}`);
      
      return {
        success: false,
        message: 'Ce type de conflit nécessite une résolution manuelle',
        resolvedConflicts: [],
        failedResolutions: [conflict.id]
      };
    } catch (error) {
      console.error('Erreur lors de la résolution du conflit de disponibilité:', error);
      return {
        success: false,
        message: 'Erreur lors de la résolution du conflit de disponibilité',
        resolvedConflicts: [],
        failedResolutions: [conflict.id]
      };
    }
  }

  /**
   * Ajuste les disponibilités d'un enseignant pour résoudre un conflit de charge
   */
  private adjustTeacherAvailability(availability: any[], conflict: Conflict): Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }> {
    // Convertir d'abord au format attendu par saveTeacherAvailability
    const convertedAvailability = availability.map(day => ({
      dayOfWeek: day.day_of_week,
      startTime: day.start_time,
      endTime: day.end_time,
      isAvailable: Boolean(day.is_available)
    }));

    // Logique d'ajustement basée sur le type de conflit
    if (conflict.title.includes('Dépassement de charge')) {
      // Réduire les heures de disponibilité
      return convertedAvailability.map(day => {
        if (day.isAvailable) {
          const startHour = parseInt(day.startTime.split(':')[0]);
          const endHour = parseInt(day.endTime.split(':')[0]);
          const duration = endHour - startHour;
          
          // Réduire de 1 heure si possible
          if (duration > 2) {
            const newEndHour = Math.max(startHour + 2, endHour - 1);
            return {
              ...day,
              endTime: `${newEndHour.toString().padStart(2, '0')}:00`
            };
          }
        }
        return day;
      });
    } else if (conflict.title.includes('Sous-utilisation')) {
      // Étendre les heures de disponibilité
      return convertedAvailability.map(day => {
        if (day.isAvailable) {
          const startHour = parseInt(day.startTime.split(':')[0]);
          const endHour = parseInt(day.endTime.split(':')[0]);
          
          // Étendre d'1 heure si possible (max 17h)
          if (endHour < 17) {
            const newEndHour = Math.min(17, endHour + 1);
            return {
              ...day,
              endTime: `${newEndHour.toString().padStart(2, '0')}:00`
            };
          }
        }
        return day;
      });
    }
    
    return convertedAvailability;
  }

  /**
   * Résout plusieurs conflits en lot
   */
  async resolveMultipleConflicts(conflicts: Conflict[], schoolId: string): Promise<ConflictResolutionResult> {
    const results: ConflictResolutionResult[] = [];
    
    for (const conflict of conflicts) {
      if (conflict.autoResolvable) {
        const result = await this.resolveConflict(conflict, schoolId);
        results.push(result);
      }
    }
    
    const totalResolved = results.reduce((sum, result) => sum + result.resolvedConflicts.length, 0);
    const totalFailed = results.reduce((sum, result) => sum + result.failedResolutions.length, 0);
    
    return {
      success: totalResolved > 0,
      message: `${totalResolved} conflit(s) résolu(s), ${totalFailed} échec(s)`,
      resolvedConflicts: results.flatMap(r => r.resolvedConflicts),
      failedResolutions: results.flatMap(r => r.failedResolutions)
    };
  }
}

export const conflictResolutionService = new ConflictResolutionService();
