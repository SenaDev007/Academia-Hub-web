import React from 'react';
import { FileText, Plus, Eye, Edit, Copy, Trash2, Star, StarOff } from 'lucide-react';
import { Template } from '../../types/documentSettings';
import { useDefaultTemplates } from '../../hooks/useDefaultTemplates';

interface TemplateCategorySectionProps {
  category: {
    id: string;
    name: string;
    color: string;
    icon: React.ReactNode;
  };
  templates: Template[];
  onEdit: (template: Template) => void;
  onDuplicate: (template: Template) => void;
  onDelete: (template: Template) => void;
  onPreview: (template: Template) => void;
  onCreateNew: () => void;
  onSetDefault?: (template: Template) => void;
  onRemoveDefault?: (template: Template) => void;
}

const TemplateCategorySection: React.FC<TemplateCategorySectionProps> = ({
  category,
  templates,
  onEdit,
  onDuplicate,
  onDelete,
  onPreview,
  onCreateNew,
  onSetDefault,
  onRemoveDefault
}) => {
  const { isDefaultTemplate } = useDefaultTemplates();
  const categoryTemplates = templates.filter(template => template.category === category.id);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header de la catégorie */}
      <div className={`px-6 py-4 ${category.color} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {category.icon}
            <div>
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <p className="text-sm opacity-90">
                {categoryTemplates.length} template{categoryTemplates.length !== 1 ? 's' : ''} disponible{categoryTemplates.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onCreateNew}
            className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau</span>
          </button>
        </div>
      </div>

      {/* Liste des templates */}
      <div className="p-6">
        {categoryTemplates.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun template</h4>
            <p className="text-gray-500 mb-4">
              Commencez par créer votre premier template {category.name.toLowerCase()}
            </p>
            <button
              onClick={onCreateNew}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un template
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categoryTemplates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">{template.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>Type: {template.documentType}</span>
                      <span>•</span>
                      <span>Modifié: {template.lastModified}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {template.isDefault && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Par défaut
                      </span>
                    )}
                    {!template.isActive && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Inactif
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onPreview(template)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Prévisualiser"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(template)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDuplicate(template)}
                      className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                      title="Dupliquer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {isDefaultTemplate(template.documentType, template.id) ? (
                      <button
                        onClick={() => onRemoveDefault?.(template)}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                        title="Retirer comme template par défaut"
                      >
                        <StarOff className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onSetDefault?.(template)}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                        title="Définir comme template par défaut"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(template)}
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
    </div>
  );
};

export default TemplateCategorySection;
