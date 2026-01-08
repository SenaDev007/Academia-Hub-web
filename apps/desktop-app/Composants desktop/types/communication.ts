// Types pour le module Communication refactorisé

// ==================== CONTACTS & RÉPERTOIRE ====================

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  status: 'active' | 'inactive' | 'blocked';
  students: ContactStudent[]; // Élèves associés
  tags: string[]; // Tags pour catégorisation
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
  preferredChannel: 'email' | 'sms' | 'whatsapp' | 'auto';
}

export interface ContactStudent {
  studentId: string;
  studentName: string;
  className: string;
  classId: string;
  relationship: 'parent' | 'guardian' | 'tutor' | 'emergency_contact';
}

export interface ContactGroup {
  id: string;
  name: string;
  description?: string;
  contacts: string[]; // Contact IDs
  createdAt: string;
  createdBy: string;
  type: 'manual' | 'auto_class' | 'auto_level' | 'auto_criteria';
  criteria?: ContactGroupCriteria;
}

export interface ContactGroupCriteria {
  classes?: string[];
  levels?: string[];
  tags?: string[];
  status?: ('active' | 'inactive')[];
  lastContactedBefore?: string;
  lastContactedAfter?: string;
}

// ==================== PARAMÉTRAGES TECHNIQUES ====================

export interface SMTPConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  secure: boolean; // TLS/SSL
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  isDefault: boolean;
  isActive: boolean;
  maxPerHour?: number;
  testStatus: 'untested' | 'success' | 'failed';
  lastTested?: string;
}

export interface SMSConfig {
  id: string;
  name: string;
  provider: 'mtn_benin' | 'moov_benin' | 'celtiis' | 'custom';
  apiKey: string;
  apiSecret?: string;
  senderId: string;
  baseUrl: string;
  isDefault: boolean;
  isActive: boolean;
  maxPerHour?: number;
  costPerSMS?: number; // En FCFA
  testStatus: 'untested' | 'success' | 'failed';
  lastTested?: string;
}

export interface WhatsAppConfig {
  id: string;
  name: string;
  provider: 'whatsapp_business' | 'twilio' | 'custom';
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookUrl?: string;
  isDefault: boolean;
  isActive: boolean;
  maxPerHour?: number;
  testStatus: 'untested' | 'success' | 'failed';
  lastTested?: string;
}

// ==================== MESSAGES UNIFIÉS ====================

export interface Message {
  id: string;
  channel: 'email' | 'sms' | 'whatsapp';
  type: 'individual' | 'group' | 'broadcast';
  
  // Expéditeur
  senderId: string; // ID de la config (SMTP, SMS, WhatsApp)
  senderName: string;
  senderAddress: string; // Email, numéro, etc.
  
  // Destinataires
  recipients: MessageRecipient[];
  
  // Contenu
  subject?: string; // Pour emails
  content: string;
  contentType: 'text' | 'html' | 'markdown';
  attachments?: MessageAttachment[];
  
  // Métadonnées
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledAt?: string;
  sentAt?: string;
  
  // Tracking
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  
  // Contexte
  campaignId?: string;
  templateId?: string;
  triggeredBy?: 'manual' | 'automatic' | 'scheduled';
  triggerSource?: string; // Module source (Finance, Examens, etc.)
  
  // Audit
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface MessageRecipient {
  contactId: string;
  contactName: string;
  address: string; // Email, numéro de téléphone
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'bounced';
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedReason?: string;
  errorCode?: string;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

// ==================== TEMPLATES ====================

export interface MessageTemplate {
  id: string;
  name: string;
  description?: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'all';
  category: 'general' | 'finance' | 'academic' | 'administrative' | 'emergency';
  
  // Contenu
  subject?: string; // Pour emails
  content: string;
  contentType: 'text' | 'html' | 'markdown';
  
  // Variables disponibles
  variables: TemplateVariable[];
  
  // Métadonnées
  isActive: boolean;
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface TemplateVariable {
  name: string;
  description: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  required: boolean;
  defaultValue?: string;
  example?: string;
}

// ==================== CAMPAGNES ====================

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: 'one_time' | 'recurring' | 'triggered';
  
  // Configuration
  channels: ('email' | 'sms' | 'whatsapp')[];
  templateId?: string;
  targetGroups: string[]; // Contact group IDs
  targetContacts: string[]; // Specific contact IDs
  
  // Planification
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'cancelled';
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  
  // Récurrence (si applicable)
  recurrence?: CampaignRecurrence;
  
  // Déclencheurs automatiques (si applicable)
  triggers?: CampaignTrigger[];
  
  // Statistiques
  totalMessages: number;
  sentMessages: number;
  deliveredMessages: number;
  readMessages: number;
  failedMessages: number;
  
  // Audit
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface CampaignRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // Tous les X jours/semaines/mois
  daysOfWeek?: number[]; // Pour weekly (0=dimanche, 1=lundi, etc.)
  dayOfMonth?: number; // Pour monthly
  endDate?: string;
  maxOccurrences?: number;
}

export interface CampaignTrigger {
  event: 'payment_overdue' | 'exam_published' | 'absence_detected' | 'custom';
  conditions: Record<string, any>;
  delay?: number; // Délai en minutes avant envoi
}

// ==================== HISTORIQUE & CONVERSATIONS ====================

export interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  channel: 'email' | 'sms' | 'whatsapp';
  subject?: string;
  status: 'active' | 'closed' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Messages de la conversation
  messages: ConversationMessage[];
  
  // Métadonnées
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  assignedTo?: string; // Utilisateur assigné
  tags: string[];
}

export interface ConversationMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  contentType: 'text' | 'html' | 'markdown';
  attachments?: MessageAttachment[];
  
