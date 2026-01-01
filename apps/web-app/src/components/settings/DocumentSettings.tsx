import React, { useState } from 'react';
import DocumentHeaderFooterConfig from './DocumentHeaderFooterConfig';
import DocumentTemplates from './DocumentTemplates';
import DocumentWatermarkConfig from './DocumentWatermarkConfig';
import HeaderFooterTemplates from './HeaderFooterTemplates';
import { useDocumentSettingsContext } from '../../contexts/DocumentSettingsContext';

const DocumentSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'header-footer' | 'templates' | 'watermark' | 'header-footer-templates'>('header-footer');
  
  // Hook pour les paramètres de documents
  const { settings, loading, error, success, saveSettings, setError, setSuccess } = useDocumentSettingsContext();

  return (
    <div className="space-y-6">
      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Succès</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveSection('header-footer')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === 'header-footer'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              En-têtes & Pieds de page
            </button>
            <button
              onClick={() => setActiveSection('watermark')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === 'watermark'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Filigranes du document
            </button>
            <button
              onClick={() => setActiveSection('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Modèles de documents
            </button>
            <button
              onClick={() => setActiveSection('header-footer-templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === 'header-footer-templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Templates En-têtes/Pieds
            </button>
          </nav>
        </div>
        <div className="p-6">
          {activeSection === 'header-footer' && <DocumentHeaderFooterConfig />}
          {activeSection === 'watermark' && <DocumentWatermarkConfig />}
          {activeSection === 'templates' && <DocumentTemplates />}
          {activeSection === 'header-footer-templates' && <HeaderFooterTemplates />}
        </div>
      </div>
    </div>
  );
};

export default DocumentSettings;
