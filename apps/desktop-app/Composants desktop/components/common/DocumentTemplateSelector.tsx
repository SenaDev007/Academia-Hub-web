import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Template } from '../../types/documentSettings';
import { useDefaultTemplates } from '../../hooks/useDefaultTemplates';
import { getDocumentTypeIcon } from '../icons/DocumentTypeIcons';

interface DocumentTemplateSelectorProps {
  documentType: string;
  templates: Template[];
  selectedTemplateId?: string;
  onTemplateSelect: (template: Template | null) => void;
  showDefaultOption?: boolean;
  className?: string;
}

const DocumentTemplateSelector: React.FC<DocumentTemplateSelectorProps> = ({
  documentType,
  templates,
  selectedTemplateId,
  onTemplateSelect,
  showDefaultOption = true,
  className = ''
}) => {
  const { getDefaultTemplate, isDefaultTemplate } = useDefaultTemplates();
  const [isOpen, setIsOpen] = useState(false);

  const defaultTemplate = getDefaultTemplate(documentType, templates);
  const availableTemplates = templates.filter(t => t.documentType === documentType);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);


  useEffect(() => {
    // Si aucun template n'est sélectionné et qu'il y a un template par défaut, l'utiliser
    if (!selectedTemplateId && defaultTemplate && showDefaultOption) {
      onTemplateSelect(defaultTemplate);
    }
  }, [defaultTemplate, selectedTemplateId, onTemplateSelect, showDefaultOption]);

  const handleTemplateSelect = (template: Template) => {
    onTemplateSelect(template);
    setIsOpen(false);
  };

  const handleUseDefault = () => {
    if (defaultTemplate) {
      onTemplateSelect(defaultTemplate);
      setIsOpen(false);
    }
  };

  const handleClearSelection = () => {
    onTemplateSelect(null);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <div className="flex items-center space-x-3">
          {getDocumentTypeIcon(documentType, "w-5 h-5")}
          <div className="text-left">
            {selectedTemplate ? (
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedTemplate.name}</p>
                <p className="text-xs text-gray-500">{selectedTemplate.description}</p>
              </div>
            ) : defaultTemplate && showDefaultOption ? (
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Template par défaut</p>
                  <p className="text-xs text-gray-500">{defaultTemplate.name}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Sélectionner un template...</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {selectedTemplate && isDefaultTemplate(documentType, selectedTemplate.id) && (
            <Star className="w-4 h-4 text-yellow-500" />
          )}
          {getDocumentTypeIcon('chevronDown', "w-5 h-5 text-gray-400")}
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {showDefaultOption && defaultTemplate && (
            <div className="p-2">
              <button
                onClick={handleUseDefault}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-yellow-50 rounded-lg"
              >
                <Star className="w-4 h-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Template par défaut</p>
                  <p className="text-xs text-gray-500">{defaultTemplate.name}</p>
                </div>
                {selectedTemplateId === defaultTemplate.id && (
                  <div className="text-green-500 ml-auto">
                    {getDocumentTypeIcon('check', "w-4 h-4 text-green-500")}
                  </div>
                )}
              </button>
            </div>
          )}

          {availableTemplates.length > 0 && (
            <div className="border-t border-gray-200 p-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-1">
                Templates disponibles
              </p>
              {availableTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg"
                >
                  {getDocumentTypeIcon(template.documentType, "w-4 h-4")}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{template.name}</p>
                    <p className="text-xs text-gray-500">{template.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isDefaultTemplate(documentType, template.id) && (
                      <Star className="w-4 h-4 text-yellow-500" />
                    )}
                    {selectedTemplateId === template.id && (
                      <div className="text-green-500">
                        {getDocumentTypeIcon('check', "w-4 h-4 text-green-500")}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-gray-200 p-2">
            <button
              onClick={handleClearSelection}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg text-gray-500"
            >
              {getDocumentTypeIcon('circle', "w-4 h-4")}
              <p className="text-sm">Aucun template</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentTemplateSelector;
