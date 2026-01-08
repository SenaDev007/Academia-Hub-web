import React, { useState } from 'react';
import { 
  Plus, 
  Download, 
  Upload, 
  CheckCircle,
  Settings,
  AlertTriangle,
  BookOpen,
  Building,
  DollarSign,
  MoreHorizontal
} from 'lucide-react';
import { DocumentTemplateModal, TemplatePreviewModal, ConfirmModal, AlertModal } from '../modals';
import { useDocumentSettingsContext } from '../../contexts/DocumentSettingsContext';
import { Template } from '../../types/documentSettings';
import TemplateCategorySection from './TemplateCategorySection';
import DefaultTemplatesOverview from './DefaultTemplatesOverview';
import { useDefaultTemplates } from '../../hooks/useDefaultTemplates';

const DocumentTemplates: React.FC = () => {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' | 'info' | 'warning' });

  // Utilisation du context pour les paramètres de documents
  const { settings, error, success, saveSettings } = useDocumentSettingsContext();
  
  // Gestion des templates par défaut
  const { setDefaultTemplate, removeDefaultTemplate } = useDefaultTemplates();

  // Utiliser les templates du context
  const templates = settings.templates || [];

  // Catégories de documents avec icônes et couleurs
  const categories = [
    { 
      id: 'academique', 
      name: 'Académique', 
      color: 'bg-blue-600',
      icon: <BookOpen className="w-5 h-5" />
    },
    { 
      id: 'administratif', 
      name: 'Administratif', 
      color: 'bg-green-600',
      icon: <Building className="w-5 h-5" />
    },
    { 
      id: 'financier', 
      name: 'Financier', 
      color: 'bg-yellow-600',
      icon: <DollarSign className="w-5 h-5" />
    },
    { 
      id: 'autre', 
      name: 'Autre', 
      color: 'bg-purple-600',
      icon: <MoreHorizontal className="w-5 h-5" />
    }
  ];


  // Handlers pour les modals
  const handleNewTemplate = () => {
    setIsEditMode(false);
    setSelectedTemplate(null);
    setIsTemplateModalOpen(true);
  };

  const handleEditTemplate = (template: Template) => {
    setIsEditMode(true);
    setSelectedTemplate(template);
    setIsTemplateModalOpen(true);
  };

  const handleDeleteTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsConfirmModalOpen(true);
  };

  const handleDuplicateTemplate = async (template: Template) => {
    try {
    const duplicatedTemplate = {
      ...template,
        id: `TPL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${template.name} (copie)`,
        isDefault: false,
        lastModified: new Date().toISOString().split('T')[0]
      };
      
      const updatedTemplates = [...templates, duplicatedTemplate];
      const updatedSettings = {
        ...settings,
        templates: updatedTemplates
      };

      await saveSettings(updatedSettings);
    
    setAlertMessage({
      title: 'Template dupliqué',
      message: `Le template "${template.name}" a été dupliqué avec succès.`,
      type: 'success'
    });
    setIsAlertModalOpen(true);
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
      setAlertMessage({
        title: 'Erreur de duplication',
        message: 'Erreur lors de la duplication du template.',
        type: 'error'
      });
      setIsAlertModalOpen(true);
    }
  };

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsPreviewModalOpen(true);
  };

  const handleSetDefaultTemplate = (template: Template) => {
    setDefaultTemplate(template.documentType, template.id);
    setAlertMessage({
      title: 'Template par défaut défini',
      message: `Le template "${template.name}" est maintenant le template par défaut pour les documents de type "${template.documentType}".`,
      type: 'success'
    });
    setIsAlertModalOpen(true);
  };

  const handleRemoveDefaultTemplate = (template: Template) => {
    removeDefaultTemplate(template.documentType);
    setAlertMessage({
      title: 'Template par défaut retiré',
      message: `Le template "${template.name}" n'est plus le template par défaut pour les documents de type "${template.documentType}".`,
      type: 'success'
    });
    setIsAlertModalOpen(true);
  };

  const handleExportTemplates = () => {
    try {
    const exportData = {
        templates: templates,
      exportDate: new Date().toISOString(),
        totalCount: templates.length,
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `templates-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setAlertMessage({
      title: 'Export réussi',
        message: `${templates.length} template(s) exporté(s) avec succès.`,
      type: 'success'
    });
    setIsAlertModalOpen(true);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setAlertMessage({
        title: 'Erreur d\'export',
        message: 'Erreur lors de l\'export des templates.',
        type: 'error'
      });
      setIsAlertModalOpen(true);
    }
  };

  const handleImportTemplates = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          if (!data.templates || !Array.isArray(data.templates)) {
            throw new Error('Format de fichier invalide');
          }

          // Fusionner les templates importés avec les existants
          const importedTemplates = data.templates.map((template: any) => ({
            ...template,
            id: `TPL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }));

          const updatedTemplates = [...templates, ...importedTemplates];
          const updatedSettings = {
            ...settings,
            templates: updatedTemplates
          };

          await saveSettings(updatedSettings);
          
          setAlertMessage({
            title: 'Import réussi',
            message: `${importedTemplates.length} template(s) importé(s) avec succès.`,
            type: 'success'
          });
          setIsAlertModalOpen(true);
        } catch (error) {
          console.error('Erreur lors de l\'import:', error);
          setAlertMessage({
            title: 'Erreur d\'import',
            message: 'Le fichier importé n\'est pas valide ou corrompu.',
            type: 'error'
          });
          setIsAlertModalOpen(true);
        }
      };
      reader.readAsText(file);
    }
  };


  const handleSaveTemplate = async (templateData: Partial<Template>) => {
    try {
      const templateWithId = templateData.id 
        ? templateData 
        : { ...templateData, id: `TPL-${Date.now()}` };

      const updatedTemplates = templateData.id
        ? templates.map(t => t.id === templateData.id ? templateWithId as Template : t)
        : [...templates, templateWithId as Template];

      const updatedSettings = {
        ...settings,
        templates: updatedTemplates
      };

      await saveSettings(updatedSettings);
      
    setAlertMessage({
      title: isEditMode ? 'Template mis à jour' : 'Template créé',
      message: isEditMode 
        ? `Le template "${templateData.name}" a été mis à jour avec succès.`
        : `Le template "${templateData.name}" a été créé avec succès.`,
      type: 'success'
    });
    setIsAlertModalOpen(true);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du template:', error);
      setAlertMessage({
        title: 'Erreur',
        message: 'Erreur lors de la sauvegarde du template.',
        type: 'error'
      });
      setIsAlertModalOpen(true);
    }
  };

  const confirmDeleteTemplate = async () => {
    try {
      if (!selectedTemplate) return;

      const updatedTemplates = templates.filter(t => t.id !== selectedTemplate.id);
      const updatedSettings = {
        ...settings,
        templates: updatedTemplates
      };

      await saveSettings(updatedSettings);
      
    setIsConfirmModalOpen(false);
    setAlertMessage({
      title: 'Template supprimé',
        message: `Le template "${selectedTemplate.name}" a été supprimé avec succès.`,
      type: 'success'
    });
    setIsAlertModalOpen(true);
    } catch (error) {
      console.error('Erreur lors de la suppression du template:', error);
      setAlertMessage({
        title: 'Erreur',
        message: 'Erreur lors de la suppression du template.',
        type: 'error'
      });
      setIsAlertModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Messages d'erreur et de succès du context */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Paramétrage des Documents</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestion des templates pour tous les documents générés</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Upload className="w-4 h-4 mr-2" />
            Importer
          </button>
          <button 
            onClick={handleNewTemplate}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau template
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Templates de Documents
            </h2>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
              {templates.length} template{templates.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleExportTemplates}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter tous
            </button>
            <label className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              Importer
              <input
                type="file"
                accept=".json"
                onChange={handleImportTemplates}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Vue d'ensemble des templates par défaut */}
      <DefaultTemplatesOverview />

      {/* Templates par catégorie */}
      <div className="space-y-8">
        {categories.map((category) => (
          <TemplateCategorySection
            key={category.id}
            category={category}
            templates={templates}
            onEdit={handleEditTemplate}
            onDuplicate={handleDuplicateTemplate}
            onDelete={handleDeleteTemplate}
            onPreview={handlePreviewTemplate}
            onCreateNew={handleNewTemplate}
            onSetDefault={handleSetDefaultTemplate}
            onRemoveDefault={handleRemoveDefaultTemplate}
          />
        ))}
      </div>

      {/* Information section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-900/30">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-3">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-2">Paramétrage des documents</h3>
            <p className="text-blue-800 dark:text-blue-400 mb-4">
              Les templates de documents permettent de personnaliser l'apparence de tous les documents générés par l'application.
              Vous pouvez créer des templates pour chaque type de document et les personnaliser selon vos besoins.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                  Bonnes pratiques
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                  <li>• Utilisez des variables pour les données dynamiques</li>
                  <li>• Testez vos templates avant de les utiliser</li>
                  <li>• Créez des templates distincts pour chaque type de document</li>
                  <li>• Respectez la charte graphique de votre établissement</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600 dark:text-yellow-400" />
                  Points d'attention
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                  <li>• Vérifiez la compatibilité avec l'impression</li>
                  <li>• Assurez-vous que toutes les variables sont définies</li>
                  <li>• Limitez la taille des images pour optimiser les performances</li>
                  <li>• Testez sur différents formats de papier si nécessaire</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DocumentTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSave={handleSaveTemplate}
        templateData={selectedTemplate}
        isEdit={isEditMode}
      />

      <TemplatePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        template={selectedTemplate || {
          name: '',
          content: '',
          documentType: '',
          category: ''
        }}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteTemplate}
        title="Supprimer ce template ?"
        message={`Êtes-vous sûr de vouloir supprimer le template "${selectedTemplate?.name}" ? Cette action est irréversible.`}
        type="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
      />

      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title={alertMessage.title}
        message={alertMessage.message}
        type={alertMessage.type}
      />
    </div>
  );
};

export default DocumentTemplates;