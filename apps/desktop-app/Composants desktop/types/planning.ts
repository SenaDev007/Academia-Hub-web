export interface PlanningClass {
  id: string;
  name: string;
  level: string;
  capacity: number;
  main_teacher_id?: string;
  room_id?: string;
  school_id?: string;
  created_at?: string;
  updated_at?: string;
  // Propriétés jointes retournées par le service
  teacher_name?: string;
  teacher_subject?: string;
  room_name?: string;
  room_type?: string;
  description?: string;
}

export interface PlanningRoom {
  id: string;
  name: string;
  type: string;
  capacity: number;
  equipment: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  description?: string;
  school_id?: string;
}

export interface PlanningSubject {
  id: string;
  name: string;
  code: string;
  level: string;
  coefficient: number;
  // Pour le 2nd cycle du secondaire, classe spécifique
  classId?: string;
  school_id?: string;
}

export interface PlanningTeacher {
  id: string;
  name: string;
  subject: string;
  classes: string[];
  hoursPerWeek: number;
  userId?: string;
  school_id?: string;
  // Informations supplémentaires du HR
  matricule?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  status?: string;
  hireDate?: string;
  qualifications?: string;
}

export interface PlanningSchedule {
  id: string;
  day: string;
  time: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  class: string;
  room: string;
  duration: string;
  dayOfWeek: number;
  durationMinutes: number;
  subjectId: string;
  teacherId: string;
  classId: string;
  roomId?: string;
}

export interface PlanningBreak {
  id: string;
  name: string;
  type: string;
  startTime: string;
  endTime: string;
  duration: number;
  levels: string[];
}

export interface WorkHoursConfig {
  id: string;
  startTime: string;
  endTime: string;
  lunchBreakStart: string;
  lunchBreakEnd: string;
  courseDuration: number;
  breakBetweenCourses: number;
  workDays: number[];
}

export interface RoomReservation {
  id: string;
  roomId: string;
  teacherId: string;
  title: string;
  description?: string;
  startDatetime: string;
  endDatetime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface PlanningStats {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: string;
}

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  hoursPerWeek: number;
}

export interface TeacherAvailability {
  id: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Types pour les heures travaillées
export interface WorkedHoursEntry {
  id: string;
  employeeId: string; // Lien avec module RH
  employeeName: string;
  date: string; // Format YYYY-MM-DD
  scheduledHours: number; // Heures prévues depuis le planning
  validatedHours: number; // Heures réellement effectuées
  classId?: string; // Optionnel - classe concernée
  className?: string;
  subjectId?: string; // Optionnel - matière concernée
  subjectName?: string;
  entryMode: 'manual' | 'planning_validation' | 'badge' | 'biometric'; // Mode de saisie
  validatedBy: string; // Utilisateur ayant validé
  validatedAt: string; // Timestamp de validation
  notes?: string; // Notes optionnelles
  status: 'pending' | 'validated' | 'disputed'; // Statut de l'entrée
}

export interface WorkedHoursSummary {
  employeeId: string;
  employeeName: string;
  period: string; // Format YYYY-MM pour mensuel, YYYY-WW pour hebdomadaire
  periodType: 'daily' | 'weekly' | 'monthly';
  totalScheduledHours: number;
  totalValidatedHours: number;
  variance: number; // Écart entre prévu et réalisé
  overtimeHours: number; // Heures supplémentaires
  absenceHours: number; // Heures d'absence
  contractualHours?: number; // Heures contractuelles pour comparaison
  entries: WorkedHoursEntry[];
}

export interface PayrollReport {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeType: 'permanent' | 'temporary' | 'hourly'; // Type de contrat
  period: string; // Format YYYY-MM
  totalWorkedHours: number;
  hourlyRate?: number; // Pour les vacataires
  baseSalary?: number; // Pour les permanents
  overtimeRate?: number;
  overtimeHours: number;
  overtimePay: number;
  totalPay: number;
  deductions: number;
  netPay: number;
  generatedAt: string;
  generatedBy: string;
  status: 'draft' | 'validated' | 'sent_to_payroll' | 'processed';
  notes?: string;
}

export interface WorkedHoursAlert {
  id: string;
  type: 'absence' | 'overtime' | 'undertime' | 'contract_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  employeeId: string;
  employeeName: string;
  date: string;
  message: string;
  details: string;
  threshold?: number; // Seuil dépassé
  actualValue?: number; // Valeur réelle
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface WorkedHoursConfig {
  defaultWorkingHours: number; // Heures de travail par défaut par jour
  overtimeThreshold: number; // Seuil pour heures supplémentaires
  maxDailyHours: number; // Maximum d'heures par jour
  maxWeeklyHours: number; // Maximum d'heures par semaine
  alertThresholds: {
    absenceHours: number; // Seuil d'alerte pour absences
    overtimeHours: number; // Seuil d'alerte pour heures sup
  };
  payrollIntegration: {
    enabled: boolean;
    autoGenerateReports: boolean;
    reportGenerationDay: number; // Jour du mois pour génération auto
  };
}