  // Métadonnées
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  senderName: string;
  senderAddress: string;
  
  // Statut
  status: 'sent' | 'delivered' | 'read' | 'failed';
  failedReason?: string;
}

// ==================== STATISTIQUES & RAPPORTS ====================

export interface CommunicationStats {
  period: 'today' | 'week' | 'month' | 'year' | 'custom';
  startDate: string;
  endDate: string;
  
  // Statistiques globales
  totalMessages: number;
  totalContacts: number;
  totalCampaigns: number;
  
  // Par canal
  byChannel: {
    email: ChannelStats;
    sms: ChannelStats;
    whatsapp: ChannelStats;
  };
  
  // Tendances
  trends: {
    messagesOverTime: TimeSeriesData[];
    deliveryRates: TimeSeriesData[];
    readRates: TimeSeriesData[];
  };
  
  // Top performers
  topTemplates: TemplateUsageStats[];
  topCampaigns: CampaignPerformanceStats[];
  
  // Coûts (pour SMS principalement)
  totalCost: number;
  costByChannel: Record<string, number>;
}

export interface ChannelStats {
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  deliveryRate: number; // Pourcentage
  readRate: number; // Pourcentage
  cost?: number; // En FCFA
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface TemplateUsageStats {
  templateId: string;
  templateName: string;
  usageCount: number;
  deliveryRate: number;
  readRate: number;
}

export interface CampaignPerformanceStats {
  campaignId: string;
  campaignName: string;
  totalMessages: number;
  deliveryRate: number;
  readRate: number;
  cost?: number;
}

// ==================== INTÉGRATIONS ====================

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'finance_reminders' | 'exam_notifications' | 'absence_alerts' | 'custom';
  isActive: boolean;
  
  // Configuration spécifique
  sourceModule: string;
  triggerEvents: string[];
  templateId: string;
  targetGroups: string[];
  
  // Conditions
  conditions?: Record<string, any>;
  
  // Délais
  delays?: IntegrationDelay[];
  
  // Métadonnées
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

export interface IntegrationDelay {
  delay: number; // En minutes
  templateId: string;
  condition?: Record<string, any>;
}

// ==================== TYPES D'INTERFACE ====================

export interface CommunicationFilters {
  channel?: 'email' | 'sms' | 'whatsapp';
  status?: Message['status'];
  dateRange?: {
    start: string;
    end: string;
  };
  contactId?: string;
  campaignId?: string;
  templateId?: string;
  search?: string;
}

export interface ContactFilters {
  status?: Contact['status'];
  tags?: string[];
  classes?: string[];
  levels?: string[];
  search?: string;
  hasEmail?: boolean;
  hasPhone?: boolean;
  hasWhatsApp?: boolean;
  lastContactedBefore?: string;
  lastContactedAfter?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== TYPES D'ACTIONS ====================

export interface SendMessageRequest {
  channel: 'email' | 'sms' | 'whatsapp';
  recipients: string[]; // Contact IDs
  subject?: string;
  content: string;
  templateId?: string;
  templateVariables?: Record<string, any>;
  attachments?: string[]; // File IDs
  scheduledAt?: string;
  priority?: Message['priority'];
  campaignId?: string;
}

export interface BulkMessageRequest {
  channel: 'email' | 'sms' | 'whatsapp';
  targetGroups?: string[];
  targetContacts?: string[];
  subject?: string;
  content: string;
  templateId?: string;
  templateVariables?: Record<string, any>;
  attachments?: string[];
  scheduledAt?: string;
  priority?: Message['priority'];
  campaignName?: string;
}

export interface TestConfigRequest {
  configType: 'smtp' | 'sms' | 'whatsapp';
  configId: string;
  testRecipient: string;
  testMessage?: string;
}

// ==================== TYPES D'ERREURS ====================

export interface CommunicationError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ==================== EXPORTS ====================

export type MessageChannel = 'email' | 'sms' | 'whatsapp';
export type MessageStatus = Message['status'];
export type ContactStatus = Contact['status'];
export type CampaignStatus = Campaign['status'];
export type ConversationStatus = Conversation['status'];
export type MessagePriority = Message['priority'];
export type TemplateCategory = MessageTemplate['category'];
export type IntegrationType = IntegrationConfig['type'];
