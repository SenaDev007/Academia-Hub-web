/**
 * Types API pour Academia Hub Web SaaS
 * 
 * Remplace electron.d.ts pour la version Web
 * Tous les types correspondent aux réponses de l'API REST
 */

// Types de base
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Authentification
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  tenant: Tenant;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}

// Utilisateur
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  tenantId: string;
  status: 'active' | 'inactive' | 'suspended';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tenant
export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: 'active' | 'suspended' | 'cancelled';
  primaryEmail?: string;
  primaryPhone?: string;
  address?: string;
  website?: string;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Student
export interface Student {
  id: string;
  tenantId: string;
  educmasterNumber?: string;
  firstName: string;
  lastName: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  address?: string;
  phone?: string;
  email?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentName?: string;
  classId?: string;
  enrollmentDate?: string;
  enrollmentStatus: 'active' | 'graduated' | 'transferred' | 'expelled' | 'inactive';
  photoUrl?: string;
  identityDocumentType?: string;
  identityDocumentNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  address?: string;
  phone?: string;
  email?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentName?: string;
  classId?: string;
  enrollmentDate?: string;
  photoUrl?: string;
  identityDocumentType?: string;
  identityDocumentNumber?: string;
  notes?: string;
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {}

// Teacher
export interface Teacher {
  id: string;
  tenantId: string;
  matricule: string;
  firstName: string;
  lastName: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  address?: string;
  phone?: string;
  email?: string;
  departmentId?: string;
  position?: string;
  specialization?: string;
  subjectId?: string;
  academicYearId?: string;
  hireDate?: string;
  contractType?: 'CDI' | 'CDD' | 'Stage' | 'Freelance' | 'Interim';
  status: 'active' | 'inactive' | 'on-leave' | 'terminated' | 'retired';
  workingHours?: number;
  salary?: number;
  bankDetails?: string;
  emergencyContact?: string;
  qualifications?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Class
export interface Class {
  id: string;
  tenantId: string;
  name: string;
  level: string;
  academicYearId?: string;
  capacity?: number;
  mainTeacherId?: string;
  roomId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Subject
export interface Subject {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  level: string;
  coefficient: number;
  academicYearId?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment
export interface Payment {
  id: string;
  tenantId: string;
  studentId: string;
  feeConfigurationId?: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money' | 'check' | 'other';
  paymentDate: string;
  reference?: string;
  receiptNumber?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Academic Year
export interface AcademicYear {
  id: string;
  tenantId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

// Quarter
export interface Quarter {
  id: string;
  tenantId: string;
  academicYearId: string;
  name: string;
  number: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
}

// Request options
export interface RequestOptions {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

