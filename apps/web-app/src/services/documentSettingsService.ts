import { DocumentSettingsData, HeaderConfig, FooterConfig, DocumentTemplate, WatermarkConfig } from '../types/documentSettings';

// Fonction utilitaire pour vérifier si l'API Electron est disponible
const isElectronAPIAvailable = () => {
  return typeof window !== 'undefined' && 
         (window as any).electronAPI && 
         typeof (window as any).electronAPI === 'object';
};

class DocumentSettingsService {
  private static instance: DocumentSettingsService;

  public static getInstance(): DocumentSettingsService {
    if (!DocumentSettingsService.instance) {
      DocumentSettingsService.instance = new DocumentSettingsService();
    }
    return DocumentSettingsService.instance;
  }

  // Charger les paramètres de documents
  async loadSettings(): Promise<DocumentSettingsData> {
    if (!isElectronAPIAvailable()) {
      console.warn('Electron API not available, returning default settings');
      return this.getDefaultSettings();
    }

    try {
      const electronAPI = (window as any).electronAPI;
      
      // Vérifier si l'API documents est disponible
      if (!electronAPI.documents) {
        console.warn('Documents API not available, returning default settings');
        return this.getDefaultSettings();
      }
      
      const settings = await electronAPI.documents.getSettings();
      return settings || this.getDefaultSettings();
    } catch (error) {
      console.error('Error loading document settings:', error);
      
      // Si l'erreur est "No handler registered", retourner les paramètres par défaut
      if (error instanceof Error && error.message.includes('No handler registered')) {
        console.warn('Documents handlers not registered yet, returning default settings');
        return this.getDefaultSettings();
      }
      
      throw new Error('Erreur lors du chargement des paramètres de documents');
    }
  }

  // Sauvegarder les paramètres de documents
  async saveSettings(settings: DocumentSettingsData): Promise<void> {
    if (!isElectronAPIAvailable()) {
      console.warn('Electron API not available, settings not saved');
      return;
    }

    try {
      const electronAPI = (window as any).electronAPI;
      
      // Vérifier si l'API documents est disponible
      if (!electronAPI.documents) {
        console.warn('Documents API not available, settings not saved');
        return;
      }
      
      await electronAPI.documents.saveSettings(settings);
    } catch (error) {
      console.error('Error saving document settings:', error);
      
      // Si l'erreur est "No handler registered", ne pas lever d'exception
      if (error instanceof Error && error.message.includes('No handler registered')) {
        console.warn('Documents handlers not registered yet, settings not saved');
        return;
      }
      
      throw new Error('Erreur lors de la sauvegarde des paramètres de documents');
    }
  }

  // Réinitialiser les paramètres par défaut
  async resetToDefaults(): Promise<void> {
    if (!isElectronAPIAvailable()) {
      console.warn('Electron API not available, reset not performed');
      return;
    }

    try {
      const electronAPI = (window as any).electronAPI;
      
      // Vérifier si l'API documents est disponible
      if (!electronAPI.documents) {
        console.warn('Documents API not available, reset not performed');
        return;
      }
      
      await electronAPI.documents.resetSettings();
    } catch (error) {
      console.error('Error resetting document settings:', error);
      
      // Si l'erreur est "No handler registered", ne pas lever d'exception
      if (error instanceof Error && error.message.includes('No handler registered')) {
        console.warn('Documents handlers not registered yet, reset not performed');
        return;
      }
      
      throw new Error('Erreur lors de la réinitialisation des paramètres de documents');
    }
  }

  // Obtenir les paramètres par défaut
  getDefaultSettings(): DocumentSettingsData {
    return {
      headers: [
        {
          id: 'default-bulletin',
          name: 'En-tête Bulletin par défaut',
          type: 'bulletin',
          schoolName: '',
          schoolAddress: '',
          schoolPhone: '',
          schoolEmail: '',
          academicYear: new Date().getFullYear().toString(),
          slogan: '',
          additionalText: ''
        }
      ],
      footers: [
        {
          id: 'default-bulletin',
          name: 'Pied de page Bulletin par défaut',
          type: 'bulletin',
          directorName: '',
          directorTitle: 'Directeur',
          legalNotice: '',
          contactInfo: '',
          qrCode: false,
          date: true,
          pageNumber: true
        }
      ],
      templates: [
        {
          id: 'TPL-001',
          name: 'Facture standard',
          description: 'Template de facture avec en-tête et pied de page personnalisés',
          type: 'invoice',
          category: 'boutique',
          lastModified: new Date().toISOString().split('T')[0],
          isDefault: true,
          isActive: true,
          createdBy: 'Admin'
        }
      ],
      watermarks: [
        {
          id: 'default-watermark',
          name: 'Configuration par défaut',
          type: 'bulletin',
          watermark: {
            enabled: false,
            type: 'text',
            content: 'CONFIDENTIEL',
            opacity: 0.2,
            position: 'diagonal',
            size: 'medium',
            color: '#000000'
          }
        }
      ]
    };
  }

  // Valider les paramètres
  validateSettings(settings: DocumentSettingsData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validation des en-têtes
    settings.headers.forEach((header, index) => {
      if (!header.name.trim()) {
        errors.push(`Le nom de l'en-tête ${index + 1} est requis`);
      }
      if (!header.schoolName.trim()) {
        errors.push(`Le nom de l'école pour l'en-tête ${index + 1} est requis`);
      }
    });

    // Validation des pieds de page
    settings.footers.forEach((footer, index) => {
      if (!footer.name.trim()) {
        errors.push(`Le nom du pied de page ${index + 1} est requis`);
      }
      if (!footer.directorName.trim()) {
        errors.push(`Le nom du directeur pour le pied de page ${index + 1} est requis`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const documentSettingsService = DocumentSettingsService.getInstance();
export default documentSettingsService;
