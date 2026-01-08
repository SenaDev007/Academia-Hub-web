import { useState, useEffect } from 'react';
import { Template } from '../types/documentSettings';
import { useDefaultTemplates } from './useDefaultTemplates';
import { useDocumentSettingsContext } from '../contexts/DocumentSettingsContext';

interface UseDocumentTemplateReturn {
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template | null) => void;
  availableTemplates: Template[];
  defaultTemplate: Template | null;
  isUsingDefault: boolean;
  loadTemplate: (templateId: string) => void;
  clearTemplate: () => void;
}

export function useDocumentTemplate(documentType: string): UseDocumentTemplateReturn {
  const { settings } = useDocumentSettingsContext();
  const { getDefaultTemplate, isDefaultTemplate } = useDefaultTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const templates = settings.templates || [];
  const availableTemplates = templates.filter(t => t.documentType === documentType);
  const defaultTemplate = getDefaultTemplate(documentType, templates);

  // Charger le template par défaut au montage si aucun template n'est sélectionné
  useEffect(() => {
    if (!selectedTemplate && defaultTemplate) {
      setSelectedTemplate(defaultTemplate);
    }
  }, [defaultTemplate, selectedTemplate]);

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
    }
  };

  const clearTemplate = () => {
    setSelectedTemplate(null);
  };

  const isUsingDefault = selectedTemplate ? isDefaultTemplate(documentType, selectedTemplate.id) : false;

  return {
    selectedTemplate,
    setSelectedTemplate,
    availableTemplates,
    defaultTemplate,
    isUsingDefault,
    loadTemplate,
    clearTemplate
  };
}
