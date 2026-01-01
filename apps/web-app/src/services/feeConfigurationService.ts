// Vérifier si nous sommes dans Electron
const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

export interface FeeConfiguration {
  id?: string;
  academicYearId: string;
  level: string;
  classId?: string | null;
  className?: string;
  classLevel?: string;
  inscriptionFee: number;
  reinscriptionFee: number;
  tuitionFees: number[];
  effectiveDate: string;
  schoolId: string;
  createdAt?: string;
  updatedAt?: string;
}

class FeeConfigurationService {
  private electronAPI: any = null;

  constructor() {
    if (isElectron) {
      this.electronAPI = (window as any).electronAPI;
    }
  }

  private async ensureElectronAPI() {
    if (!this.electronAPI && isElectron) {
      console.log('🔄 Attente de l\'API Electron pour les configurations de frais...');
      let attempts = 0;
      while (!this.electronAPI && attempts < 100) {
        this.electronAPI = (window as any).electronAPI;
        if (!this.electronAPI) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
      }
    }
    return this.electronAPI;
  }

  async createFeeConfiguration(data: Omit<FeeConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<FeeConfiguration> {
    if (!isElectron) {
      console.warn('Mode développement - génération d\'ID local');
      const mockId = this.generateId();
      return {
        ...data,
        id: mockId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    const electronAPI = await this.ensureElectronAPI();
    if (!electronAPI || !electronAPI.finance) {
      throw new Error('API Electron non disponible');
    }

    try {
      console.log('💾 Création de la configuration de frais:', data);
      
      // Suivre le modèle Students : utiliser directement l'API students pour récupérer les classes
      if (electronAPI.students) {
        console.log('🔄 Vérification des classes via l\'API students...');
        const classesResult = await electronAPI.students.getClasses(data.schoolId);
        console.log('Classes disponibles:', classesResult);
        
        // Vérifier si la classe existe
        if (data.classId && classesResult.success) {
          const classExists = classesResult.data.find((cls: any) => cls.id === data.classId);
          if (!classExists) {
            console.warn(`⚠️ Classe ${data.classId} non trouvée, configuration au niveau uniquement`);
            data.classId = null; // Configuration au niveau si classe introuvable
          }
        }
      }
      
      const result = await electronAPI.finance.createFeeConfiguration(data);
      console.log('✅ Configuration créée:', result);
      
      // Vérifier si la création a réussi
      if (result && result.success !== false) {
        return result.data || result;
      } else {
        throw new Error(result.error || 'Erreur lors de la création de la configuration');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création de la configuration:', error);
      throw error;
    }
  }

  async updateFeeConfiguration(id: string, data: Partial<FeeConfiguration>): Promise<FeeConfiguration> {
    if (!isElectron) {
      throw new Error('Mode développement - mise à jour non supportée');
    }

    const electronAPI = await this.ensureElectronAPI();
    if (!electronAPI || !electronAPI.finance) {
      throw new Error('API Electron non disponible');
    }

    try {
      const result = await electronAPI.finance.updateFeeConfiguration(id, data);
      return result.data;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la configuration:', error);
      throw error;
    }
  }

  async deleteFeeConfiguration(id: string): Promise<void> {
    if (!isElectron) {
      throw new Error('Mode développement - suppression non supportée');
    }

    const electronAPI = await this.ensureElectronAPI();
    if (!electronAPI || !electronAPI.finance) {
      throw new Error('API Electron non disponible');
    }

    try {
      await electronAPI.finance.deleteFeeConfiguration(id);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la configuration:', error);
      throw error;
    }
  }

  async getFeeConfigurations(schoolId: string, academicYearId?: string): Promise<FeeConfiguration[]> {
    if (!isElectron) {
      return [];
    }

    const electronAPI = await this.ensureElectronAPI();
    if (!electronAPI || !electronAPI.finance) {
      throw new Error('API Electron non disponible');
    }

    try {
      console.log('📊 Appel electronAPI.finance.getFeeConfigurations avec:', { schoolId, academicYearId });
      console.log('🔍 electronAPI disponible:', !!electronAPI);
      console.log('🔍 electronAPI.finance disponible:', !!electronAPI?.finance);
      console.log('🔍 electronAPI.finance.getFeeConfigurations disponible:', !!electronAPI?.finance?.getFeeConfigurations);
      
      // Test de l'appel IPC
      console.log('🔍 Test de l\'appel IPC...');
      const result = await electronAPI.finance.getFeeConfigurations(schoolId, { academicYearId });
      console.log('✅ Configurations récupérées du backend:', result);
      console.log('🔍 Type du résultat:', typeof result);
      console.log('🔍 Clés du résultat:', Object.keys(result || {}));
      
      return result.data || result || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des configurations:', error);
      console.error('❌ Stack trace:', error.stack);
      throw error;
    }
  }

  private generateId(): string {
    return 'fc_' + Math.random().toString(36).substr(2, 9);
  }
}

export const feeConfigurationService = new FeeConfigurationService();
