export interface CahierJournalEntry {
  id: string;
  date: string;
  classe: string;
  matiere: string;
  duree: number; // en minutes
  objectifs: string;
  competences: string[];
  deroulement: string;
  supports: string;
  evaluation: string;
  observations: string;
  statut: 'planifie' | 'en_cours' | 'realise' | 'reporte' | 'valide' | 'en_attente_validation';
  enseignant: string;
  createdAt: string;
  updatedAt: string;
  validatedBy?: string;
  validatedAt?: string;
  comments?: string[];
}

export interface Template {
  id: string;
  nom: string;
  matiere: string;
  niveau: string;
  duree: number;
  objectifs: string;
  competences: string[];
  deroulement: string;
  supports: string;
  evaluation: string;
  auteur: string;
  utilise: number;
  note: number;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
}

export interface ExportConfig {
  format: 'individual' | 'weekly' | 'monthly' | 'custom';
  dateRange: {
    start: string;
    end: string;
  };
  includeDetails: {
    objectifs: boolean;
    competences: boolean;
    deroulement: boolean;
    supports: boolean;
    evaluation: boolean;
    observations: boolean;
  };
  template: 'standard' | 'inspection' | 'minimal' | 'detailed';
  orientation: 'portrait' | 'landscape';
  includeSignature: boolean;
  includeHeader: boolean;
  customHeader?: string;
}

export interface IValidationWorkflow {
  id: string;
  entryId: string;
  submittedBy: string;
  submittedAt: string;
  currentStep: 'enseignant' | 'directeur' | 'conseiller_pedagogique';
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  comments: ValidationComment[];
  notificationsSent: NotificationLog[];
  createdAt: string;
  updatedAt: string;
}

export interface ValidationComment {
  id: string;
  author: string;
  role: 'enseignant' | 'directeur' | 'conseiller_pedagogique';
  comment: string;
  action: 'submit' | 'approve' | 'reject' | 'return' | 'comment';
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  type: 'whatsapp' | 'email' | 'platform';
  recipient: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed';
  sentAt: string;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'enseignant' | 'directeur' | 'conseiller_pedagogique' | 'administrateur';
  whatsappNumber?: string;
  classes?: string[];
  matieres?: string[];
  etablissement?: string;
}