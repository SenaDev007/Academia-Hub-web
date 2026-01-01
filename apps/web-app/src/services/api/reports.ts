import { dataService } from '../dataService';

export interface ReportFilters {
  classId?: string;
  studentId?: string;
  termId?: string;
  academicYearId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface StudentReport {
  studentId: string;
  studentName: string;
  className: string;
  termName: string;
  academicYear: string;
  grades: Array<{
    subject: string;
    average: number;
    rank: number;
    totalGrades: number;
  }>;
  generalAverage: number;
  classRank: number;
  totalStudents: number;
  attendance: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
  behavior: {
    incidents: number;
    warnings: number;
    sanctions: number;
  };
}

export interface ClassReport {
  classId: string;
  className: string;
  termName: string;
  academicYear: string;
  studentCount: number;
  subjectAverages: Array<{
    subject: string;
    classAverage: number;
    highest: number;
    lowest: number;
  }>;
  gradeDistribution: {
    excellent: number;
    good: number;
    average: number;
    belowAverage: number;
    poor: number;
  };
  attendance: {
    average: number;
    present: number;
    absent: number;
    late: number;
  };
}

export const reportsService = {
  async generateStudentReport(studentId: string, termId: string) {
    try {
      // Récupérer les données de l'élève
      const student = await dataService.getStudentById(studentId);
      if (!student) {
        return {
          data: null,
          success: false,
          error: 'Élève non trouvé'
        };
      }

      // Récupérer les notes de l'élève pour le terme
      const grades = await dataService.getAllGrades({ studentId, termId });
      
      // Récupérer les absences
      const absences = await dataService.getStudentAbsences(studentId, { termId });
      
      // Récupérer les incidents de discipline
      const incidents = await dataService.getStudentDisciplineIncidents(studentId, { termId });

      // Calculer les moyennes par matière
      const subjectGrades: { [key: string]: { scores: number[], coefficients: number[], name: string } } = {};
      grades.forEach(grade => {
        if (!subjectGrades[grade.subjectId]) {
          subjectGrades[grade.subjectId] = { scores: [], coefficients: [], name: grade.subjectName || '' };
        }
        subjectGrades[grade.subjectId].scores.push(grade.score);
        subjectGrades[grade.subjectId].coefficients.push(grade.coefficient);
      });

      const subjectAverages = Object.keys(subjectGrades).map(subjectId => {
        const subjectData = subjectGrades[subjectId];
        const weightedSum = subjectData.scores.reduce((sum, score, index) => 
          sum + (score * subjectData.coefficients[index]), 0);
        const totalCoefficient = subjectData.coefficients.reduce((sum, coeff) => sum + coeff, 0);
        const average = totalCoefficient > 0 ? weightedSum / totalCoefficient : 0;
        
        return {
          subject: subjectData.name,
          average: Math.round(average * 100) / 100,
          rank: 0, // Sera calculé plus tard
          totalGrades: subjectData.scores.length
        };
      });

      // Calculer la moyenne générale
      let totalWeightedScore = 0;
      let totalCoefficient = 0;
      subjectAverages.forEach(subject => {
        totalWeightedScore += subject.average * subject.totalGrades;
        totalCoefficient += subject.totalGrades;
      });
      const generalAverage = totalCoefficient > 0 ? totalWeightedScore / totalCoefficient : 0;

      // Calculer les statistiques d'assiduité
      const attendance = {
        present: absences.filter(a => a.status === 'present').length,
        absent: absences.filter(a => a.status === 'absent').length,
        late: absences.filter(a => a.status === 'late').length,
        total: absences.length
      };

      // Calculer les statistiques de comportement
      const behavior = {
        incidents: incidents.length,
        warnings: incidents.filter(i => i.type === 'warning').length,
        sanctions: incidents.filter(i => i.type === 'sanction').length
      };

      const report: StudentReport = {
        studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        className: student.className || '',
        termName: '', // À récupérer depuis le terme
        academicYear: '', // À récupérer depuis l'année académique
        grades: subjectAverages,
        generalAverage: Math.round(generalAverage * 100) / 100,
        classRank: 0, // Sera calculé plus tard
        totalStudents: 0, // Sera calculé plus tard
        attendance,
        behavior
      };

      return {
        data: report,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la génération du rapport étudiant:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async generateClassReport(classId: string, termId: string) {
    try {
      // Récupérer les données de la classe
      const students = await dataService.getStudentsByClass(classId);
      const grades = await dataService.getAllGrades({ classId, termId });
      
      if (students.length === 0) {
        return {
          data: null,
          success: false,
          error: 'Aucun élève dans cette classe'
        };
      }

      // Calculer les moyennes par matière
      const subjectGrades: { [key: string]: { scores: number[], name: string } } = {};
      grades.forEach(grade => {
        if (!subjectGrades[grade.subjectId]) {
          subjectGrades[grade.subjectId] = { scores: [], name: grade.subjectName || '' };
        }
        subjectGrades[grade.subjectId].scores.push(grade.score);
      });

      const subjectAverages = Object.keys(subjectGrades).map(subjectId => {
        const scores = subjectGrades[subjectId].scores;
        const classAverage = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return {
          subject: subjectGrades[subjectId].name,
          classAverage: Math.round(classAverage * 100) / 100,
          highest: Math.max(...scores),
          lowest: Math.min(...scores)
        };
      });

      // Calculer la distribution des notes
      const allScores = grades.map(g => g.score);
      const gradeDistribution = {
        excellent: allScores.filter(s => s >= 16).length,
        good: allScores.filter(s => s >= 14 && s < 16).length,
        average: allScores.filter(s => s >= 12 && s < 14).length,
        belowAverage: allScores.filter(s => s >= 10 && s < 12).length,
        poor: allScores.filter(s => s < 10).length
      };

      // Calculer l'assiduité moyenne
      const attendance = {
        average: 0, // Sera calculé avec les absences réelles
        present: 0,
        absent: 0,
        late: 0
      };

      const report: ClassReport = {
        classId,
        className: students[0]?.className || '',
        termName: '', // À récupérer depuis le terme
        academicYear: '', // À récupérer depuis l'année académique
        studentCount: students.length,
        subjectAverages,
        gradeDistribution,
        attendance
      };

      return {
        data: report,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la génération du rapport de classe:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  async exportReport(type: string, params: ReportFilters) {
    try {
      let reportData;
      
      if (type === 'student' && params.studentId && params.termId) {
        const result = await this.generateStudentReport(params.studentId, params.termId);
        if (!result.success) {
          return {
            data: null,
            success: false,
            error: result.error
          };
        }
        reportData = result.data;
      } else if (type === 'class' && params.classId && params.termId) {
        const result = await this.generateClassReport(params.classId, params.termId);
        if (!result.success) {
          return {
            data: null,
            success: false,
            error: result.error
          };
        }
        reportData = result.data;
      } else {
        return {
          data: null,
          success: false,
          error: 'Paramètres invalides pour l\'export'
        };
      }

      // Créer un CSV local
      const csvContent = this.generateCSVReport(type, reportData);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      return {
        data: blob,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'export du rapport:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  generateCSVReport(type: string, data: any): string {
    if (type === 'student') {
      const report = data as StudentReport;
      let csv = `Rapport Étudiant - ${report.studentName}\n`;
      csv += `Classe: ${report.className}\n`;
      csv += `Moyenne Générale: ${report.generalAverage}\n\n`;
      csv += "Matière,Moyenne,Rang,Total Notes\n";
      
      report.grades.forEach(grade => {
        csv += `"${grade.subject}",${grade.average},${grade.rank},${grade.totalGrades}\n`;
      });
      
      return csv;
    } else if (type === 'class') {
      const report = data as ClassReport;
      let csv = `Rapport de Classe - ${report.className}\n`;
      csv += `Nombre d\'élèves: ${report.studentCount}\n\n`;
      csv += "Matière,Moyenne Classe,Note Max,Note Min\n";
      
      report.subjectAverages.forEach(subject => {
        csv += `"${subject.subject}",${subject.classAverage},${subject.highest},${subject.lowest}\n`;
      });
      
      return csv;
    }
    
    return '';
  }
};
