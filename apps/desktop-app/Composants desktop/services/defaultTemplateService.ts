import { Template } from '../types/documentSettings';

interface DefaultTemplateConfig {
  [key: string]: string; // documentType -> templateId
}

class DefaultTemplateService {
  private static instance: DefaultTemplateService;
  private defaultTemplates: DefaultTemplateConfig = {};

  private constructor() {
    this.loadDefaultTemplates();
  }

  public static getInstance(): DefaultTemplateService {
    if (!DefaultTemplateService.instance) {
      DefaultTemplateService.instance = new DefaultTemplateService();
    }
    return DefaultTemplateService.instance;
  }

  private loadDefaultTemplates(): void {
    // Charger depuis le localStorage ou la base de données
    const stored = localStorage.getItem('defaultTemplates');
    if (stored) {
      try {
        this.defaultTemplates = JSON.parse(stored);
      } catch (error) {
        console.error('Erreur lors du chargement des templates par défaut:', error);
        this.defaultTemplates = {};
      }
    }
  }

  private saveDefaultTemplates(): void {
    localStorage.setItem('defaultTemplates', JSON.stringify(this.defaultTemplates));
  }

  /**
   * Définir un template comme par défaut pour un type de document
   */
  public setDefaultTemplate(documentType: string, templateId: string): void {
    this.defaultTemplates[documentType] = templateId;
    this.saveDefaultTemplates();
    
    // Notifier les autres composants du changement
    window.dispatchEvent(new CustomEvent('defaultTemplateChanged', {
      detail: { documentType, templateId }
    }));
  }

  /**
   * Obtenir le template par défaut pour un type de document
   */
  public getDefaultTemplateId(documentType: string): string | null {
    return this.defaultTemplates[documentType] || null;
  }

  /**
   * Obtenir tous les templates par défaut
   */
  public getAllDefaultTemplates(): DefaultTemplateConfig {
    return { ...this.defaultTemplates };
  }

  /**
   * Supprimer un template par défaut
   */
  public removeDefaultTemplate(documentType: string): void {
    delete this.defaultTemplates[documentType];
    this.saveDefaultTemplates();
    
    // Notifier les autres composants du changement
    window.dispatchEvent(new CustomEvent('defaultTemplateChanged', {
      detail: { documentType, templateId: null }
    }));
  }

  /**
   * Vérifier si un template est par défaut pour un type de document
   */
  public isDefaultTemplate(documentType: string, templateId: string): boolean {
    return this.defaultTemplates[documentType] === templateId;
  }

  /**
   * Obtenir le template par défaut depuis une liste de templates
   */
  public getDefaultTemplateFromList(documentType: string, templates: Template[]): Template | null {
    const defaultTemplateId = this.getDefaultTemplateId(documentType);
    if (!defaultTemplateId) return null;
    
    return templates.find(template => template.id === defaultTemplateId) || null;
  }

  /**
   * Réinitialiser tous les templates par défaut
   */
  public resetAllDefaultTemplates(): void {
    this.defaultTemplates = {};
    this.saveDefaultTemplates();
    
    // Notifier les autres composants du changement
    window.dispatchEvent(new CustomEvent('defaultTemplateChanged', {
      detail: { documentType: 'all', templateId: null }
    }));
  }
}

export const defaultTemplateService = DefaultTemplateService.getInstance();
export default defaultTemplateService;
