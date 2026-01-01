import { dataService } from '../dataService';

export interface Grade {
  id: string;
  studentId: string;
  studentName?: string;
  subjectId: string;
  subjectName?: string;
  classId: string;
  className?: string;
  academicYearId: string;
  termId: string;
  evaluationType: 'test' | 'exam' | 'quiz' | 'homework' | 'participation';
  score: number;
  maxScore: number;
  coefficient: number;
  weightedScore: number;
  comment?: string;
  date: string;
  teacherId: string;
  teacherName?: string;
  isValidated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGradeData {
  studentId: string;
  subjectId: string;
  classId: string;
  academicYearId: string;
  termId: string;
  evaluationType: 'test' | 'exam' | 'quiz' | 'homework' | 'participation';
  score: number;
  maxScore: number;
  coefficient?: number;
  comment?: string;
  date: string;
}

export interface GradeFilters {
  studentId?: string;
  subjectId?: string;
  classId?: string;
  academicYearId?: string;
  termId?: string;
  teacherId?: string;
  evaluationType?: string;
  dateFrom?: string;
  dateTo?: string;
  isValidated?: boolean;
  page?: number;
  limit?: number;
}

export interface StudentAverage {
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  average: number;
  rank: number;
  totalGrades: number;
  coefficient: number;
}

export interface ClassAverage {
  subjectId: string;
  subjectName: string;
  classAverage: number;
  highestScore: number;
  lowestScore: number;
  totalStudents: number;
}

export const gradesService = {
  async getGrades(filters?: GradeFilters) {
    try {
      const grades = await dataService.getAllGrades(filters);
      return {
        data: grades,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des notes:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getGrade(id: string) {
    try {
      const grade = await dataService.getGradeById(id);
      if (!grade) {
        return {
          data: null,
          success: false,
          error: 'Note non trouvée'
        };
      }
      return {
        data: grade,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la note:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async createGrade(data: CreateGradeData) {
    try {
      const grade = await dataService.createGrade(data);
      return {
        data: grade,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création de la note:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async updateGrade(id: string, data: Partial<CreateGradeData>) {
    try {
      const grade = await dataService.updateGrade(id, data);
      return {
        data: grade,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async deleteGrade(id: string) {
    try {
      const success = await dataService.deleteGrade(id);
      return {
        data: success,
        success
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de la note:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async bulkCreateGrades(grades: CreateGradeData[]) {
    try {
      const createdGrades = [];
      for (const gradeData of grades) {
        const grade = await dataService.createGrade(gradeData);
        createdGrades.push(grade);
      }
      return {
        data: createdGrades,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création en masse des notes:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async validateGrades(gradeIds: string[]) {
    try {
      const validatedGrades = [];
      for (const id of gradeIds) {
        const grade = await dataService.updateGrade(id, { isValidated: true });
        validatedGrades.push(grade);
      }
      return {
        data: validatedGrades,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la validation des notes:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getStudentGrades(studentId: string, filters?: Omit<GradeFilters, 'studentId'>) {
    try {
      const grades = await dataService.getAllGrades({ ...filters, studentId });
      return {
        data: grades,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des notes de l\'élève:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getSubjectGrades(subjectId: string, classId: string, termId: string) {
    try {
      const grades = await dataService.getAllGrades({ subjectId, classId, termId });
      return {
        data: grades,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des notes par matière:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getClassAverages(classId: string, termId: string, subjectId?: string) {
    try {
      const grades = await dataService.getAllGrades({ classId, termId, subjectId });
      
      // Calculer les moyennes par matière
      const subjectGrades: { [key: string]: number[] } = {};
      const subjectNames: { [key: string]: string } = {};
      
      grades.forEach(grade => {
        if (!subjectGrades[grade.subjectId]) {
          subjectGrades[grade.subjectId] = [];
          subjectNames[grade.subjectId] = grade.subjectName || '';
        }
        subjectGrades[grade.subjectId].push(grade.score);
      });

      const averages: ClassAverage[] = Object.keys(subjectGrades).map(subjectId => {
        const scores = subjectGrades[subjectId];
        const classAverage = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return {
          subjectId,
          subjectName: subjectNames[subjectId],
          classAverage: Math.round(classAverage * 100) / 100,
          highestScore: Math.max(...scores),
          lowestScore: Math.min(...scores),
          totalStudents: scores.length
        };
      });

      return {
        data: averages,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors du calcul des moyennes de classe:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getStudentAverage(studentId: string, termId: string) {
    try {
      const grades = await dataService.getAllGrades({ studentId, termId });
      
      // Calculer la moyenne générale de l'élève
      const subjectGrades: { [key: string]: { scores: number[], coefficients: number[], name: string } } = {};
      
      grades.forEach(grade => {
        if (!subjectGrades[grade.subjectId]) {
          subjectGrades[grade.subjectId] = { scores: [], coefficients: [], name: grade.subjectName || '' };
        }
        subjectGrades[grade.subjectId].scores.push(grade.score);
        subjectGrades[grade.subjectId].coefficients.push(grade.coefficient);
      });

      const studentAverages: StudentAverage[] = Object.keys(subjectGrades).map(subjectId => {
        const subjectData = subjectGrades[subjectId];
        const weightedSum = subjectData.scores.reduce((sum, score, index) => 
          sum + (score * subjectData.coefficients[index]), 0);
        const totalCoefficient = subjectData.coefficients.reduce((sum, coeff) => sum + coeff, 0);
        const average = totalCoefficient > 0 ? weightedSum / totalCoefficient : 0;
        
        return {
          studentId,
          studentName: grades[0]?.studentName || '',
          subjectId,
          subjectName: subjectData.name,
          average: Math.round(average * 100) / 100,
          rank: 0, // Sera calculé plus tard
          totalGrades: subjectData.scores.length,
          coefficient: totalCoefficient
        };
      });

      return {
        data: studentAverages,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors du calcul de la moyenne de l\'élève:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getRankings(classId: string, termId: string) {
    try {
      const students = await dataService.getStudentsByClass(classId);
      const rankings = [];

      for (const student of students) {
        const grades = await dataService.getAllGrades({ 
          studentId: student.id, 
          termId 
        });
        
        if (grades.length > 0) {
          const subjectGrades: { [key: string]: { scores: number[], coefficients: number[] } } = {};
          
          grades.forEach(grade => {
            if (!subjectGrades[grade.subjectId]) {
              subjectGrades[grade.subjectId] = { scores: [], coefficients: [] };
            }
            subjectGrades[grade.subjectId].scores.push(grade.score);
            subjectGrades[grade.subjectId].coefficients.push(grade.coefficient);
          });

          let totalWeightedScore = 0;
          let totalCoefficient = 0;

          Object.keys(subjectGrades).forEach(subjectId => {
            const subjectData = subjectGrades[subjectId];
            const weightedSum = subjectData.scores.reduce((sum, score, index) => 
              sum + (score * subjectData.coefficients[index]), 0);
            const subjectCoefficient = subjectData.coefficients.reduce((sum, coeff) => sum + coeff, 0);
            
            totalWeightedScore += weightedSum;
            totalCoefficient += subjectCoefficient;
          });

          const generalAverage = totalCoefficient > 0 ? totalWeightedScore / totalCoefficient : 0;
          
          rankings.push({
            studentId: student.id,
            studentName: student.firstName + ' ' + student.lastName,
            average: Math.round(generalAverage * 100) / 100,
            rank: 0 // Sera calculé après le tri
          });
        }
      }

      // Trier par moyenne décroissante et assigner les rangs
      rankings.sort((a, b) => b.average - a.average);
      rankings.forEach((ranking, index) => {
        ranking.rank = index + 1;
      });

      return {
        data: rankings,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors du calcul des classements:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async importGrades(file: File, classId: string, subjectId: string, termId: string) {
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const grades = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length === headers.length) {
          const gradeData: any = {};
          headers.forEach((header, index) => {
            gradeData[header] = values[index];
          });
          
          const created = await dataService.createGrade({
            studentId: gradeData.studentId || gradeData.student_id,
            subjectId,
            classId,
            academicYearId: gradeData.academicYearId || gradeData.academic_year_id,
            termId,
            evaluationType: gradeData.evaluationType || gradeData.evaluation_type || 'test',
            score: parseFloat(gradeData.score),
            maxScore: parseFloat(gradeData.maxScore || gradeData.max_score) || 20,
            coefficient: parseFloat(gradeData.coefficient) || 1,
            comment: gradeData.comment || '',
            date: gradeData.date || new Date().toISOString()
          });
          grades.push(created);
        }
      }

      return {
        data: grades,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'import des notes:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async exportGrades(filters?: GradeFilters) {
    try {
      const grades = await dataService.getAllGrades(filters);
      
      // Créer un CSV local
      const headers = ['Élève', 'Matière', 'Classe', 'Type', 'Note', 'Max', 'Coefficient', 'Date', 'Commentaire'];
      const rows = grades.map(grade => [
        grade.studentName || '',
        grade.subjectName || '',
        grade.className || '',
        grade.evaluationType,
        grade.score.toString(),
        grade.maxScore.toString(),
        grade.coefficient.toString(),
        grade.date,
        grade.comment || ''
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
      console.error('Erreur lors de l\'export des notes:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async getGradeStats(filters?: GradeFilters) {
    try {
      const grades = await dataService.getAllGrades(filters);
      
      // Calculer les statistiques
      const totalGrades = grades.length;
      const validatedGrades = grades.filter(g => g.isValidated).length;
      const averageScore = totalGrades > 0 ? 
        grades.reduce((sum, g) => sum + g.score, 0) / totalGrades : 0;
      
      const stats = {
        totalGrades,
        validatedGrades,
        pendingGrades: totalGrades - validatedGrades,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore: Math.max(...grades.map(g => g.score), 0),
        lowestScore: Math.min(...grades.map(g => g.score), 100)
      };

      return {
        data: stats,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
};
