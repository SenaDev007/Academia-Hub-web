import { useState, useEffect, useCallback } from 'react';
import { Template } from '../types/documentSettings';
import { defaultTemplateService } from '../services/defaultTemplateService';

interface UseDefaultTemplatesReturn {
  defaultTemplates: { [key: string]: string };
  setDefaultTemplate: (documentType: string, templateId: string) => void;
  removeDefaultTemplate: (documentType: string) => void;
  getDefaultTemplate: (documentType: string, templates: Template[]) => Template | null;
  isDefaultTemplate: (documentType: string, templateId: string) => boolean;
  resetAllDefaultTemplates: () => void;
}

export function useDefaultTemplates(): UseDefaultTemplatesReturn {
  const [defaultTemplates, setDefaultTemplates] = useState<{ [key: string]: string }>({});

  // Charger les templates par défaut au montage
  useEffect(() => {
    setDefaultTemplates(defaultTemplateService.getAllDefaultTemplates());
  }, []);

  // Écouter les changements de templates par défaut
  useEffect(() => {
    const handleDefaultTemplateChanged = () => {
      setDefaultTemplates(defaultTemplateService.getAllDefaultTemplates());
    };

    window.addEventListener('defaultTemplateChanged', handleDefaultTemplateChanged);
    return () => {
      window.removeEventListener('defaultTemplateChanged', handleDefaultTemplateChanged);
    };
  }, []);

  const setDefaultTemplate = useCallback((documentType: string, templateId: string) => {
    defaultTemplateService.setDefaultTemplate(documentType, templateId);
  }, []);

  const removeDefaultTemplate = useCallback((documentType: string) => {
    defaultTemplateService.removeDefaultTemplate(documentType);
  }, []);

  const getDefaultTemplate = useCallback((documentType: string, templates: Template[]): Template | null => {
    return defaultTemplateService.getDefaultTemplateFromList(documentType, templates);
  }, []);

  const isDefaultTemplate = useCallback((documentType: string, templateId: string): boolean => {
    return defaultTemplateService.isDefaultTemplate(documentType, templateId);
  }, []);

  const resetAllDefaultTemplates = useCallback(() => {
    defaultTemplateService.resetAllDefaultTemplates();
  }, []);

  return {
    defaultTemplates,
    setDefaultTemplate,
    removeDefaultTemplate,
    getDefaultTemplate,
    isDefaultTemplate,
    resetAllDefaultTemplates
  };
}
