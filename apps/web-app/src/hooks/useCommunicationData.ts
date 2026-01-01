import { useState, useEffect, useCallback } from 'react';
import { communicationService } from '../services/communicationService';
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
  ContactFilters,
  CommunicationFilters,
  PaginationParams,
  PaginatedResponse
} from '../types/communication';

interface UseCommunicationDataReturn {
  // États des données
  contacts: Contact[];
  contactGroups: ContactGroup[];
  messages: Message[];
  templates: MessageTemplate[];
  campaigns: Campaign[];
  conversations: Conversation[];
  smtpConfigs: SMTPConfig[];
  smsConfigs: SMSConfig[];
  whatsappConfigs: WhatsAppConfig[];
  stats: CommunicationStats | null;
  integrations: IntegrationConfig[];
  
  // États de chargement
  loading: boolean;
  error: string | null;
  
  // Actions - Contacts
  fetchContacts: (filters?: ContactFilters, pagination?: PaginationParams) => Promise<void>;
  createContact: (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Contact>;
  updateContact: (contactId: string, updates: Partial<Contact>) => Promise<Contact>;
  deleteContact: (contactId: string) => Promise<void>;
  importContacts: (file: File, options?: any) => Promise<{ imported: number; skipped: number; errors: string[] }>;
  exportContacts: (filters?: ContactFilters, format?: 'csv' | 'excel') => Promise<{ filePath: string }>;
  syncContactsWithStudents: () => Promise<{ synced: number; created: number; updated: number }>;
  
  // Actions - Groupes
  fetchContactGroups: () => Promise<void>;
  createContactGroup: (groupData: Omit<ContactGroup, 'id' | 'createdAt'>) => Promise<ContactGroup>;
  updateContactGroup: (groupId: string, updates: Partial<ContactGroup>) => Promise<ContactGroup>;
  deleteContactGroup: (groupId: string) => Promise<void>;
  
  // Actions - Messages
  fetchMessages: (filters?: CommunicationFilters, pagination?: PaginationParams) => Promise<void>;
  sendMessage: (messageData: any) => Promise<Message>;
  sendBulkMessage: (messageData: any) => Promise<Campaign>;
  scheduleMessage: (messageData: any) => Promise<Message>;
  
  // Actions - Templates
  fetchTemplates: (channel?: 'email' | 'sms' | 'whatsapp' | 'all') => Promise<void>;
  createTemplate: (templateData: Omit<MessageTemplate, 'id' | 'usageCount' | 'lastUsed' | 'createdAt' | 'updatedAt'>) => Promise<MessageTemplate>;
  updateTemplate: (templateId: string, updates: Partial<MessageTemplate>) => Promise<MessageTemplate>;
  deleteTemplate: (templateId: string) => Promise<void>;
  
  // Actions - Campagnes
  fetchCampaigns: () => Promise<void>;
  createCampaign: (campaignData: any) => Promise<Campaign>;
  startCampaign: (campaignId: string) => Promise<Campaign>;
  pauseCampaign: (campaignId: string) => Promise<Campaign>;
  cancelCampaign: (campaignId: string) => Promise<Campaign>;
  
  // Actions - Configurations
  fetchConfigs: () => Promise<void>;
  testConfig: (configType: 'smtp' | 'sms' | 'whatsapp', configId: string, testRecipient: string) => Promise<{ success: boolean; message: string }>;
  
  // Actions - Statistiques
  fetchStats: (period?: 'today' | 'week' | 'month' | 'year' | 'custom', startDate?: string, endDate?: string) => Promise<void>;
  
  // Utilitaires
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export const useCommunicationData = (): UseCommunicationDataReturn => {
  // États des données
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactGroups, setContactGroups] = useState<ContactGroup[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [smtpConfigs, setSmtpConfigs] = useState<SMTPConfig[]>([]);
  const [smsConfigs, setSmsConfigs] = useState<SMSConfig[]>([]);
  const [whatsappConfigs, setWhatsappConfigs] = useState<WhatsAppConfig[]>([]);
  const [stats, setStats] = useState<CommunicationStats | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  
  // États de chargement
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction utilitaire pour gérer les erreurs
  const handleError = useCallback((error: any, operation: string) => {
    console.error(`Erreur lors de ${operation}:`, error);
    setError(`Erreur lors de ${operation}: ${error.message || 'Erreur inconnue'}`);
  }, []);

  // Actions - Contacts
  const fetchContacts = useCallback(async (filters?: ContactFilters, pagination?: PaginationParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await communicationService.getContacts(filters, pagination);
      setContacts(response.data);
    } catch (error) {
      handleError(error, 'la récupération des contacts');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const createContact = useCallback(async (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newContact = await communicationService.createContact(contactData);
      setContacts(prev => [...prev, newContact]);
      return newContact;
    } catch (error) {
      handleError(error, 'la création du contact');
      throw error;
    }
  }, [handleError]);

  const updateContact = useCallback(async (contactId: string, updates: Partial<Contact>) => {
    try {
      setError(null);
      const updatedContact = await communicationService.updateContact(contactId, updates);
      setContacts(prev => prev.map(contact => contact.id === contactId ? updatedContact : contact));
      return updatedContact;
    } catch (error) {
      handleError(error, 'la mise à jour du contact');
      throw error;
    }
  }, [handleError]);

  const deleteContact = useCallback(async (contactId: string) => {
    try {
      setError(null);
      await communicationService.deleteContact(contactId);
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
    } catch (error) {
      handleError(error, 'la suppression du contact');
      throw error;
    }
  }, [handleError]);

  const importContacts = useCallback(async (file: File, options?: any) => {
    try {
      setError(null);
      const result = await communicationService.importContacts(file, options);
      // Recharger les contacts après import
      await fetchContacts();
      return result;
    } catch (error) {
      handleError(error, 'l\'importation des contacts');
      throw error;
    }
  }, [handleError, fetchContacts]);

  const exportContacts = useCallback(async (filters?: ContactFilters, format: 'csv' | 'excel' = 'csv') => {
    try {
      setError(null);
      return await communicationService.exportContacts(filters, format);
    } catch (error) {
      handleError(error, 'l\'exportation des contacts');
      throw error;
    }
  }, [handleError]);

  const syncContactsWithStudents = useCallback(async () => {
    try {
      setError(null);
      const result = await communicationService.syncContactsWithStudents();
      // Recharger les contacts après synchronisation
      await fetchContacts();
      return result;
    } catch (error) {
      handleError(error, 'la synchronisation des contacts');
      throw error;
    }
  }, [handleError, fetchContacts]);

  // Actions - Groupes
  const fetchContactGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const groups = await communicationService.getContactGroups();
      setContactGroups(groups);
    } catch (error) {
      handleError(error, 'la récupération des groupes');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const createContactGroup = useCallback(async (groupData: Omit<ContactGroup, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      const newGroup = await communicationService.createContactGroup(groupData);
      setContactGroups(prev => [...prev, newGroup]);
      return newGroup;
    } catch (error) {
      handleError(error, 'la création du groupe');
      throw error;
    }
  }, [handleError]);

  const updateContactGroup = useCallback(async (groupId: string, updates: Partial<ContactGroup>) => {
    try {
      setError(null);
      const updatedGroup = await communicationService.updateContactGroup(groupId, updates);
      setContactGroups(prev => prev.map(group => group.id === groupId ? updatedGroup : group));
      return updatedGroup;
    } catch (error) {
      handleError(error, 'la mise à jour du groupe');
      throw error;
    }
  }, [handleError]);

  const deleteContactGroup = useCallback(async (groupId: string) => {
    try {
      setError(null);
      await communicationService.deleteContactGroup(groupId);
      setContactGroups(prev => prev.filter(group => group.id !== groupId));
    } catch (error) {
      handleError(error, 'la suppression du groupe');
      throw error;
    }
  }, [handleError]);

  // Actions - Messages
  const fetchMessages = useCallback(async (filters?: CommunicationFilters, pagination?: PaginationParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await communicationService.getMessages(filters, pagination);
      setMessages(response.data);
    } catch (error) {
      handleError(error, 'la récupération des messages');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const sendMessage = useCallback(async (messageData: any) => {
    try {
      setError(null);
      const message = await communicationService.sendMessage(messageData);
      setMessages(prev => [...prev, message]);
      return message;
    } catch (error) {
      handleError(error, 'l\'envoi du message');
      throw error;
    }
  }, [handleError]);

  const sendBulkMessage = useCallback(async (messageData: any) => {
    try {
      setError(null);
      const campaign = await communicationService.sendBulkMessage(messageData);
      setCampaigns(prev => [...prev, campaign]);
      return campaign;
    } catch (error) {
      handleError(error, 'l\'envoi groupé');
      throw error;
    }
  }, [handleError]);

  const scheduleMessage = useCallback(async (messageData: any) => {
    try {
      setError(null);
      const message = await communicationService.scheduleMessage(messageData);
      setMessages(prev => [...prev, message]);
      return message;
    } catch (error) {
      handleError(error, 'la planification du message');
      throw error;
    }
  }, [handleError]);

  // Actions - Templates
  const fetchTemplates = useCallback(async (channel?: 'email' | 'sms' | 'whatsapp' | 'all') => {
    try {
      setLoading(true);
      setError(null);
      const templateList = await communicationService.getMessageTemplates(channel);
      setTemplates(templateList);
    } catch (error) {
      handleError(error, 'la récupération des templates');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const createTemplate = useCallback(async (templateData: Omit<MessageTemplate, 'id' | 'usageCount' | 'lastUsed' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newTemplate = await communicationService.createMessageTemplate(templateData);
      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (error) {
      handleError(error, 'la création du template');
      throw error;
    }
  }, [handleError]);

  const updateTemplate = useCallback(async (templateId: string, updates: Partial<MessageTemplate>) => {
    try {
      setError(null);
      const updatedTemplate = await communicationService.updateMessageTemplate(templateId, updates);
      setTemplates(prev => prev.map(template => template.id === templateId ? updatedTemplate : template));
      return updatedTemplate;
    } catch (error) {
      handleError(error, 'la mise à jour du template');
      throw error;
    }
  }, [handleError]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      setError(null);
      await communicationService.deleteMessageTemplate(templateId);
      setTemplates(prev => prev.filter(template => template.id !== templateId));
    } catch (error) {
      handleError(error, 'la suppression du template');
      throw error;
    }
  }, [handleError]);

  // Actions - Campagnes
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const campaignList = await communicationService.getCampaigns();
      setCampaigns(campaignList);
    } catch (error) {
      handleError(error, 'la récupération des campagnes');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const createCampaign = useCallback(async (campaignData: any) => {
    try {
      setError(null);
      const newCampaign = await communicationService.createCampaign(campaignData);
      setCampaigns(prev => [...prev, newCampaign]);
      return newCampaign;
    } catch (error) {
      handleError(error, 'la création de la campagne');
      throw error;
    }
  }, [handleError]);

  const startCampaign = useCallback(async (campaignId: string) => {
    try {
      setError(null);
      const updatedCampaign = await communicationService.startCampaign(campaignId);
      setCampaigns(prev => prev.map(campaign => campaign.id === campaignId ? updatedCampaign : campaign));
      return updatedCampaign;
    } catch (error) {
      handleError(error, 'le démarrage de la campagne');
      throw error;
    }
  }, [handleError]);

  const pauseCampaign = useCallback(async (campaignId: string) => {
    try {
      setError(null);
      const updatedCampaign = await communicationService.pauseCampaign(campaignId);
      setCampaigns(prev => prev.map(campaign => campaign.id === campaignId ? updatedCampaign : campaign));
      return updatedCampaign;
    } catch (error) {
      handleError(error, 'la pause de la campagne');
      throw error;
    }
  }, [handleError]);

  const cancelCampaign = useCallback(async (campaignId: string) => {
    try {
      setError(null);
      const updatedCampaign = await communicationService.cancelCampaign(campaignId);
      setCampaigns(prev => prev.map(campaign => campaign.id === campaignId ? updatedCampaign : campaign));
      return updatedCampaign;
    } catch (error) {
      handleError(error, 'l\'annulation de la campagne');
      throw error;
    }
  }, [handleError]);

  // Actions - Configurations
  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [smtp, sms, whatsapp, integrationConfigs] = await Promise.all([
        communicationService.getSMTPConfigs(),
        communicationService.getSMSConfigs(),
        communicationService.getWhatsAppConfigs(),
        communicationService.getIntegrationConfigs()
      ]);
      setSmtpConfigs(smtp);
      setSmsConfigs(sms);
      setWhatsappConfigs(whatsapp);
      setIntegrations(integrationConfigs);
    } catch (error) {
      handleError(error, 'la récupération des configurations');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const testConfig = useCallback(async (configType: 'smtp' | 'sms' | 'whatsapp', configId: string, testRecipient: string) => {
    try {
      setError(null);
      const request = { configType, configId, testRecipient };
      
      switch (configType) {
        case 'smtp':
          return await communicationService.testSMTPConfig(request);
        case 'sms':
          return await communicationService.testSMSConfig(request);
        case 'whatsapp':
          return await communicationService.testWhatsAppConfig(request);
        default:
          throw new Error('Type de configuration non supporté');
      }
    } catch (error) {
      handleError(error, 'le test de configuration');
      throw error;
    }
  }, [handleError]);

  // Actions - Statistiques
  const fetchStats = useCallback(async (period: 'today' | 'week' | 'month' | 'year' | 'custom' = 'month', startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      const statistics = await communicationService.getCommunicationStats(period, startDate, endDate);
      setStats(statistics);
    } catch (error) {
      handleError(error, 'la récupération des statistiques');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Utilitaires
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchContacts(),
        fetchContactGroups(),
        fetchMessages(),
        fetchTemplates(),
        fetchCampaigns(),
        fetchConfigs(),
        fetchStats()
      ]);
    } catch (error) {
      handleError(error, 'le rafraîchissement des données');
    } finally {
      setLoading(false);
    }
  }, [fetchContacts, fetchContactGroups, fetchMessages, fetchTemplates, fetchCampaigns, fetchConfigs, fetchStats, handleError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Chargement initial des données
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Écouter les événements en temps réel
  useEffect(() => {
    const unsubscribeMessageStatus = communicationService.onMessageStatusUpdate((messageId, status, details) => {
      setMessages(prev => prev.map(message => 
        message.id === messageId 
          ? { ...message, status: status as any, ...details }
          : message
      ));
    });

    const unsubscribeCampaignUpdate = communicationService.onCampaignUpdate((campaignId, status, stats) => {
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, status: status as any, ...stats }
          : campaign
      ));
    });

    return () => {
      unsubscribeMessageStatus();
      unsubscribeCampaignUpdate();
    };
  }, []);

  return {
    // États des données
    contacts,
    contactGroups,
    messages,
    templates,
    campaigns,
    conversations,
    smtpConfigs,
    smsConfigs,
    whatsappConfigs,
    stats,
    integrations,
    
    // États de chargement
    loading,
    error,
    
    // Actions - Contacts
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    importContacts,
    exportContacts,
    syncContactsWithStudents,
    
    // Actions - Groupes
    fetchContactGroups,
    createContactGroup,
    updateContactGroup,
    deleteContactGroup,
    
    // Actions - Messages
    fetchMessages,
    sendMessage,
    sendBulkMessage,
    scheduleMessage,
    
    // Actions - Templates
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    
    // Actions - Campagnes
    fetchCampaigns,
    createCampaign,
    startCampaign,
    pauseCampaign,
    cancelCampaign,
    
    // Actions - Configurations
    fetchConfigs,
    testConfig,
    
    // Actions - Statistiques
    fetchStats,
    
    // Utilitaires
    refreshData,
    clearError
  };
};
