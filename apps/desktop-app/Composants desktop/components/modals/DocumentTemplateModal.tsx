import React, { useState, useEffect } from 'react';
import { X, Save, FileText } from 'lucide-react';
import TemplateEditor from '../editors/TemplateEditor';

interface Template {
  id: string;
  name: string;
  description: string;
  documentType: 'bulletin' | 'certificat' | 'facture' | 'reçu' | 'attestation' | 'convocation' | 'other';
  category: 'academique' | 'administratif' | 'financier' | 'autre';
  content: string;
  headerConfigId?: string;
  footerConfigId?: string;
  watermarkConfigId?: string;
  lastModified: string;
  isDefault: boolean;
  isActive: boolean;
  createdBy: string;
}

interface DocumentTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (templateData: Partial<Template>) => void;
  templateData?: Template | null;
  isEdit?: boolean;
}

const DocumentTemplateModal: React.FC<DocumentTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  templateData,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<Partial<Template>>({
    name: '',
    description: '',
    documentType: 'bulletin',
    category: 'academique',
    content: '',
    isDefault: false,
    isActive: true,
    createdBy: 'Admin'
  });


  useEffect(() => {
    if (templateData && isEdit) {
      setFormData(templateData);
    } else {
      setFormData({
        name: '',
        description: '',
        documentType: 'bulletin',
        category: 'academique',
        content: '',
        isDefault: false,
        isActive: true,
        createdBy: 'Admin'
      });
    }
  }, [templateData, isEdit, isOpen]);

  const documentTypes = [
    { value: 'bulletin', label: 'Bulletin de notes' },
    { value: 'certificat', label: 'Certificat de scolarité' },
    { value: 'facture', label: 'Facture' },
    { value: 'reçu', label: 'Reçu de paiement' },
    { value: 'attestation', label: 'Attestation' },
    { value: 'convocation', label: 'Convocation' },
    { value: 'other', label: 'Autre' }
  ];

  const categories = [
    { value: 'academique', label: 'Académique' },
    { value: 'administratif', label: 'Administratif' },
    { value: 'financier', label: 'Financier' },
    { value: 'autre', label: 'Autre' }
  ];

  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert('Le nom du template est requis');
      return;
    }

    const templateToSave = {
      ...formData,
      lastModified: new Date().toISOString().split('T')[0]
    };

    onSave(templateToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEdit ? 'Modifier le template' : 'Nouveau template'}
              </h2>
              <p className="text-sm text-gray-500">
                {isEdit ? 'Modifiez les paramètres du template' : 'Créez un nouveau template de document'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulaire */}
            <div className="space-y-4">
            <div>
                <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du template *
              </label>
              <input
                  id="templateName"
                type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Bulletin trimestriel 2024"
              />
            </div>
            
            <div>
                <label htmlFor="templateDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="templateDescription"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Description du template..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
                    Type de document
              </label>
              <select
                id="documentType"
                    value={formData.documentType || 'bulletin'}
                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value as Template['documentType'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {documentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
              </label>
                  <select
                    id="category"
                    value={formData.category || 'academique'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Template['category'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>
            </div>
            
              <div className="space-y-3">
                <div className="flex items-center">
                <input
                    id="isActive"
                  type="checkbox"
                    checked={formData.isActive || false}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                    Template actif
              </label>
            </div>
            
                <div className="flex items-center">
                <input
                    id="isDefault"
                  type="checkbox"
                    checked={formData.isDefault || false}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isDefault" className="ml-2 text-sm font-medium text-gray-700">
                    Template par défaut
              </label>
            </div>
          </div>
        </div>
        
            {/* Éditeur de template */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Contenu du template</h3>
                <div className="text-sm text-gray-500">
                  Utilisez l'éditeur visuel pour créer votre template
            </div>
              </div>
              
              <TemplateEditor
                content={formData.content || ''}
                onChange={(content) => setFormData({ ...formData, content })}
                isEditMode={isEdit}
              />

              <div className="text-xs text-gray-500">
                <p>💡 <strong>Conseil :</strong> Utilisez l'éditeur visuel pour formater le contenu. Cliquez sur les variables pour les insérer automatiquement.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
            Annuler
            </button>
                    <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
            <Save className="w-4 h-4" />
            <span>{isEdit ? 'Mettre à jour' : 'Créer'}</span>
                    </button>
                  </div>
          </div>
        </div>
  );
};

export default DocumentTemplateModal;