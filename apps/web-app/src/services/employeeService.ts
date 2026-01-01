// electronAPI est disponible globalement dans l'application

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email?: string;
  phone?: string;
  position: string;
  department: string;
  canTeach: boolean;
  status: 'active' | 'inactive' | 'suspended';
  hireDate: string;
  contractType: 'permanent' | 'temporary' | 'intern' | 'consultant';
  hourlyRate?: number;
  monthlySalary?: number;
  schoolId: string;
}

class EmployeeService {
  private static instance: EmployeeService;
  private electronAPI: any;

  constructor() {
    this.electronAPI = (window as any).electronAPI;
  }

  static getInstance(): EmployeeService {
    if (!EmployeeService.instance) {
      EmployeeService.instance = new EmployeeService();
    }
    return EmployeeService.instance;
  }

  /**
   * Récupérer tous les employés de l'école (depuis la table teachers - tous postes confondus)
   */
  async getAllEmployees(schoolId: string): Promise<Employee[]> {
    try {
      if (!this.electronAPI?.database?.executeQuery) {
        console.warn('API database non disponible');
        return [];
      }

      // Récupérer TOUS les employés depuis la table teachers (enseignants + personnel)
      const sql = `
        SELECT 
          t.id,
          t.firstName,
          t.lastName,
          t.email,
          t.phone,
          t.departmentId,
          t.hireDate,
          t.schoolId,
          p.canTeach,
          p.name as positionName,
          p.category as positionCategory
        FROM teachers t
        LEFT JOIN positions p ON t.positionId = p.id
        WHERE t.schoolId = ?
        ORDER BY t.firstName, t.lastName
      `;

      const result = await this.electronAPI.database.executeQuery(sql, [schoolId]);
      
      if (result.success && result.results) {
        return result.results.map((emp: any) => ({
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          name: `${emp.firstName} ${emp.lastName}`,
          email: emp.email,
          phone: emp.phone,
          position: emp.positionName || 'Employé',
          department: emp.positionCategory || 'Général',
          canTeach: emp.canTeach === 1,
          status: 'active',
          hireDate: emp.hireDate,
          contractType: 'permanent',
          hourlyRate: null,
          monthlySalary: null,
          schoolId: emp.schoolId
        }));
      }

      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error);
      return [];
    }
  }

  /**
   * Récupérer les employés par département
   */
  async getEmployeesByDepartment(schoolId: string, department: string): Promise<Employee[]> {
    try {
      const allEmployees = await this.getAllEmployees(schoolId);
      return allEmployees.filter(emp => emp.department === department);
    } catch (error) {
      console.error('Erreur lors de la récupération des employés par département:', error);
      return [];
    }
  }

  /**
   * Récupérer les enseignants uniquement (canTeach = true)
   */
  async getTeachers(schoolId: string): Promise<Employee[]> {
    try {
      const allEmployees = await this.getAllEmployees(schoolId);
      return allEmployees.filter(emp => emp.canTeach);
    } catch (error) {
      console.error('Erreur lors de la récupération des enseignants:', error);
      return [];
    }
  }

  /**
   * Récupérer le personnel non-enseignant (canTeach = false)
   */
  async getNonTeachingStaff(schoolId: string): Promise<Employee[]> {
    try {
      const allEmployees = await this.getAllEmployees(schoolId);
      return allEmployees.filter(emp => !emp.canTeach);
    } catch (error) {
      console.error('Erreur lors de la récupération du personnel non-enseignant:', error);
      return [];
    }
  }

  /**
   * Récupérer un employé par ID (depuis la table teachers)
   */
  async getEmployeeById(employeeId: string): Promise<Employee | null> {
    try {
      if (!this.electronAPI?.database?.executeQuery) {
        console.warn('API database non disponible');
        return null;
      }

      const sql = `
        SELECT 
          t.id,
          t.firstName,
          t.lastName,
          t.email,
          t.phone,
          t.position,
          t.department,
          t.status,
          t.hireDate,
          t.contractType,
          t.hourlyRate,
          t.monthlySalary,
          t.schoolId,
          p.canTeach,
          p.name as positionName
        FROM teachers t
        LEFT JOIN positions p ON t.positionId = p.id
        WHERE t.id = ?
      `;

      const result = await this.electronAPI.database.executeQuery(sql, [employeeId]);
      
      if (result.success && result.results && result.results.length > 0) {
        const emp = result.results[0];
        return {
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          name: `${emp.firstName} ${emp.lastName}`,
          email: emp.email,
          phone: emp.phone,
          position: emp.positionName || emp.position || 'Enseignant',
          department: emp.department || 'Éducation',
          canTeach: emp.canTeach === 1,
          status: emp.status || 'active',
          hireDate: emp.hireDate,
          contractType: emp.contractType || 'permanent',
          hourlyRate: emp.hourlyRate,
          monthlySalary: emp.monthlySalary,
          schoolId: emp.schoolId
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'employé:', error);
      return null;
    }
  }

  /**
   * Récupérer les départements disponibles
   */
  async getDepartments(schoolId: string): Promise<string[]> {
    try {
      const allEmployees = await this.getAllEmployees(schoolId);
      const departments = [...new Set(allEmployees.map(emp => emp.department))];
      return departments.sort();
    } catch (error) {
      console.error('Erreur lors de la récupération des départements:', error);
      return [];
    }
  }
}

export const employeeService = EmployeeService.getInstance();
