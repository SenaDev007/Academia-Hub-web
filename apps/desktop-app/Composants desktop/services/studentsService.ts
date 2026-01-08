import { Student, Class, Absence, DisciplineIncident, ClassTransfer, StudentStats } from '../hooks/useStudentsData';
import { api, apiClient } from '../lib/api/client';

/**
 * Students Service - Web SaaS Version
 * Utilise l'API HTTP au lieu d'Electron IPC
 */
class StudentsService {
  // Students
  async getStudents(schoolId: string, filters?: any): Promise<Student[]> {
    try {
      const response = await api.students.getAll();
      return response.data;
    } catch (error) {
      console.error('Error in getStudents:', error);
      throw error;
    }
  }

  async getStudentById(id: string): Promise<Student> {
    try {
      const response = await api.students.getById(id);
      return response.data;
    } catch (error) {
      console.error('Error in getStudentById:', error);
      throw error;
    }
  }

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    try {
      const response = await api.students.create(studentData);
      return response.data;
    } catch (error) {
      console.error('Error in createStudent:', error);
      throw error;
    }
  }

  async updateStudent(id: string, studentData: Partial<Student>): Promise<Student> {
    try {
      const response = await api.students.update(id, studentData);
      return response.data;
    } catch (error) {
      console.error('Error in updateStudent:', error);
      throw error;
    }
  }

  async deleteStudent(id: string): Promise<void> {
    try {
      await api.students.delete(id);
    } catch (error) {
      console.error('Error in deleteStudent:', error);
      throw error;
    }
  }

  // Classes
  // TODO: Implémenter via API /api/classes quand l'endpoint sera créé
  async getClasses(schoolId: string): Promise<Class[]> {
    try {
      // TODO: Adapter quand l'endpoint /api/classes sera créé
      const response = await apiClient.get('/classes');
      return response.data;
    } catch (error) {
      console.error('Error in getClasses:', error);
      throw error;
    }
  }

  // Absences
  // TODO: Implémenter via API /api/absences quand l'endpoint sera créé
  async getAbsences(schoolId: string, filters?: any): Promise<Absence[]> {
    try {
      // TODO: Adapter quand l'endpoint /api/absences sera créé
      const response = await apiClient.get('/absences', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error in getAbsences:', error);
      throw error;
    }
  }

  async createAbsence(absenceData: Partial<Absence>): Promise<Absence> {
    try {
      // TODO: Adapter quand l'endpoint /api/absences sera créé
      const response = await apiClient.post('/absences', absenceData);
      return response.data;
    } catch (error) {
      console.error('Error in createAbsence:', error);
      throw error;
    }
  }

  async updateAbsence(id: string, absenceData: Partial<Absence>): Promise<Absence> {
    try {
      // TODO: Adapter quand l'endpoint /api/absences sera créé
      const response = await apiClient.patch(`/absences/${id}`, absenceData);
      return response.data;
    } catch (error) {
      console.error('Error in updateAbsence:', error);
      throw error;
    }
  }

  async deleteAbsence(id: string): Promise<void> {
    try {
      // TODO: Adapter quand l'endpoint /api/absences sera créé
      await apiClient.delete(`/absences/${id}`);
    } catch (error) {
      console.error('Error in deleteAbsence:', error);
      throw error;
    }
  }

  // Discipline
  // TODO: Implémenter via API /api/discipline quand l'endpoint sera créé
  async getDisciplineIncidents(schoolId: string, filters?: any): Promise<DisciplineIncident[]> {
    try {
      // TODO: Adapter quand l'endpoint /api/discipline sera créé
      const response = await apiClient.get('/discipline', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error in getDisciplineIncidents:', error);
      throw error;
    }
  }

  async createDisciplineIncident(incidentData: Partial<DisciplineIncident>): Promise<DisciplineIncident> {
    try {
      // TODO: Adapter quand l'endpoint /api/discipline sera créé
      const response = await apiClient.post('/discipline', incidentData);
      return response.data;
    } catch (error) {
      console.error('Error in createDisciplineIncident:', error);
      throw error;
    }
  }

  async updateDisciplineIncident(id: string, incidentData: Partial<DisciplineIncident>): Promise<DisciplineIncident> {
    try {
      // TODO: Adapter quand l'endpoint /api/discipline sera créé
      const response = await apiClient.patch(`/discipline/${id}`, incidentData);
      return response.data;
    } catch (error) {
      console.error('Error in updateDisciplineIncident:', error);
      throw error;
    }
  }

  async deleteDisciplineIncident(id: string): Promise<void> {
    try {
      // TODO: Adapter quand l'endpoint /api/discipline sera créé
      await apiClient.delete(`/discipline/${id}`);
    } catch (error) {
      console.error('Error in deleteDisciplineIncident:', error);
      throw error;
    }
  }

  // Transfers
  // TODO: Implémenter via API /api/transfers quand l'endpoint sera créé
  async getClassTransfers(schoolId: string, filters?: any): Promise<ClassTransfer[]> {
    try {
      // TODO: Adapter quand l'endpoint /api/transfers sera créé
      const response = await apiClient.get('/transfers', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error in getClassTransfers:', error);
      throw error;
    }
  }

  async createClassTransfer(transferData: Partial<ClassTransfer>): Promise<ClassTransfer> {
    try {
      // TODO: Adapter quand l'endpoint /api/transfers sera créé
      const response = await apiClient.post('/transfers', transferData);
      return response.data;
    } catch (error) {
      console.error('Error in createClassTransfer:', error);
      throw error;
    }
  }

  async updateClassTransfer(id: string, transferData: Partial<ClassTransfer>): Promise<ClassTransfer> {
    try {
      // TODO: Adapter quand l'endpoint /api/transfers sera créé
      const response = await apiClient.patch(`/transfers/${id}`, transferData);
      return response.data;
    } catch (error) {
      console.error('Error in updateClassTransfer:', error);
      throw error;
    }
  }

  async deleteClassTransfer(id: string): Promise<void> {
    try {
      // TODO: Adapter quand l'endpoint /api/transfers sera créé
      await apiClient.delete(`/transfers/${id}`);
    } catch (error) {
      console.error('Error in deleteClassTransfer:', error);
      throw error;
    }
  }

  // Statistics
  // TODO: Implémenter via API /api/students/stats quand l'endpoint sera créé
  async getStudentStats(schoolId: string): Promise<StudentStats> {
    try {
      // TODO: Adapter quand l'endpoint /api/students/stats sera créé
      const response = await apiClient.get('/students/stats');
      return response.data;
    } catch (error) {
      console.error('Error in getStudentStats:', error);
      throw error;
    }
  }
}

export const studentsService = new StudentsService();
