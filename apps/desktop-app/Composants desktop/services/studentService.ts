// Service de gestion des étudiants avec communication sécurisée vers Electron

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  classId?: string;
  className?: string;
  age?: number;
  enrollmentDate?: string;
  status: 'active' | 'inactive' | 'graduated' | 'transferred';
  photo?: string;
  medicalInfo?: string;
  registrationNumber?: string;
  studentNumber?: string;
  notes?: string;
  // Nouveaux champs pour les frais scolaires
  seniority?: 'new' | 'old';
  inscriptionFee?: number;
  reinscriptionFee?: number;
  tuitionFee?: number;
  totalSchoolFees?: number;
  // Champ pour l'année académique
  academicYearId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Class {
  id: string;
  name: string;
  level: string;
}

export interface EnrollmentStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  newThisWeek: number;
}

class StudentService {
  private async invokeIpc(method: string, ...args: any[]): Promise<any> {
    try {
      // Vérifier si on est dans un environnement Electron
      if (typeof window !== 'undefined' && (window as any).electronAPI?.students) {
        // En production Electron - utiliser l'API students
        const response = await api.students[method](...args);
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.error || 'Erreur lors de l\'opération');
        }
      } else {
        // En développement web - utiliser des données mockées
        return await this.getMockData(method, ...args);
      }
    } catch (error) {
      console.error(`Error in ${method}:`, error);
      throw error;
    }
  }

  private async getMockData(method: string, ...args: any[]): Promise<any> {
    // Données mockées pour le développement
    switch (method) {
      case 'getStudents':
        return [
          {
            id: 'STU-1',
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean.dupont@example.com',
            phone: '+225 07 12 34 56 78',
            dateOfBirth: '2010-05-15',
            address: 'Abidjan, Côte d\'Ivoire',
            parentName: 'Marie Dupont',
            parentPhone: '+225 07 12 34 56 79',
            classId: 'CLASS-1',
            className: '6ème A',
            enrollmentDate: '2024-09-01',
            status: 'active',
            photo: null,
            medicalInfo: 'Aucune allergie connue',
            registrationNumber: 'MAT-2024-ABC1',
            fees: 'paid'
          },
          {
            id: 'STU-2',
            firstName: 'Fatou',
            lastName: 'Traoré',
            email: 'fatou.traore@example.com',
            phone: '+225 07 12 34 56 80',
            dateOfBirth: '2009-08-22',
            address: 'Bouaké, Côte d\'Ivoire',
            parentName: 'Amadou Traoré',
            parentPhone: '+225 07 12 34 56 81',
            classId: 'CLASS-2',
            className: '5ème B',
            enrollmentDate: '2024-09-01',
            status: 'active',
            photo: null,
            medicalInfo: 'Asthme léger',
            registrationNumber: 'MAT-2024-DEF2',
            fees: 'pending'
          }
        ];
      
      case 'getClasses':
        return [
          { id: 'CLASS-1', name: '6ème A', level: '6ème' },
          { id: 'CLASS-2', name: '5ème B', level: '5ème' },
          { id: 'CLASS-3', name: '4ème A', level: '4ème' },
          { id: 'CLASS-4', name: '3ème B', level: '3ème' }
        ];
      
      case 'getStudentById':
        return {
          id: 'STU-1',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@example.com',
          phone: '+225 07 12 34 56 78',
          dateOfBirth: '2010-05-15',
          address: 'Abidjan, Côte d\'Ivoire',
          parentName: 'Marie Dupont',
          parentPhone: '+225 07 12 34 56 79',
          classId: 'CLASS-1',
          className: '6ème A',
          enrollmentDate: '2024-09-01',
          status: 'active',
          photo: null,
          medicalInfo: 'Aucune allergie connue',
          registrationNumber: 'MAT-2024-ABC1'
        };
      
      case 'createStudent':
        return 'STU-' + Date.now();
      
      case 'updateStudent':
        return { success: true };
      
      case 'deleteStudent':
        return { success: true };
      
      case 'getStudentStats':
        return {
          totalStudents: 2,
          presentToday: 1,
          absentToday: 1,
          newThisWeek: 0
        };
      
      default:
        return null;
    }
  }

  async getAllStudents(filters?: {
    classId?: string;
    academicYearId?: string;
    status?: string;
    search?: string;
  }): Promise<Student[]> {
    try {
      const students = await this.invokeIpc('getStudents', 'school-1', filters);
      
      // Calculate age from birth_date
      return students.map((student: any) => ({
        ...student,
        age: student.dateOfBirth ? this.calculateAge(student.dateOfBirth) : undefined
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des élèves:', error);
      return [];
    }
  }

  async getStudentById(id: string): Promise<Student | null> {
    try {
      const student = await this.invokeIpc('getStudentById', id);
      if (student) {
        return {
          ...student,
          age: student.dateOfBirth ? this.calculateAge(student.dateOfBirth) : undefined
        };
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'élève:', error);
      return null;
    }
  }

  async getClasses(): Promise<Class[]> {
    try {
      return await this.invokeIpc('getClasses', 'school-1');
    } catch (error) {
      console.error('Erreur lors de la récupération des classes:', error);
      return [];
    }
  }

  async getEnrollmentStats(): Promise<EnrollmentStats> {
    try {
      const stats = await this.invokeIpc('getStudentStats', 'school-1');
      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        newThisWeek: 0
      };
    }
  }

  async createStudent(data: Partial<Student>): Promise<string> {
    try {
      const studentData = {
        ...data,
        registrationNumber: data.registrationNumber || this.generateMatricule()
      };
      
      const id = await this.invokeIpc('createStudent', studentData);
      return id;
    } catch (error) {
      console.error('Erreur lors de la création de l\'élève:', error);
      throw error;
    }
  }

  async updateStudent(id: string, data: Partial<Student>): Promise<void> {
    try {
      await this.invokeIpc('updateStudent', id, data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'élève:', error);
      throw error;
    }
  }

  async deleteStudent(id: string): Promise<void> {
    try {
      await this.invokeIpc('deleteStudent', id);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'élève:', error);
      throw error;
    }
  }

  // Class Transfers
  async getClassTransfers(schoolId: string, filters?: any): Promise<any[]> {
    try {
      return await this.invokeIpc('getClassTransfers', schoolId, filters);
    } catch (error) {
      console.error('Erreur lors de la récupération des transferts:', error);
      throw error;
    }
  }

  async createClassTransfer(transferData: any): Promise<string> {
    try {
      const id = await this.invokeIpc('createClassTransfer', transferData);
      return id;
    } catch (error) {
      console.error('Erreur lors de la création du transfert:', error);
      throw error;
    }
  }

  async updateClassTransfer(id: string, transferData: any): Promise<void> {
    try {
      await this.invokeIpc('updateClassTransfer', id, transferData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du transfert:', error);
      throw error;
    }
  }

  async deleteClassTransfer(id: string): Promise<void> {
    try {
      await this.invokeIpc('deleteClassTransfer', id);
    } catch (error) {
      console.error('Erreur lors de la suppression du transfert:', error);
      throw error;
    }
  }

  async updateStudentClass(studentId: string, newClassId: string): Promise<void> {
    try {
      await this.invokeIpc('updateStudentClass', studentId, newClassId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la classe de l\'élève:', error);
      throw error;
    }
  }

  // Méthodes pour les absences
  async getAbsences(schoolId: string, filters: any = {}): Promise<any[]> {
    try {
      const result = await this.invokeIpc('getAbsences', schoolId, filters);
      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des absences:', error);
      throw error;
    }
  }

  async createAbsence(absenceData: any): Promise<string> {
    try {
      const result = await this.invokeIpc('createAbsence', absenceData);
      return result.id;
    } catch (error) {
      console.error('Erreur lors de la création de l\'absence:', error);
      throw error;
    }
  }

  async updateAbsence(id: string, absenceData: any): Promise<void> {
    try {
      await this.invokeIpc('updateAbsence', id, absenceData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'absence:', error);
      throw error;
    }
  }

  async deleteAbsence(id: string): Promise<void> {
    try {
      console.log('=== DEBUG deleteAbsence dans studentService ===');
      console.log('ID reçu:', id);
      console.log('Type de ID:', typeof id);
      console.log('ID stringifié:', JSON.stringify(id));
      
      await this.invokeIpc('deleteAbsence', id);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'absence:', error);
      throw error;
    }
  }

  private calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  private generateId(): string {
    return 'STU-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  private generateMatricule(): string {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `MAT-${year}-${random}`;
  }
}

export const studentService = new StudentService();
