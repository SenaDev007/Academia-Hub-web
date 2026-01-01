import React from 'react';
import { Star, Settings } from 'lucide-react';
import { useDefaultTemplates } from '../../hooks/useDefaultTemplates';
import { useDocumentSettingsContext } from '../../contexts/DocumentSettingsContext';
import { getDocumentTypeIcon, getCategoryIcon } from '../icons/DocumentTypeIcons';

const DefaultTemplatesOverview: React.FC = () => {
  const { defaultTemplates, getDefaultTemplate } = useDefaultTemplates();
  const { settings } = useDocumentSettingsContext();
  const templates = settings.templates || [];

  const documentTypes = [
    { id: 'bulletin', name: 'Bulletin de notes', category: 'academique' },
    { id: 'certificat', name: 'Certificat de scolarité', category: 'academique' },
    { id: 'convocation', name: 'Convocation', category: 'academique' },
    { id: 'attestation', name: 'Attestation', category: 'administratif' },
    { id: 'facture', name: 'Facture', category: 'financier' },
    { id: 'reçu', name: 'Reçu de paiement', category: 'financier' },
    { id: 'other', name: 'Autre', category: 'autre' }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      academique: 'bg-blue-100 text-blue-800',
      administratif: 'bg-green-100 text-green-800',
      financier: 'bg-yellow-100 text-yellow-800',
      autre: 'bg-purple-100 text-purple-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-yellow-100 rounded-full p-2">
          <Star className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Templates par Défaut</h3>
          <p className="text-sm text-gray-500">
            Configuration des templates utilisés automatiquement dans toute l'application
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documentTypes.map((docType) => {
          const defaultTemplate = getDefaultTemplate(docType.id, templates);
          const isConfigured = !!defaultTemplate;

          return (
            <div
              key={docType.id}
              className={`border rounded-lg p-4 ${
                isConfigured 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getDocumentTypeIcon(docType.id, "w-4 h-4")}
                    {getCategoryIcon(docType.category, "w-5 h-5")}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{docType.name}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(docType.category)}`}>
                      {docType.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  {isConfigured ? (
                    <div className="w-5 h-5 text-green-600">
                      {getDocumentTypeIcon('check', "w-5 h-5")}
                    </div>
                  ) : (
                    <div className="w-5 h-5 text-gray-400">
                      {getDocumentTypeIcon('alert', "w-5 h-5")}
                    </div>
                  )}
                </div>
              </div>

              {isConfigured ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {defaultTemplate.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {defaultTemplate.description}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <FileText className="w-3 h-3" />
                    <span>ID: {defaultTemplate.id}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500 mb-2">Aucun template par défaut</p>
                  <p className="text-xs text-gray-400">
                    Les documents de ce type utiliseront le template système
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Comment ça fonctionne ?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Les templates par défaut sont automatiquement utilisés lors de la génération de documents</li>
              <li>• Un seul template par défaut par type de document peut être défini</li>
              <li>• Les changements s'appliquent immédiatement dans toute l'application</li>
              <li>• Si aucun template par défaut n'est défini, le système utilise un template de base</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultTemplatesOverview;
