// Service de gestion des licences avec communication sécurisée vers Electron

export interface SchoolData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface PromoterData {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ProductKeyResult {
  id: string;
  productKey: string;
  status: string;
}

export interface LicenseValidationResult {
  valid: boolean;
  message?: string;
  license?: {
    id: string;
    type: string;
    maxInstallations: number;
    currentInstallations: number;
    expirationDate: string;
  };
}

export interface InstallationData {
  machineId: string;
  schoolId: string;
}

export interface SchoolLicenseStatus {
  hasLicense: boolean;
  message?: string;
  license?: {
    id: string;
    type: string;
    status: string;
    maxInstallations: number;
    currentInstallations: number;
    activationDate: string;
    expirationDate: string;
    daysUntilExpiration: number;
  };
  schoolName?: string;
  promoterEmail?: string;
}

/**
 * Service de gestion des licences et clés d'activation
 */
export class LicenseService {
  private static async invokeIpc(channel: string, ...args: any[]): Promise<any> {
    try {
      // Vérifier si on est dans un environnement Electron
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        // En production Electron
        return await api.invoke(channel, ...args);
      } else {
        // En développement web - utiliser des données mockées
        return await this.getMockData(channel, ...args);
      }
    } catch (error) {
      console.error(`Error invoking ${channel}:`, error);
      throw error;
    }
  }

  private static async getMockData(channel: string, ...args: any[]): Promise<any> {
    // Données mockées pour le développement
    switch (channel) {
      case 'license-generate-product-key':
        return {
          success: true,
          id: 'LIC-' + Date.now(),
          productKey: 'DEMO-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
          status: 'active'
        };
      case 'license-send-product-key-email':
        return {
          success: true,
          messageId: 'msg-' + Date.now()
        };
      case 'license-validate-activation-key':
        return {
          success: true,
          valid: true,
          message: 'Clé d\'activation valide',
          license: {
            id: 'LIC-' + Date.now(),
            type: 'demo',
            maxInstallations: 1,
            currentInstallations: 1,
            expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
          }
        };
      case 'license-register-installation':
        return {
          success: true,
          installationId: 'INST-' + Date.now()
        };
      case 'license-check-school-status':
        return {
          success: true,
          hasLicense: true,
          message: 'Licence active',
          license: {
            id: 'LIC-' + Date.now(),
            type: 'demo',
            status: 'active',
            maxInstallations: 1,
            currentInstallations: 1,
            activationDate: new Date().toISOString(),
            expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            daysUntilExpiration: 15
          },
          schoolName: 'École de Démonstration',
          promoterEmail: 'demo@example.com'
        };
      case 'license-create-demo':
        return {
          success: true,
          id: 'LIC-' + Date.now(),
          type: 'demo',
          status: 'active'
        };
      default:
        return { success: false, error: 'Channel not implemented in mock' };
    }
  }
  /**
   * Génère une clé produit unique pour une école
   * @param schoolData Informations sur l'école
   * @param promoterData Informations sur le promoteur
   * @returns Promise avec la clé produit générée
   */
  static async generateProductKey(
    schoolData: SchoolData, 
    promoterData: PromoterData
  ): Promise<ProductKeyResult> {
    try {
      const result = await this.invokeIpc(
        'license-generate-product-key', 
        schoolData, 
        promoterData
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la génération de la clé produit');
      }
      
      return {
        id: result.id,
        productKey: result.productKey,
        status: result.status
      };
    } catch (error) {
      console.error('Error generating product key:', error);
      throw error;
    }
  }

