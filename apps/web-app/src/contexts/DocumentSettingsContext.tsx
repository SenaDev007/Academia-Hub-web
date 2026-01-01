import React, { createContext, useContext, ReactNode } from 'react';
import { useDocumentSettings } from '../hooks/useDocumentSettings';
import { DocumentSettingsData } from '../types/documentSettings';

interface DocumentSettingsContextType {
  settings: DocumentSettingsData;
  loading: boolean;
  error: string | null;
  success: string | null;
  loadSettings: () => Promise<void>;
  saveSettings: (settingsData: DocumentSettingsData) => Promise<void>;
  resetSettings: () => Promise<void>;
  updateSetting: (field: keyof DocumentSettingsData, value: any) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

const DocumentSettingsContext = createContext<DocumentSettingsContextType | undefined>(undefined);

interface DocumentSettingsProviderProps {
  children: ReactNode;
}

export const DocumentSettingsProvider: React.FC<DocumentSettingsProviderProps> = ({ children }) => {
  const documentSettings = useDocumentSettings();

  return (
    <DocumentSettingsContext.Provider value={documentSettings}>
      {children}
    </DocumentSettingsContext.Provider>
  );
};

export const useDocumentSettingsContext = (): DocumentSettingsContextType => {
  const context = useContext(DocumentSettingsContext);
  if (context === undefined) {
    throw new Error('useDocumentSettingsContext must be used within a DocumentSettingsProvider');
  }
  return context;
};
