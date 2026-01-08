import React, { createContext, useContext, ReactNode } from 'react';
import { useSchoolSettings } from '../hooks/useSchoolSettings';
import { SchoolSettingsData } from '../services/schoolSettingsService';

interface SchoolSettingsContextType {
  settings: SchoolSettingsData;
  loading: boolean;
  error: string | null;
  success: string | null;
  loadSettings: () => Promise<void>;
  saveSettings: (settingsData: SchoolSettingsData) => Promise<void>;
  resetSettings: () => Promise<void>;
  updateSetting: (field: keyof SchoolSettingsData, value: string | SchoolSettingsData['cycles']) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

const SchoolSettingsContext = createContext<SchoolSettingsContextType | undefined>(undefined);

interface SchoolSettingsProviderProps {
  children: ReactNode;
}

export const SchoolSettingsProvider: React.FC<SchoolSettingsProviderProps> = ({ children }) => {
  const schoolSettings = useSchoolSettings();

  return (
    <SchoolSettingsContext.Provider value={schoolSettings}>
      {children}
    </SchoolSettingsContext.Provider>
  );
};

export const useSchoolSettingsContext = (): SchoolSettingsContextType => {
  const context = useContext(SchoolSettingsContext);
  if (context === undefined) {
    throw new Error('useSchoolSettingsContext must be used within a SchoolSettingsProvider');
  }
  return context;
};
