// Types pour la gestion des utilisateurs et l'authentification

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  schoolId?: string;
  department?: string;
  position?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  preferences: UserPreferences;
  permissions: Permission[];
}

export type UserRole = 
  | 'super_admin'
  | 'admin'
  | 'hr_manager'
  | 'finance_manager'
  | 'teacher'
  | 'staff'
  | 'parent'
  | 'student';

export type UserStatus = 
  | 'pending'
  | 'active'
  | 'suspended'
  | 'inactive'
  | 'banned';

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  timezone: string;
  dateFormat: string;
  currency: string;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  loginAlerts: boolean;
  securityAlerts: boolean;
  systemUpdates: boolean;
  marketing: boolean;
}

export interface Permission {
  id: string;
  name: string;
  module: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  resource?: string;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in';
  value: any;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  lastActivityAt: Date;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  location?: string;
}

export interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  twoFactorUsed: boolean;
  createdAt: Date;
}

export interface TwoFactorAuth {
  id: string;
  userId: string;
  method: 'sms' | 'email' | 'app';
  secret?: string;
  backupCodes: string[];
  isEnabled: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
}

export interface PasswordReset {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  usedAt?: Date;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  module: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

export interface UserInvitation {
  id: string;
  email: string;
  role: UserRole;
  schoolId?: string;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  accepted: boolean;
  acceptedAt?: Date;
  createdAt: Date;
}

// Types pour les formulaires
export interface UserRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  schoolId?: string;
  department?: string;
  position?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export interface UserLoginData {
  identifier: string; // email ou téléphone
  password: string;
  rememberMe: boolean;
  twoFactorCode?: string;
}

export interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  department?: string;
  position?: string;
  preferences: UserPreferences;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TwoFactorSetupData {
  method: 'sms' | 'email' | 'app';
  phone?: string;
  backupCodes?: string[];
}

// Types pour les réponses API
export interface AuthResponse {
  user: User;
  session: UserSession;
  permissions: Permission[];
  requiresTwoFactor: boolean;
  twoFactorMethods?: string[];
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  filters: UserFilters;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  schoolId?: string;
  department?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface UserStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  byRole: Record<UserRole, number>;
  byStatus: Record<UserStatus, number>;
  recentLogins: number;
  failedAttempts: number;
}

// Types pour les validations
export interface ValidationRule {
  field: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Types pour les notifications
export interface SecurityAlert {
  id: string;
  userId: string;
  type: 'suspicious_login' | 'password_breach' | 'unusual_activity' | 'failed_attempts';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  targetUsers: string[]; // IDs des utilisateurs cibles
  isGlobal: boolean;
  expiresAt?: Date;
  createdAt: Date;
}
