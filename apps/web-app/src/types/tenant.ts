/**
 * Types for multi-tenant functionality
 */

// School (Tenant) status types
export type SchoolStatus = 'pending_payment' | 'pending_kyc' | 'active' | 'suspended' | 'expired';

// Subscription plan types
export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise' | 'main';

// School settings interface
export interface SchoolSettings {
  logo?: string;
  theme?: string;
  language?: string;
  emailTemplates?: Record<string, any>;
  customDomain?: string;
  features?: string[];
}

// School (Tenant) interface
export interface School {
  id: string;
  name: string;
  subdomain: string;
  plan: SubscriptionPlan;
  status?: SchoolStatus;
  settings: SchoolSettings;
  customDomain?: string;
  maxStudents?: number;
  maxTeachers?: number;
  maxAdmins?: number;
  createdAt?: string;
  updatedAt?: string;
}

// User role types
export type UserRole = 'promoter' | 'admin' | 'teacher' | 'student' | 'parent';

// User status types
export type UserStatus = 'pending' | 'active' | 'suspended' | 'blocked';

// User interface
export interface User {
  id: string;
  schoolId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  avatar?: string;
  kycVerified?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Subscription status types
export type SubscriptionStatus = 'pending' | 'active' | 'expired' | 'cancelled';

// Subscription interface
export interface Subscription {
  id: string;
  schoolId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  paymentMethod?: string;
  paymentReference?: string;
  amount: number;
  currency: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

// KYC document types
export type KYCDocumentType = 'id_card' | 'school_authorization' | 'proof_of_address' | 'school_photo';

// KYC document status
export type KYCDocumentStatus = 'pending' | 'approved' | 'rejected';

// KYC document interface
export interface KYCDocument {
  id: string;
  schoolId: string;
  userId: string;
  type: KYCDocumentType;
  fileUrl: string;
  status: KYCDocumentStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// KYC verification status
export type KYCVerificationStatus = 'pending' | 'approved' | 'rejected';

// KYC verification interface
export interface KYCVerification {
  id: string;
  schoolId: string;
  status: KYCVerificationStatus;
  documents: KYCDocument[];
  rejectionReason?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}