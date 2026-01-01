import { useState, useEffect, useCallback } from 'react';
import { SchoolSettingsData } from '../services/schoolSettingsService';

export const useSchoolSettings = () => {
  const [settings, setSettings] = useState<SchoolSettingsData>({
    name: 'École Primaire Excellence',
    abbreviation: 'EPE',
    educationLevels: 'Maternelle, Primaire',
    motto: 'Excellence et Discipline',
    slogan: 'Établissement Privé',
    address: 'Adresse de l\'école',
    department: '',
    commune: '',
    primaryPhone: '+228 22 21 20 19',
    secondaryPhone: '',
    primaryEmail: 'contact@ecole-excellence.tg',
    website: 'www.ecole-excellence.tg',
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      // Utiliser la même approche que ReceiptModal
      // Utiliser l'API HTTP
      try {
        const response = await api.school.getSettings();
        const data = response.data?.data || response.data;
        console.log('Paramètres de l\'école récupérés:', data);
        
        if (data) {
          setSettings({
            name: data.name || data.schoolName || 'Nom de l\'école',
            abbreviation: data.abbreviation || 'École',
            educationLevels: data.educationLevels || 'Maternelle, Primaire',
            motto: data.motto || 'Excellence et Discipline',
            slogan: data.slogan || 'Établissement Privé',
            address: data.address || 'Adresse de l\'école',
            department: data.department || '',
            commune: data.commune || '',
            primaryPhone: data.primaryPhone || data.phone || 'Téléphone',
            secondaryPhone: data.secondaryPhone || '',
            primaryEmail: data.primaryEmail || data.email || 'Email',
            website: data.website || '',
            whatsapp: data.whatsapp || '',
            logo: data.logo || '',
            primaryColor: data.primaryColor || '#3b82f6',
            secondaryColor: data.secondaryColor || '#10b981',
            founderName: data.founderName || '',
            directorPrimary: data.directorPrimary || '',
            directorSecondary: data.directorSecondary || '',
            cycles: data.cycles || {
              maternelle: [],
              primaire: [],
              college: [],
              lycee: []
            }
          });
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement des paramètres de l\'école:', err);
      setError('Impossible de charger les paramètres de l\'école');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (settingsData: SchoolSettingsData) => {
    setLoading(true);
    try {
      // Utiliser l'API HTTP
      try {
        await api.school.updateSettings(settingsData);
        setSettings(settingsData);
      setSuccess('Paramètres sauvegardés avec succès');
        console.log('Paramètres sauvegardés:', settingsData);
      } else {
        throw new Error('API Electron non disponible');
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Impossible de sauvegarder les paramètres');
    } finally {
      setLoading(false);
    }
  }, []);

  const resetSettings = useCallback(async () => {
    setLoading(true);
    try {
      // Logique de réinitialisation à implémenter
      console.log('Réinitialisation des paramètres');
      setSuccess('Paramètres réinitialisés');
    } catch (err) {
      console.error('Erreur lors de la réinitialisation:', err);
      setError('Impossible de réinitialiser les paramètres');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetting = useCallback((field: keyof SchoolSettingsData, value: string | SchoolSettingsData['cycles']) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const setErrorState = useCallback((error: string | null) => {
    setError(error);
  }, []);

  const setSuccessState = useCallback((success: string | null) => {
    setSuccess(success);
  }, []);

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
    setError: setErrorState,
    setSuccess: setSuccessState
  };
};