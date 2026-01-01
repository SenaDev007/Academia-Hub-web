import React, { useState } from 'react';
import { FileText, Download, Printer, Eye } from 'lucide-react';
import { useDocumentTemplate } from '../../hooks/useDocumentTemplate';
import DocumentTemplateSelector from '../common/DocumentTemplateSelector';
import { getDocumentTypeIcon } from '../icons/DocumentTypeIcons';

const DocumentGenerationExample: React.FC = () => {
  const [documentType, setDocumentType] = useState('bulletin');
  const [previewMode, setPreviewMode] = useState(false);

  const {
    selectedTemplate,
    setSelectedTemplate,
    availableTemplates,
    isUsingDefault
  } = useDocumentTemplate(documentType);

  const documentTypes = [
    { id: 'bulletin', name: 'Bulletin de notes' },
    { id: 'certificat', name: 'Certificat de scolarité' },
    { id: 'attestation', name: 'Attestation' },
    { id: 'facture', name: 'Facture' },
    { id: 'reçu', name: 'Reçu de paiement' }
  ];

  const handleGenerateDocument = () => {
    if (!selectedTemplate) {
      alert('Veuillez sélectionner un template');
      return;
    }

    // Ici, vous généreriez le document avec le template sélectionné
    console.log('Génération du document avec le template:', selectedTemplate);
    alert(`Document généré avec le template: ${selectedTemplate.name}`);
  };

  const handlePreviewDocument = () => {
    if (!selectedTemplate) {
      alert('Veuillez sélectionner un template');
      return;
    }

    setPreviewMode(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Génération de Documents</h2>
        
        <div className="space-y-6">
          {/* Sélection du type de document */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de document
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {documentTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setDocumentType(type.id)}
                  className={`flex items-center space-x-2 px-3 py-2 border rounded-lg text-left transition-colors ${
                    documentType === type.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {getDocumentTypeIcon(type.id, "w-4 h-4")}
                  <span className="text-sm font-medium">{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sélection du template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template de document
            </label>
            <DocumentTemplateSelector
              documentType={documentType}
              templates={availableTemplates}
              selectedTemplateId={selectedTemplate?.id}
              onTemplateSelect={setSelectedTemplate}
              showDefaultOption={true}
            />
            
            {/* Informations sur le template sélectionné */}
            {selectedTemplate && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedTemplate.name}</p>
                    <p className="text-xs text-gray-500">{selectedTemplate.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isUsingDefault && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Template par défaut
                      </span>
                    )}
                    <span className="text-xs text-gray-500">ID: {selectedTemplate.id}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePreviewDocument}
              disabled={!selectedTemplate}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4" />
              <span>Prévisualiser</span>
            </button>
            
            <button
              onClick={handleGenerateDocument}
              disabled={!selectedTemplate}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              <span>Générer le document</span>
            </button>
            
            <button
              onClick={handleGenerateDocument}
              disabled={!selectedTemplate}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger</span>
            </button>
            
            <button
              onClick={handleGenerateDocument}
              disabled={!selectedTemplate}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </button>
          </div>

          {/* Aperçu du document */}
          {previewMode && selectedTemplate && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Aperçu du document</h3>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {getDocumentTypeIcon('close', "w-5 h-5")}
                </button>
              </div>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedTemplate.content }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentGenerationExample;
