import { WorkedHoursEntry } from '../types/planning';

export class WorkedHoursService {
  private electronAPI: any;

  constructor() {
    this.electronAPI = (window as any).electronAPI;
  }

  /**
   * Récupérer toutes les entrées d'heures travaillées
   */
  async getAllWorkedHours(): Promise<WorkedHoursEntry[]> {
    try {
      if (this.electronAPI?.database?.executeQuery) {
        const sql = 'SELECT * FROM worked_hours ORDER BY created_at DESC';
        const result = await this.electronAPI.database.executeQuery(sql, []);
        
        console.log('🔍 WorkedHoursService - Données récupérées:', result);
        
        if (!Array.isArray(result)) {
          console.warn('⚠️ executeQuery n\'a pas retourné un tableau:', result);
          return [];
        }
        
        // Convertir les données de snake_case vers camelCase
        return result.map((row: any) => ({
          id: row.id,
          employeeId: row.employee_id,
          employeeName: row.employee_name,
          date: row.date,
          scheduledHours: row.scheduled_hours,
          validatedHours: row.validated_hours,
          classId: row.class_id,
          className: row.class_name,
          subjectId: row.subject_id,
          subjectName: row.subject_name,
          entryMode: row.entry_mode,
          validatedBy: row.validated_by,
          validatedAt: row.validated_at,
          notes: row.notes,
          status: row.status,
          schoolId: row.school_id,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
      }
      
      console.warn('API database non disponible');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des heures travaillées:', error);
      return [];
    }
  }

  /**
   * Créer une nouvelle entrée d'heures travaillées
   */
  async createWorkedHoursEntry(entryData: Omit<WorkedHoursEntry, 'id' | 'validatedAt'>): Promise<WorkedHoursEntry> {
    try {
      if (this.electronAPI?.database?.executeQuery) {
        const id = `wh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const validatedAt = new Date().toISOString();
        const createdAt = new Date().toISOString();
        const updatedAt = new Date().toISOString();
        
        const sql = `
          INSERT INTO worked_hours (
            id, employee_id, employee_name, date, scheduled_hours, validated_hours,
            class_id, class_name, subject_id, subject_name, entry_mode, validated_by,
            validated_at, notes, status, school_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
          id, entryData.employeeId, entryData.employeeName, entryData.date,
          entryData.scheduledHours, entryData.validatedHours, entryData.classId || '',
          entryData.className || '', entryData.subjectId || '', entryData.subjectName || '',
          entryData.entryMode, entryData.validatedBy || '', validatedAt,
          entryData.notes || '', entryData.status, entryData.schoolId, createdAt, updatedAt
        ];
        
        await this.electronAPI.database.executeQuery(sql, values);
        
        return {
          ...entryData,
          id,
          validatedAt
        } as WorkedHoursEntry;
      }
      
      throw new Error('API database non disponible');
    } catch (error) {
      console.error('Erreur lors de la création de l\'entrée:', error);
      throw error;
    }
  }
}

export const workedHoursService = new WorkedHoursService();
