import { dataService } from '../dataService';
import { Subject } from '../dataService';

export interface CreateSubjectData {
  name: string;
  code: string;
  description?: string;
  coefficient: number;
  classId: string;
  teacherId?: string;
  totalHours?: number;
  practicalHours?: number;
  theoreticalHours?: number;
  evaluationType: 'continuous' | 'exams' | 'mixed';
  gradingScale?: number;
  isCompulsory?: boolean;
}

export interface SubjectFilters {
  classId?: string;
  teacherId?: string;
  academicYearId?: string;
  search?: string;
  isCompulsory?: boolean;
  page?: number;
  limit?: number;
}

export const subjectsService = {
  async getSubjects(filters?: SubjectFilters) {
    try {
      const subjects = await dataService.getAllSubjects(filters);
      return {
        data: subjects,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des matières:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getSubject(id: string) {
    try {
      const subject = await dataService.getSubjectById(id);
      if (!subject) {
        return {
          data: null,
          success: false,
          error: 'Matière non trouvée'
        };
      }
      return {
        data: subject,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la matière:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async createSubject(data: CreateSubjectData) {
    try {
      const subject = await dataService.createSubject(data);
      return {
        data: subject,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création de la matière:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async updateSubject(id: string, data: Partial<CreateSubjectData>) {
    try {
      const subject = await dataService.updateSubject(id, data);
      return {
        data: subject,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la matière:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async deleteSubject(id: string) {
    try {
      const success = await dataService.deleteSubject(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de la matière:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getSubjectsByClass(classId: string) {
    try {
      const subjects = await dataService.getSubjectsByClass(classId);
      return {
        data: subjects,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des matières par classe:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getSubjectsByTeacher(teacherId: string) {
    try {
      const subjects = await dataService.getSubjectsByTeacher(teacherId);
      return {
        data: subjects,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des matières par enseignant:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async assignTeacher(subjectId: string, teacherId: string) {
    try {
      const subject = await dataService.updateSubject(subjectId, { teacherId });
      return {
        data: subject,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'assignation de l\'enseignant:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getSubjectStats(subjectId: string) {
    try {
      const stats = await dataService.getSubjectStats(subjectId);
      return {
        data: stats,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de la matière:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async duplicateSubjects(classId: string, targetClassId: string) {
    try {
      const sourceSubjects = await dataService.getSubjectsByClass(classId);
      const duplicatedSubjects = [];

      for (const subject of sourceSubjects) {
        const duplicated = await dataService.createSubject({
          ...subject,
          classId: targetClassId,
          name: `${subject.name} - Copie`,
          code: `${subject.code}-COPY`
        });
        duplicatedSubjects.push(duplicated);
      }

      return {
        data: duplicatedSubjects,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la duplication des matières:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async importSubjects(file: File, classId: string) {
    try {
      // Pour l'import CSV/Excel, nous devrons lire le fichier localement
      // et traiter les données manuellement
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const subjects = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length === headers.length) {
          const subjectData: any = {};
          headers.forEach((header, index) => {
            subjectData[header] = values[index];
          });
          
          const created = await dataService.createSubject({
            name: subjectData.name || subjectData.nom,
            code: subjectData.code,
            coefficient: parseInt(subjectData.coefficient) || 1,
            classId,
            evaluationType: subjectData.evaluationType || 'mixed',
            isCompulsory: subjectData.isCompulsory === 'true'
          });
          subjects.push(created);
        }
      }

      return {
        data: subjects,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'import des matières:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async exportSubjects(filters?: SubjectFilters) {
    try {
      const subjects = await dataService.getAllSubjects(filters);
      
      // Créer un CSV local
      const headers = ['Nom', 'Code', 'Coefficient', 'Classe', 'Enseignant', 'Type Evaluation', 'Obligatoire'];
      const rows = subjects.map(subject => [
        subject.name,
        subject.code,
        subject.coefficient.toString(),
        subject.className || '',
        subject.teacherName || '',
        subject.evaluationType,
        subject.isCompulsory ? 'Oui' : 'Non'
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      return {
        data: blob,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'export des matières:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
};