  /**
   * Envoie la clé produit par email
   * @param productKeyData Données de la clé produit
   * @param promoterEmail Email du promoteur
   * @returns Promise avec le résultat de l'envoi
   */
  static async sendProductKeyEmail(
    productKeyData: any, 
    promoterEmail: string
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      const result = await this.invokeIpc(
        'license-send-product-key-email', 
        productKeyData, 
        promoterEmail
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de l\'envoi de l\'email');
      }
      
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending product key email:', error);
      throw error;
    }
  }

  /**
   * Valide une clé d'activation
   * @param activationKey Clé d'activation à valider
   * @returns Promise avec le résultat de la validation
   */
  static async validateActivationKey(
    activationKey: string
  ): Promise<LicenseValidationResult> {
    try {
      const result = await this.invokeIpc(
        'license-validate-activation-key', 
        activationKey
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la validation de la clé');
      }
      
      return {
        valid: result.valid,
        message: result.message,
        license: result.license
      };
    } catch (error) {
      console.error('Error validating activation key:', error);
      throw error;
    }
  }

  /**
   * Enregistre une nouvelle installation
   * @param licenseId ID de la licence
   * @param installationData Données de l'installation
   * @returns Promise avec le résultat de l'enregistrement
   */
  static async registerInstallation(
    licenseId: string, 
    installationData: InstallationData
  ): Promise<{ success: boolean; installationId?: string }> {
    try {
      const result = await this.invokeIpc(
        'license-register-installation', 
        licenseId, 
        installationData
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de l\'enregistrement de l\'installation');
      }
      
      return { success: true, installationId: result.installationId };
    } catch (error) {
      console.error('Error registering installation:', error);
      throw error;
    }
  }

  /**
   * Vérifie le statut de la licence d'une école
   * @param schoolId ID de l'école
   * @returns Promise avec le statut de la licence
   */
  static async checkSchoolLicenseStatus(
    schoolId: string
  ): Promise<SchoolLicenseStatus> {
    try {
      const result = await this.invokeIpc(
        'license-check-school-status', 
        schoolId
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la vérification du statut de la licence');
      }
      
      return {
        hasLicense: result.hasLicense,
        message: result.message,
        license: result.license,
        schoolName: result.schoolName,
        promoterEmail: result.promoterEmail
      };
    } catch (error) {
      console.error('Error checking school license status:', error);
      throw error;
    }
  }

  /**
   * Crée une licence de démonstration
   * @param schoolData Données de l'école
   * @returns Promise avec la licence créée
   */
  static async createDemoLicense(
    schoolData: SchoolData
  ): Promise<{ success: boolean; license?: any }> {
    try {
      const result = await this.invokeIpc(
        'license-create-demo', 
        schoolData
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la création de la licence de démonstration');
      }
      
      return { success: true, license: result };
    } catch (error) {
      console.error('Error creating demo license:', error);
      throw error;
    }
  }

  /**
   * Génère un ID machine unique pour identifier l'installation
   * @returns ID machine unique
   */
  static generateMachineId(): string {
    // Générer un ID basé sur les informations système
    const platform = navigator.platform;
    const userAgent = navigator.userAgent;
    const screenResolution = `${screen.width}x${screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Créer un hash simple
    const hashInput = `${platform}-${userAgent}-${screenResolution}-${timezone}`;
    let hash = 0;
    
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36).toUpperCase();
  }

  /**
   * Vérifie si l'application est en mode démonstration
   * @returns true si en mode démo, false sinon
   */
  static isDemoMode(): boolean {
    // Vérifier dans le localStorage ou les préférences
    const demoMode = localStorage.getItem('demoMode');
    return demoMode === 'true';
  }

  /**
   * Active le mode démonstration
   * @param days Nombre de jours pour la démo (défaut: 15)
   */
  static activateDemoMode(days: number = 15): void {
    const demoExpiry = new Date();
    demoExpiry.setDate(demoExpiry.getDate() + days);
    
    localStorage.setItem('demoMode', 'true');
    localStorage.setItem('demoExpiry', demoExpiry.toISOString());
  }

  /**
   * Vérifie si la démo est expirée
   * @returns true si expirée, false sinon
   */
  static isDemoExpired(): boolean {
    const demoExpiry = localStorage.getItem('demoExpiry');
    if (!demoExpiry) return true;
    
    const expiryDate = new Date(demoExpiry);
    return new Date() > expiryDate;
  }

  /**
   * Désactive le mode démonstration
   */
  static deactivateDemoMode(): void {
    localStorage.removeItem('demoMode');
    localStorage.removeItem('demoExpiry');
  }
}

export default LicenseService;
