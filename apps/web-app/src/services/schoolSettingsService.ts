// Import de l'API Electron via window

export interface SchoolSettingsData {
  // Informations générales
  name: string;
  abbreviation: string;
  educationLevels: string;
  motto: string;
  slogan: string;
  
  // Contact et localisation
  address: string;
  department: string;
  commune: string;
  primaryPhone: string;
  secondaryPhone: string;
  primaryEmail: string;
  website: string;
  whatsapp: string;
  
  // Logo et identité visuelle
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  
  // Informations pédagogiques
  founderName: string;
  directorPrimary: string;
  directorSecondary: string;
  
  // Cycles d'enseignement
  cycles: {
    maternelle: string[];
    primaire: string[];
    college: string[];
    lycee: string[];
  };
}

export class SchoolSettingsService {
  private static instance: SchoolSettingsService;
  private settings: SchoolSettingsData | null = null;

  private constructor() {}

  public static getInstance(): SchoolSettingsService {
    if (!SchoolSettingsService.instance) {
      SchoolSettingsService.instance = new SchoolSettingsService();
    }
    return SchoolSettingsService.instance;
  }

  // Charger les paramètres depuis la base de données
  async loadSettings(): Promise<SchoolSettingsData> {
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI && electronAPI.school) {
        const settings = await electronAPI.school.getSettings();
        this.settings = settings;
        return settings;
      }
      throw new Error('Electron API not available');
    } catch (error) {
      console.error('Error loading school settings:', error);
      throw error;
    }
  }

  // Sauvegarder les paramètres dans la base de données
  async saveSettings(settings: SchoolSettingsData): Promise<void> {
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI && electronAPI.school) {
        await electronAPI.school.saveSettings(settings);
        this.settings = settings;
      } else {
        throw new Error('Electron API not available');
      }
    } catch (error) {
      console.error('Error saving school settings:', error);
      throw error;
    }
  }

  // Obtenir les paramètres actuels (depuis le cache)
  getCurrentSettings(): SchoolSettingsData | null {
    return this.settings;
  }

  // Réinitialiser les paramètres aux valeurs par défaut
  async resetToDefaults(): Promise<void> {
    const defaultSettings: SchoolSettingsData = {
      name: '',
      abbreviation: '',
      educationLevels: '',
      motto: '',
      slogan: '',
      address: '',
      department: '',
      commune: '',
      primaryPhone: '',
      secondaryPhone: '',
      primaryEmail: '',
      website: '',
      whatsapp: '',
      logo: '',
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
      founderName: '',
      directorPrimary: '',
      directorSecondary: '',
      cycles: {
        maternelle: [],
        primaire: [],
        college: [],
        lycee: []
      }
    };

    await this.saveSettings(defaultSettings);
  }

  // Valider les paramètres
  validateSettings(settings: SchoolSettingsData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!settings.name.trim()) {
      errors.push('Le nom de l\'établissement est requis');
    }

    if (!settings.educationLevels) {
      errors.push('Les niveaux d\'enseignement sont requis');
    }

    if (!settings.address.trim()) {
      errors.push('L\'adresse est requise');
    }

    if (!settings.primaryPhone.trim()) {
      errors.push('Le téléphone principal est requis');
    }

    if (!settings.primaryEmail.trim()) {
      errors.push('L\'email principal est requis');
    }

    if (settings.primaryEmail && !this.isValidEmail(settings.primaryEmail)) {
      errors.push('L\'email principal n\'est pas valide');
    }

    if (settings.website && !this.isValidUrl(settings.website)) {
      errors.push('L\'URL du site web n\'est pas valide');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export const schoolSettingsService = SchoolSettingsService.getInstance();
