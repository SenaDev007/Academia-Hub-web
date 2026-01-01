import { 
  Contact, 
  ContactGroup, 
  Message, 
  MessageTemplate, 
  Campaign, 
  Conversation,
  SMTPConfig,
  SMSConfig,
  WhatsAppConfig,
  CommunicationStats,
  IntegrationConfig,
  SendMessageRequest,
  BulkMessageRequest,
  TestConfigRequest,
  CommunicationFilters,
  ContactFilters,
  PaginationParams,
  PaginatedResponse
} from '../types/communication';

class CommunicationService {
  private static instance: CommunicationService;

  private constructor() {}

  public static getInstance(): CommunicationService {
    if (!CommunicationService.instance) {
      CommunicationService.instance = new CommunicationService();
    }
    return CommunicationService.instance;
  }

  // ==================== GESTION DES CONTACTS ====================

  async getContacts(filters?: ContactFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Contact>> {
    return api.communication.getContacts(filters?.schoolId || '', filters, pagination);
  }

  async getContact(contactId: string): Promise<Contact> {
    return api.communication.getContact(contactId);
  }

  async createContact(contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    return api.communication.createContact(contactData);
  }

  async updateContact(contactId: string, updates: Partial<Contact>): Promise<Contact> {
    return api.communication.updateContact(contactId, updates);
  }

  async deleteContact(contactId: string): Promise<void> {
    return api.communication.deleteContact(contactId);
  }

  async importContacts(file: File, options?: { 
    skipDuplicates?: boolean; 
    updateExisting?: boolean;
    mapping?: Record<string, string>;
  }): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options || {}));
    
    return api.communication.importContacts(file.name, formData, 'csv');
  }

  async exportContacts(filters?: ContactFilters, format: 'csv' | 'excel' = 'csv'): Promise<{ filePath: string }> {
    return api.communication.exportContacts(filters?.schoolId || '', format);
  }

  async syncContactsWithStudents(schoolId: string): Promise<{ synced: number; created: number; updated: number }> {
    return api.communication.syncContactsWithStudents(schoolId);
  }

  async detectDuplicateContacts(schoolId: string): Promise<{ duplicates: Contact[][]; suggestions: string[] }> {
    return api.communication.detectDuplicateContacts(schoolId);
  }

  async mergeDuplicateContacts(primaryContactId: string, duplicateContactIds: string[]): Promise<Contact> {
    // Cette méthode n'est pas encore implémentée dans le preload, on utilise une approche alternative
    throw new Error('Merge duplicate contacts not yet implemented');
  }

  // ==================== GESTION DES GROUPES ====================

  async getContactGroups(schoolId: string): Promise<ContactGroup[]> {
    return api.communication.getContactGroups(schoolId);
  }

  async getContactGroup(groupId: string): Promise<ContactGroup> {
    // Cette méthode n'est pas dans le preload, on utilise getContactGroups et on filtre
    const groups = await api.communication.getContactGroups('');
    const group = groups.find(g => g.id === groupId);
    if (!group) throw new Error('Group not found');
    return group;
  }

  async createContactGroup(groupData: Omit<ContactGroup, 'id' | 'createdAt'>): Promise<ContactGroup> {
    return api.communication.createContactGroup(groupData);
  }

  async updateContactGroup(groupId: string, updates: Partial<ContactGroup>): Promise<ContactGroup> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Update contact group not yet implemented');
  }

  async deleteContactGroup(groupId: string): Promise<void> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Delete contact group not yet implemented');
  }

  async addContactsToGroup(groupId: string, contactIds: string[]): Promise<ContactGroup> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Add contacts to group not yet implemented');
  }

  async removeContactsFromGroup(groupId: string, contactIds: string[]): Promise<ContactGroup> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Remove contacts from group not yet implemented');
  }

  async refreshAutoGroup(groupId: string): Promise<ContactGroup> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Refresh auto group not yet implemented');
  }

  // ==================== PARAMÉTRAGES TECHNIQUES ====================

  // SMTP
  async getSMTPConfigs(schoolId: string): Promise<SMTPConfig[]> {
    // Cette méthode n'est pas encore implémentée dans le preload
    return [];
  }

  async createSMTPConfig(config: Omit<SMTPConfig, 'id' | 'testStatus' | 'lastTested'>): Promise<SMTPConfig> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Create SMTP config not yet implemented');
  }

  async updateSMTPConfig(configId: string, updates: Partial<SMTPConfig>): Promise<SMTPConfig> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Update SMTP config not yet implemented');
  }

  async deleteSMTPConfig(configId: string): Promise<void> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Delete SMTP config not yet implemented');
  }

  async testSMTPConfig(request: TestConfigRequest): Promise<{ success: boolean; message: string; details?: any }> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Test SMTP config not yet implemented');
  }

  // SMS
  async getSMSConfigs(schoolId: string): Promise<SMSConfig[]> {
    // Cette méthode n'est pas encore implémentée dans le preload
    return [];
  }

  async createSMSConfig(config: Omit<SMSConfig, 'id' | 'testStatus' | 'lastTested'>): Promise<SMSConfig> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Create SMS config not yet implemented');
  }

  async updateSMSConfig(configId: string, updates: Partial<SMSConfig>): Promise<SMSConfig> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Update SMS config not yet implemented');
  }

  async deleteSMSConfig(configId: string): Promise<void> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Delete SMS config not yet implemented');
  }

  async testSMSConfig(request: TestConfigRequest): Promise<{ success: boolean; message: string; details?: any }> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Test SMS config not yet implemented');
  }

  // WhatsApp
  async getWhatsAppConfigs(schoolId: string): Promise<WhatsAppConfig[]> {
    // Cette méthode n'est pas encore implémentée dans le preload
    return [];
  }

  async createWhatsAppConfig(config: Omit<WhatsAppConfig, 'id' | 'testStatus' | 'lastTested'>): Promise<WhatsAppConfig> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Create WhatsApp config not yet implemented');
  }

  async updateWhatsAppConfig(configId: string, updates: Partial<WhatsAppConfig>): Promise<WhatsAppConfig> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Update WhatsApp config not yet implemented');
  }

  async deleteWhatsAppConfig(configId: string): Promise<void> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Delete WhatsApp config not yet implemented');
  }

  async testWhatsAppConfig(request: TestConfigRequest): Promise<{ success: boolean; message: string; details?: any }> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Test WhatsApp config not yet implemented');
  }

  // ==================== GESTION DES MESSAGES ====================

  async getMessages(filters?: CommunicationFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Message>> {
    return api.communication.getMessages(filters?.schoolId || '', filters, pagination);
  }

  async getMessage(messageId: string): Promise<Message> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Get message not yet implemented');
  }

  async sendMessage(request: SendMessageRequest): Promise<Message> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Send message not yet implemented');
  }

  async sendBulkMessage(request: BulkMessageRequest): Promise<Campaign> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Send bulk message not yet implemented');
  }

  async scheduleMessage(request: SendMessageRequest): Promise<Message> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Schedule message not yet implemented');
  }

  async cancelScheduledMessage(messageId: string): Promise<Message> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Cancel scheduled message not yet implemented');
  }

  async resendFailedMessage(messageId: string, recipientIds?: string[]): Promise<Message> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Resend failed message not yet implemented');
  }

  async getMessageDeliveryStatus(messageId: string): Promise<Message> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Get message delivery status not yet implemented');
  }

  // ==================== GESTION DES TEMPLATES ====================

  async getMessageTemplates(channel?: 'email' | 'sms' | 'whatsapp' | 'all'): Promise<MessageTemplate[]> {
    return api.communication.getMessageTemplates('', channel);
  }

  async getMessageTemplate(templateId: string): Promise<MessageTemplate> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async createMessageTemplate(template: Omit<MessageTemplate, 'id' | 'usageCount' | 'lastUsed' | 'createdAt' | 'updatedAt'>): Promise<MessageTemplate> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async updateMessageTemplate(templateId: string, updates: Partial<MessageTemplate>): Promise<MessageTemplate> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async deleteMessageTemplate(templateId: string): Promise<void> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async duplicateMessageTemplate(templateId: string, newName: string): Promise<MessageTemplate> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async previewTemplate(templateId: string, variables: Record<string, any>): Promise<{ subject?: string; content: string }> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  // ==================== GESTION DES CAMPAGNES ====================

  async getCampaigns(schoolId: string): Promise<Campaign[]> {
    return api.communication.getCampaigns(schoolId);
  }

  async getCampaign(campaignId: string): Promise<Campaign> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async createCampaign(campaign: Omit<Campaign, 'id' | 'totalMessages' | 'sentMessages' | 'deliveredMessages' | 'readMessages' | 'failedMessages' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<Campaign> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async startCampaign(campaignId: string): Promise<Campaign> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async pauseCampaign(campaignId: string): Promise<Campaign> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async resumeCampaign(campaignId: string): Promise<Campaign> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async cancelCampaign(campaignId: string): Promise<Campaign> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async getCampaignMessages(campaignId: string, pagination?: PaginationParams): Promise<PaginatedResponse<Message>> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  // ==================== CONVERSATIONS ====================

  async getConversations(filters?: { contactId?: string; channel?: string; status?: string }): Promise<Conversation[]> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async createConversation(contactId: string, channel: 'email' | 'sms' | 'whatsapp', subject?: string): Promise<Conversation> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async addMessageToConversation(conversationId: string, content: string, attachments?: string[]): Promise<Conversation> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async closeConversation(conversationId: string): Promise<Conversation> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async archiveConversation(conversationId: string): Promise<Conversation> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async assignConversation(conversationId: string, userId: string): Promise<Conversation> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  // ==================== STATISTIQUES & RAPPORTS ====================

  async getCommunicationStats(period: 'today' | 'week' | 'month' | 'year' | 'custom', startDate?: string, endDate?: string): Promise<CommunicationStats> {
    return api.communication.getStats('', period, startDate, endDate);
  }

  async getChannelStats(channel: 'email' | 'sms' | 'whatsapp', period: string, startDate?: string, endDate?: string): Promise<any> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async getContactEngagement(contactId: string): Promise<{
    totalMessages: number;
    lastContact: string;
    preferredChannel: string;
    responseRate: number;
    engagementScore: number;
  }> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async generateReport(type: 'delivery' | 'engagement' | 'cost' | 'campaign_performance', filters: any): Promise<{ filePath: string }> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  // ==================== INTÉGRATIONS ====================

  async getIntegrationConfigs(): Promise<IntegrationConfig[]> {
    try {
      // Utiliser l'API HTTP
      try {
        return await api.communication.getIntegrationConfigs();
      } else {
        throw new Error('getIntegrationConfigs not yet implemented');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des configurations d\'intégration:', error);
      return [];
    }
  }

  async createIntegrationConfig(config: Omit<IntegrationConfig, 'id' | 'createdAt' | 'updatedAt' | 'lastTriggered' | 'triggerCount'>): Promise<IntegrationConfig> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async updateIntegrationConfig(configId: string, updates: Partial<IntegrationConfig>): Promise<IntegrationConfig> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async deleteIntegrationConfig(configId: string): Promise<void> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async testIntegration(configId: string, testData?: any): Promise<{ success: boolean; message: string; details?: any }> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async triggerIntegration(configId: string, eventData: any): Promise<{ triggered: boolean; messageId?: string }> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  // ==================== UTILITAIRES ====================

  async uploadAttachment(file: File): Promise<{ id: string; filename: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async validatePhoneNumber(phoneNumber: string, country: string = 'BJ'): Promise<{ valid: boolean; formatted: string; carrier?: string }> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async validateEmail(email: string): Promise<{ valid: boolean; reason?: string }> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async getAvailableVariables(context: 'student' | 'parent' | 'class' | 'school'): Promise<{ name: string; description: string; example: string }[]> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async renderTemplate(content: string, variables: Record<string, any>): Promise<string> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  // ==================== WEBHOOKS & ÉVÉNEMENTS ====================

  async setupWebhook(channel: 'whatsapp' | 'sms', config: any): Promise<{ webhookUrl: string; secret: string }> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  async processWebhookEvent(channel: string, payload: any, signature?: string): Promise<{ processed: boolean; actions?: string[] }> {
    // Cette méthode n'est pas encore implémentée dans le preload
    throw new Error('Method not yet implemented');
  }

  // ==================== ÉVÉNEMENTS EN TEMPS RÉEL ====================

  onMessageStatusUpdate(callback: (messageId: string, status: string, details?: any) => void): () => void {
    const handler = (event: any, data: any) => callback(data.messageId, data.status, data.details);
    return api.communication.on('messageStatusUpdate', handler);
  }

  onNewInboundMessage(callback: (message: any) => void): () => void {
    const handler = (event: any, message: any) => callback(message);
    return api.communication.on('newInboundMessage', handler);
  }

  onCampaignUpdate(callback: (campaignId: string, status: string, stats: any) => void): () => void {
    const handler = (event: any, data: any) => callback(data.campaignId, data.status, data.stats);
    return api.communication.on('campaignUpdate', handler);
  }
}

export const communicationService = CommunicationService.getInstance();
