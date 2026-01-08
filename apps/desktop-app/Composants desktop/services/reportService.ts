// Service de rapport pour Electron

export interface AbsenceReport {
  studentId: string;
  studentName: string;
  className: string;
  totalAbsences: number;
  justifiedAbsences: number;
  unjustifiedAbsences: number;
  absenceRate: number;
  lastAbsenceDate?: string;
  absences: Array<{
    date: string;
    period: string;
    reason: string;
    justified: boolean;
    parentNotified: boolean;
  }>;
}

export interface ClassAbsenceReport {
  className: string;
  totalStudents: number;
  totalAbsences: number;
  averageAbsenceRate: number;
  students: AbsenceReport[];
}

export interface SchoolAbsenceReport {
  schoolName: string;
  reportDate: string;
  period: {
    from: string;
    to: string;
  };
  totalStudents: number;
  totalAbsences: number;
  averageAbsenceRate: number;
  classes: ClassAbsenceReport[];
  summary: {
    mostAbsentStudent: {
      name: string;
      absences: number;
    };
    leastAbsentClass: {
      name: string;
      rate: number;
    };
    mostAbsentClass: {
      name: string;
      rate: number;
    };
  };
}

class ReportService {
  // Générer un rapport d'assiduité complet
  async generateAbsenceReport(schoolId: string, options: {
    fromDate: string;
    toDate: string;
    classId: string;
    format: 'pdf' | 'excel' | 'csv';
    includeDetails: boolean;
  }): Promise<{ success: boolean; report?: any; filePath?: string; message?: string; error?: string }> {
    try {
      const result = await api.reports.generateAbsenceReport(schoolId, options);
      return result;
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      return { success: false, error: error.message };
    }
  }

  // Générer un rapport pour un élève spécifique
  async generateStudentAbsenceReport(studentId: string, options: {
    fromDate?: string;
    toDate?: string;
    format: 'pdf' | 'excel' | 'csv';
  }): Promise<AbsenceReport> {
    try {
      const report = await invoke('reports:generateStudentAbsenceReport', {
        studentId,
        options
      });
      return report as AbsenceReport;
    } catch (error) {
      console.error('Erreur lors de la génération du rapport élève:', error);
      throw error;
    }
  }

  // Générer un rapport pour une classe spécifique
  async generateClassAbsenceReport(classId: string, options: {
    fromDate?: string;
    toDate?: string;
    format: 'pdf' | 'excel' | 'csv';
  }): Promise<ClassAbsenceReport> {
    try {
      const report = await invoke('reports:generateClassAbsenceReport', {
        classId,
        options
      });
      return report as ClassAbsenceReport;
    } catch (error) {
      console.error('Erreur lors de la génération du rapport classe:', error);
      throw error;
    }
  }

  // Exporter le rapport dans le format demandé
  async exportReport(report: SchoolAbsenceReport | ClassAbsenceReport | AbsenceReport, format: 'pdf' | 'excel' | 'csv'): Promise<string> {
    try {
      const filePath = await invoke('reports:exportReport', {
        report,
        format
      });
      return filePath as string;
    } catch (error) {
      console.error('Erreur lors de l\'export du rapport:', error);
      throw error;
    }
  }

  // Ouvrir le dossier contenant le rapport
  async openReportFolder(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await api.reports.openReportsFolder();
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du dossier:', error);
      return { success: false, error: error.message };
    }
  }

  // Ouvrir un rapport spécifique
  async openReport(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await api.reports.openReport(filePath);
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du rapport:', error);
      return { success: false, error: error.message };
    }
  }
}

export const reportService = new ReportService();
