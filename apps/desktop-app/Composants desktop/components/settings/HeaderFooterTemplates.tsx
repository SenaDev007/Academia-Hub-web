import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  Star, 
  StarOff,
  BookOpen,
  Building,
  DollarSign,
  FileType
} from 'lucide-react';
import { useDocumentSettingsContext } from '../../contexts/DocumentSettingsContext';
import { useDefaultTemplates } from '../../hooks/useDefaultTemplates';
import { HeaderConfig, FooterConfig } from '../../types/documentSettings';
import { getCategoryIcon } from '../icons/DocumentTypeIcons';
import HeaderFooterTemplateModal from '../modals/HeaderFooterTemplateModal';
import BeninHeaderFooterPreviewModal from '../modals/BeninHeaderFooterPreviewModal';

const HeaderFooterTemplates: React.FC = () => {
  const { settings, saveSettings } = useDocumentSettingsContext();
  const { setDefaultTemplate, removeDefaultTemplate, isDefaultTemplate } = useDefaultTemplates();
  const [selectedType, setSelectedType] = useState<'header' | 'footer'>('header');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<HeaderConfig | FooterConfig | undefined>();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<HeaderConfig | FooterConfig | undefined>();

  const headers = settings.headerFooterConfigs.filter(config => 'schoolName' in config) as HeaderConfig[];
  const footers = settings.headerFooterConfigs.filter(config => 'directorName' in config) as FooterConfig[];

  const categories = [
    { id: 'all', name: 'Toutes les catégories', icon: <FileType className="w-5 h-5" /> },
    { id: 'academique', name: 'Académique', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'administratif', name: 'Administratif', icon: <Building className="w-5 h-5" /> },
    { id: 'financier', name: 'Financier', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'autre', name: 'Autre', icon: <FileType className="w-5 h-5" /> }
  ];

  const documentTypes = [
    { id: 'bulletin', name: 'Bulletin de notes' },
    { id: 'certificat', name: 'Certificat de scolarité' },
    { id: 'convocation', name: 'Convocation' },
    { id: 'attestation', name: 'Attestation' },
    { id: 'facture', name: 'Facture' },
    { id: 'reçu', name: 'Reçu de paiement' }
  ];

  const getFilteredItems = () => {
    const items = selectedType === 'header' ? headers : footers;
    return items.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesCategory;
    });
  };

  const handleSetDefault = (item: HeaderConfig | FooterConfig) => {
    setDefaultTemplate(item.type, item.id);
  };

  const handleRemoveDefault = (item: HeaderConfig | FooterConfig) => {
    removeDefaultTemplate(item.type);
  };

  const handleEdit = (item: HeaderConfig | FooterConfig) => {
    setEditingTemplate(item);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDuplicate = (item: HeaderConfig | FooterConfig) => {
    const duplicatedItem = {
      ...item,
      id: `TEMPLATE-${Date.now()}`,
      name: `${item.name} (Copie)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingTemplate(duplicatedItem);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleDelete = (item: HeaderConfig | FooterConfig) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le template "${item.name}" ?`)) {
      const updatedConfigs = settings.headerFooterConfigs.filter(config => config.id !== item.id);
      saveSettings({
        ...settings,
        headerFooterConfigs: updatedConfigs
      });
    }
  };

  const handlePreview = (item: HeaderConfig | FooterConfig) => {
    setPreviewTemplate(item);
    setIsPreviewModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingTemplate(undefined);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleSaveTemplate = (template: HeaderConfig | FooterConfig) => {
    if (isEditMode && editingTemplate) {
      // Modification
      const updatedConfigs = settings.headerFooterConfigs.map(config => 
        config.id === template.id ? template : config
      );
      saveSettings({
        ...settings,
        headerFooterConfigs: updatedConfigs
      });
    } else {
      // Création
      saveSettings({
        ...settings,
        headerFooterConfigs: [...settings.headerFooterConfigs, template]
      });
    }
    setIsModalOpen(false);
    setEditingTemplate(undefined);
    setIsEditMode(false);
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Templates d'En-têtes et Pieds de Page</h2>
            <p className="text-sm text-gray-500">
              Gérez les templates d'en-têtes et pieds de page pour vos documents
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedType('header')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === 'header'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En-têtes ({headers.length})
            </button>
            <button
              onClick={() => setSelectedType('footer')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === 'footer'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pieds de page ({footers.length})
            </button>
          </div>

          <div className="flex space-x-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-500">
            {filteredItems.length} template{filteredItems.length !== 1 ? 's' : ''} trouvé{filteredItems.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau {selectedType === 'header' ? 'en-tête' : 'pied de page'}</span>
          </button>
        </div>

        {/* Liste des templates */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun template trouvé</h3>
            <p className="text-gray-500 mb-6">
              {selectedCategory === 'all' 
                ? `Commencez par créer votre premier template ${selectedType === 'header' ? 'd\'en-tête' : 'de pied de page'}.`
                : 'Aucun template ne correspond à cette catégorie.'}
            </p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un template
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      {item.isDefault && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Par défaut
                        </span>
                      )}
                      {!item.isActive && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Inactif
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>Type: {item.type}</span>
                      {item.category && (
                        <>
                          <span>•</span>
                          <span>Catégorie: {item.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handlePreview(item)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Prévisualiser"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(item)}
                      className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                      title="Dupliquer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {isDefaultTemplate(item.type, item.id) ? (
                      <button
                        onClick={() => handleRemoveDefault(item)}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                        title="Retirer comme template par défaut"
                      >
                        <StarOff className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(item)}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                        title="Définir comme template par défaut"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de création/édition */}
      <HeaderFooterTemplateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTemplate(undefined);
          setIsEditMode(false);
        }}
        onSave={handleSaveTemplate}
        templateData={editingTemplate}
        isEdit={isEditMode}
        type={selectedType}
      />

      {/* Modal de prévisualisation */}
      <BeninHeaderFooterPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewTemplate(undefined);
        }}
        headerConfig={previewTemplate && 'schoolName' in previewTemplate ? previewTemplate as HeaderConfig : undefined}
        footerConfig={previewTemplate && 'directorName' in previewTemplate ? previewTemplate as FooterConfig : undefined}
        title={`Aperçu - ${previewTemplate?.name || 'Template'}`}
      />
    </div>
  );
};

export default HeaderFooterTemplates;
