import { useState, useEffect, useCallback } from 'react';
import { DocumentSettingsData } from '../types/documentSettings';
import { documentSettingsService } from '../services/documentSettingsService';
import { defaultDocumentTemplates } from '../data/defaultDocumentTemplates';
import { defaultHeaderTemplates, defaultFooterTemplates } from '../data/defaultHeaderFooterTemplates';

interface UseDocumentSettingsReturn {
  // Data states
  settings: DocumentSettingsData;
  
  // Loading states
  loading: boolean;
  error: string | null;
  success: string | null;
  
  // CRUD operations
  loadSettings: () => Promise<void>;
  saveSettings: (settingsData: DocumentSettingsData) => Promise<void>;
  resetSettings: () => Promise<void>;
  updateSetting: (field: keyof DocumentSettingsData, value: any) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

// Fonction utilitaire pour vérifier si l'API Electron est disponible
const isElectronAPIAvailable = () => {
  return typeof window !== 'undefined' && 
         (window as any).electronAPI && 
         typeof (window as any).electronAPI === 'object';
};

// Données par défaut
const getDefaultSettings = (): DocumentSettingsData => ({
  headerFooterConfigs: [...defaultHeaderTemplates, ...defaultFooterTemplates],
  templates: defaultDocumentTemplates,
  watermarkConfigs: []
});

export function useDocumentSettings(): UseDocumentSettingsReturn {
  const [settings, setSettings] = useState<DocumentSettingsData>(getDefaultSettings());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fonction pour charger les paramètres
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log('Chargement des paramètres de documents...');
      const settingsData = await documentSettingsService.loadSettings();
      console.log('Paramètres de documents chargés:', settingsData);
      
      // Fusionner avec les valeurs par défaut pour s'assurer que tous les champs existent
      const mergedSettings = { ...getDefaultSettings(), ...settingsData };
      setSettings(mergedSettings);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des paramètres de documents';
      setError(errorMessage);
      console.error('Error loading document settings:', err);
      
      // En cas d'erreur, utiliser les valeurs par défaut
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour sauvegarder les paramètres
  const saveSettings = useCallback(async (settingsData: DocumentSettingsData) => {
    if (!isElectronAPIAvailable()) {
      const errorMessage = 'Mode développement : API Electron non disponible';
      setError(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log('Sauvegarde des paramètres de documents...', settingsData);
      
      // Valider les paramètres
      const validation = documentSettingsService.validateSettings(settingsData);
      if (!validation.isValid) {
        const errorMessage = validation.errors.join(', ');
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      await documentSettingsService.saveSettings(settingsData);
      setSettings(settingsData);
      setSuccess('Paramètres de documents sauvegardés avec succès');
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde des paramètres de documents';
      setError(errorMessage);
      console.error('Error saving document settings:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour réinitialiser les paramètres
  const resetSettings = useCallback(async () => {
    if (!isElectronAPIAvailable()) {
      const errorMessage = 'Mode développement : API Electron non disponible';
      setError(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log('Réinitialisation des paramètres de documents...');
      await documentSettingsService.resetToDefaults();
      
      const defaultSettings = documentSettingsService.getDefaultSettings();
      setSettings(defaultSettings);
      setSuccess('Paramètres de documents réinitialisés avec succès');
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la réinitialisation des paramètres de documents';
      setError(errorMessage);
      console.error('Error resetting document settings:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour mettre à jour un paramètre spécifique
  const updateSetting = useCallback((field: keyof DocumentSettingsData, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Charger les paramètres au montage du composant
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    success,
    loadSettings,
    saveSettings,
    resetSettings,
    updateSetting,
    setError,
    setSuccess
  };
}
