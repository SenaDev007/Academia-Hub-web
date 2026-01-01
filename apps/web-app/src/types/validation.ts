export interface ValidationWorkflow {
  id: string;
  type: 'fiche_pedagogique' | 'cahier_journal' | 'bulletin' | 'attestation';
  itemId: string;
  title: string;
  currentStep: number;
  totalSteps: number;
  status: ValidationStatus;
  steps: ValidationStep[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
  metadata?: Record<string, any>;
}

export interface ValidationStep {
  id: string;
  name: string;
  description: string;
  role: string;
  userId?: string;
  userName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comment?: string;
  signature?: string;
  timestamp?: string;
  required: boolean;
  order: number;
}

export type ValidationStatus = 
  | 'draft' 
  | 'in_review' 
  | 'approved' 
  | 'rejected' 
  | 'published' 
  | 'archived';

export interface ValidationRequest {
  workflowId: string;
  stepId: string;
  action: 'approve' | 'reject' | 'sign';
  comment?: string;
  signature?: string;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: string;
}

export interface ValidationStats {
  totalWorkflows: number;
  pendingValidations: number;
  approvedWorkflows: number;
  rejectedWorkflows: number;
  averageValidationTime: number;
  validationByRole: Record<string, number>;
  validationByType: Record<string, number>;
}

export interface ValidationFilters {
  type?: string[];
  status?: ValidationStatus[];
  role?: string[];
  dateFrom?: string;
  dateTo?: string;
  createdBy?: string;
  search?: string;
}

export interface ValidationNotification {
  id: string;
  type: 'validation_required' | 'validation_completed' | 'workflow_updated';
  workflowId: string;
  stepId?: string;
  message: string;
  userId: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}
