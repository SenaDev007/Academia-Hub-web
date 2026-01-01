// Types pour le module Ressources Humaines (RH)

export interface Teacher {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  address: string;
  phone: string;
  email: string;
  departmentId: string;
  position: string;
  specialization: string;
  subjectId: string;
  hireDate: string;
  contractType: 'CDI' | 'CDD' | 'Stage' | 'Freelance' | 'Interim';
  status: 'active' | 'inactive' | 'on-leave' | 'terminated' | 'retired';
  workingHours: number;
  salary: number;
  bankDetails: string;
  emergencyContact: string;
  qualifications: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  schoolId: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
  schoolId: string;
}

export interface Contract {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  contractType: 'CDI' | 'CDD' | 'Stage' | 'Freelance' | 'Interim';
  startDate: string;
  endDate?: string;
  salary: number;
  workingHours: string;
  status: 'active' | 'expired' | 'terminated' | 'pending';
  renewalDate?: string;
  probationPeriod?: number;
  noticePeriod?: number;
  createdAt: string;
  updatedAt: string;
  schoolId: string;
}

export interface Evaluation {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  evaluationDate: string;
  evaluator: string;
  overallScore: number;
  criteria: {
    pedagogy?: number;
    communication: number;
    teamwork: number;
    innovation: number;
    punctuality: number;
    quality: number;
    leadership?: number;
  };
  objectives: string[];
  strengths: string[];
  areasForImprovement: string[];
  nextEvaluation: string;
  status: 'draft' | 'submitted' | 'approved' | 'completed';
  comments?: string;
  createdAt: string;
  updatedAt: string;
  schoolId: string;
}

export interface Training {
  id: string;
  title: string;
  category: string;
  instructor: string;
  startDate: string;
  endDate: string;
  duration: string;
  participants: number;
  cost: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  description?: string;
  objectives?: string[];
  materials?: string[];
  location?: string;
  maxParticipants?: number;
  createdAt: string;
  updatedAt: string;
  schoolId: string;
}

export interface Payroll {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  grossSalary: number;
  netSalary: number;
  socialCharges: number;
  taxes: number;
  bonuses: number;
  deductions: number;
  workingDays: number;
  overtimeHours: number;
  overtimeRate: number;
  status: 'draft' | 'calculated' | 'approved' | 'paid';
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
  schoolId: string;
}

export interface TeacherAvailability {
  id: string;
  teacherId: string;
  dayOfWeek: number; // 0-6 (Dimanche-Samedi)
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  schoolId: string;
}

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  academicYear: string;
  semester: string;
  hoursPerWeek: number;
  isMainTeacher: boolean;
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'completed';
  createdAt: string;
  updatedAt: string;
  schoolId: string;
}

// Types pour les statistiques RH
export interface HRStats {
  totalTeachers: number;
  activeTeachers: number;
  totalSalary: number;
  averageSalary: number;
  contractsExpiring: number;
  evaluationsPending: number;
  trainingsThisMonth: number;
  satisfactionScore: number;
}

// Types pour les filtres et recherche
export interface TeacherFilters {
  department?: string;
  status?: string;
  contractType?: string;
  subject?: string;
  searchTerm?: string;
}

export interface ContractFilters {
  status?: string;
  contractType?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

// Types pour les réponses API
export interface HRDataResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  message?: string;
}

export interface HRSingleResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
