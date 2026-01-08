import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Eye } from 'lucide-react';
import { HeaderConfig, FooterConfig } from '../../types/documentSettings';

interface HeaderFooterTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: HeaderConfig | FooterConfig) => void;
  templateData?: HeaderConfig | FooterConfig;
  isEdit?: boolean;
  type: 'header' | 'footer';
}

const HeaderFooterTemplateModal: React.FC<HeaderFooterTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  templateData,
  isEdit = false,
  type
}) => {
  const [formData, setFormData] = useState<Partial<HeaderConfig | FooterConfig>>({
    name: '',
    description: '',
    type: 'bulletin',
    category: 'academique',
    isDefault: false,
    isActive: true,
    documentTypes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Propriétés spécifiques aux en-têtes
    ...(type === 'header' ? {
      schoolName: '',
      schoolAddress: '',
      schoolPhone: '',
      schoolEmail: '',
      academicYear: '',
      slogan: '',
      additionalText: ''
    } : {}),
    // Propriétés spécifiques aux pieds de page
    ...(type === 'footer' ? {
      directorName: '',
      directorTitle: '',
      legalNotice: '',
      contactInfo: '',
      qrCode: false,
      date: true,
      pageNumber: false
    } : {})
  });

  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (templateData && isEdit) {
      setFormData(templateData);
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'bulletin',
        category: 'academique',
        isDefault: false,
        isActive: true,
        documentTypes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Propriétés spécifiques aux en-têtes
        ...(type === 'header' ? {
          schoolName: '',
          schoolAddress: '',
          schoolPhone: '',
          schoolEmail: '',
          academicYear: '',
          slogan: '',
          additionalText: ''
        } : {}),
        // Propriétés spécifiques aux pieds de page
        ...(type === 'footer' ? {
          directorName: '',
          directorTitle: '',
          legalNotice: '',
          contactInfo: '',
          qrCode: false,
          date: true,
          pageNumber: false
        } : {})
      });
    }
  }, [isOpen, templateData, isEdit, type]);

  const documentTypes = [
    { id: 'bulletin', name: 'Bulletin de notes' },
    { id: 'certificat', name: 'Certificat de scolarité' },
    { id: 'convocation', name: 'Convocation' },
    { id: 'attestation', name: 'Attestation' },
    { id: 'facture', name: 'Facture' },
    { id: 'reçu', name: 'Reçu de paiement' }
  ];

  const categories = [
    { id: 'academique', name: 'Académique' },
    { id: 'administratif', name: 'Administratif' },
    { id: 'financier', name: 'Financier' },
    { id: 'autre', name: 'Autre' }
  ];

  const handleSave = () => {
    if (!formData.name || !formData.type) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const template: HeaderConfig | FooterConfig = {
      id: templateData?.id || `TEMPLATE-${Date.now()}`,
      name: formData.name,
      description: formData.description || '',
      type: formData.type as any,
      category: formData.category as any,
      isDefault: formData.isDefault || false,
      isActive: formData.isActive !== false,
      documentTypes: formData.documentTypes || [],
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...formData
    } as HeaderConfig | FooterConfig;

    onSave(template);
    onClose();
  };

  const handleDocumentTypeChange = (docType: string, checked: boolean) => {
    const currentTypes = formData.documentTypes || [];
    if (checked) {
      setFormData({
        ...formData,
        documentTypes: [...currentTypes, docType]
      });
    } else {
      setFormData({
        ...formData,
        documentTypes: currentTypes.filter(t => t !== docType)
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Modifier' : 'Créer'} un template {type === 'header' ? 'd\'en-tête' : 'de pied de page'}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Prévisualiser"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {previewMode ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Aperçu du template</h3>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="text-sm text-gray-600">
                  {type === 'header' ? 'Aperçu de l\'en-tête' : 'Aperçu du pied de page'} - {formData.name}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Type: {formData.type} | Catégorie: {formData.category}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du template *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: En-tête Bulletin Officiel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de document *
                  </label>
                  <select
                    value={formData.type || 'bulletin'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {documentTypes.map(docType => (
                      <option key={docType.id} value={docType.id}>{docType.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Description du template..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={formData.category || 'academique'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Types de documents applicables
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {documentTypes.map(docType => (
                      <label key={docType.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.documentTypes?.includes(docType.id) || false}
                          onChange={(e) => handleDocumentTypeChange(docType.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{docType.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Propriétés spécifiques aux en-têtes */}
              {type === 'header' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Configuration de l'en-tête</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de l'école
                      </label>
                      <input
                        type="text"
                        value={formData.schoolName || ''}
                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="{{nomEcole}}"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse de l'école
                      </label>
                      <input
                        type="text"
                        value={formData.schoolAddress || ''}
                        onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="{{adresseEcole}}"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="text"
                        value={formData.schoolPhone || ''}
                        onChange={(e) => setFormData({ ...formData, schoolPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="{{telephoneEcole}}"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.schoolEmail || ''}
                        onChange={(e) => setFormData({ ...formData, schoolEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="{{emailEcole}}"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Année scolaire
                      </label>
                      <input
                        type="text"
                        value={formData.academicYear || ''}
                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="{{anneeScolaire}}"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slogan
                      </label>
                      <input
                        type="text"
                        value={formData.slogan || ''}
                        onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="{{sloganEcole}}"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texte additionnel
                    </label>
                    <input
                      type="text"
                      value={formData.additionalText || ''}
                      onChange={(e) => setFormData({ ...formData, additionalText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: BULLETIN DE NOTES - TRIMESTRE 1"
                    />
                  </div>
                </div>
              )}

              {/* Propriétés spécifiques aux pieds de page */}
              {type === 'footer' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Configuration du pied de page</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du responsable
                      </label>
                      <input
                        type="text"
                        value={formData.directorName || ''}
                        onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="{{directeurNom}}"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre du responsable
                      </label>
                      <input
                        type="text"
                        value={formData.directorTitle || ''}
                        onChange={(e) => setFormData({ ...formData, directorTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="{{directeurTitre}}"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mention légale
                    </label>
                    <textarea
                      value={formData.legalNotice || ''}
                      onChange={(e) => setFormData({ ...formData, legalNotice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Mention légale..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Informations de contact
                    </label>
                    <input
                      type="text"
                      value={formData.contactInfo || ''}
                      onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="{{adresseEcole}} - Tél: {{telephoneEcole}}"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Options d'affichage
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.date || false}
                          onChange={(e) => setFormData({ ...formData, date: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Afficher la date</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.pageNumber || false}
                          onChange={(e) => setFormData({ ...formData, pageNumber: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Afficher le numéro de page</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.qrCode || false}
                          onChange={(e) => setFormData({ ...formData, qrCode: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Afficher un QR Code</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Options générales */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Options générales</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isDefault || false}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Définir comme template par défaut</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive !== false}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Template actif</span>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isEdit ? 'Modifier' : 'Créer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderFooterTemplateModal;
