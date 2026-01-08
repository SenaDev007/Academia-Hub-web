// Utiliser une importation compatible avec Vite/Electron
// import { v4 as uuidv4 } from 'uuid';
import { api } from '../lib/api/client';

// Fonction utilitaire pour récupérer le schoolId du tenant actuel
export function getCurrentSchoolId(): string {
  try {
    const tenant = localStorage.getItem('tenant');
    if (tenant) {
      const tenantData = JSON.parse(tenant);
      return tenantData.id || 'school-1';
    }
  } catch (error) {
    console.warn('Erreur lors de la récupération du tenant:', error);
  }
  return 'school-1';
}

// Types pour le service dataService
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  classId: string;
  registrationNumber: string;
  medicalInfo?: string;
  notes?: string;
  status: 'active' | 'inactive';
  // Nouveaux champs pour les frais scolaires
  seniority?: 'new' | 'old';
  inscriptionFee?: number;
  reinscriptionFee?: number;
  tuitionFee?: number;
  totalSchoolFees?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subjectId: string;
  qualification: string;
  experience: number;
  hireDate: string;
  salary: number;
  address: string;
  emergencyContact: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  level: string;
  capacity: number;
  teacherId?: string;
  roomId?: string;
  academicYear: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  id: string;
  name: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  date: string;
  duration: number;
  maxScore: number;
  passingScore: number;
  type: 'quiz' | 'assignment' | 'exam' | 'project';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  id: string;
  studentId: string;
  examId: string;
  score: number;
  grade: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  roomId?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CahierJournalEntry {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  scheduleId?: string;
  date: string;
  startTime: string;
  endTime: string;
  content: string;
  homework?: string;
  observations?: string;
  isValidated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'mobile_money';
  reference: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecentStudent {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  createdAt: string;
}

export interface RecentAbsence {
  id: string;
  studentName: string;
  className: string;
  date: string;
}

export interface UpcomingExam {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
  location?: string;
}

export interface UpcomingMeeting {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
  location?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalPayments: number;
  totalRevenue: number;
}

// Interface pour les appels IPC
interface ElectronAPI {
  database: {
    query: (sql: string, params?: any[]) => Promise<any[]>;
    get: (sql: string, params?: any[]) => Promise<any>;
    run: (sql: string, params?: any[]) => Promise<any>;
  };
}

// Alternative UUID generation compatible avec Vite
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback simple pour le développement
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Vérifier si nous sommes dans Electron
const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

class DataService {
  private isInitialized = false;
  private electronAPI: any = null;

  constructor() {
    if (isElectron) {
      this.electronAPI = (window as any).electronAPI;
    }
  }

  private async ensureElectronAPI() {
    if (!this.electronAPI && isElectron) {
      console.log('🔄 Attente de l\'API Electron...');
      // Attendre que l'API soit disponible
      let attempts = 0;
      while (!this.electronAPI && attempts < 100) { // Augmenté à 100 tentatives (10 secondes)
        this.electronAPI = (window as any).electronAPI;
        if (!this.electronAPI) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
          if (attempts % 10 === 0) {
            console.log(`🔄 Tentative ${attempts}/100 - API non disponible`);
          }
        }
      }
      
      if (this.electronAPI) {
        console.log('✅ API Electron chargée avec succès');
        if (this.electronAPI.database) {
          console.log('✅ Database API disponible');
        } else {
          console.log('⚠️ Database API non disponible');
        }
      } else {
        console.log('❌ API Electron non disponible après 10 secondes');
      }
    }
    return this.electronAPI;
  }

  private generateId(): string {
    return generateUUID();
  }

  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  // === STUDENTS ===
  async getStudents(filters: any = {}): Promise<Student[]> {
    if (!isElectron || !this.electronAPI) {
      return this.getMockStudents(filters);
    }

    let sql = 'SELECT * FROM students WHERE 1=1';
    const params: any[] = [];

    if (filters.classId) {
      sql += ' AND classId = ?';
      params.push(filters.classId);
    }

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.search) {
      sql += ' AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY lastName, firstName';

    return this.electronAPI.database.query(sql, params);
  }

  async getStudent(id: string): Promise<Student | null> {
    if (!isElectron || !this.electronAPI) {
      return this.getMockStudents().find(s => s.id === id) || null;
    }

    const sql = 'SELECT * FROM students WHERE id = ?';
    return this.electronAPI.database.get(sql, [id]);
  }

  async createStudent(data: Partial<Student>): Promise<Student> {
    if (!isElectron || !this.electronAPI) {
      const mockStudent = {
        id: this.generateId(),
        ...data,
        status: 'active' as const,
        createdAt: this.getCurrentTimestamp(),
        updatedAt: this.getCurrentTimestamp(),
      } as Student;
      return mockStudent;
    }

    const id = this.generateId();
    const sql = `
      INSERT INTO students (id, firstName, lastName, email, phone, dateOfBirth, 
                           gender, address, parentName, parentPhone, parentEmail, 
                           classId, registrationNumber, medicalInfo, notes, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      id,
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.dateOfBirth,
      data.gender,
      data.address,
      data.parentName,
      data.parentPhone,
      data.parentEmail,
      data.classId,
      data.registrationNumber,
      data.medicalInfo,
      data.notes,
      'active',
      this.getCurrentTimestamp(),
      this.getCurrentTimestamp()
    ];

    await this.electronAPI.database.run(sql, params);
    return this.getStudent(id);
  }

  async updateStudent(id: string, data: Partial<Student>): Promise<Student | null> {
    if (!isElectron || !this.electronAPI) {
      return null;
    }

    const sql = `
      UPDATE students 
      SET firstName = ?, lastName = ?, email = ?, phone = ?, dateOfBirth = ?,
          gender = ?, address = ?, parentName = ?, parentPhone = ?, parentEmail = ?,
          classId = ?, registrationNumber = ?, medicalInfo = ?, notes = ?, updatedAt = ?
      WHERE id = ?
    `;
    
    const params = [
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.dateOfBirth,
      data.gender,
      data.address,
      data.parentName,
      data.parentPhone,
      data.parentEmail,
      data.classId,
      data.registrationNumber,
      data.medicalInfo,
      data.notes,
      this.getCurrentTimestamp(),
      id
    ];

    await this.electronAPI.database.run(sql, params);
    return this.getStudent(id);
  }

  async deleteStudent(id: string): Promise<void> {
    if (!isElectron || !this.electronAPI) {
      return;
    }

    const sql = 'DELETE FROM students WHERE id = ?';
    await this.electronAPI.database.run(sql, [id]);
  }

  // === TEACHERS ===
  async getTeachers(filters: any = {}): Promise<Teacher[]> {
    if (!isElectron || !this.electronAPI) {
      return this.getMockTeachers(filters);
    }

    let sql = 'SELECT * FROM teachers WHERE 1=1';
    const params: any[] = [];

    if (filters.subjectId) {
      sql += ' AND subjectId = ?';
      params.push(filters.subjectId);
    }

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    sql += ' ORDER BY lastName, firstName';
    return this.electronAPI.database.query(sql, params);
  }

  async getTeacher(id: string): Promise<Teacher | null> {
    if (!isElectron || !this.electronAPI) {
      return this.getMockTeachers().find(t => t.id === id) || null;
    }

    const sql = 'SELECT * FROM teachers WHERE id = ?';
    return this.electronAPI.database.get(sql, [id]);
  }

  async createTeacher(data: Partial<Teacher>): Promise<Teacher> {
    // En mode non-Electron, retourner un mock
    if (!isElectron || !this.electronAPI) {
      const mockTeacher = {
        id: this.generateId(),
        ...data,
        status: 'active' as const,
        createdAt: this.getCurrentTimestamp(),
        updatedAt: this.getCurrentTimestamp(),
      } as Teacher;
      return mockTeacher;
    }

    // Alignement avec le flux Encaissements: passer par l'API IPC hr.createTeacher
    try {
      if (this.electronAPI.hr && this.electronAPI.hr.createTeacher) {
        const result = await this.electronAPI.hr.createTeacher({
          ...data,
        });
        return result?.data || (await this.getTeacher(result?.data?.id)) || (data as Teacher);
      }
    } catch (error) {
      console.error('Error creating teacher via IPC hr.createTeacher:', error);
      // Fallback DB direct si nécessaire
    }

    // Fallback: tentative d'insertion directe si l'IPC n'est pas disponible
    const id = this.generateId();
    const sql = `
      INSERT INTO teachers (id, matricule, firstName, lastName, gender, dateOfBirth, nationality, address, phone, email,
                           departmentId, positionId, subjectId, qualifications, experienceYears, hireDate, status, description,
                           emergencyContact, photo, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const now = this.getCurrentTimestamp();
    const params = [
      id,
      (data as any).matricule || null,
      data.firstName || null,
      data.lastName || null,
      (data as any).gender || null,
      (data as any).dateOfBirth || null,
      (data as any).nationality || null,
      data.address || null,
      data.phone || null,
      data.email || null,
      (data as any).departmentId || null,
      (data as any).positionId || null,
      (data as any).subjectId || null,
      (data as any).qualifications || null,
      (data as any).experienceYears ?? 0,
      (data as any).hireDate || null,
      (data as any).status || 'active',
      (data as any).description || null,
      (data as any).emergencyContact || null,
      (data as any).photo || null,
      now,
      now
    ];

    await this.electronAPI.database.run(sql, params);
    return this.getTeacher(id);
  }

  async updateTeacher(id: string, data: Partial<Teacher>): Promise<Teacher | null> {
    if (!isElectron || !this.electronAPI) {
      return null;
    }

    // Alignement avec Encaissements: passer par IPC hr.updateTeacher
    try {
      if (this.electronAPI.hr && this.electronAPI.hr.updateTeacher) {
        const result = await this.electronAPI.hr.updateTeacher(id, data);
        return result?.data || (await this.getTeacher(id));
      }
    } catch (error) {
      console.error('Error updating teacher via IPC hr.updateTeacher:', error);
      // Fallback DB direct si nécessaire
    }

    // Fallback: mise à jour directe minimale sur quelques champs clés
    const now = this.getCurrentTimestamp();
    const sql = `
      UPDATE teachers SET 
        firstName = COALESCE(?, firstName),
        lastName = COALESCE(?, lastName),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        departmentId = COALESCE(?, departmentId),
        positionId = COALESCE(?, positionId),
        subjectId = COALESCE(?, subjectId),
        qualifications = COALESCE(?, qualifications),
        experienceYears = COALESCE(?, experienceYears),
        hireDate = COALESCE(?, hireDate),
        description = COALESCE(?, description),
        emergencyContact = COALESCE(?, emergencyContact),
        photo = COALESCE(?, photo),
        updatedAt = ?
      WHERE id = ?
    `;
    const params = [
      data.firstName ?? null,
      data.lastName ?? null,
      (data as any).email ?? null,
      (data as any).phone ?? null,
      (data as any).address ?? null,
      (data as any).departmentId ?? null,
      (data as any).positionId ?? null,
      (data as any).subjectId ?? null,
      (data as any).qualifications ?? null,
      (data as any).experienceYears ?? null,
      (data as any).hireDate ?? null,
      (data as any).description ?? null,
      (data as any).emergencyContact ?? null,
      (data as any).photo ?? null,
      now,
      id
    ];
    await this.electronAPI.database.run(sql, params);
    return this.getTeacher(id);
  }

  // === CLASSES ===
  async getClasses(): Promise<Class[]> {
    if (!isElectron || !this.electronAPI) {
      return this.getMockClasses();
    }

    const sql = 'SELECT * FROM classes ORDER BY name';
    return this.electronAPI.database.query(sql);
  }

  async getClass(id: string): Promise<Class | null> {
    if (!isElectron || !this.electronAPI) {
      return this.getMockClasses().find(c => c.id === id) || null;
    }

    const sql = 'SELECT * FROM classes WHERE id = ?';
    return this.electronAPI.database.get(sql, [id]);
  }

  async createClass(data: Partial<Class>): Promise<Class> {
    if (!isElectron || !this.electronAPI) {
      const mockClass = {
        id: this.generateId(),
        ...data,
        createdAt: this.getCurrentTimestamp(),
        updatedAt: this.getCurrentTimestamp(),
      } as Class;
      return mockClass;
    }

    const id = this.generateId();
    const sql = `
      INSERT INTO classes (id, name, level, capacity, teacherId, roomId, academicYear, description, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      id,
      data.name,
      data.level,
      data.capacity,
      data.teacherId,
      data.roomId,
      data.academicYear,
      data.description,
      this.getCurrentTimestamp(),
      this.getCurrentTimestamp()
    ];

    await this.electronAPI.database.run(sql, params);
    return this.getClass(id);
  }

  // === EXAMS ===
  async getExams(filters: any = {}): Promise<Exam[]> {
    if (!isElectron || !this.electronAPI) {
      return this.getMockExams(filters);
    }

    let sql = `
      SELECT e.*, s.name as subjectName, c.name as className, 
             t.firstName || ' ' || t.lastName as teacherName
      FROM exams e
      LEFT JOIN subjects s ON e.subjectId = s.id
      LEFT JOIN classes c ON e.classId = c.id
      LEFT JOIN teachers t ON e.teacherId = t.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.classId) {
      sql += ' AND e.classId = ?';
      params.push(filters.classId);
    }

    if (filters.subjectId) {
      sql += ' AND e.subjectId = ?';
      params.push(filters.subjectId);
    }

    if (filters.teacherId) {
      sql += ' AND e.teacherId = ?';
      params.push(filters.teacherId);
    }

    sql += ' ORDER BY e.date DESC';
    return this.electronAPI.database.query(sql, params);
  }

  async getExam(id: string): Promise<Exam | null> {
    if (!isElectron || !this.electronAPI) {
      return this.getMockExams().find(e => e.id === id) || null;
    }

    const sql = 'SELECT * FROM exams WHERE id = ?';
    return this.electronAPI.database.get(sql, [id]);
  }

  async createExam(data: Partial<Exam>): Promise<Exam> {
    if (!isElectron || !this.electronAPI) {
      const mockExam = {
        id: this.generateId(),
        ...data,
        createdAt: this.getCurrentTimestamp(),
        updatedAt: this.getCurrentTimestamp(),
      } as Exam;
      return mockExam;
    }

    const id = this.generateId();
    const sql = `
      INSERT INTO exams (id, name, subjectId, classId, teacherId, date, duration, 
                       maxScore, passingScore, type, description, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      id,
      data.name,
      data.subjectId,
      data.classId,
      data.teacherId,
      data.date,
      data.duration,
      data.maxScore,
      data.passingScore,
      data.type,
      data.description,
      this.getCurrentTimestamp(),
      this.getCurrentTimestamp()
    ];

    await this.electronAPI.database.run(sql, params);
    return this.getExam(id);
  }

  // === GRADES ===
  async getGrades(examId: string): Promise<Grade[]> {
    if (!isElectron || !this.electronAPI) {
      return this.getMockGrades().filter(g => g.examId === examId);
    }

    const sql = `
      SELECT g.*, s.firstName || ' ' || s.lastName as studentName
      FROM grades g
      JOIN students s ON g.studentId = s.id
      WHERE g.examId = ?
      ORDER BY s.lastName, s.firstName
    `;
    return this.electronAPI.database.query(sql, [examId]);
  }

  async createGrade(data: Partial<Grade>): Promise<string> {
    if (!isElectron || !this.electronAPI) {
      return this.generateId();
    }

    const id = this.generateId();
    const sql = `
      INSERT INTO grades (id, studentId, examId, score, grade, remarks, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      id,
      data.studentId,
      data.examId,
      data.score,
      data.grade,
      data.remarks,
      this.getCurrentTimestamp(),
      this.getCurrentTimestamp()
    ];

    await this.electronAPI.database.run(sql, params);
    return id;
  }

  // === SCHEDULES ===
  async getSchedules(filters: any = {}): Promise<Schedule[]> {
    if (!isElectron || !this.electronAPI) {
      return this.getMockSchedules(filters);
    }

    let sql = `
      SELECT s.*, c.name as className, sub.name as subjectName, 
             t.firstName || ' ' || t.lastName as teacherName, r.name as roomName
      FROM schedules s
      LEFT JOIN classes c ON s.classId = c.id
      LEFT JOIN subjects sub ON s.subjectId = sub.id
      LEFT JOIN teachers t ON s.teacherId = t.id
      LEFT JOIN rooms r ON s.roomId = r.id
      WHERE s.isActive = 1
    `;
    const params: any[] = [];

    if (filters.classId) {
      sql += ' AND s.classId = ?';
      params.push(filters.classId);
    }

    if (filters.teacherId) {
      sql += ' AND s.teacherId = ?';
      params.push(filters.teacherId);
    }

    if (filters.dayOfWeek) {
      sql += ' AND s.dayOfWeek = ?';
      params.push(filters.dayOfWeek);
    }

    sql += ' ORDER BY s.dayOfWeek, s.startTime';
    return this.electronAPI.database.query(sql, params);
  }

  // === CAHIER JOURNAL ===
  async getCahierJournalEntries(filters: any = {}): Promise<CahierJournalEntry[]> {
    if (!isElectron || !this.electronAPI) {
      return this.getMockCahierJournalEntries(filters);
    }

    let sql = `
      SELECT cj.*, cl.name as className, sub.name as subjectName,
             t.firstName || ' ' || t.lastName as teacherName
      FROM cahier_journal cj
      LEFT JOIN classes cl ON cj.classId = cl.id
      LEFT JOIN subjects sub ON cj.subjectId = sub.id
      LEFT JOIN teachers t ON cj.teacherId = t.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.classId) {
      sql += ' AND cj.classId = ?';
      params.push(filters.classId);
    }

    if (filters.teacherId) {
      sql += ' AND cj.teacherId = ?';
      params.push(filters.teacherId);
    }

    if (filters.date) {
      sql += ' AND cj.date = ?';
      params.push(filters.date);
    }

    sql += ' ORDER BY cj.date DESC, cj.startTime';
    return this.electronAPI.database.query(sql, params);
  }

  async createCahierJournalEntry(data: Partial<CahierJournalEntry>): Promise<string> {
    if (!isElectron || !this.electronAPI) {
      return this.generateId();
    }

    const id = this.generateId();
    const sql = `
      INSERT INTO cahier_journal (id, classId, subjectId, teacherId, scheduleId, 
                                date, startTime, endTime, content, homework, observations, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      id,
      data.classId,
      data.subjectId,
      data.teacherId,
      data.scheduleId,
      data.date,
      data.startTime,
      data.endTime,
      data.content,
      data.homework,
      data.observations,
      this.getCurrentTimestamp(),
      this.getCurrentTimestamp()
    ];

    await this.electronAPI.database.run(sql, params);
    return id;
  }

  // === PAYMENTS ===
  async getPayments(filters: any = {}): Promise<Payment[]> {
    if (!isElectron || !this.electronAPI) {
      return this.getMockPayments(filters);
    }

    try {
      const result = await this.electronAPI.finance.getPayments(filters.schoolId || getCurrentSchoolId(), filters);
      return result.data || [];
    } catch (error) {
      console.error('Error getting payments:', error);
      return this.getMockPayments(filters);
    }
  }

  async createPayment(data: Partial<Payment>): Promise<string> {
    if (!isElectron || !this.electronAPI) {
      return this.generateId();
    }

    try {
      const result = await this.electronAPI.finance.createPayment({
        ...data,
        schoolId: data.schoolId || getCurrentSchoolId()
      });
      return result.data?.id || this.generateId();
    } catch (error) {
      console.error('Error creating payment:', error);
      return this.generateId();
    }
  }

  // === DASHBOARD ===
  async getDashboardStats(): Promise<DashboardStats> {
    console.log('🔍 getDashboardStats - isElectron:', isElectron);
    
    if (!isElectron) {
      console.log('⚠️ Mode non-Electron - retour de données mockées');
      return {
        totalStudents: 150,
        totalTeachers: 12,
        totalClasses: 8,
        totalPayments: 245,
        totalRevenue: 1250000
      };
    }

    // S'assurer que l'API Electron est disponible
    console.log('🔍 Vérification de l\'API Electron...');
    const electronAPI = await this.ensureElectronAPI();
    console.log('🔍 electronAPI disponible:', !!electronAPI);
    console.log('🔍 electronAPI.database disponible:', !!electronAPI?.database);
    
    if (!electronAPI || !electronAPI.database) {
      console.warn('⚠️ Electron API ou database non disponible - retour de données mockées');
      return {
        totalStudents: 150,
        totalTeachers: 12,
        totalClasses: 8,
        totalPayments: 245,
        totalRevenue: 1250000
      };
    }

    const stats: DashboardStats = {} as DashboardStats;

    // Statistiques étudiants via l'API Students
    console.log('🔍 Récupération du nombre d\'étudiants...');
    try {
      try {
        const studentsResult = await api.students.getAll();
        const studentsData = studentsResult.data?.data || studentsResult.data || [];
        if (Array.isArray(studentsData)) {
          stats.totalStudents = studentsData.length;
          console.log('📊 Nombre d\'étudiants actifs:', stats.totalStudents);
        } else {
          stats.totalStudents = 0;
          console.log('⚠️ Pas de données d\'étudiants disponibles');
        }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des étudiants:', error);
      stats.totalStudents = 0;
    }

    // Statistiques enseignants via l'API Planning
    try {
      console.log('🔍 Récupération du nombre d\'enseignants...');
      try {
        const teachersResult = await api.planning.getTeachers(getCurrentSchoolId());
        const teachersData = teachersResult.data?.data || teachersResult.data || [];
        if (Array.isArray(teachersData)) {
          stats.totalTeachers = teachersData.length;
          console.log('📊 Nombre d\'enseignants actifs:', stats.totalTeachers);
        } else {
          stats.totalTeachers = 0;
          console.log('⚠️ Pas de données d\'enseignants disponibles');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des enseignants:', error);
        stats.totalTeachers = 0;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des enseignants:', error);
      stats.totalTeachers = 0;
    }

    // Statistiques classes via l'API Planning
    console.log('🔍 Récupération du nombre de classes...');
    try {
      try {
        const classesResult = await api.classes.getAll();
        const classesData = classesResult.data?.data || classesResult.data || [];
        if (Array.isArray(classesData)) {
          stats.totalClasses = classesData.length;
          console.log('📊 Nombre de classes:', stats.totalClasses);
        } else {
          stats.totalClasses = 0;
          console.log('⚠️ Pas de données de classes disponibles');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des classes:', error);
        stats.totalClasses = 0;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des classes:', error);
      stats.totalClasses = 0;
    }

    // Statistiques paiements via Finance API
    try {
      console.log('🔍 Récupération des statistiques financières...');
      
      // Utiliser l'API Finance
      try {
        console.log('✅ API finance disponible, récupération des données...');
        
        // Récupérer les paiements directement
        const paymentsResult = await api.finance.getPayments();
        console.log('📊 Résultat getPayments:', paymentsResult);
        
        const paymentsData = paymentsResult.data?.data || paymentsResult.data || [];
        if (Array.isArray(paymentsData)) {
          const payments = paymentsData;
          stats.totalPayments = payments.length;
          stats.totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          console.log('📊 Paiements totaux:', stats.totalPayments);
          console.log('📊 Revenus totaux:', stats.totalRevenue);
        } else {
          console.log('⚠️ Pas de données de paiements disponibles');
          stats.totalPayments = 0;
          stats.totalRevenue = 0;
        }
      } else {
        console.log('⚠️ API finance non disponible');
        stats.totalPayments = 0;
        stats.totalRevenue = 0;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques financières:', error);
      stats.totalPayments = 0;
      stats.totalRevenue = 0;
    }

    console.log('✅ Statistiques finales retournées:', stats);
    return stats;
  }

  // === FINANCE METHODS ===
  async getAllPayments(filters: any = {}): Promise<Payment[]> {
    return this.getPayments(filters);
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    if (!isElectron || !this.electronAPI) {
      return null;
    }

    try {
      const result = await this.electronAPI.finance.getPaymentById(id);
      return result.data || null;
    } catch (error) {
      console.error('Error getting payment by id:', error);
      return null;
    }
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment | null> {
    if (!isElectron || !this.electronAPI) {
      return null;
    }

    try {
      const result = await this.electronAPI.finance.updatePayment(id, data);
      return result.data || null;
    } catch (error) {
      console.error('Error updating payment:', error);
      return null;
    }
  }

  async deletePayment(id: string): Promise<boolean> {
    if (!isElectron || !this.electronAPI) {
      return false;
    }

    try {
      const result = await this.electronAPI.finance.deletePayment(id);
      return result.success || false;
    } catch (error) {
      console.error('Error deleting payment:', error);
      return false;
    }
  }

  // Expenses
  async getAllExpenses(filters: any = {}): Promise<any[]> {
    if (!isElectron || !this.electronAPI) {
      return [];
    }

    try {
      const result = await this.electronAPI.finance.getExpenses(filters.schoolId || getCurrentSchoolId(), filters);
      return result.data || [];
    } catch (error) {
      console.error('Error getting expenses:', error);
      return [];
    }
  }

  async getExpenseById(id: string): Promise<any | null> {
    if (!isElectron || !this.electronAPI) {
      return null;
    }

    try {
      const result = await this.electronAPI.finance.getExpenseById(id);
      return result.data || null;
    } catch (error) {
      console.error('Error getting expense by id:', error);
      return null;
    }
  }

  async createExpense(data: any): Promise<string> {
    if (!isElectron || !this.electronAPI) {
      return this.generateId();
    }

    try {
      const result = await this.electronAPI.finance.createExpense({
        ...data,
        schoolId: data.schoolId || getCurrentSchoolId()
      });
      return result.data?.id || this.generateId();
    } catch (error) {
      console.error('Error creating expense:', error);
      return this.generateId();
    }
  }

  async updateExpense(id: string, data: any): Promise<any | null> {
    if (!isElectron || !this.electronAPI) {
      return null;
    }

    try {
      const result = await this.electronAPI.finance.updateExpense(id, data);
      return result.data || null;
    } catch (error) {
      console.error('Error updating expense:', error);
      return null;
    }
  }

  async deleteExpense(id: string): Promise<boolean> {
    if (!isElectron || !this.electronAPI) {
      return false;
    }

    try {
      const result = await this.electronAPI.finance.deleteExpense(id);
      return result.success || false;
    } catch (error) {
      console.error('Error deleting expense:', error);
      return false;
    }
  }

  // Fee Structures
  async getAllFeeStructures(filters: any = {}): Promise<any[]> {
    if (!isElectron || !this.electronAPI) {
      return [];
    }

    try {
      const result = await this.electronAPI.finance.getFeeStructures(filters.schoolId || getCurrentSchoolId(), filters);
      return result.data || [];
    } catch (error) {
      console.error('Error getting fee structures:', error);
      return [];
    }
  }

  async getFeeStructureById(id: string): Promise<any | null> {
    if (!isElectron || !this.electronAPI) {
      return null;
    }

    try {
      // Note: This method might need to be implemented in the service
      return null;
    } catch (error) {
      console.error('Error getting fee structure by id:', error);
      return null;
    }
  }

  async createFeeStructure(data: any): Promise<string> {
    if (!isElectron || !this.electronAPI) {
      return this.generateId();
    }

    try {
      const result = await this.electronAPI.finance.createFeeStructure({
        ...data,
        schoolId: data.schoolId || getCurrentSchoolId()
      });
      return result.data?.id || this.generateId();
    } catch (error) {
      console.error('Error creating fee structure:', error);
      return this.generateId();
    }
  }

  async updateFeeStructure(id: string, data: any): Promise<any | null> {
    if (!isElectron || !this.electronAPI) {
      return null;
    }

    try {
      // Note: This method might need to be implemented in the service
      return null;
    } catch (error) {
      console.error('Error updating fee structure:', error);
      return null;
    }
  }

  // Fee Configurations
  async getFeeConfigurations(filters: any = {}): Promise<any[]> {
    // En mode développement Vite, retourner des données vides
    if (!isElectron || !this.electronAPI) {
      console.warn('Mode développement Vite - API Electron non disponible, retour de données vides');
      return [];
    }

    try {
      // Vérifier si la méthode existe
      if (!this.electronAPI.finance.getFeeConfigurations) {
        console.warn('getFeeConfigurations non disponible dans l\'API Electron');
        return [];
      }

      const result = await this.electronAPI.finance.getFeeConfigurations(getCurrentSchoolId(), filters);
      return result.data || [];
    } catch (error) {
      console.error('Error getting fee configurations:', error);
      return [];
    }
  }

  async createFeeConfiguration(data: any): Promise<string> {
    if (!isElectron) {
      console.warn('Mode développement - génération d\'ID local');
      return this.generateId();
    }

    // S'assurer que l'API Electron est disponible
    const electronAPI = await this.ensureElectronAPI();
    if (!electronAPI || !electronAPI.finance) {
      console.warn('⚠️ API Electron ou finance non disponible - génération d\'ID local');
      return this.generateId();
    }

    try {
      if (!electronAPI.finance.createFeeConfiguration) {
        console.warn('createFeeConfiguration non disponible dans l\'API Electron');
        return this.generateId();
      }

      console.log('💾 Appel de createFeeConfiguration avec les données:', data);
      const result = await electronAPI.finance.createFeeConfiguration({
        ...data,
        schoolId: data.schoolId || getCurrentSchoolId()
      });
      console.log('✅ Résultat de createFeeConfiguration:', result);
      return result.data?.id || this.generateId();
    } catch (error) {
      console.error('❌ Erreur lors de la création de la configuration de frais:', error);
      return this.generateId();
    }
  }

  async updateFeeConfiguration(id: string, data: any): Promise<any | null> {
    if (!isElectron || !this.electronAPI) {
      return null;
    }

    try {
      const result = await this.electronAPI.finance.updateFeeConfiguration(id, {
        ...data,
        schoolId: data.schoolId || getCurrentSchoolId()
      });
      return result.data || null;
    } catch (error) {
      console.error('Error updating fee configuration:', error);
      return null;
    }
  }

  async deleteFeeConfiguration(id: string, schoolId: string = getCurrentSchoolId()): Promise<boolean> {
    if (!isElectron || !this.electronAPI) {
      return false;
    }

    try {
      const result = await this.electronAPI.finance.deleteFeeConfiguration(id, schoolId);
      return result.success || false;
    } catch (error) {
      console.error('Error deleting fee configuration:', error);
      return false;
    }
  }

  async getFeeConfigurationByLevelAndYear(level: string, academicYearId: string, schoolId: string = getCurrentSchoolId()): Promise<any | null> {
    if (!isElectron || !this.electronAPI) {
      return null;
    }

    try {
      const result = await this.electronAPI.finance.getFeeConfigurationByLevelAndYear(level, academicYearId, schoolId);
      return result.data || null;
    } catch (error) {
      console.error('Error getting fee configuration by level and year:', error);
      return null;
    }
  }

  async deleteFeeStructure(id: string): Promise<boolean> {
    if (!isElectron || !this.electronAPI) {
      return false;
    }

    try {
      // Note: This method might need to be implemented in the service
      return false;
    } catch (error) {
      console.error('Error deleting fee structure:', error);
      return false;
    }
  }

  // Student Balance
  async getStudentBalance(studentId: string): Promise<any> {
    if (!isElectron || !this.electronAPI) {
      return { feesDue: 0, paymentsMade: 0, balance: 0 };
    }

    try {
      const result = await this.electronAPI.finance.getStudentBalance(studentId);
      return result.data || { feesDue: 0, paymentsMade: 0, balance: 0 };
    } catch (error) {
      console.error('Error getting student balance:', error);
      return { feesDue: 0, paymentsMade: 0, balance: 0 };
    }
  }

  // Finance Report
  async getFinanceReport(filters: any): Promise<any> {
    if (!isElectron || !this.electronAPI) {
      return null;
    }

    try {
      // Note: This method might need to be implemented in the service
      return null;
    } catch (error) {
      console.error('Error getting finance report:', error);
      return null;
    }
  }

  // === MOCK DATA ===
  private getMockStudents(filters: any = {}): Student[] {
    const mockStudents: Student[] = [
      {
        id: '1',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@school.com',
        phone: '0123456789',
        dateOfBirth: '2005-03-15',
        gender: 'M',
        address: '123 Rue de Paris',
        parentName: 'Marie Dupont',
        parentPhone: '0698765432',
        parentEmail: 'marie.dupont@email.com',
        classId: '1',
        registrationNumber: '2024001',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie.martin@school.com',
        phone: '0123456790',
        dateOfBirth: '2005-06-20',
        gender: 'F',
        address: '456 Rue de Lyon',
        parentName: 'Pierre Martin',
        parentPhone: '0698765433',
        parentEmail: 'pierre.martin@email.com',
        classId: '1',
        registrationNumber: '2024002',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];

    return mockStudents.filter(student => {
      if (filters.classId && student.classId !== filters.classId) return false;
      if (filters.status && student.status !== filters.status) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        return student.firstName.toLowerCase().includes(search) ||
               student.lastName.toLowerCase().includes(search) ||
               student.email.toLowerCase().includes(search);
      }
      return true;
    });
  }

  private getMockTeachers(filters: any = {}): Teacher[] {
    return [
      {
        id: '1',
        firstName: 'Pierre',
        lastName: 'Dubois',
        email: 'pierre.dubois@school.com',
        phone: '0123456788',
        subjectId: '1',
        qualification: 'Licence Mathématiques',
        experience: 5,
        hireDate: '2019-09-01',
        salary: 2500000,
        address: '789 Rue de Marseille',
        emergencyContact: 'Sophie Dubois: 0698765431',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
  }

  private getMockClasses(): Class[] {
    return [
      {
        id: '1',
        name: '6ème A',
        level: '6ème',
        capacity: 30,
        teacherId: '1',
        roomId: '1',
        academicYear: '2024-2025',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
  }

  private getMockExams(filters: any = {}): Exam[] {
    return [
      {
        id: '1',
        name: 'Contrôle 1',
        subjectId: '1',
        classId: '1',
        teacherId: '1',
        date: '2024-03-15',
        duration: 60,
        maxScore: 20,
        passingScore: 10,
        type: 'exam',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
  }

  private getMockGrades(): Grade[] {
    return [
      {
        id: '1',
        studentId: '1',
        examId: '1',
        score: 15,
        grade: 'Bien',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        studentId: '2',
        examId: '1',
        score: 18,
        grade: 'Très Bien',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
  }

  private getMockSchedules(filters: any = {}): Schedule[] {
    return [
      {
        id: '1',
        classId: '1',
        subjectId: '1',
        teacherId: '1',
        roomId: '1',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:00',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
  }

  private getMockCahierJournalEntries(filters: any = {}): CahierJournalEntry[] {
    return [
      {
        id: '1',
        classId: '1',
        subjectId: '1',
        teacherId: '1',
        scheduleId: '1',
        date: '2024-03-15',
        startTime: '08:00',
        endTime: '09:00',
        content: 'Introduction aux fractions',
        homework: 'Exercices 1-5 page 45',
        isValidated: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
  }

  private getMockPayments(filters: any = {}): Payment[] {
    return [
      {
        id: '1',
        studentId: '1',
        amount: 50000,
        paymentMethod: 'cash',
        reference: 'PAY-2024-001',
        status: 'completed',
        date: '2024-03-01',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
  }

  // ========================================
  // NEW FEE SYSTEM METHODS
  // ========================================

  // Academic Years
  async getAcademicYears(schoolId: string): Promise<any[]> {
    if (!isElectron || !this.electronAPI) {
      console.warn('Mode développement Vite - API Electron non disponible, retour de données vides');
      return [];
    }

    try {
      const result = await this.electronAPI.finance.getAcademicYears(schoolId);
      return result.data || [];
    } catch (error) {
      console.error('Error getting academic years:', error);
      return [];
    }
  }

  async getAllAcademicYears(): Promise<any[]> {
    if (!isElectron || !this.electronAPI || !this.electronAPI.database) {
      console.warn('Mode développement Vite - API Electron non disponible');
      return [];
    }
    
    try {
      const response = await this.electronAPI.database.all('SELECT * FROM academic_years ORDER BY startDate DESC');
      if (response && response.success) {
        return response.results || [];
      } else {
        console.warn('Database query failed:', response?.error);
        return [];
      }
    } catch (error) {
      console.error('Error getting all academic years:', error);
      return [];
    }
  }

  getSimulatedAcademicYears(): any[] {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Déterminer l'année académique actuelle
    const academicYear = currentMonth >= 8 ? currentYear : currentYear - 1; // Septembre = mois 8
    
    const years = [];
    
    // 5 années en arrière
    for (let i = 5; i >= 1; i--) {
      const year = academicYear - i;
      years.push({
        id: `academic-year-${year}-${year + 1}`,
        name: `${year}-${year + 1}`,
        startDate: `${year}-09-01`,
        endDate: `${year + 1}-06-30`,
        isActive: 0,
        schoolId: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    // Année actuelle
    years.push({
      id: `academic-year-${academicYear}-${academicYear + 1}`,
      name: `${academicYear}-${academicYear + 1}`,
      startDate: `${academicYear}-09-01`,
      endDate: `${academicYear + 1}-06-30`,
      isActive: 1,
      schoolId: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    // 2 années futures
    for (let i = 1; i <= 2; i++) {
      const year = academicYear + i;
      years.push({
        id: `academic-year-${year}-${year + 1}`,
        name: `${year}-${year + 1}`,
        startDate: `${year}-09-01`,
        endDate: `${year + 1}-06-30`,
        isActive: 0,
        schoolId: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    return years;
  }

  async getSchools(): Promise<any[]> {
    if (!isElectron || !this.electronAPI || !this.electronAPI.database) {
      console.warn('Mode développement Vite - API Electron non disponible, retour de données vides');
      return [];
    }
    
    try {
      let result = await this.electronAPI.database.get('SELECT id, name FROM schools LIMIT 1');
      
      // Si aucune école n'existe, en créer une par défaut
      if (!result) {
        console.log('📚 Aucune école trouvée - création d\'une école par défaut...');
        const defaultSchool = {
          id: 'school-1',
          name: 'École Académia Hub',
          address: 'Adresse par défaut',
          phone: '000-000-0000',
          email: 'contact@academia-hub.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        await this.electronAPI.database.run(`
          INSERT INTO schools (id, name, address, phone, email, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          defaultSchool.id,
          defaultSchool.name,
          defaultSchool.address,
          defaultSchool.phone,
          defaultSchool.email,
          new Date().toISOString(),
          new Date().toISOString()
        ]);
        
        console.log('✅ École par défaut créée:', defaultSchool.name);
        result = defaultSchool;
      }
      
      return result ? [result] : [];
    } catch (error) {
      console.error('Error getting schools:', error);
      return [];
    }
  }

  async createAcademicYear(yearData: any): Promise<string> {
    if (!isElectron || !this.electronAPI || !this.electronAPI.database) {
      console.warn('API Electron non disponible, génération d\'ID local');
      return this.generateId();
    }

    try {
      // Vérifier d'abord si une année avec ce nom existe déjà
      const existingYear = await this.electronAPI.database.all(
        'SELECT id FROM academic_years WHERE name = ?',
        [yearData.name]
      );
      
      if (existingYear && existingYear.length > 0) {
        console.log(`⚠️ Année académique ${yearData.name} existe déjà, pas de création`);
        return existingYear[0].id;
      }

      // Si schoolId est null, créer directement dans la base sans contrainte de clé étrangère
      if (!yearData.schoolId) {
        const id = this.generateId();
        const response = await this.electronAPI.database.run(`
          INSERT INTO academic_years (id, name, startDate, endDate, isActive, schoolId, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          id,
          yearData.name,
          yearData.startDate,
          yearData.endDate,
          yearData.isActive ? 1 : 0,
          null, // schoolId peut être null
          new Date().toISOString(),
          new Date().toISOString()
        ]);
        
        if (!response || !response.success) {
          throw new Error(response?.error || 'Database operation failed');
        }
        return id;
      }

      const result = await this.electronAPI.finance.createAcademicYear(yearData);
      if (result.success && result.data?.id) {
        return result.data.id;
      } else {
        console.error('Erreur lors de la création de l\'année académique:', result.error);
        return this.generateId();
      }
    } catch (error) {
      console.error('Error creating academic year:', error);
      return this.generateId();
    }
  }

  async updateAcademicYear(id: string, yearData: any): Promise<any | null> {
    if (!isElectron || !this.electronAPI) {
      return null;
    }

    try {
      const result = await this.electronAPI.finance.updateAcademicYear(id, yearData);
      return result.data || null;
    } catch (error) {
      console.error('Error updating academic year:', error);
      return null;
    }
  }

  async deleteAcademicYear(id: string): Promise<boolean> {
    if (!isElectron || !this.electronAPI) {
      return false;
    }

    try {
      const result = await this.electronAPI.finance.deleteAcademicYear(id);
      return result.success || false;
    } catch (error) {
      console.error('Error deleting academic year:', error);
      return false;
    }
  }

  async initializeDefaultAcademicYears(schoolId?: string): Promise<void> {
    if (!isElectron || !this.electronAPI) {
      console.warn('API Electron non disponible - impossible de créer les années académiques');
      return;
    }

    try {
      console.log('🔄 Initialisation automatique des années académiques...');
      
      // Vérifier d'abord si des années académiques existent déjà
      const existingYears = await this.getAllAcademicYears();
      if (existingYears && existingYears.length > 0) {
        console.log(`✅ ${existingYears.length} années académiques existent déjà, pas de création nécessaire`);
        return;
      }
      
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      // Détermine l'année scolaire actuelle (septembre à juin)
      let currentAcademicYearStart;
      if (currentMonth >= 9) {
        currentAcademicYearStart = currentYear;
      } else {
        currentAcademicYearStart = currentYear - 1;
      }

      // Créer les années académiques (5 ans en arrière, 2 ans en avant)
      for (let i = -5; i <= 2; i++) {
        const startYear = currentAcademicYearStart + i;
        const endYear = startYear + 1;
        const isCurrent = i === 0;
        
        const yearData = {
          name: `${startYear}-${endYear}`,
          startDate: new Date(startYear, 8, 1).toISOString().split('T')[0], // 1er septembre
          endDate: new Date(endYear, 5, 30).toISOString().split('T')[0], // 30 juin
          isActive: isCurrent,
          schoolId: schoolId || null // Optionnel
        };

        try {
          await this.createAcademicYear(yearData);
          console.log(`✅ Année académique créée: ${yearData.name}`);
        } catch (yearError) {
          console.error(`❌ Erreur lors de la création de l'année ${yearData.name}:`, yearError);
          // Continuer avec les autres années même si une échoue
        }
      }
      
      console.log('✅ Toutes les années académiques créées automatiquement');
    } catch (error) {
      console.error('Erreur lors de la création automatique des années académiques:', error);
      throw error;
    }
  }

  async setActiveAcademicYear(yearId: string, schoolId: string): Promise<boolean> {
    if (!isElectron || !this.electronAPI) {
      return false;
    }

    try {
      const result = await this.electronAPI.finance.setActiveAcademicYear(yearId, schoolId);
      return result.success || false;
    } catch (error) {
      console.error('Error setting active academic year:', error);
      return false;
    }
  }

  async getActiveAcademicYear(schoolId: string): Promise<any | null> {
    if (!isElectron || !this.electronAPI) {
      return null;
    }

    try {
      const result = await this.electronAPI.finance.getActiveAcademicYear(schoolId);
      return result.data || null;
    } catch (error) {
      console.error('Error getting active academic year:', error);
      return null;
    }
  }

  // Fee Structures (New System)
  async getFeeStructures(schoolId: string, filters: any = {}): Promise<any[]> {
    if (!isElectron || !this.electronAPI) {
      console.warn('Mode développement Vite - API Electron non disponible, retour de données vides');
      return [];
    }

    try {
      const result = await this.electronAPI.finance.getFeeStructures(schoolId, filters);
      return result.data || [];
    } catch (error) {
      console.error('Error getting fee structures:', error);
      return [];
    }
  }

  // Student Fees
  async getStudentFees(schoolId: string, filters: any = {}): Promise<any[]> {
    if (!isElectron || !this.electronAPI) {
      console.warn('Mode développement Vite - API Electron non disponible, retour de données vides');
      return [];
    }

    try {
      const result = await this.electronAPI.finance.getStudentFees(schoolId, filters);
      return result.data || [];
    } catch (error) {
      console.error('Error getting student fees:', error);
      return [];
    }
  }

  async createStudentFee(feeData: any): Promise<string> {
    if (!isElectron || !this.electronAPI) {
      console.warn('API Electron non disponible, génération d\'ID local');
      return this.generateId();
    }

    try {
      const result = await this.electronAPI.finance.createStudentFee(feeData);
      return result.data?.id || this.generateId();
    } catch (error) {
      console.error('Error creating student fee:', error);
      return this.generateId();
    }
  }

  async updateStudentFee(id: string, feeData: any): Promise<any | null> {
    if (!isElectron || !this.electronAPI) {
      return null;
    }

    try {
      const result = await this.electronAPI.finance.updateStudentFee(id, feeData);
      return result.data || null;
    } catch (error) {
      console.error('Error updating student fee:', error);
      return null;
    }
  }

  async deleteStudentFee(id: string): Promise<boolean> {
    if (!isElectron || !this.electronAPI) {
      return false;
    }

    try {
      const result = await this.electronAPI.finance.deleteStudentFee(id);
      return result.success || false;
    } catch (error) {
      console.error('Error deleting student fee:', error);
      return false;
    }
  }

  // Fee Payments
  async getFeePayments(schoolId: string, filters: any = {}): Promise<any[]> {
    if (!isElectron || !this.electronAPI) {
      console.warn('Mode développement Vite - API Electron non disponible, retour de données vides');
      return [];
    }

    try {
      const result = await this.electronAPI.finance.getFeePayments(schoolId, filters);
      return result.data || [];
    } catch (error) {
      console.error('Error getting fee payments:', error);
      return [];
    }
  }

  async createFeePayment(paymentData: any): Promise<string> {
    if (!isElectron || !this.electronAPI) {
      console.warn('API Electron non disponible, génération d\'ID local');
      return this.generateId();
    }

    try {
      const result = await this.electronAPI.finance.createFeePayment(paymentData);
      return result.data?.id || this.generateId();
    } catch (error) {
      console.error('Error creating fee payment:', error);
      return this.generateId();
    }
  }

  // Utility Methods
  async generateStudentFeesFromStructures(academicYearId: string, schoolId: string): Promise<any[]> {
    if (!isElectron || !this.electronAPI) {
      console.warn('Mode développement Vite - API Electron non disponible, retour de données vides');
      return [];
    }

    try {
      const result = await this.electronAPI.finance.generateStudentFeesFromStructures(academicYearId, schoolId);
      return result.data || [];
    } catch (error) {
      console.error('Error generating student fees from structures:', error);
      return [];
    }
  }

  async getStudentFeeSummary(studentId: string, academicYearId: string): Promise<any[]> {
    if (!isElectron || !this.electronAPI) {
      console.warn('Mode développement Vite - API Electron non disponible, retour de données vides');
      return [];
    }

    try {
      const result = await this.electronAPI.finance.getStudentFeeSummary(studentId, academicYearId);
      return result.data || [];
    } catch (error) {
      console.error('Error getting student fee summary:', error);
      return [];
    }
  }

  // ========================================
  // QUARTERS METHODS
  // ========================================

  // Quarters
  async getQuarters(schoolId: string): Promise<any[]> {
    console.log('🔍 dataService.getQuarters appelé avec schoolId:', schoolId);
    console.log('🔍 isElectron:', isElectron, 'electronAPI disponible:', !!this.electronAPI);
    
    if (!isElectron || !this.electronAPI) {
      console.warn('Mode développement Vite - API Electron non disponible, retour de données vides');
      return [];
    }

    try {
      console.log('🔍 Appel de electronAPI.finance.getQuarters...');
      const result = await this.electronAPI.finance.getQuarters(schoolId);
      console.log('🔍 Résultat de electronAPI.finance.getQuarters:', result);
      console.log('🔍 Type de résultat:', typeof result, 'Success:', result?.success, 'Data:', result?.data);
      return result.data || [];
    } catch (error) {
      console.error('Error getting quarters:', error);
      return [];
    }
  }

  async createQuarter(quarterData: any): Promise<string> {
    if (!isElectron || !this.electronAPI) {
      console.warn('API Electron non disponible, génération d\'ID local');
      return this.generateId();
    }

    try {
      const result = await this.electronAPI.finance.createQuarter(quarterData);
      return result.data?.id || this.generateId();
    } catch (error) {
      console.error('Error creating quarter:', error);
      return this.generateId();
    }
  }

  // Initialiser les trimestres par défaut
  async initializeDefaultQuarters(): Promise<void> {
    console.log('🔄 Initialisation des trimestres par défaut...');
    
    try {
      // Récupérer toutes les années scolaires
      const academicYears = await this.getAllAcademicYears();
      
      if (academicYears.length === 0) {
        console.log('⚠️ Aucune année scolaire trouvée pour créer les trimestres');
        return;
      }
      
      console.log(`📊 ${academicYears.length} années scolaires trouvées, création des trimestres...`);
      
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // 1-12
      
      // Créer les trimestres pour chaque année scolaire
      for (const academicYear of academicYears) {
        console.log(`📅 Création des trimestres pour l'année: ${academicYear.name}`);
        
        // Extraire les années de l'ID ou du nom
        const yearMatch = academicYear.id.match(/academic-year-(\d{4})-(\d{4})/) || 
                        academicYear.name.match(/(\d{4})-(\d{4})/);
        
        if (yearMatch) {
          const startYear = parseInt(yearMatch[1]);
          const endYear = parseInt(yearMatch[2]);
          
          await this.createQuartersForAcademicYear(academicYear.id, startYear, endYear, currentMonth);
        } else {
          console.warn(`⚠️ Impossible de parser l'année scolaire: ${academicYear.name}`);
        }
      }
      
      console.log('✅ Trimestres créés avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des trimestres:', error);
      throw error;
    }
  }

  // Créer les trimestres pour une année scolaire spécifique
  private async createQuartersForAcademicYear(academicYearId: string, startYear: number, endYear: number, currentMonth: number): Promise<void> {
    // Vérifier si les trimestres existent déjà pour cette année
    const existingQuarters = await this.getQuarters(getCurrentSchoolId());
    const quartersForThisYear = existingQuarters.filter(q => q.academicYearId === academicYearId);
    
    if (quartersForThisYear.length > 0) {
      console.log(`✅ Trimestres déjà existants pour ${academicYearId}`);
      return;
    }

    // Créer les trimestres pour cette année scolaire
    const quartersToCreate = [
      {
        name: '1er Trimestre',
        quarterNumber: 1,
        startDate: new Date(startYear, 8, 1).toISOString().split('T')[0], // 1er septembre
        endDate: new Date(startYear, 11, 31).toISOString().split('T')[0], // 31 décembre
        isActive: this.isCurrentQuarter(1, currentMonth) && this.isCurrentAcademicYear(startYear, currentMonth)
      },
      {
        name: '2ème Trimestre',
        quarterNumber: 2,
        startDate: new Date(endYear, 0, 1).toISOString().split('T')[0], // 1er janvier
        endDate: new Date(endYear, 3, 30).toISOString().split('T')[0], // 30 avril
        isActive: this.isCurrentQuarter(2, currentMonth) && this.isCurrentAcademicYear(startYear, currentMonth)
      },
      {
        name: '3ème Trimestre',
        quarterNumber: 3,
        startDate: new Date(endYear, 3, 1).toISOString().split('T')[0], // 1er avril
        endDate: new Date(endYear, 5, 30).toISOString().split('T')[0], // 30 juin
        isActive: this.isCurrentQuarter(3, currentMonth) && this.isCurrentAcademicYear(startYear, currentMonth)
      }
    ];

    // Créer les trimestres en base de données
    for (const quarterData of quartersToCreate) {
      try {
        const quarterId = await this.createQuarter({
          ...quarterData,
          academicYearId,
          schoolId: getCurrentSchoolId()
        });
        
        console.log(`✅ Trimestre créé: ${quarterData.name} pour ${academicYearId}`);
      } catch (error) {
        console.error(`❌ Erreur lors de la création du trimestre ${quarterData.name}:`, error);
      }
    }
  }

  // Vérifie si c'est l'année scolaire actuelle
  private isCurrentAcademicYear(startYear: number, currentMonth: number): boolean {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    let currentAcademicYearStart: number;
    if (currentMonth >= 9) {
      currentAcademicYearStart = currentYear;
    } else {
      currentAcademicYearStart = currentYear - 1;
    }
    
    return startYear === currentAcademicYearStart;
  }

  // Détermine si un trimestre est actuel basé sur le mois
  private isCurrentQuarter(quarterNumber: number, currentMonth: number): boolean {
    switch (quarterNumber) {
      case 1: // 1er Trimestre (Septembre à Décembre)
        return currentMonth >= 9 && currentMonth <= 12;
      case 2: // 2ème Trimestre (Janvier à Avril)
        return currentMonth >= 1 && currentMonth <= 4;
      case 3: // 3ème Trimestre (Avril à Juin)
        return currentMonth >= 4 && currentMonth <= 6;
      default:
        return false;
    }
  }

  // Données simulées pour le développement
  getSimulatedQuarters(): any[] {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Détermine l'année scolaire actuelle
    let academicYearStart: number;
    if (currentMonth >= 9) {
      academicYearStart = currentYear;
    } else {
      academicYearStart = currentYear - 1;
    }

    const academicYearEnd = academicYearStart + 1;
    const academicYearId = `academic-year-${academicYearStart}-${academicYearEnd}`;

    return [
      {
        id: `quarter-1-${academicYearId}`,
        name: '1er Trimestre',
        academicYearId,
        startDate: new Date(academicYearStart, 8, 1).toISOString().split('T')[0],
        endDate: new Date(academicYearStart, 11, 31).toISOString().split('T')[0],
        quarterNumber: 1,
        isActive: this.isCurrentQuarter(1, currentMonth),
        schoolId: 'default'
      },
      {
        id: `quarter-2-${academicYearId}`,
        name: '2ème Trimestre',
        academicYearId,
        startDate: new Date(academicYearEnd, 0, 1).toISOString().split('T')[0],
        endDate: new Date(academicYearEnd, 3, 30).toISOString().split('T')[0],
        quarterNumber: 2,
        isActive: this.isCurrentQuarter(2, currentMonth),
        schoolId: 'default'
      },
      {
        id: `quarter-3-${academicYearId}`,
        name: '3ème Trimestre',
        academicYearId,
        startDate: new Date(academicYearEnd, 3, 1).toISOString().split('T')[0],
        endDate: new Date(academicYearEnd, 5, 30).toISOString().split('T')[0],
        quarterNumber: 3,
        isActive: this.isCurrentQuarter(3, currentMonth),
        schoolId: 'default'
      }
    ];
  }

  async updateQuarter(id: string, quarterData: any): Promise<any | null> {
    if (!isElectron || !this.electronAPI) {
      return null;
    }

    try {
      const result = await this.electronAPI.finance.updateQuarter(id, quarterData);
      return result.data || null;
    } catch (error) {
      console.error('Error updating quarter:', error);
      return null;
    }
  }

  async setActiveQuarter(quarterId: string, schoolId: string): Promise<boolean> {
    if (!isElectron || !this.electronAPI) {
      return false;
    }

    try {
      const result = await this.electronAPI.finance.setActiveQuarter(quarterId, schoolId);
      return result.success || false;
    } catch (error) {
      console.error('Error setting active quarter:', error);
      return false;
    }
  }

  // === ACTIVITÉS RÉCENTES ===
  
  async getRecentPayments(limit: number = 5): Promise<Payment[]> {
    if (!isElectron) {
      return [];
    }

    try {
      // Utiliser l'API Finance au lieu de l'API database directe
      try {
        const result = await api.finance.getPayments();
        const paymentsData = result.data?.data || result.data || [];
        if (Array.isArray(paymentsData)) {
          // Prendre les premiers 'limit' paiements et les trier par date
          const sortedPayments = paymentsData
            .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
            .slice(0, limit);
          
          return sortedPayments.map((payment: any) => ({
            ...payment,
            studentName: payment.studentName || `${payment.firstName || ''} ${payment.lastName || ''}`.trim(),
            className: payment.className || payment.class_name
          }));
        }
      }
      return [];
    } catch (error) {
      console.error('Error getting recent payments:', error);
      return [];
    }
  }

  async getRecentStudents(limit: number = 5): Promise<RecentStudent[]> {
    if (!isElectron) {
      return [];
    }

    try {
      // Utiliser l'API Students
      try {
        const result = await api.students.getAll();
        const studentsData = result.data?.data || result.data || [];
        if (Array.isArray(studentsData)) {
          // Prendre les premiers 'limit' étudiants et les trier par date
          const sortedStudents = studentsData
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
          
          return sortedStudents.map((student: any) => ({
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            className: student.className,
            createdAt: student.createdAt
          }));
        }
      }
      return [];
    } catch (error) {
      console.error('Error getting recent students:', error);
      return [];
    }
  }

  async getRecentAbsences(limit: number = 5): Promise<RecentAbsence[]> {
    if (!isElectron) {
      return [];
    }

    try {
      // Utiliser l'API Students pour récupérer les absences
      try {
        const result = await api.students.getAbsences();
        if (result && result.success && Array.isArray(result.data)) {
          // Filtrer les absences non justifiées et prendre les plus récentes
          const unjustifiedAbsences = result.data
            .filter((absence: any) => !absence.justified)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, limit);
          
          return unjustifiedAbsences.map((absence: any) => ({
            id: absence.id,
            studentName: absence.studentName || `${absence.firstName || ''} ${absence.lastName || ''}`.trim(),
            className: absence.className,
            date: absence.date
          }));
        }
      }
      return [];
    } catch (error) {
      console.error('Error getting recent absences:', error);
      return [];
    }
  }

  async getUpcomingExams(limit: number = 5): Promise<UpcomingExam[]> {
    // Pour l'instant, retourner des données par défaut car la table exams n'existe pas encore
    console.log('ℹ️ Table exams non disponible - retour de données par défaut');
    return [];
  }

  async getUpcomingMeetings(limit: number = 5): Promise<UpcomingMeeting[]> {
    // Pour l'instant, retourner des données par défaut car la table meetings n'existe pas encore
    console.log('ℹ️ Table meetings non disponible - retour de données par défaut');
    return [];
  }
}

// Export singleton
const dataService = new DataService();
export default dataService;
