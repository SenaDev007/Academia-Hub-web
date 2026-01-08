import { dataService } from '../dataService';
import { Exam, ExamResult } from '../dataService';

export interface CreateExamData {
  title: string;
  description?: string;
  subjectId: string;
  classId: string;
  termId: string;
  type: 'test' | 'quiz' | 'exam' | 'assignment';
  date: string;
  startTime: string;
  endTime: string;
  maxScore: number;
  coefficient: number;
  room?: string;
  instructions?: string;
}

export const examsService = {
  async getExams(params?: {
    classId?: string;
    subjectId?: string;
    teacherId?: string;
    termId?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const exams = await dataService.getAllExams(params);
      return {
        data: exams,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des examens:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getExam(id: string) {
    try {
      const exam = await dataService.getExamById(id);
      if (!exam) {
        return {
          data: null,
          success: false,
          error: 'Examen non trouvé'
        };
      }
      return {
        data: exam,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'examen:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async createExam(data: CreateExamData) {
    try {
      const exam = await dataService.createExam(data);
      return {
        data: exam,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'examen:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async updateExam(id: string, data: Partial<CreateExamData>) {
    try {
      const exam = await dataService.updateExam(id, data);
      return {
        data: exam,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'examen:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async deleteExam(id: string) {
    try {
      const success = await dataService.deleteExam(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'examen:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getExamResults(examId: string) {
    try {
      const results = await dataService.getExamResults(examId);
      return {
        data: results,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des résultats:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async submitExamResult(examId: string, studentId: string, score: number, remarks?: string) {
    try {
      const result = await dataService.submitExamResult({
        examId,
        studentId,
        score,
        remarks,
        maxScore: 20,
        status: 'present'
      });
      return {
        data: result,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la soumission du résultat:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async bulkSubmitResults(examId: string, results: Array<{
    studentId: string;
    score: number;
    remarks?: string;
    status?: string;
  }>) {
    try {
      const submittedResults = await Promise.all(
        results.map(result => 
          dataService.submitExamResult({
            examId,
            studentId: result.studentId,
            score: result.score,
            remarks: result.remarks,
            maxScore: 20,
            status: result.status || 'present'
          })
        )
      );
      return {
        data: submittedResults,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la soumission en masse des résultats:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getUpcomingExams(limit: number = 10) {
    try {
      const exams = await dataService.getAllExams({
        dateFrom: new Date().toISOString().split('T')[0],
        limit
      });
      return {
        data: exams,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des examens à venir:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getExamSchedule(classId: string, date?: string) {
    try {
      const exams = await dataService.getAllExams({
        classId,
        dateFrom: date || new Date().toISOString().split('T')[0]
      });
      return {
        data: exams,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du planning des examens:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
};
